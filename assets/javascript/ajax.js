// Creating our ajax call for yelp API
const client_id = 'UBoDtdxOKSgJELPqsAtwag';
const client_secret = 'DluMc4r2kSvoSRdksiaNDNqkXiA9fFJKRPPWFruza63FtNGeRJrYaqCIN3StcVNZ';
const corsHeroku = 'https://cors-anywhere.herokuapp.com/';

function displayTruckInfo(){

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
    fetch(`${corsHeroku}https://api.yelp.com/v3/businesses/search?term=foodtrucks&latitude=39.742043&longitude=-104.991531`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${accessToken}`,
      }
    })
    .then(response =>  response.json())
    .then(response => {
      console.log(response);


      const sortedRatings = _.sortBy(response.businesses, function(business) {
        return - business.rating;
      });

      console.log('hopefully sorted array', sortedRatings);

      let i = 0;

      while (i < 6) {
        $(`#truck-${i + 1}-thumbnail`).attr("src", sortedRatings[i].image_url);
        $(`#truck-${i + 1}-name`).text(sortedRatings[i].name);
        $(`#truck-${i +1}-image`).attr("src", sortedRatings[i].image_url);
        $(`#truck-${i+1}-rating`).text("Rating: " + sortedRatings[i].rating);
        $(`#truck-${i + 1}-phone`).text("Phone number: " + sortedRatings[i].phone);
        $(`#truck-${i + 1}-hours`).text("Hours: " + sortedRatings[i].is_closed);
        $(`#thumb-truck-${i+1}-name`).text(sortedRatings[i].name);
        if(sortedRatings[i].is_closed === true || sortedRatings[i].is_closed === false){
          $(".hours-div").text("No hours of operation information is available. Please call phone number below");
        }
        i++
      }

console.log(response.businesses)
console.log(sortedRatings)


    });
  });
};

displayTruckInfo();

var truckIdArray = ["the-gyros-king-food-truck-denver", "stella-blue-food-truck-denver", "batter-crepe-company-denver", "east-coast-joes-denver", "smokestack-70-denver", "flex-able-food-trucks-denver"];

function displayTruckReviews() {
  truckIdArray.forEach(function(truckId, i) {
    return fetch(`${corsHeroku}https://api.yelp.com/oauth2/token?client_id=${client_id}&client_secret=${client_secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ grant_type: 'client_credentials' })
    })
    .then((response) => response.json())
    .then((responseJSON) => responseJSON.access_token)
    .then((accessToken) => {
      fetch(corsHeroku + "https://api.yelp.com/v3/businesses/" + truckId + "/reviews", {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${accessToken}`,
        }
      })
      .then(response =>  response.json())

      .then(response => {
        console.log('what is our response', response);

        var truckReview = $("#truck-" + (i+1) + "-reviews").html("Reviews: " + response.reviews.length);
        response.reviews.forEach(function(review, j) {
          console.log(review)
          truckReview.append("<br />" + review.text + "<hr />");
        })
        console.log('what is truck review', truckReview)
      });
    });
  });
}

displayTruckReviews();

// Creating functionality for displaying and hiding top-6 cards when corresponding thumbnail is clicked

var thumbnailArray = ["#thumbnail-1-link", "#thumbnail-2-link", "#thumbnail-3-link", "#thumbnail-4-link", "#thumbnail-5-link", "#thumbnail-6-link"];

var cardArray = ["#portfolio-modal-1", "#portfolio-modal-2", "#portfolio-modal-3", "#portfolio-modal-4", "#portfolio-modal-5", "#portfolio-modal-6"]

var resetHiddenDivs = function() {
  $.each(cardArray, function(i){
    $(cardArray[i]).addClass("hidden-divs");
  });
};

$.each(thumbnailArray, function(i){
  $(thumbnailArray[i]).click( function(){
    resetHiddenDivs();
    if ($(`#portfolio-modal-${i+1}`).hasClass("hidden-divs")) {
      $(`#portfolio-modal-${i+1}`).removeClass("hidden-divs");
    } else {
      $(`#portfolio-modal-${i+1}`).addClass("hidden-divs");
    }
  });
});

$(".portfolio-cards").on("click", ".dismiss", function(){
 resetHiddenDivs();
});