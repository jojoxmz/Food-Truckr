var myform = $("form#myform");
var thankYou= $(".thank-you");

myform.submit(function(event){
	event.preventDefault();
   	myform.empty();
   	thankYou.show();

  // Change to your service ID, or keep using the default service
  var service_id = "default_service";
  var template_id = "contactus";

  myform.find("button").text("Sending...");
  emailjs.sendForm(service_id,template_id,"myform")
  	.then(function(){ 
    	console.log("Sent!");
       myform.find("button").text("Send");
    }, function(err) {
       console.log("Send email failed!\r\n Response:\n " + JSON.stringify(err));
       myform.find("button").text("Send");
    });
  return false;
});