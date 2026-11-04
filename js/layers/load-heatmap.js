export default (network_points_data) => {
	const filteredData = network_points_data.features.filter(
		(feature) =>
			feature.properties.type === 'RH' ||
			feature.properties.type === 'MN' ||
			feature.properties.type === 'LB'
	);
	map.addSource('heatmap-source', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: filteredData,
		},
	});

	function ConvertFeetToPixels(zoomLevel, distanceInFeet) {
		let pixelLength;
		switch (zoomLevel) {
			case 12:
				pixelLength = distanceInFeet * 0.03; // @3px for 100ft
				break;
			case 13:
				pixelLength = distanceInFeet * 0.07 // @7px for 100ft
				break;
			case 14:
				pixelLength = distanceInFeet * 0.11; // 11px for 100ft
				break;
			case 15:
				pixelLength = distanceInFeet * 0.24; // @24px for 100ft
				break;
			case 16:
				pixelLength = distanceInFeet * 0.4; // @40px for 100ft
				break;
			case 17:
				pixelLength = distanceInFeet * 0.9; // @90px for 100ft
				break;
			case 18:
				pixelLength = distanceInFeet * 1.4;// @140px for 100ft
				break;
			case 19:
				pixelLength = distanceInFeet * 3.1;// @310px for 100ft
				break;
			case 20:
				pixelLength = distanceInFeet * 4.8;// @480px for 100ft
				break;
			default:
				pixelLength = 1;

		}
		return Math.round(pixelLength);
	}

	const heatmapLayer = {
		id: 'heatmap-layer',
		type: 'heatmap',
		source: 'heatmap-source',
		minzoom: 12,
		maxzoom: 20,
		paint: {
			'heatmap-weight': 1,
			'heatmap-intensity': 1,
			'heatmap-color': rippleRamp(null),
			'heatmap-radius': [
				'interpolate',
				['linear'],
				['zoom'],
				// 'ap_type' instead of 'type' to go by specific router used instead of general Mesh or Access Point check
				12, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(12, 500), 'MN', ConvertFeetToPixels(12, 500), 'LB', 1, 1], // map zoomed out
				14, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(14, 500), 'MN', ConvertFeetToPixels(14, 500), 'LB', 1, 1],
				16, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(16, 500), 'MN', ConvertFeetToPixels(16, 500), 'LB', 1, 1],
				18, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(18, 500), 'MN', ConvertFeetToPixels(18, 500), 'LB', 1, 1],
				20, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(20, 500), 'MN', ConvertFeetToPixels(20, 500), 'LB', 1, 1], // map zoomed in
			],
			'heatmap-opacity': {
				default: 1,
				stops: [
					[14, 0.5],
					[20, 0.2],
				],
			},
		},
		layout: {
			visibility: 'none',
		},
	};

	// draw the heatmap underneath the node icons so the access points stay readable on top of it
	map.addLayer(heatmapLayer, map.getLayer('network-points-layer') ? 'network-points-layer' : undefined);
	startRipple();
};

// Base heatmap ramp as [density, r, g, b, a]
const BASE_STOPS = [
	[0, 234, 238, 253, 0],
	[0.2, 134, 152, 255, 1],
	[0.4, 87, 98, 233, 1],
	[0.6, 64, 67, 200, 1],
	[0.8, 33, 5, 142, 1],
];

// Ripple tuning: a lighter band slides down the density ramp (center -> edge),
// which reads as a ring travelling outward along each cluster's contour.
const RIPPLE_PERIOD_MS = 2000;
const RIPPLE_WIDTH = 0.08; // band half-width, in density units
const RIPPLE_STRENGTH = 0.45; // 0 = no highlight, 1 = full highlight color
const RIPPLE_COLOR = [205, 212, 255];
const RIPPLE_SAMPLES = 40; // ramp stops; more = smoother band

const baseColorAt = (d) => {
	for (let i = 1; i < BASE_STOPS.length; i++) {
		const [d1, ...c1] = BASE_STOPS[i];
		if (d <= d1) {
			const [d0, ...c0] = BASE_STOPS[i - 1];
			const t = (d - d0) / (d1 - d0);
			return c0.map((v, k) => v + (c1[k] - v) * t);
		}
	}
	return BASE_STOPS[BASE_STOPS.length - 1].slice(1);
};

// Builds the heatmap-color expression with the ripple band centered at `band`
// (density 0..1); null returns the static ramp.
function rippleRamp(band) {
	const expr = ['interpolate', ['linear'], ['heatmap-density']];
	for (let i = 0; i <= RIPPLE_SAMPLES; i++) {
		const d = i / RIPPLE_SAMPLES;
		const [r, g, b, a] = baseColorAt(d);
		const glow = band === null ? 0 : RIPPLE_STRENGTH * Math.exp(-(((d - band) / RIPPLE_WIDTH) ** 2));
		const mix = (v, k) => Math.round(v + (RIPPLE_COLOR[k] - v) * glow);
		expr.push(d, `rgba(${mix(r, 0)}, ${mix(g, 1)}, ${mix(b, 2)}, ${a})`);
	}
	return expr;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let rippleRunning = false;
let rippleWasActive = false;

// One loop for the page's lifetime: the heatmap layer is re-added on every basemap
// switch, so each frame looks it up instead of holding a reference. It only repaints
// while the heatmap is visible, so the hidden/Network-tab case costs nothing.
function startRipple() {
	if (rippleRunning) return;
	rippleRunning = true;

	const tick = (now) => {
		requestAnimationFrame(tick);
		const visible =
			map.getLayer('heatmap-layer') &&
			map.getLayoutProperty('heatmap-layer', 'visibility') === 'visible';
		const active = visible && !reducedMotion.matches;

		if (active) {
			// band travels from the densest core (1) out past the faint edge (0)
			const band = 1 - ((now % RIPPLE_PERIOD_MS) / RIPPLE_PERIOD_MS) * 1.15;
			map.setPaintProperty('heatmap-layer', 'heatmap-color', rippleRamp(band));
		} else if (rippleWasActive && map.getLayer('heatmap-layer')) {
			// leave a clean static ramp behind when pausing
			map.setPaintProperty('heatmap-layer', 'heatmap-color', rippleRamp(null));
		}
		rippleWasActive = active;
	};
	requestAnimationFrame(tick);
}
