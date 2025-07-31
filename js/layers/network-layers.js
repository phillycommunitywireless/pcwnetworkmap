import loadIcons from '../load-icons.js';
import {
	bindCheckboxAnimation,
	loadNetworkLayer,
} from './network-layers.util.js';

/**
 * @async
 * @returns {Promise<LayerData | null>} 
 */
export const loadNetworkPoints = async () => {
	try {
		await loadIcons();
		const network_points_data = await loadNetworkLayer(
			'/get_networkpoints',
			'network-points'
		);

		if (!network_points_data) {
			alert('Error loading network points');
			throw ReferenceError("Didn't load required network points");
		}

		map.addLayer({
			id: 'network-points-layer',
			type: 'symbol',
			source: 'network-points',
			layout: {
				'icon-image': [
					'match',
					['get', 'type'],
					'HS',
					'HS_icon',
					'RH',
					'RH_icon',
					'MN',
					'MN_icon',
					'LB',
					'LB_icon',
					'default-icon',
				],
				'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.01, 17, 0.45],
				'icon-allow-overlap': false,
				'icon-ignore-placement': true,
			},
			paint: {
				'icon-opacity': 0.85,
				'text-halo-color': 'rgb(255, 255, 255)',
				'text-halo-width': 2,
				'text-halo-blur': 0.5,
			},
		});
		return network_points_data;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export const loadNetworkLayers = () => {
	// Level 1
	loadNetworkLayer('/get_level1', 'line').then(() => {
		const animationLineId = 'highsite-line';
		map.addLayer({
			type: 'line',
			source: 'line',
			id: animationLineId,
			layout: {
				visibility: 'none',
			},
			minzoom: 13,
			paint: {
				'line-color': 'lime',
				'line-width': 2,
				'line-opacity': 0.65,
			},
		});
		const cb = bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks');
		cb.disabled = false;
	});

	// Level 2
	loadNetworkLayer('/get_level2', 'new-line').then(() => {
		const animationLineId = 'wiredap-line';
		map.addLayer({
			type: 'line',
			source: 'new-line',
			id: animationLineId,
			layout: {
				visibility: 'none',
			},
			minzoom: 13,
			paint: {
				'line-color': 'magenta',
				'line-width': 4,
				'line-opacity': 0.65,
			},
		});
		const cb = bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks2');
		cb.disabled = false;
	});

	// Level 3
	loadNetworkLayer('/get_level3', 'new-line2').then(() => {
		const animationLineId = 'meshnode-line';
		map.addLayer({
			type: 'line',
			source: 'new-line2',
			id: animationLineId,
			layout: {
				visibility: 'none',
			},
			minzoom: 13,
			paint: {
				'line-color': 'yellow',
				'line-width': 4,
				'line-opacity': 0.65,
			},
		});
		const cb = bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks3');
		cb.disabled = false;
	});

	// Level 4
	loadNetworkLayer('/get_level4', 'new-line3').then(() => {
		const animationLineId = 'ptp-line';
		map.addLayer({
			type: 'line',
			source: 'new-line3',
			id: animationLineId,
			layout: {
				visibility: 'none',
			},
			minzoom: 13,
			paint: {
				'line-color': 'red',
				'line-width': 4,
				'line-opacity': 0.65,
			},
		});
		const cb = bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks4');
		cb.disabled = false;
	});
};
