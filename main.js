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
		console.log('Lookup API called successfully.'); 
		data.forEach(function(x) { 
			console.log( x.OperationNumber, x.Operation, x.EventTime, x.UserIdentifier); 
			minChangeNumber = Math.max(minChangeNumber, x.OperationNumber);
		});
	} 
}; 

setInterval(function() { lookupApi.getChanges(minChangeNumber, callback); }, 500);


console.log("hello world!");
