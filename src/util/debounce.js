export const debounce = (() => {
	const timers = { leading: false };
	const LEADING = 'leading';
	// if the last argument of callback is true then debounce trigger function
	// before wait
	return function (callback, ms, uniqueId, leading = false) {
		if (leading && !timers[LEADING]) {
			callback();
			timers['leading'] = true;
		} else {
			if (timers[uniqueId]) clearTimeout(timers[uniqueId]);
			timers[uniqueId] = setTimeout(() => {
				if (!timers[LEADING]) callback();
				timers[LEADING] = false;
			}, ms);
		}
	};
})();
