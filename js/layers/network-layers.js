import loadIcons from '../load-icons.js';
import {
	bindCheckboxAnimation,
	loadNetworkLayer,
} from './network-layers.util.js';

// The points layer is shared by both tabs; the Signal tab shows smaller icons so the
// heatmap underneath stays readable. syncTabLayers (bind-elements.js) swaps between them.
export const NETWORK_ICON_SIZE = ['interpolate', ['linear'], ['zoom'], 0, 0.01, 17, 0.45];
export const SIGNAL_ICON_SIZE = ['interpolate', ['linear'], ['zoom'], 0, 0.01, 17, 0.32];

// Every connection line is on by default. Enabling the checkbox and ticking it is enough
// when the Signal tab is open: syncTabLayers (bind-elements.js) shows the line and starts
// its animation when the visitor switches to the Network tab. If the Network tab is already
// open (a basemap switch rebuilds the layers mid-visit), fire the change now.
const enableByDefault = (checkbox) => {
	checkbox.disabled = false;
	checkbox.checked = true;
	if (document.querySelector('input[name="sidebar-tab"]:checked')?.value === 'tab-links') {
		checkbox.dispatchEvent(new Event('change'));
	}
};

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
				'icon-size': NETWORK_ICON_SIZE,
				'icon-allow-overlap': false,
				'icon-ignore-placement': true,

				// Display network points on top of 3d buildings 
				'symbol-z-order': 'auto',
				'symbol-placement': 'point',
				'symbol-z-elevate': true

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
	// Lift the connection lines off the ground so they read as 3D alongside the
	// building-elevated point icons (which use `symbol-z-elevate`). Mapbox has no
	// line equivalent that auto-snaps to building height, so this is a single
	// constant offset (meters) rather than a per-endpoint match — good enough to
	// stop the lines lying flat on the street. Requires `line-elevation-reference`
	// to be set; both props need mapbox-gl >= 3.8 (we're on 3.17). Tune per level
	// if high-site links want more lift than rooftop/mesh links. The paint
	// blocks below set `line-emissive-strength` so the lifted lines stay bright
	// above the shaded 3D buildings instead of going dim.
	// NOTE: requires the mercator projection (set in map-init.js) — `line-z-offset`
	// is silently ignored under Mapbox's default globe projection.
	const LINE_Z_OFFSET_M = 35;
	// Level 1
	loadNetworkLayer('/get_level1', 'line').then((data) => {
		// Leave the checkbox disabled if the fetch failed; there is no source to draw.
		if (!data) return;
		const animationLineId = 'highsite-line';
		map.addLayer({
			type: 'line',
			source: 'line',
			id: animationLineId,
			layout: {
				visibility: 'none',
				'line-elevation-reference': 'ground',
				'line-z-offset': LINE_Z_OFFSET_M,
			},
			minzoom: 13,
			paint: {
				'line-color': '#5E35B1',
				'line-width': 2,
				'line-opacity': 0.65,
				'line-emissive-strength': 1,
			},
		});
		map.fire('line-layer-added');
		enableByDefault(bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks'));
	});

	// Level 2
	loadNetworkLayer('/get_level2', 'new-line').then((data) => {
		// Leave the checkbox disabled if the fetch failed; there is no source to draw.
		if (!data) return;
		const animationLineId = 'wiredap-line';
		map.addLayer({
			type: 'line',
			source: 'new-line',
			id: animationLineId,
			layout: {
				visibility: 'none',
				'line-elevation-reference': 'ground',
				'line-z-offset': LINE_Z_OFFSET_M,
			},
			minzoom: 13,
			paint: {
				// cabling: light grey, solid (wireless links are the coloured, animated ones)
				'line-color': '#BDBDBD',
				'line-width': 4,
				'line-opacity': 0.85,
				'line-emissive-strength': 1,
			},
		});
		map.fire('line-layer-added');
		// Wired links stay solid; only the wireless links (levels 1, 3, 4) animate.
		enableByDefault(document.getElementById('toggleNetworkLinks2'));
	});

	// Level 3
	loadNetworkLayer('/get_level3', 'new-line2').then((data) => {
		// Leave the checkbox disabled if the fetch failed; there is no source to draw.
		if (!data) return;
		const animationLineId = 'meshnode-line';
		map.addLayer({
			type: 'line',
			source: 'new-line2',
			id: animationLineId,
			layout: {
				visibility: 'none',
				'line-elevation-reference': 'ground',
				'line-z-offset': LINE_Z_OFFSET_M,
			},
			minzoom: 13,
			paint: {
				'line-color': '#FF7043',
				'line-width': 4,
				'line-opacity': 0.65,
				'line-emissive-strength': 1,
			},
		});
		map.fire('line-layer-added');
		enableByDefault(bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks3'));
	});

	// Level 4
	loadNetworkLayer('/get_level4', 'new-line3').then((data) => {
		// Leave the checkbox disabled if the fetch failed; there is no source to draw.
		if (!data) return;
		const animationLineId = 'ptp-line';
		map.addLayer({
			type: 'line',
			source: 'new-line3',
			id: animationLineId,
			layout: {
				visibility: 'none',
				'line-elevation-reference': 'ground',
				'line-z-offset': LINE_Z_OFFSET_M,
			},
			minzoom: 13,
			paint: {
				'line-color': '#AB47BC',
				'line-width': 4,
				'line-opacity': 0.65,
				'line-emissive-strength': 1,
			},
		});
		map.fire('line-layer-added');
		enableByDefault(bindCheckboxAnimation(animationLineId, 'toggleNetworkLinks4'));
	});
};
