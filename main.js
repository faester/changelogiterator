var Userservicejppoldk = require('userservicejppoldk');
var authorize = require('./authorize.js');
var program = require('commander');
var ParseChanges = require('./parsechanges.js');
var FindMax = require('./findmax.js');

program
	.version('0.1.0')
	.option('-i, --id [value]', 'auth.jppol.dk client id')
	.option('-s, --secret [value]', 'auth.jppol.dk client secret')
	.option('-A, --auth [value]', 'Authorization endpoint')
	.option('-U, --userservice [value]', 'Userservice endpoint')
	.option('-m, --maxChange [value]', 'Minimum change number', parseInt)
	.option('-M, --findMaximum')
	.parse(process.argv);

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

parameters = ['id', 'secret', 'auth', 'userservice', 'maxChange'];

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
var maxChange = localStorage.getItem('maxChange');

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
var crudApi = new Userservicejppoldk.UserCrudApi();


var l = 1;
var r = 12800000;
var expandingRange = program.findMaximum;
var findMin = program.findMaximum;
var retrieving = false;
var maxChangeNumber = maxChange; // {Number} First change of interest

var logUser = function(error, data, response) {
	console.log(data);
}

var pc = new ParseChanges(lookupApi, function(changeLogItem) {
	console.log(changeLogItem.Operation, changeLogItem.OperationNumber, changeLogItem.UserIdentifier, changeLogItem.EventTime);

	if (changeLogItem.Operation == "Create" || changeLogItem.Operation == "Update"){
		crudApi.getUserById(changeLogItem.UserIdentifier, logUser);
	}

	localStorage.setItem('maxChange', Math.max(maxChange, changeLogItem.OperationNumber));
});

var fm = new FindMax(lookupApi, pc.start);

if (program.findMaximum) {
	setTimeout(fm.start, 1000);
} else {
	setTimeout(function() { pc.start(maxChange); }, 1000);
}

console.log("Eagerly listening.");
