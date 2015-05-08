garageApp

.service('settings', function() {
    return {
        host: "http://stretchgarageweb.azurewebsites.net/"
    };
    })
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
        }

        parkingPlace.GetParkingPlace = function (id) {
            var defer = $q.defer();

            $http({
                method: 'GET',
                url: settings.host + '/api/ParkedCars/' + id
            })
            .success(function (data) {
                parkingPlace.parkingPlaceList = data;
                defer.resolve(data);
            })
            .error(function (err) {
                defer.reject(err);
            });

            return defer.promise;
        }

        return parkingPlace;
    }])

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
        }

        geolocation.sendLocation = function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            return $http.get(settings.host + 'api/CheckLocation/?id=1&latitude=' + lat + '&longitude=' + lng)
                .then(function (result) {
                    return result.data.content;
                });
        }

        return geolocation;
    }]);