var Userservicejppoldk = require('userservicejppoldk');
var authorize = require('./authorize.js');
var program = require('commander');

program
	.version('0.1.0')
	.option('-i, --id [value]', 'auth.jppol.dk client id')
	.option('-s, --secret [value]', 'auth.jppol.dk client secret')
	.option('-A, --auth [value]', 'Authorization endpoint')
	.option('-U, --userservice [value]', 'Userservice endpoint')
	.option('-m, --minChange [value]', 'Minimum change number', parseInt)
	.option('-M, --findMinimum')
	.parse(process.argv);

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

parameters = ['id', 'secret', 'auth', 'userservice', 'minChange'];

parameters.forEach(function(p) {
if (program[p] != null) {
       	console.log (p,'found on command line, setting to', program[p]);	
	localStorage.setItem(p, program[p]); 
} else {
	if (localStorage.getItem(p) === null) {
		console.error(p, 'missing from command line and not found in local storage');
		throw 'wrong config'
	}
}
});



var auth = localStorage.getItem('auth'); 
var userservice = localStorage.getItem('userservice'); 
var clientId = localStorage.getItem('id'); 
var clientSecret = localStorage.getItem('secret');
var minChange = localStorage.getItem('minChange');

var token = "empty";
authorize.init(auth, clientId, clientSecret);
authorize.authorize();

var Userservicejppoldk = require('userservicejppoldk');

var defaultClient = Userservicejppoldk.ApiClient.instance;
defaultClient.basePath = userservice;
console.log("defaultClient.basePath", defaultClient.basePath);

// Configure OAuth2 access token for authorization: clientAccess
var clientAccess = defaultClient.authentications['clientAccess'];
authorize.register(clientAccess);

var lookupApi = new Userservicejppoldk.LookupAndValidateApi()
authorize.register(clientAccess);


var l = 1;
var r = 12800000;
var expandingRange = program.findMinimum;
var findMin = program.findMinimum;
var retrieving = false;
var minChangeNumber = minChange; // {Number} First change of interest

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
		if (expandingRange) {
			if (data.length > 128) {
				r = r * 2;
			} else {
				minChangeNumber = r;
				r = r * 2;
				expandingRange = false;
			}
			console.log("Expanding range", r);
			lookupApi.getChanges(r, callback); 
		} else if (findMin) {
			if (data.length >= 128){
				l = minChangeNumber;
			} else if (data.length <= 1) {
				r = minChangeNumber; 
			} else {
				minChangeNumber += data.length - 1;
				findMin = false;
				console.log("Found min change number", minChangeNumber);
				return;
			}

			minChangeNumber = parseInt((r + l) / 2, 10);
			console.log("Searching", l, "to", r, "size", r - l);
			lookupApi.getChanges(minChangeNumber, callback); 
			localStorage.setItem('minChange', minChangeNumber);
		} else if (!retrieving) {
			retrieving = true;
			console.log('minimum change', minChangeNumber);
			lookupApi.getChanges(minChangeNumber, callback);
		} else {
			data.forEach(function(item) { 
				minChangeNumber = Math.max(item.OperationNumber, minChangeNumber);
				localStorage.setItem('minChange', minChangeNumber);
				console.log(item.Operation, item.OperationNumber, item.UserIdentifier, item.EventTime);
			});
			if (data.length > 128){
				lookupApi.getChanges(minChangeNumber, callback);
			} else {
				setTimeout(function() { lookupApi.getChanges(minChangeNumber, callback); }, 5000);
			}
		}
	} 
}; 

setTimeout(function() { lookupApi.getChanges(minChangeNumber, callback); }, 1000);


console.log("hello world!");
