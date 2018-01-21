//Initial Firebase Congifiguation
var config = {
  apiKey: "AIzaSyBjhon0-cIYtELUMFxUT0isynUMCxaNp9Y",
  authDomain: "food-truckr.firebaseapp.com",
  databaseURL: "https://food-truckr.firebaseio.com",
  projectId: "food-truckr",
  storageBucket: "food-truckr.appspot.com",
  messagingSenderId: "463131017710"
};

firebase.initializeApp(config);

var database = firebase.database();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var markersRef = firebase.database().ref("markers");
var trucksRef = firebase.database().ref("trucks");

connectedRef.on("value", function(snap) {
  if (snap.val()) {
    var con = connectionsRef.push(true);
    con.onDisconnect().remove();
    userKey = con.key;
  }
});

var denverCenter = {lat: 39.742043, lng: -104.991531};
var map;
var locationsObj = {};
var markerArr = [];
var initialDisplaySet = false;
var currentLocation = {};

//Class that will store marker-related data, instances to be passed to firebase
 class MarkerDataObj {
   constructor(lat, lng, truckName, truckID) {
     this.markerID = "";
     this.lat = lat;
     this.lng = lng;
     this.truckName = truckName;
     this.truckID = truckID;
     this.upvotes = 0;
     this.downvotes = 0;
     this.recentActivity = "Pinned";
     this.recentActivityTime = firebase.database.ServerValue.TIMESTAMP;
   }
 }

 function convertTimestamp(timestamp) {
   var newDate = moment(timestamp).format("DD MMM YYYY hh:mm:ss a");
   return moment(newDate).fromNow();
 }

 function setModalDisplay() {
   $("#truck-name").text(this.title);
   $("#num-of-upvotes").text(this.upvotes);
   $("#num-of-downvotes").text(this.downvotes);
   $("#activity").text(this.recentActivity);
   $("#activity-date").text(convertTimestamp(this.recentActivityTime));
   $("#upvote-btn").attr("markerID-data", this.markerID);
   $("#downvote-btn").attr("markerID-data", this.markerID);
   $("#stats-modal").modal("show");
 }

 //Called  on initial page load and on when any child modified. For initial page load,
 //iterate over child nodes (data related to individual markers), create initial markers
 //for display with embedded data, and pin those markers to map. The data in the markers
 //will be used to generate and populate the stats-modals on a click event. Add reference to the markers
 //in global associative array to manipulate or remove markers
 markersRef.on('value', function(snapshot) {

  if (initialDisplaySet == false) {
    snapshot.forEach(function(childNodes) {

      var markerID = (childNodes.key).toString();
      var lat = childNodes.val().lat;
      var lng = childNodes.val().lng;
      var truckName = childNodes.val().truckName;
      var truckID = childNodes.val().truckID;
      var upvotes = childNodes.val().upvotes;
      var downvotes = childNodes.val().downvotes;
      var recentActivity = childNodes.val().recentActivity;
      var recentActivityTime = childNodes.val().recentActivityTime;

      var marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        title: truckName,
        truckID: truckID,
        markerID: markerID,
        upvotes: upvotes,
        downvotes: downvotes,
        recentActivity: recentActivity,
        recentActivityTime: recentActivityTime
      });

      markerArr.push(marker);

      //Enclosing reference to marker
      function attachClickEvent() {
        google.maps.event.addListener(marker, "click", setModalDisplay);
      }
       attachClickEvent(marker);
    });
  }
    initialDisplaySet = true;
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: denverCenter
  });
}

$(".reset").on("click",function() {
  map.setOptions({
       center: denverCenter,
       zoom: 12
   });
})

function displayNearbyTrucks() {

}

var getUserCurrentLocationWithPromise = function(result) {
  var infoWindow = new google.maps.InfoWindow;
  var deferred = new $.Deferred();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      deferred.resolve(position);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  return deferred.promise();
}

