/* global $ */
/* global angular */
garageApp

.controller('ParkingPlaceCtrl', ['$scope', 'parkingPlaces',
    function ($scope, parkingPlaces) {
        $scope.init = function () {
            $scope.getAllParkingPlaces();
        };

        $scope.getAllParkingPlaces = function () {
            parkingPlaces.GetAllParkingPlaces()
            .then(
                function (data) {
                    //success
                    $scope.ParkingPlaces = parkingPlaces.parkingPlaceList;
                },
                function (data) {
                    //error
                    $scope.ShowMessage(data, 2000);
                });
        };

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
        };

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
                    $scope.ShowMessage(data, 2000);
                });
        };

        $scope.$on('$destroy', function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        });

        $scope.init();
    }])

.controller('UnitCtrl', ['$scope', 'settings', 'unitService', '$location',
    function ($scope, settings, unitService, $location) {
        if (settings.Id() !== undefined) {
            $scope.UnitName = settings.Id();
        }

        $scope.submit = function () {
            unitService.createUnit($scope.UnitName)
            .then(function() {
                $location.path("/");
            });
        };
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

        $scope.getGeolocation = function () {
            geolocationService.getGeolocation()
                .then(
                function (position) {
                    //success
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

                    $scope.lat.push(lat);
                    $scope.lng.push(lng);

                    if (angular.isDefined(spd) || spd <= 10)
                        $scope.spd.push(-1);
                    else
                        $scope.spd.push(spd);

                    return geolocationService.sendLocation($scope.lat, $scope.lng, $scope.spd);
                },
                function (data) {
                    //error
                })
                .then(function (result) {
                    $scope.getNewLocation(result.interval);
                },
                function (data) {
                    //error
                });
        };

        var stop;
        $scope.getNewLocation = function (interval) {
            var id = settings.GetId();
            var gps = settings.GetGps();
            if (!angular.isDefined(id) || id === null || !gps)
                return;
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