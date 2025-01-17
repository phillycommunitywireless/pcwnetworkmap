import { createColorExpression, fetchJSON } from '/js/util.js';

export default async () => {
	const data_url =
		'https://raw.githubusercontent.com/blackmad/neighborhoods/refs/heads/master/philadelphia.geojson';
	const data = await fetchJSON(data_url);
	const centroids = generateCentroids(data);
	const colorExpression = createColorExpression(data);

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

	// add polygon fill layer
	map.addLayer({
		id: 'neighborhood-layer',
		type: 'fill',
		source: 'neighborhood-source',
		layout: {
			visibility: 'none',
		},
		paint: {
			'fill-color': colorExpression,
			'fill-opacity': 0.25,
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
			'text-halo-width': 1.5,
			'text-halo-blur': 0.5,
		},
	});
};