//Drops pin at current user location
function dropPinAtUserCurrentLocationAndZoom() {
  var infoWindow = new google.maps.InfoWindow;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      position.coords.latitude
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);
      var marker = new google.maps.Marker({
        position: pos,
        map: map
      });
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function testSearchTerm(searchTerm) {
  const client_id = 'UBoDtdxOKSgJELPqsAtwag';
  const client_secret = 'DluMc4r2kSvoSRdksiaNDNqkXiA9fFJKRPPWFruza63FtNGeRJrYaqCIN3StcVNZ';
  const corsHeroku = 'https://cors-anywhere.herokuapp.com/';

    var regEx = /[-'":]/g

    fetch(`${corsHeroku}https://api.yelp.com/oauth2/token?client_id=${client_id}&client_secret=${client_secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ grant_type: 'client_credentials' })
    })
    .then((response) => response.json())
    .then((responseJSON) => responseJSON.access_token)
    .then((accessToken) => {
      fetch(corsHeroku + "https://api.yelp.com/v3/businesses/search?term=" + searchTerm + "&categories=foodtrucks&latitude=39.742043&longitude=-104.991531", {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${accessToken}`,
        }
      })
      .then(response =>  response.json())
      .then(response => {

      if(response.businesses.length == 0) {
        renderNoFoodTruckFoundDisplay();
       } else if (response.businesses.length > 0) {
         var foodTruckFound = false;
         for(var i = 0; i < response.businesses.length; i++) {
           if((response.businesses[i].name).toUpperCase().replace(regEx, '') == searchTerm.toUpperCase().replace(regEx, '')) {
             dropNewTruckPin((response.businesses[i].name), (response.businesses[i].id));
             dismissModalForPinDrop();
             foodTruckFound = true;
           }
        }
        if(foodTruckFound == false) {
          renderNoFoodTruckFoundDisplay();
        }
       }
     });
   });
 }

$("#search-term").on("input", toggleBtnDisplay);

function toggleBtnDisplay() {
  if ($(this).val().trim() != "") {
    $("#truck-query").removeAttr("disabled");
  } else {
    $("#truck-query").attr("disabled", "disabled");
  }
}

function renderNoFoodTruckFoundDisplay() {
  $("#noFoodTruckFound").show();
  $("#search-term").val("");
  $("#search-term").removeAttr("disabled");
}

$("#search-term").on("focus", function() {
  $("#noFoodTruckFound").hide();
});

function dismissModalForPinDrop() {
  setTimeout(function() {
    $(".truckQuery").modal("hide");
    $("#search-term").val("");
    $("#search-term").removeAttr("disabled");
  }, 3000)
}

$("#truck-query").on("click", function(event) {
  event.preventDefault();
  $("#noFoodTruckFound").hide();
  $("#truck-query, #search-term").attr("disabled", "disabled");

  var searchTerm = $("#search-term").val().trim();
  testSearchTerm(searchTerm);
});

function dropNewTruckPin(searchTerm, truckID) {
    getUserCurrentLocationWithPromise().then(function(position) {

    var newMarkerData = new MarkerDataObj(position.lat, position.lng, searchTerm, truckID);
    var newKey = markersRef.push().key;
    newMarkerData.markerID = newKey;

    //New marker dropped with custom data to be stored in and updated with firebase
    var marker = new google.maps.Marker({
      position: {lat: newMarkerData.lat, lng: newMarkerData.lng},
      map: map,
      title: newMarkerData.truckName,
      truckID: newMarkerData.truckID,
      markerID: newMarkerData.markerID,
      upvotes: newMarkerData.upvotes,
      downvotes: newMarkerData.downvotes,
      recentActivity: newMarkerData.recentActivity,
      recentActivityTime: newMarkerData.recentActivityTime
    });

    map.setZoom(18);
    map.panTo(marker.position);
    console.log(marker.markerID);

    //Push new marker to associative array
    markerArr.push(marker);

    //Enclosing reference to marker
    function attachNewClickEvent(marker) {
      google.maps.event.addListener(marker, "click", setModalDisplay)
    }
    attachNewClickEvent(marker);

    //Push new marker to firebase
    var updates = {};
    updates['/markers/' + newKey] = newMarkerData;
    updates['/trucks/' + newMarkerData.truckID + '/' + newKey] = newMarkerData;
    database.ref().update(updates);
  });
}

