var Userservicejppoldk = require('userservicejppoldk');
var authorize = require('./authorize.js');

var authEndpoint = "https://testauth.jppol.dk/connect/token";

var clientId = "d4849a8f1e6245b4b74bd520f4159b3d";
var clientSecret = "YqEhP9qYK5tFImpekbhPmc3szf+sw50Ic29/24VaBgk=";
var token = "empty";
authorize.init(authEndpoint, clientId, clientSecret);

var Userservicejppoldk = require('userservicejppoldk');

var defaultClient = Userservicejppoldk.ApiClient.instance;
defaultClient.basePath = "https://userservicetest.jppol.dk";
console.log("defaultClient.basePath", defaultClient.basePath);

// Configure OAuth2 access token for authorization: clientAccess
var clientAccess = defaultClient.authentications['clientAccess'];
authorize.register(clientAccess);

var lookupApi = new Userservicejppoldk.LookupAndValidateApi()
authorize.register(clientAccess);
authorize.authorize();


var l = 1;
var r = 128;
var findMax = true;
var minChangeNumber = 1; // {Number} First change of interest

var callback = function(error, data, response) { 
	if (error) { 
		if(error.status == 405) {
			console.error("Client is not allowed to access change log.");
		}
		else {
			console.error(error); 
		}
	} 
	else { 
		console.log("items", data.length);
		if (findMax) {
			if (data.length >= 128){
				l = minChangeNumber;
				r = r * 2;
			} else if (data.length <= 1) {
				r = minChangeNumber; 
			} else {
				minChangeNumber += data.length;
				console.log("Found min change number", minChangeNumber);
				findMax = false;
				setInterval(function() { lookupApi.getChanges(minChangeNumber, callback); }, 10000);
				return;
			}

			minChangeNumber = parseInt((r + l) / 2, 10);
			console.log("Searching", l, minChangeNumber, r);
			lookupApi.getChanges(minChangeNumber, callback); 
		} else {
			data.forEach(function(item) { 
				minChangeNumber = Math.max(item.OperationNumber, minChangeNumber);
				console.log(item.Operation, item.OperationNumber, item.UserIdentifier, item.EventTime);
			});
			if (data.length > 128){
				lookupApi.getChanges(minChangeNumber, callback);
			}
		}
	} 
}; 

setTimeout(function() { lookupApi.getChanges(minChangeNumber, callback); }, 500);


console.log("hello world!");
