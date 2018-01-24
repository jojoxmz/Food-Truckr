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
var inactiveMarkersRef = firebase.database().ref("inactiveMarkers");
var inactiveTruckDataRef = firebase.database().ref("inactiveTruckData");


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
var locationInfoWindow = null;
var locationRadiusCircle = null;
var modalTimeout = null;

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
     this.pinTime = firebase.database.ServerValue.TIMESTAMP;
     this.recentActivity = "Pinned";
     this.recentActivityTime = firebase.database.ServerValue.TIMESTAMP;
     this.status = "active";
   }
 }

 function convertTimestamp(timestamp) {
   var newDate = moment(timestamp).format();
   return moment(newDate).fromNow();
 }

function isMarkerStale(timestamp) {
  var newDate = moment(timestamp).format();
  var differenceInMin = moment().diff(newDate, 'minutes', true);
  console.log(differenceInMin);
  if(differenceInMin > 1440) {
    return true;
  } else {
    return false;
  }
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

 $("#stats-modal").on("hidden.bs.modal", function () {
   $("#removal-msg").hide();
   $("#recent-activity").show();
   $("#upvote-btn, #downvote-btn").removeAttr("disabled");
   $("#stats-modal-body").removeClass("box-glow");
   $("#recent-activity").removeClass("text-glow");
 });

 markersRef.on('value', function(snapshot) {

  if (initialDisplaySet == false) {
    snapshot.forEach(function(childNodes) {

      console.log(isMarkerStale(childNodes.val().pinTime));
      if(childNodes.val().status == "active") {

        if(isMarkerStale(childNodes.val().pinTime)) {

          var key = (childNodes.key).toString();
          var truck = childNodes.val().truckID;
          markersRef.child(key).update({
            status: "inactive",
            inactiveReason: "stale"
          })

          trucksRef.child(truck).child("markers").child(key).update({
            status: "inactive",
            inactiveReason: "stale"
          })

        } else {
          var markerID = (childNodes.key).toString();
          var lat = childNodes.val().lat;
          var lng = childNodes.val().lng;
          var truckName = childNodes.val().truckName;
          var truckID = childNodes.val().truckID;
          var upvotes = childNodes.val().upvotes;
          var downvotes = childNodes.val().downvotes;
          var recentActivity = childNodes.val().recentActivity;
          var recentActivityTime = childNodes.val().recentActivityTime;
          var pinTime = childNodes.val().pinTime;

          var infowindow = new google.maps.InfoWindow;
          var marker = new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map: map,
            title: truckName,
            truckID: truckID,
            markerID: markerID,
            upvotes: upvotes,
            downvotes: downvotes,
            recentActivity: recentActivity,
            recentActivityTime: recentActivityTime,
            pinTime: pinTime
          });

          markerArr.push(marker);

          //Enclosing reference to marker
          function attachClickEvent(marker) {
            google.maps.event.addListener(marker, "click", setModalDisplay);
          }
          attachClickEvent(marker);
        }
      }
    });
  }
    initialDisplaySet = true;
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: denverCenter
  });

  google.maps.event.addListener(map, "click", function() {
    if(locationRadiusCircle != null) {
      locationRadiusCircle.setMap(null);
      locationRadiusCircle = null;
    }
  })
}

function resetLocationWindowAndCircle() {
  if(locationInfoWindow != null) {
    locationInfoWindow.close();
    locationInfoWindow = null;
  }

  if(locationRadiusCircle != null) {
    locationRadiusCircle.setMap(null);
    locationRadiusCircle = null;
  }
}

$(".reset").on("click",function() {
  map.setOptions({
     center: denverCenter,
     zoom: 12
   });
   resetLocationWindowAndCircle();
})

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

function displayNearbyTrucks(radius) {
  infoWindowError = new google.maps.InfoWindow;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

    locationRadiusCircle = new google.maps.Circle({
        strokeColor: '#18BC9C',
        strokeOpacity: 0.7,
        strokeWeight: 2,
        fillColor: '#18BC9C',
        fillOpacity: 0.25,
        map: map,
        center: pos,
        radius: (parseFloat(radius) * 1609)
      });

      map.setCenter(pos);
      map.fitBounds(locationRadiusCircle.getBounds());

      locationInfoWindow = new google.maps.InfoWindow({
        content: "YOU ARE HERE",
        position: pos
      });

      locationInfoWindow.open(map);
    }, function() {
      handleLocationError(true, infoWindowError, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWindowError, map.getCenter());
  }
}

$(".dropdown-item").on("click", function() {
  resetLocationWindowAndCircle();
  var radius = $(this).attr("data-number");
  displayNearbyTrucks(radius);
});

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
      recentActivityTime: newMarkerData.recentActivityTime,
      pinTime: newMarkerData.pinTime
    });

    map.setZoom(18);
    map.panTo(marker.position);

    //Push new marker to associative array
    markerArr.push(marker);

    //Enclosing reference to marker
    function attachNewClickEvent(marker) {
      google.maps.event.addListener(marker, "click", setModalDisplay)
    }

    attachNewClickEvent(marker);

    var updates = {};
    updates['/markers/' + newKey] = newMarkerData;
    updates['/trucks/' + newMarkerData.truckID + '/markers/' + newKey] = newMarkerData;
    console.log(updates);
    database.ref().update(updates);
  });
}

