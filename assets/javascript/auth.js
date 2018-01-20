var config = {
  apiKey: "AIzaSyBjhon0-cIYtELUMFxUT0isynUMCxaNp9Y",
  authDomain: "food-truckr.firebaseapp.com",
  databaseURL: "https://food-truckr.firebaseio.com",
  projectId: "food-truckr",
  storageBucket: "food-truckr.appspot.com",
  messagingSenderId: "463131017710"
};

firebase.initializeApp(config);

//Test data
var email = "gregbrod@gmail.com";
var password = "testpassword22"
var displayName =  "gregggyyy";
var newUser = true;

var database = firebase.database();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var usersRef = firebase.database().ref("users");
var markersRef = firebase.database().ref("markers");
var trucksRef = firebase.database().ref("trucks");

connectedRef.on("value", function(snap) {
  if (snap.val()) {
    var con = connectionsRef.push(true);
    con.onDisconnect().remove();
  }
});

//the event listener should be once email and password submitted(after veryifying OK) and
//should pull from form. This is just to test whether we may create a new account on firebase.
/*$(".nav-item").on("click", function() {
  alert("called");

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error.code);
    console.log(error.msg);
  });
});

firebase.auth().onAuthStateChanged(function(user) {
  alert("auth status changed")
  if (user) {

    usersRef.child(user.uid).set({
      displayName: displayName,
      uid: user.uid,
      email: user.email
    });

  console.log("The user is singed in");
  } else {
  console.log("The user is not signed in");
  }
});
