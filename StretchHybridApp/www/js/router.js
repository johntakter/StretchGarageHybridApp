var garageApp = angular.module("GarageApp", ["ngRoute"])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', { templateUrl: 'partials/parkingplacelist.html', controller: 'ParkingPlaceCtrl' }).
                when('/ParkingPlace/', { templateUrl: 'partials/parkingplacelist.html', controller: 'ParkingPlaceCtrl' }).
                when('/ParkingPlace/:id', { templateUrl: 'partials/parkingplacedetail.html', controller: 'ParkingDetailCtrl' }).
                otherwise({
                    redirectTo: '/'
                });
        }
    ]);