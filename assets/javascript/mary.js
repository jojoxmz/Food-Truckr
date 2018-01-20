// var queryUrl = "https://api.foursquare.com/v2/venues/explore?client_id=NCFDMIMRBLCB1MNHTEXODLIWB2KWDVQBQ50ZTCYQ3X05N43Y&client_secret=JPMDM31IHWHU35E4EVKGG3BGVYWEZ4DHWHIHDP4YSQFBYSOB&v=20170801&ll=39.742043, -104.991531&query=food truck " + userInputSearch + "&limit=50";
//
//
// $.ajax({
//   url: queryUrl,
//   method: 'GET'
// }).done(function(response) {
//   console.log(response);
//   console.log(response.response.groups[0].items[0].venue);
//
//
//   for(var i=0; i< locationsArray.length; i++){
//     console.log(locationsArray[i].venue);
//   };
//
// });

const client_id = 'UBoDtdxOKSgJELPqsAtwag';
const client_secret = 'DluMc4r2kSvoSRdksiaNDNqkXiA9fFJKRPPWFruza63FtNGeRJrYaqCIN3StcVNZ';
const corsHeroku = 'https://cors-anywhere.herokuapp.com/';

fetch(`${corsHeroku}https://api.yelp.com/oauth2/token?client_id=${client_id}&client_secret=${client_secret}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify({ grant_type: 'client_credentials' })
})
  .then((res) => res.json())
  .then((resJSON) => resJSON.access_token)
  .then((accessToken) => {
    fetch(`${corsHeroku}https://api.yelp.com/v3/businesses/search?term=delis&latitude=39.710850&longitude=-105.081505`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${accessToken}`,
      }
    })
    .then(res =>  res.json())
    .then(res => {
      console.log('res', res)
    })
  })
  .catch(err => {
    console.log('err', err);
  });
