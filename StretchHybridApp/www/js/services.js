garageApp

.service('parkingPlaces',
    function parkingPlaces($http, $q) {
        var parkingPlace = this;
        parkingPlace.parkingPlaceList = {};

        parkingPlace.GetAllParkingPlaces = function () {
            var defer = $q.defer();
            $http({
                method: 'GET',
                url: 'http://stretchgarageweb.azurewebsites.net/api/ParkingPlace/'
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
                url: 'http://stretchgarageweb.azurewebsites.net/api/ParkedCars/' + id
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
    });