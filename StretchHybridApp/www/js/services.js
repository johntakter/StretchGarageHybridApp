garageApp
    .service('settings', function () {
        return {
            Id: function () {
                return window.localStorage.getItem("id");
            },
            host: "http://stretchgarageweb.azurewebsites.net/"
        };
    })

    .service("geolocationService", ['$q', '$window', '$rootScope', '$http', 'settings',
        function geolocationService($q, $window, $rootScope, $http, settings) {
            var geolocation = this;
            geolocation.getGeolocation = function () {
                var deferred = $q.defer();

                if (!$window.navigator) {
                    $rootScope.$apply(function () {
                        deferred.reject(new Error("Geolocation is not supported"));
                    });
                } else {
                    $window.navigator.geolocation.getCurrentPosition(function (position) {
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

            geolocation.sendLocation = function (position) {
                if(settings.Id() == undefined) throw new Error("No ID on device, cant send location request");
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                return $http.get(settings.host + 'api/CheckLocation/?id=' + settings.Id() + '&latitude=' + lat + '&longitude=' + lng)
                    .then(function (result) {
                        return result.data.content;
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
    
            unit.createUnit = function (name) {
                var defer = $q.defer();
    
                $http({
                    method: 'GET',
                    url: settings.host + 'api/Unit/' + name + '/' + 0
                })
                .success(function (result) {
                    console.log(result);
                    if (!result.success) {
                        defer.reject(result.message);
                    }
                    else {
                        window.localStorage.setItem("id", result.content);
                        defer.resolve(result.content);
                    }
                })
                .error(function (err) {
                    defer.reject(err);
                });
    
                return defer.promise;
            };
    
            unit.getId = function () {
                return localStorage["id"];
            };
    
            unit.setId = function (id) {
                localStorage["id"] = id;
            };
            return unit;
        }]);