﻿garageApp

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

.controller('UnitCtrl', ['$scope', '$rootScope', 'settings', 'unitService', '$location', '$timeout',
    function ($scope, $rootScope, settings, unitService, $location, $timeout) {
        $scope.init = function () {
            if (settings.GetUser() !== undefined) {
                $scope.unit.Name = settings.GetUser();
                $scope.unit.Phonenumber = settings.GetNumber();
                $scope.toggleGpsText();
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

        $rootScope.$on('gpsChange', function (event, args) {
            $scope.toggleGpsText();
        });

        $scope.toggleGpsText = function() {
            if (settings.GetGps()) {
                $scope.gpsText = "Stoppa Gps";
            } else {
                $scope.gpsText = "Starta Gps";
            }
        };

        $scope.init();
    }])

.controller('AppController', ['$scope', '$rootScope', 'geolocationService', 'unitService', '$http', '$interval', '$timeout', 'settings', '$location',
    function ($scope, $rootScope, geolocationService, unitService, $http, $interval, $timeout, settings, $location) {
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
        $scope.staticLat = -1;
        $scope.staticLng = -1;
        $scope.staticTime = -1;
        
        $scope.getGeolocation = function () {
            geolocationService.getGeolocation()
                .then(
                function (position) {
                    //success
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;

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
                    $scope.speedTimes.push(position.timestamp);

                    if ($scope.lat.length >= 2) {
                        var distance = distanceInMeters(
                            $scope.lat[$scope.lat.length - 1], $scope.lng[$scope.lng.length - 1],
                            $scope.lat[$scope.lat.length - 2], $scope.lng[$scope.lng.length - 2]);

                        var timeDiff = $scope.speedTimes[$scope.speedTimes.length - 1] - $scope.speedTimes[$scope.speedTimes.length -2];
                        
                        var speed = distance / timeDiff;
                        $scope.spd.push(speed);
                    }
                    else
                        $scope.spd.push(-1);
                        
                    
                    if ($scope.lat.length >= 2) {
                        var interval = checkStaticPosition($scope.spd, position.timestamp);
                        if (interval > -1) {
                            return {checkSpeed: true, interval: interval, isParked: false};
                        }
                    }                    
                    return geolocationService.sendLocation($scope.lat, $scope.lng, $scope.spd);                    
                },
                function (data) {
                    //error
                    $scope.getNewLocation(5000);
                })
                .then(function (result) {
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
        };

        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        };
        
        function checkStaticPosition(speedArr, timestamp) {

            var moved = checkStationary(speedArr)

            if (moved) {
                $scope.staticTime = $scope.staticLat = $scope.staticLng = -1;
                return -1;
            }
            
            if ($scope.staticTime === -1) {
                $scope.staticLat = $scope.lat[$scope.lat.length - 1];
                $scope.staticLng = $scope.lng[$scope.lng.length - 1];
                $scope.staticTime = timestamp;
                return -1;
            }

            var timeDiff = timestamp - $scope.staticTime;
            if (timeDiff < 300)
                return -1;

            var distanceMoved = distanceInMeters(
                $scope.lat[$scope.lat.length - 1],
                $scope.lng[$scope.lng.length - 1],
                $scope.lat[$scope.lat.length - 2],
                $scope.lng[$scope.lng.length - 2]);

            
            if (distanceMoved > 20) //Not moved more than 20 meters
            {
                $scope.staticLat = $scope.lat[$scope.lat.length - 1];
                $scope.staticLng = $scope.lng[$scope.lng.length - 1];
                $scope.staticTime = timestamp;
                return -1;
            }

            return 150000; //2.30 minutes

                        
        }
        function checkStationary(speedArr) {
            var moved = false;
            for (var i = 0; i < speedArr.length; i++) {
                if (speedArr[i] > 2) {
                    moved = true;
                    break;
                }
            }

            return moved;
        }

        var stop;
        $scope.getNewLocation = function (interval) {
            var id = settings.GetId();
            var gps = settings.GetGps();
            if (!angular.isDefined(id) || id === null || !gps)
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

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.isReversible = function() {
            return $location.path() === "/";
        };

        $scope.toggleGps = function () {
            var gps = !settings.GetGps();
            settings.SetGps(gps);
            if (!gps) {
                $scope.stopGps();
            } else {
                $scope.startGps();
            }
        };

        $scope.stopGps = function () {
            if (angular.isDefined(stop)) {
                $timeout.cancel(stop);
                stop = undefined;
            }
        };

        $scope.startGps = function() {
            $scope.getNewLocation(0);
        };

        $scope.parkManually = function() {
            var location = $location.path().split("/");
            var index = location[location.length - 1];
            unitService.parkManually(index).
                then(function(result) {
                    $scope.alerts = [{ type: "success", msg: "Du har parkerats" }];
                    $timeout(function() {
                        $scope.alerts = [];
                    }, 2000);
                }, function(err) {
                    $scope.alerts = [{ type: "danger", msg: "Det gick inte att manuellt parkera bilen." }];
                    $timeout(function() {
                        $scope.alerts = [];
                    }, 2000);
                });
        };

        $scope.unparkManually = function () {
            unitService.unparkManually().
                then(function (result) {
                    $scope.alerts = [{ type: "success", msg: "Du har avparkerats" }];
                    $timeout(function () {
                        $scope.alerts = [];
                    }, 2000);
                }, function (err) {
                    $scope.alerts = [{ type: "danger", msg: "Det gick inte att manuellt av parkera bilen." }];
                    $timeout(function () {
                        $scope.alerts = [];
                    }, 2000);
                });
        };
        
        $scope.init();
    }]);