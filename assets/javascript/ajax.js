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

      console.log(response.businesses);
      console.log(sortedRatings);

console.log(response.businesses)
console.log(sortedRatings)


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
