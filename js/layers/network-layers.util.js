import { fetchJSON } from '../util/util.js';

export const loadNetworkLayer = async (endpoint, name) => {
	const api_endpoint =
		'https://pcwnetworkmap-api.onrender.com';
	let layer_data;
	try {
		layer_data = await fetchJSON(api_endpoint + endpoint);
		map.addSource(name, {
			type: 'geojson',
			data: layer_data,
		});
	} catch (e) {
		'error loading network connection layer', name, e;
	}
	return layer_data;
};

export const initAnimateNetworkLine = (id) => {
	// technique based on https://jsfiddle.net/2mws8y3q/
	const dashSequence = [
		[0, 4, 3],
		[0.5, 4, 2.5],
		[1, 4, 2],
		[1.5, 4, 1.5],
		[2, 4, 1],
		[2.5, 4, 0.5],
		[3, 4, 0],
		[0, 0.5, 3, 3.5],
		[0, 1, 3, 3],
		[0, 1.5, 3, 2.5],
		[0, 2, 3, 2],
		[0, 2.5, 3, 1.5],
		[0, 3, 3, 1],
		[0, 3.5, 3, 0.5],
	];
	let step = 0;
	const animateNetworkLine = (timestamp = 0) => {
		// Update line-dasharray using the next value in dashArraySequence. The
		// divisor in the expression `timestamp / 100` controls the animation speed.
		const nextStep = parseInt((timestamp / 100) % dashSequence.length);
		if (nextStep !== step) {
			if (map.isStyleLoaded()) {
				map.setPaintProperty(id, 'line-dasharray', dashSequence[step]);
			}
			step = nextStep;
		}
		requestAnimationFrame(animateNetworkLine);
	};
	const stopAnimation = () => {
		cancelAnimationFrame(animateNetworkLine);
		step = 0;
	};
	return {
		start: animateNetworkLine,
		stop: stopAnimation,
	};
};

/**
 * @param {string} animationId 
 * @param {string} checkboxId 
 * @returns {HTMLInputElement} 
 */
export const bindCheckboxAnimation = (animationId, checkboxId) => {
	const {start, stop} = initAnimateNetworkLine(animationId);
	const checkbox = document.getElementById(checkboxId);

	const listener = function () {
		this.checked ? start() : stop();
	};
	checkbox.addEventListener('change', listener);
	map.on('layer-style-reset', () => {
		checkbox.removeEventListener('change', listener);
		checkbox.checked = false;
		stop();
	});

	return checkbox;
};
