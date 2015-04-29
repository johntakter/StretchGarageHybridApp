var UpdateLocation = {
	initialize: function() {
		//Add get id here

		UpdateLocation.getPos();
	},

	getPos: function(){		
		var element = document.getElementById('showPos');
		element.innerHTML = 'getting location...';

		navigator.geolocation.getCurrentPosition(UpdateLocation.onGpsSuccess, UpdateLocation.onGpsError);
	},

	onGpsSuccess: function(position) {
		/*var element = document.getElementById('showPos');
			element.innerHTML = 'Latitude: '+ position.coords.latitude		   + '<br />' +
			'Longitude: '          + position.coords.longitude             + '<br />' +
            'Altitude: '           + position.coords.altitude              + '<br />' +
            'Accuracy: '           + position.coords.accuracy              + '<br />' +
            'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
            'Heading: '            + position.coords.heading               + '<br />' +
            'Speed: '              + position.coords.speed                 + '<br />' +
            'Timestamp: '          + position.timestamp                    + '<br />';*/ 
        ShowPos.count += 1
		var element = document.getElementById('showPos');
		element.innerHTML = 'lon: ' + position.coords.longitude + ' lat: ' + position.coords.latitude + ' count: ' + ShowPos.count;

		UpdateLocation.sendPos(position);
    },

    // onError Callback receives a PositionError object
    onGpsError: function(error) {
    	alert('code: '    + error.code    + '\n' + 'message: ' + 
    		error.message + '\n');
    },

    sendPos: function(position){
    	var delay = 3000; //Add get delay here

    	window.setTimeout(UpdateLocation.getPos, delay);     		
    }
}

var ShowPos = {count:0};