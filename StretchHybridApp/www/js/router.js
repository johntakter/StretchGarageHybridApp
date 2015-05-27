var garageApp = angular.module("GarageApp", ["ngRoute", "ui.bootstrap"])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', { templateUrl: 'partials/parkingplacelist.html', controller: 'ParkingPlaceCtrl' }).
                when('/ParkingPlace/', { templateUrl: 'partials/parkingplacelist.html', controller: 'ParkingPlaceCtrl' }).
                when('/ParkingPlace/:id', { templateUrl: 'partials/parkingplacedetail.html', controller: 'ParkingDetailCtrl' }).
                when('/CreateUnit', { templateUrl: 'partials/unit.html', controller: 'UnitCtrl' }).
                otherwise({
                    redirectTo: '/'
                });
        }
    ])
    .run(['$location', 'settings', function ($location, settings) {
        if (window.localStorage.getItem("gps") == undefined) {
            settings.SetGps(true);
        }
        if(settings.GetId() == undefined) {
            $location.path("/CreateUnit/");
        }
    }]);