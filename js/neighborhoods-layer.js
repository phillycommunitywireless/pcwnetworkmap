import { fetchJSON } from './js/util.js';

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
const createColorExpression = (data) => {
	const colorExpression = ['match', ['get', 'cartodb_id']];
	data.features.forEach((feature) => {
		const id = feature.properties.cartodb_id;
		// Generate random hex color
		const color = '#000000'.replace(/0/g, () =>
			(~~(Math.random() * 16)).toString(16)
		);
		colorExpression.push(Number(id), color);
	});
	colorExpression.push('#000000'); // to handle "undefined"
	return colorExpression;
};
const generateCentroids = (geojsonData) => {
	return geojsonData.features.map((feature) => {
		const centroid = turf.centroid(feature);
		return {
			type: 'Feature',
			properties: {
				id: feature.properties.cartodb_id,
				label: feature.properties.name,
			},
			geometry: centroid.geometry,
		};
	});
};
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
