

var garageRequests = function () {
	var defer = $q.defer();
            $http({
                method: 'GET',
                url: '/api/ParkingPlace/'
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