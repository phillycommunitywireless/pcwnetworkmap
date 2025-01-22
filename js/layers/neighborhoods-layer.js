import {
	createRandomColorExpression,
	fetchJSON,
	generateCentroids,
	isDarkMode,
} from '../util/util.js';

export default async () => {
	const data_url =
		'https://raw.githubusercontent.com/blackmad/neighborhoods/refs/heads/master/philadelphia.geojson';
	const data = await fetchJSON(data_url);
	const centroids = generateCentroids(data, 'cartodb_id', 'name');
	const colorExpression = createRandomColorExpression(data, 'cartodb_id');
	const darkMode = isDarkMode();

	map.addSource('neighborhood-source', {
		type: 'geojson',
		data,
	});
	map.addSource('neighborhood-centroids', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: centroids,
		},
	});

	// add fill layer
	map.addLayer({
		id: 'neighborhood-fill-layer',
		type: 'fill',
		source: 'neighborhood-source',
		layout: {
			visibility: 'none',
		},
		paint: {
			'fill-color': colorExpression,
			'fill-opacity': darkMode ? 0.25 : 0.5,
		},
		filter: ['==', '$type', 'Polygon'],
	});
	// add outline layer
	map.addLayer({
		id: 'neighborhood-outline-layer',
		type: 'line',
		source: 'neighborhood-source',
		layout: {
			visibility: 'none',
		},
		paint: {
			'line-color': darkMode ? 'lightblue' : 'black',
			'line-width': darkMode ? 1 : 2,
			'line-offset': darkMode ? 0 : 2
		},
		filter: ['==', '$type', 'Polygon'],
	});
	// add label layer
	map.addLayer({
		id: 'neighborhood-labels',
		type: 'symbol',
		source: 'neighborhood-centroids',
		layout: {
			'text-field': ['get', 'label'], // Use the 'label' property for text
			'text-size': 14,
			'text-anchor': 'center',
			visibility: 'none',
		},
		paint: {
			'text-color': '#ffffff',
			'text-halo-color': '#000000',
			'text-halo-width': 2,
			'text-halo-blur': 0.5,
		},
	});
};
