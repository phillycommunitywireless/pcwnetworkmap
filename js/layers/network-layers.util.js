import { fetchJSON } from '../util/util.js';
import { showMapError } from '../util/map-error.js';

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
		console.error('error loading network connection layer', name, e);
		showMapError();
		// No source was added, so callers must not add a layer for it.
		return undefined;
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
	let frameId = null;
	const animateNetworkLine = (timestamp = 0) => {
		// Update line-dasharray using the next value in dashArraySequence. The
		// divisor in the expression `timestamp / 100` controls the animation speed.
		const nextStep = parseInt((timestamp / 100) % dashSequence.length);
		if (nextStep !== step) {
			// a frame can land after setStyle() has dropped the layer
			if (map.getLayer(id)) {
				map.setPaintProperty(id, 'line-dasharray', dashSequence[step]);
			}
			step = nextStep;
		}
		frameId = requestAnimationFrame(animateNetworkLine);
	};
	const startAnimation = () => {
		if (frameId === null) animateNetworkLine();
	};
	const stopAnimation = () => {
		if (frameId !== null) cancelAnimationFrame(frameId);
		frameId = null;
		step = 0;
		// a stop() after a style switch would otherwise target a layer that no longer exists
		if (map.getLayer(id)) map.setPaintProperty(id, 'line-dasharray', [1, 0]);
	};
	return {
		start: startAnimation,
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
	// once, not on: setStyle() drops this layer and loadNetworkLayers creates a fresh
	// binding, so a persistent handler would leak one per basemap switch and keep
	// calling stop() against a layer that is gone. Checkbox state on reset
	// (unchecked + disabled) is handled for all four lines in bind-elements.js.
	map.once('layer-style-reset', () => {
		checkbox.removeEventListener('change', listener);
		stop();
	});

	return checkbox;
};
