var Userservicejppoldk = require('userservicejppoldk');
var authorize = require('./authorize.js');
var program = require('commander');

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


var l = 1;
var r = 12800000;
var expandingRange = program.findMaximum;
var findMin = program.findMaximum;
var retrieving = false;
var maxChangeNumber = maxChange; // {Number} First change of interest

function FindMax(lookupApi, continuation){
	expandingRange = true;
	l = 0;
	r = 128000;
	m = (l + r) / 2;

	function callback(error, data, response) {
		if (error) {
			console.error('There was a problem connecting.', error);
			return;
		}
		console.log('Received', data.length, 'changes.', l, r, m, expandingRange);
		if (expandingRange) {
			m = r;
			r = r * 2;
			if(data.length < 128) {
				expandingRange = false;
			} 
		} else {
			if (data.length > 128) {
				l = m;
			} else if (data.length < 1) {
				r = m;
			} else {
				m = m + data.length;
				continuation(m);
				return;
			}
			m = parseInt((l + r) / 2, 10);
		}
		lookupApi.getChanges(m, callback);
	}

	function start() {
		lookupApi.getChanges(m, callback);
	}

	return {
		start: start
	};
};

function ParseChanges(lookupApi, receiver) {
	var m = 0;
	function callback(error, data, response) {
		data.forEach(function(item) { 
			m = Math.max(item.OperationNumber, m);
			receiver(item);
		});

		if (data.length == 0) {
			setTimeout(function() { lookupApi.getChanges(m, callback); }, 5000);
		} else {
			lookupApi.getChanges(m, callback);
		}
	}

	function start(maxChange) {
		m = maxChange;	
		lookupApi.getChanges(maxChange, callback);
	}

	return {
		start: start
	};
}

var pc = new ParseChanges(lookupApi, function(changeLogItem) {
	console.log(changeLogItem.Operation, changeLogItem.OperationNumber, changeLogItem.UserIdentifier, changeLogItem.EventTime);
	localStorage.setItem('maxChange', Math.max(maxChange, changeLogItem.OperationNumber));
});

var fm = new FindMax(lookupApi, pc.start);

if (program.findMaximum) {
	setTimeout(fm.start, 1000);
} else {
	setTimeout(function() { pc.start(maxChange); }, 1000);
}

console.log("Eagerly listening.");
