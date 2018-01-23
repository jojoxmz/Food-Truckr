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

      // for (var i = 0; i < 6; i++) {
    const sortedRatings = _.sortBy(response.businesses, function(business) {
        return - business.rating;
      });

      console.log('hoopefully sorted array', sortedRatings);

      let i = 0;
      while (i < 6) {
        $(`#truck-${i + 1}-thumbnail`).attr("src", sortedRatings[i].image_url);
        $(`#truck-${i + 1}-name`).text(sortedRatings[i].name);
        $(`#truck-${i +1}-image`).attr("src", sortedRatings[i].image_url);
        $(`#truck-${i+1}-rating`).text("Rating: " + sortedRatings[i].rating);
        $(`#truck-${i + 1}-phone`).text("Phone number: " + sortedRatings[i].phone);
        $(`#truck-${i + 1}-hours`).text("Hours: " + sortedRatings[i].is_closed);
        if(sortedRatings[i].is_closed === true){
        $(".hours-div").text("This food truck is currently <strong>closed</strong>");
        }
        if(sortedRatings[i].is_closed === false){
        $(".hours-div").text("This food truck is currently open!");
        }
        i++
      }

console.log(response.businesses)
console.log(sortedRatings)
      // var truck1Thumbnail = $("#truck-1-thumbnail").attr("src", response.businesses[0].image_url);
      // var truck1Name = $("#truck-1-name").text(response.businesses[0].name);
      // var truck1Image = $("#truck-1-image").attr("src", response.businesses[0].image_url);
      // var truck1Rating = $("#truck-1-rating").text("Rating " + response.businesses[0].rating);

      // var truck2Thumbnail = $("#truck-2-thumbnail").attr("src", response.businesses[1].image_url);
      // var truck2Name = $("#truck-2-name").text(response.businesses[1].name);
      // var truck2Image = $("#truck-2-image").attr("src", response.businesses[1].image_url);
      // var truck2Rating = $("#truck-2-rating").text("Rating " + response.businesses[1].rating);

      // var truck3Thumbnail = $("#truck-3-thumbnail").attr("src", response.businesses[2].image_url);
      // var truck3Name = $("#truck-3-name").text(response.businesses[2].name);
      // var truck3Image = $("#truck-3-image").attr("src", response.businesses[2].image_url);
      // var truck3Rating = $("#truck-3-rating").text("Rating " + response.businesses[2].rating);

      // var truck4Thumbnail = $("#truck-4-thumbnail").attr("src", response.businesses[3].image_url);
      // var truck4Name = $("#truck-4-name").text(response.businesses[3].name);
      // var truck4Image = $("#truck-4-image").attr("src", response.businesses[3].image_url);
      // var truck4Rating = $("#truck-4-rating").text("Rating " + response.businesses[3].rating);

      // var truck5Thumbnail = $("#truck-5-thumbnail").attr("src", response.businesses[6].image_url);
      // var truck5Name = $("#truck-5-name").text(response.businesses[6].name);
      // var truck5Image = $("#truck-5-image").attr("src", response.businesses[6].image_url);
      // var truck5Rating = $("#truck-5-rating").text("Rating " + response.businesses[6].rating);

      // var truck6Thumbnail = $("#truck-6-thumbnail").attr("src", response.businesses[5].image_url);
      // var truck6Name = $("#truck-6-name").text(response.businesses[5].name);
      // var truck6Image = $("#truck-6-image").attr("src", response.businesses[5].image_url);
      // var truck6Rating = $("#truck-6-rating").text("Rating " + response.businesses[5].rating);


    });
  });
};

displayTruckInfo();

var truckIdArray = ["east-coast-joes-denver", "the-gyros-king-food-truck-denver", "stella-blue-food-truck-denver", "rocky-mountain-slices-denver", "ba-nom-a-nom-denver", "flex-able-food-trucks-denver"];

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
      // .then(response => {
      //   console.log(response);

        .then(response => {
                console.log('what is our response', response);


                var truckReview = $("#truck-" + (i+1) + "-reviews").html("Reviews: " + response.reviews.length);
                response.reviews.forEach(function(review, j) {
                  console.log(review)
                  truckReview.append("<br />" + review.text + "<hr />");
                })
                console.log('what is truck review', truckReview)

              });
        // + '<br>' + response.reviews[2].text);
      // });
    });
  });
}

displayTruckReviews();


$("#truck-query").on("click", function() {
  event.preventDefault();

  var searchTerm = $("#search-term").val().trim();

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
      console.log(searchTerm);
      console.log(response);

    });
  });
});
