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


module.exports= FindMax;