$("#upvote-btn, #downvote-btn").on("click", function() {
   if($(this).attr("id") == "upvote-btn") {
     var currentUpVotes = parseInt($("#num-of-upvotes").text());
     var markerID = $(this).attr("markerID-data");

     currentUpVotes++;
     updateFbUpVoteCount(currentUpVotes, markerID);

  } else if ($(this).attr("id") == "downvote-btn") {
     var currentDownVotes = parseInt($("#num-of-downvotes").text());
     var markerID = $(this).attr("markerID-data");

     currentDownVotes++;
     updateFbDownVoteCount(currentDownVotes, markerID);
  }

  //*****ADDED WEDNESDAY*******///
  //$("#upvote-btn, #downvote-btn").attr("disabled", "disabled");
});

function updateFbUpVoteCount(currentUpVotes, markerID) {
  for(i = 0; i < markerArr.length; i++) {

    if(markerArr[i].markerID == markerID) {
      var truckName = markerArr[i].title;
      var truckID = markerArr[i].truckID;

      markersRef.child(markerID).update({
        upvotes: currentUpVotes,
        recentActivity: "Location upvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      })

      trucksRef.child(truckID).child("markers").child(markerID).update({
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

      markersRef.child(markerID).update({
        downvotes: currentDownVotes,
        recentActivity: "Location downvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      })

      trucksRef.child(truckID).child("markers").child(markerID).update({
        downvotes: currentDownVotes,
        recentActivity: "Location downvoted",
        recentActivityTime: firebase.database.ServerValue.TIMESTAMP
      });

      if(currentDownVotes == 3) {
        markersRef.child(markerID).update({
          status: "inactive",
          inactiveReason: "downvotes"
        })

        trucksRef.child(truckID).child("markers").child(markerID).update({
          status: "inactive",
          inactiveReason: "downvotes"
        });
      }

    }
  }
}

function removeMarkerOnDownVote(markerID) {
  for(i = 0; i < markerArr.length; i++) {

    if(markerArr[i].markerID == markerID) {
      var truckName = markerArr[i].title;
      var truckID = markerArr[i].truckID;

      markersRef.child(markerID).remove();
      trucksRef.child(truckID).child(markerID).remove();
    }
  }
}

markersRef.on("child_added", function(snap) {
  if(initialDisplaySet == true) {

    var isCurrentPinner = false;
    for(var i = 0; i < markerArr.length; i++) {
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
    }
    console.log("Marker array on child added: " + markerArr);
    console.log(markerArr);
    console.log("Array length on child added: " +  markerArr.length);
  }
});

markersRef.on("child_changed", function(snap) {
   var markerID = snap.val().markerID;

   console.log("Status: " + snap.val().status)
   if(snap.val().status == "inactive") {
     removeMarkerFromDisplayAndSetModalAlert(markerID, snap);
   } else {
     for(var i = 0; i < markerArr.length; i++) {
       if(markerArr[i].markerID == markerID) {
         markerArr[i].upvotes = snap.val().upvotes;
         markerArr[i].downvotes = snap.val().downvotes;
         markerArr[i].recentActivity = snap.val().recentActivity;
         markerArr[i].recentActivityTime = snap.val().recentActivityTime;
      }
    }

   if(($("#upvote-btn").attr("markerID-data") == markerID) && ($("#stats-modal").data('bs.modal') || {})._isShown) {
     $("#num-of-upvotes").text(snap.val().upvotes);
     $("#num-of-downvotes").text(snap.val().downvotes);
     $("#activity").text(snap.val().recentActivity);
     $("#activity-date").text(convertTimestamp(snap.val().recentActivityTime));

     //ADDED WEDNESDAY
     $("#stats-modal-body").addClass("box-glow");
     $("#recent-activity").addClass("text-glow");

     if(modalTimeout != null) {
       clearTimeout(modalTimeout);
     }

     modalTimeout = setTimeout(function() {
       $("#stats-modal-body").removeClass("box-glow");
       $("#recent-activity").removeClass("text-glow");
     }, 2500)
   }
 }
});

function removeMarkerFromDisplayAndSetModalAlert(markerID, snap) {
  for(var i = 0; i < markerArr.length; i++) {
    if(markerArr[i].markerID == markerID) {
      markerArr[i].setMap(null);
      markerArr[i] = null;
      markerArr.splice(i, 1);
    }
  }

  if(($("#upvote-btn").attr("markerID-data") == markerID) && ($("#stats-modal").data('bs.modal') || {})._isShown) {
    $("#upvote-btn, #downvote-btn").attr("disabled", "disabled");
    $("#num-of-upvotes").text(snap.val().upvotes);
    $("#num-of-downvotes").text(snap.val().downvotes);
    $("#recent-activity").hide();
    $("#activity, #activity-date").text("");

    if(snap.val().downvotes == 3) {
      $("#removal-msg").text("Removing pin due to significant downvotes.").show();
    } else {
      $("#removal-msg").text("Removing pin as stale.").show();
    }

    setTimeout(function() {
     $("#stats-modal").modal("hide");
   }, 4000)
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