$("#upvote-btn, #downvote-btn").on("click", function() {
   if($(this).attr("id") == "upvote-btn") {
     var currentUpVotes = parseInt($("#num-of-upvotes").text());
     var markerID = $(this).attr("markerID-data");

     currentUpVotes++;
     updateFbUpVoteCount(currentUpVotes, markerID);
      /*$("#stat-modal").modal("hide");
      $("#upvote-btn").attr("markerID-data", "");
      $("#downvote-btn").attr("markerID-data", "");*/

  } else if ($(this).attr("id") == "downvote-btn") {
     var currentDownVotes = parseInt($("#num-of-downvotes").text());
     var markerID = $(this).attr("markerID-data");

     currentDownVotes++;
     updateFbDownVoteCount(currentDownVotes, markerID)
    }
});

function updateFbUpVoteCount(currentUpVotes, markerID) {
  for(i = 0; i < markerArr.length; i++) {

    if(markerArr[i].markerID == markerID) {
      var truckName = markerArr[i].title;
      var truckID = markerArr[i].truckID;
      console.log(truckName);

      //$("#stat-modal").modal("hide");
      //$("#upvote-btn").attr("markerID-data", "");
      //$("#downvote-btn").attr("markerID-data", "");

      markersRef.child(markerID).update({
        upvotes: currentUpVotes,
        recentActivity: "Location upvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      })

      trucksRef.child(truckID).child(markerID).update({
        upvotes: currentUpVotes,
        recentActivity: "Location upvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      });
    }
  }
}

function updateFbDownVoteCount(currentDownVotes, markerID) {
  for(i = 0; i < markerArr.length; i++) {

    if(markerArr[i].markerID == markerID) {
      var truckName = markerArr[i].title;
      var truckID = markerArr[i].truckID;
      console.log(truckName);

      markersRef.child(markerID).update({
        downvotes: currentDownVotes,
        recentActivity: "Location downvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      })

      trucksRef.child(truckID).child(markerID).update({
        downvotes: currentDownVotes,
        recentActivity: "Location downvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      });
    }
  }
}

markersRef.on("child_added", function(snap) {
  if(initialDisplaySet == true) {
  console.log("Array length: " +  markerArr.length);

    var isCurrentPinner = false;
    for(var i = 0; i < markerArr.length; i++) {
      console.log(snap.val().markerID);
      console.log(markerArr[i].markerID);
      if(markerArr[i].markerID == snap.val().markerID) {
        isCurrentPinner = true;
        markerArr[i].recentActivityTime = snap.val().recentActivityTime;
      }
    }

    if(isCurrentPinner == false) {
      var marker = new google.maps.Marker({
        position: {lat: snap.val().lat, lng: snap.val().lng},
        map: map,
        title: snap.val().truckName,
        truckID: snap.val().truckID,
        markerID: snap.val().markerID,
        upvotes: snap.val().upvotes,
        downvotes: snap.val().downvotes,
        recentActivity: snap.val().recentActivity,
        recentActivityTime: snap.val().recentActivityTime
      });

      function attachClickEvent(marker) {
        google.maps.event.addListener(marker, "click", setModalDisplay)
      }

      attachClickEvent(marker);
      markerArr.push(marker);
      console.log(markerArr);
      console.log("Array length: " +  markerArr.length);
    }
  }
});

markersRef.on("child_changed", function(snap) {
   var markerID = snap.val().markerID;
   console.log(snap.val());
   console.log(snap.val().recentActivityTime);
   console.log(convertTimestamp(snap.val().recentActivityTime));

   for(var i = 0; i < markerArr.length; i++) {
     if(markerArr[i].markerID == markerID) {
       markerArr[i].upvotes = snap.val().upvotes;
       markerArr[i].downvotes = snap.val().downvotes;
       markerArr[i].recentActivity = snap.val().recentActivity;
       markerArr[i].recentActivityTime = snap.val().recentActivityTime;
     }
   }

   console.log(($("#stats-modal").data('bs.modal') || {})._isShown)
   if(($("#upvote-btn").attr("markerID-data") == markerID) && ($("#stats-modal").data('bs.modal') || {})._isShown) {
     $("#num-of-upvotes").text(snap.val().upvotes);
     $("#num-of-downvotes").text(snap.val().downvotes);
     $("#activity").text(snap.val().recentActivity);
     $("#activity-date").text(convertTimestamp(snap.val().recentActivityTime));
   }
});

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
