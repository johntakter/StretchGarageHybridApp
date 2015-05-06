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
                    $scope.ShowMessage("Woops, någonting gick fel!", 2000);
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
                function(data) {
                    //success
                    $scope.ParkingPlaces = parkingPlaces.parkingPlaceList;
                },
                function (data) {
                    //error
                    $scope.ShowMessage("Woops, någonting gick fel!", 2000);
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

    .controller('AppController', ['$scope', 'GeolocationService', '$http', '$interval',
    function ($scope, geolocation, $http, $interval) {
        var stop;
        var msgTimer;
        $scope.init = function () {
            stop = $interval(function () {
                $scope.getGeolocation();
            }, 2000);
        }

        $scope.Position;
        $scope.getGeolocation = function () {
            geolocation()
                .then(
                function (position) {
                    //success
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    $scope.Time = 'time: ' + position.timestamp +' lat: '+ position.coords.latitude +' long: '+position.coords.longitude;

                    $http({
                        method: 'GET',
                        url: 'http://stretchgarageweb.azurewebsites.net/api/CheckLocation/?id=1&latitude=' + lat + '&longitude=' + lng,
                    })
                        .success(function (data) {
                        $scope.Position = data;
                    })
                        .error(function (err) {
                        $scope.ShowMessage(err);
                    });
                },
                function (reason) {
                    //error
                    $scope.ShowMessage(reason);
                });
        }
        $scope.Messages;

        $scope.ShowMessage = function (msg) {
            if (angular.isDefined(msgTimer)) {
                $scope.Messages = {};
                $("#message").hide();
                $timeout.cancel(msgTimer);
                msgTimer = undefined;
            }
            $scope.Messages = [{ Message: msg }];
            $("#message").slideDown(400);
            msgTimer = $timeout(function () {
                $scope.Messages = undefined;
                $("#message").slideUp(300);
            }, 2000);
        };

        $scope.close = function (id) {
            $("#" + id).slideUp();
        };

        $scope.init();
    }]);

$(document).ready(function () {});