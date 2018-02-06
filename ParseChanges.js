
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

module.exports= ParseChanges;
