garageApp

.controller('ParkingPlaceCtrl', ['$scope', 'parkingPlaces',
    function ($scope, parkingPlaces) {
        $scope.init = function () {
            $scope.getAllParkingPlaces();
        }

        $scope.getAllParkingPlaces = function () {
            parkingPlaces.GetAllParkingPlaces()
            .then(
                function (data) {
                    //success
                    $scope.ParkingPlaces = parkingPlaces.parkingPlaceList;
                },
                function (data) {
                    //error
                    $scope.$emit('alert', [
                        { type: "danger", msg: data, }
                    ]);
                });
        }

        $scope.init();
    }])

.controller('ParkingDetailCtrl', ['$scope', 'parkingPlaces', '$routeParams', '$interval',
    function ($scope, parkingPlaces, $routeParams, $interval) {
        var stop;

        $scope.init = function () {
            parkingPlaces.GetParkingPlace($routeParams.id)
            .then(function (data) {
                $scope.ParkingPlaces = data;
                stop = $interval(function () {
                    $scope.getParkingPlace();
                }, 7000);
            });
        }

        $scope.ParkingPlaces = {};

        $scope.getParkingPlace = function () {
            parkingPlaces.GetParkingPlace($routeParams.id)
            .then(
                function (data) {
                    //success
                    $scope.ParkingPlaces = parkingPlaces.parkingPlaceList;
                },
                function (data) {
                    //error
                    $scope.$emit('alert', [
                        { type: "danger", msg: data, }
                    ]);
                });
        }

        $scope.$on('$destroy', function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        });

        $scope.init();
    }])

.controller('UnitCtrl', ['$scope', 'settings', 'unitService', '$location', '$timeout',
    function ($scope, settings, unitService, $location, $timeout) {
        $scope.init = function () {
            if (settings.GetUser() !== undefined) {
                $scope.unit.Name = settings.GetUser();
                debugger;
                $scope.unit.Phonenumber = settings.GetNumber();
            }
        }

        $scope.unit = {};

        $scope.submit = function (isValid) {
            if (!isValid) return;
            var id = settings.GetId();
            if (!angular.isDefined(id)) {
                unitService.putUnit(settings.GetId(), $scope.unit, settings.GetType()).
                then(function () {
                    $scope.$emit('alert', [
                        { type: "success", msg: "Din profil har uppdaterats!", }
                    ]);
                    $timeout(function () {
                        $location.path("/");
                    }, 2000);
                });
            } else {
                unitService.createUnit($scope.unit)
                .then(function () {
                    $location.path("/");
                });
            }
        };

        $scope.init();
    }])

.controller('AppController', ['$scope', '$rootScope', 'geolocationService', '$http', '$interval', '$timeout', 'settings', '$location', '$q',
    function ($scope, $rootScope, geolocationService, $http, $interval, $timeout, settings, $location, $q) {
        var msgTimer;
        $scope.init = function () {
            $scope.user = settings.GetUser();
            $scope.getNewLocation(0);
        };
        $scope.alerts = [];
        $scope.user;

        var SIZE = 3;
        $scope.lat = [];
        $scope.lng = [];
        $scope.spd = [];
        $scope.speedTimes = [];

        $scope.Count = 0;
        $scope.Position;
        $scope.getGeolocation = function () {
            geolocationService.getGeolocation()
                .then(
                function (position) {
                    //success
                    $scope.Count++;
                    $scope.Time = position.timestamp;                    

                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var spd = position.coords.speed;                    

                    if ($scope.lat.length >= SIZE) {
                        $scope.lat.splice(0, 1);
                    }
                    if ($scope.lng.length >= SIZE) {
                        $scope.lng.splice(0, 1);
                    }
                    if ($scope.spd.length >= SIZE) {
                        $scope.spd.splice(0, 1);
                    }
                    if ($scope.speedTimes.length >= SIZE) {
                        $scope.speedTimes.splice(0, 1);
                    }

                    $scope.lat.push(lat);
                    $scope.lng.push(lng);
                    $scope.speedTimes.push(position.timestamp)

                    if ($scope.lat.length >= 2) {
                        var distance = distanceInMeters(
                            $scope.lat[$scope.lat.length - 1], $scope.lng[$scope.lng.length - 1],
                            $scope.lat[$scope.lat.length - 2], $scope.lng[$scope.lng.length - 2])

                        var timeDiff = $scope.speedTimes[$scope.speedTimes.length - 1] - $scope.speedTimes[$scope.speedTimes.length -2];
                        
                        var speed = distance / timeDiff;
                        $scope.spd.push(speed);
                    }
                    else
                        $scope.spd.push(-1);

                    $scope.Position = "lat: " + lat + " long: " + lng;
                    return geolocationService.sendLocation($scope.lat, $scope.lng, $scope.spd);                    
                },
                function (data) {
                    //error
                    return $q.reject(data);
                })
                .then(function (result) {
                    $scope.Info = 'interval: ' + result.interval + ' isParked:' + result.isParked + ' checkSpeed:' + result.checkSpeed;
                    $scope.getNewLocation(result.interval);
                },
                function (data) {
                    //error
                    $scope.Info = "failed to update location";
                    $scope.getNewLocation(2000);
                });
        };

        function distanceInMeters(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d * 1000;
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }

        var stop;
        $scope.getNewLocation = function (interval) {
            var id = settings.GetId();
            if (!angular.isDefined(id) || id === null)
                return;
            if (angular.isDefined(stop)) {
                $timeout.cancel(stop);
                stop = undefined;
            }
            stop = $timeout(function () {
                $scope.getGeolocation();
            }, interval);
        };

        $scope.$on('alert', function (event, args) {
            $scope.alerts = $scope.alerts.concat(args);
            $timeout(function () {
                $scope.alerts = [];
            }, 2000);
        });

        $rootScope.$on('idChange', function (event, args) {
            $scope.getNewLocation(0);
        });

        $rootScope.$on('userChange', function (event, args) {
            $scope.user = args.user;
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        }

        $scope.isReversible = function () {
            return $location.path() === "/";
        }

        $scope.parkManually = function () {
            var location = $location.path().split("/");
            var index = location[location.length - 1];
            unitService.parkManually(index).
            then(function (result) {
                $scope.alerts = [{ type: "success", msg: "Du har parkerats" }];
                $timeout(function () {
                    $scope.alerts = [];
                }, 2000);
            }, function (err) {
                $scope.alerts = [{ type: "danger", msg: "Det gick inte att manuellt parkera bilen." }];
                $timeout(function () {
                    $scope.alerts = [];
                }, 2000);
            });
        }
        $scope.init();
    }]);