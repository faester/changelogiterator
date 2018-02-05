"use strict";
var request = require("request");
class Authorize {

	init(endpoint, clientId, clientSecret){
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.endpoint = endpoint;
	}

	register(client) {
		if (this.clients == null) {
			this.clients = [];
		}
		this.clients.push(client);
	}	

	authorize() {
		var me = this;
		var authRequest = request.post({url: this.endpoint, form: {
			grant_type: 'client_credentials',
			scope: 'userservice',
			client_id: this.clientId,
			client_secret: this.clientSecret
		},
		auth: {'user': this.clientId, 'pass': this.clientSecret}
		}, function(error, response, body){
			console.log('error:', error);
			var response = JSON.parse(body);
			console.log(response.expires_in);
			setTimeout(function() { me.authorize() }, response.expires_in * 750); // Reload after 75% of validity
			if (me.clients == null) { me.clients = []; }
			me.clients.forEach(function(client) { 
				client.accessToken = response.access_token; });
		});
		}
}

module.exports= new Authorize();
