import { isDarkMode } from '../util/util.js';

export default () => {
	// Insert the layer beneath any symbol layer.
	const layers = map.getStyle().layers;
	const labelLayerId = layers.find(
		(layer) => layer.type === 'symbol' && layer.layout['text-field']
	).id;
	const darkMode = isDarkMode();

	// The 'building' layer in the Mapbox Streets
	// vector tileset contains building height data
	// from OpenStreetMap.
	map.addLayer(
		{
			id: 'add-3d-buildings',
			source: 'composite',
			'source-layer': 'building',
			filter: ['==', 'extrude', 'true'],
			type: 'fill-extrusion',
			minzoom: 15,
			paint: {
				'fill-extrusion-color': '#aaa',
				'fill-extrusion-height': [
					'interpolate',
					['linear'],
					['zoom'],
					15,
					0,
					15.05,
					['get', 'height'],
				],
				'fill-extrusion-base': [
					'interpolate',
					['linear'],
					['zoom'],
					15,
					0,
					15.05,
					['get', 'min_height'],
				],
				'fill-extrusion-opacity': darkMode ? 0.6 : 0.8,
			},
		},
		labelLayerId
	);
};
