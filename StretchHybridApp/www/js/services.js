garageApp
.factory('settings', ['$rootScope',
        function settings($rootScope) {
            return {
                GetId: function () {
                    return window.localStorage.getItem("id");
                },
                SetId: function (id) {
                    window.localStorage.setItem("id", id);
                    $rootScope.$broadcast('idChange', { "id": id });
                },
                GetUser: function () {
                    return window.localStorage.getItem("user");
                },
                SetUser: function (user) {
                    window.localStorage.setItem("user", user);
                    $rootScope.$broadcast('userChange', { "user": user });
                },
                GetNumber: function () {
                    return window.localStorage.getItem("number");
                },
                SetNumber: function (number) {
                    window.localStorage.setItem("number", number);
                    $rootScope.$broadcast('numberChange', { "number": number });
                },
                GetType: function () {
                    return window.localStorage.getItem("type");
                },
                SetType: function (type) {
                    window.localStorage.setItem("type", type);
                    $rootScope.$broadcast('typeChange', { "type": type });
                },
                SetGps: function (gps) {
                    window.localStorage.setItem("gps", gps);
                    $rootScope.$broadcast('gpsChange', { "gps": gps });
                },
                GetGps: function () {
                    return window.localStorage.getItem("gps") === "true" ? true : false;
                },
                host: "http://stretchgarageweb.azurewebsites.net/"
            };
        }
    ])

    .service("geolocationService", ['$q', '$rootScope', '$http', 'settings',
        function geolocationService($q, $rootScope, $http, settings) {
            var geolocation = this;
            geolocation.getGeolocation = function () {
                var deferred = $q.defer();

                if (!navigator) {
                    $rootScope.$apply(function () {
                        deferred.reject(new Error("Geolocation is not supported"));
                    });
                } else {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        $rootScope.$apply(function () {
                            deferred.resolve(position);
                        });
                    }, function (error) {
                        $rootScope.$apply(function () {
                            deferred.reject(error);
                        });
                    });
                }

                return deferred.promise;
            };
            
            geolocation.sendLocation = function (lat, lng, spd) {
                var headers = "?id=" + settings.GetId();
                for (var i = 0; i < lat.length; i++) {
                    headers += "&latitude[]=" + lat[i];
                    headers += "&longitude[]=" + lng[i];
                    headers += "&speed[]=" + spd[i];
                }
                return $http.get(settings.host + 'api/CheckLocation/' + headers).
                then(function (result) {
                    return result.data.content;
                },
                function (err) {
                });
            };

            return geolocation;
        }])
        
    .service('parkingPlaces', ['$http', '$q', 'settings',
        function parkingPlaces($http, $q, settings) {
            var parkingPlace = this;
            parkingPlace.parkingPlaceList = {};
    
            parkingPlace.GetAllParkingPlaces = function () {
                var defer = $q.defer();
                $http({
                    method: 'GET',
                    url: settings.host + 'api/ParkingPlace/'
                })
                .success(function (data) {
                    parkingPlace.parkingPlaceList = data;
                    defer.resolve(data);
                })
                .error(function (err) {
                    defer.reject(err);
                });
    
                return defer.promise;
            };
    
            parkingPlace.GetParkingPlace = function (id) {
                var defer = $q.defer();
    
                $http({
                    method: 'GET',
                    url: settings.host + 'api/ParkedCars/' + id
                })
                .success(function (data) {
                    parkingPlace.parkingPlaceList = data;
                    defer.resolve(data);
                })
                .error(function (err) {
                    defer.reject(err);
                });
    
                return defer.promise;
            };
    
            return parkingPlace;
        }])

    .service("unitService", ['$http', 'settings', '$q',
        function unitService($http, settings, $q) {
            var unit = this;
    
            unit.createUnit = function (input) {
                var defer = $q.defer();

                $http({
                    method: 'POST',
                    data: {
                        "name": input.Name,
                        "phonenumber": input.Phonenumber,
                        "type": 0
                    },
                    url: settings.host + 'api/Unit/'
                })
                .success(function (result) {
                    if (!result.success) {
                        defer.reject(result.message);
                    }
                    else {
                        settings.SetId(result.content.id);
                        settings.SetUser(result.content.name);
                        settings.SetNumber(result.content.phonenumber);
                        settings.SetType(result.content.type);
                        defer.resolve(result.content);
                    }
                })
                .error(function (err) {
                    defer.reject(err);
                });

                return defer.promise;
            };
            
            unit.putUnit = function (_id, _unit, _type) {
                var defer = $q.defer();
    
                $http({
                    method: 'PUT',
                    data: {
                        id: _id,
                        name: _unit.Name,
                        number: _unit.Number,
                        type: _type,
                    },
                    url: settings.host + 'api/Unit/'
                }).
                success(function (result) {
                    if (!result.success) {
                        defer.reject(result.message);
                    } else {
                        settings.SetUser(result.content.name);
                        settings.SetNumber(result.content.number);
                        settings.SetType(result.content.type);
                        defer.resolve(result.content);
                    }
                }).
                error(function (err) {
                    defer.reject(err);
                });
    
                return defer.promise;
            };
    
            unit.parkManually = function (parkingPlaceId) {
                var defer = $q.defer();
    
                $http({
                    method: 'POST',
                    url: settings.host + 'api/unit/' + settings.GetId() + '/park/' + parkingPlaceId
                }).
                    success(function (result) {
                        if (!result)
                            defer.reject("Klara inte av att parkera manuelt");
                        else {
                            defer.resolve(result);
                        }
                    }).
                    error(function (err) {
                        defer.reject(err);
                    });
                return defer.promise;
            };
    
            unit.unparkManually = function () {
                var defer = $q.defer();
    
                $http({
                    method: 'DELETE',
                    url: settings.host + 'api/unit/' + settings.GetId() + '/park/'
                }).
                success(function (result) {
                    if (!result) {
                        defer.reject("Klara inte av att avparkera manuelt");
                    }
                    else {
                        defer.resolve(result);
                    }
                }).
                error(function (err) {
                    defer.reject(err);
                });
    
                return defer.promise;
            };
            
            return unit;
        }]);