// Hook Creadet by Niall Crosby to avoid calling function twice in development mode.
// You can learn mare here:
// https://blog.ag-grid.com/avoiding-react-18-double-mount/
// https://stackoverflow.com/questions/48846289/why-is-my-react-component-is-rendering-twice

import { useEffect, useRef, useState } from 'react';

export const useEffectOnce = (effect: Function) => {
	const effectFn = useRef(effect);
	const destroyFn = useRef<Function>();
	const effectCalled = useRef(false);
	const rendered = useRef(false);
	const [, setVal] = useState(0);

	if (effectCalled.current) {
		rendered.current = true;
	}

	useEffect(() => {
		// only execute the effect first time around
		if (!effectCalled.current) {
			destroyFn.current = effectFn.current();
			effectCalled.current = true;
		}

		// this forces one render after the effect is run
		setVal((val) => val + 1);

		return () => {
			// if the comp didn't render since the useEffect was called,
			// we know it's the dummy React cycle
			if (!rendered.current) {
				return;
			}

			// otherwise this is not a dummy destroy, so call the destroy func
			if (destroyFn.current) {
				destroyFn.current();
			}
		};
	}, []);
};
