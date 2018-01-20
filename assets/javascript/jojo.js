//var userMapInput={lat: 39.710850, lng: -105.081505};

/*function initMap() {
        var uluru = {lat: 39.742043, lng: -104.991531};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: uluru
        });
        infoWindow = new google.maps.InfoWindow;

        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
        var newMarker= new google.maps.Marker({
          position: userMapInput,
          map: map
        });

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }

      };

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      };*/


  var userInputSearch="";
	var queryUrl = "https://api.foursquare.com/v2/venues/explore?client_id=NCFDMIMRBLCB1MNHTEXODLIWB2KWDVQBQ50ZTCYQ3X05N43Y&client_secret=JPMDM31IHWHU35E4EVKGG3BGVYWEZ4DHWHIHDP4YSQFBYSOB&v=20170801&ll=39.742043, -104.991531&query=food truck " + userInputSearch + "&limit=20";





    var userInputSearch="";
	var queryUrl = "https://api.foursquare.com/v2/venues/explore?client_id=NCFDMIMRBLCB1MNHTEXODLIWB2KWDVQBQ50ZTCYQ3X05N43Y&client_secret=JPMDM31IHWHU35E4EVKGG3BGVYWEZ4DHWHIHDP4YSQFBYSOB&v=20170801&ll=39.742043, -104.991531&query=food truck " + userInputSearch + "&limit=50";


	$.ajax({
		url: queryUrl,
		method: 'GET'
	}).done(function(response) {
		console.log(response);
		console.log(response.response.groups[0].items[0].venue);

		var locationsArray= response.response.groups[0].items;

		var newLocationsArray= _.sortBy(locationsArray);

		var newLocationsArray= _.sortBy(locationsArray, [function(location) {return location.venue.rating; }]);

		console.log(locationsArray);
		console.log(newLocationsArray);

		for(var i=0; i< locationsArray.length; i++){
			console.log(locationsArray[i].venue);
		};

	});
