export const fetchJSON = (url) => fetch(url).then((r) => r.json());

/**
 * Generates randomized hex colors
 *
 * @returns {string}
 */
export const getRandomColor = () => {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

/**
 * Generates a random color from geojson data for 'fill-color' prop
 *
 * @param {GeoJSON} data
 * @param {string} data_id
 * @param {string} [minColor] - default red
 * @param {string} [maxColor] - default blue
 * @returns {string[]}
 */
export const createRangeColorExpression = (
	data,
	data_id,
	minColor = '#ff0000',
	maxColor = '#0000ff'
) => {
	if (!data?.features?.[0]?.properties?.[data_id]) {
		throw new ReferenceError(
			"Feature data doesn't contain the expected data_id"
		);
	}
	const incomeValues = data.features.map(
		(feature) => feature.properties[data_id]
	);
	const minIncome = Math.min(...incomeValues);
	const maxIncome = Math.max(...incomeValues);

	return [
		'interpolate',
		['linear'],
		['to-number', ['get', data_id]],
		minIncome,
		minColor,
		maxIncome,
		maxColor,
	];
};

/**
 * Generates a random color from geojson data for 'fill-color' prop
 *
 * @param {GeoJSON} data
 * @param {string} data_id
 * @returns {string[]}
 */
export const createRandomColorExpression = (data, data_id) => {
	const colorExpression = ['match', ['to-number', ['get', data_id]]];
	if (!data?.features?.[0]?.properties?.[data_id]) {
		throw ReferenceError("feature data doesn't contain the expected data_id");
	}
	data.features.forEach((feature) => {
		const id = feature.properties[data_id];
		// Generate random hex color
		const color = '#000000'.replace(/0/g, () =>
			(~~(Math.random() * 16)).toString(16)
		);
		colorExpression.push(id, color);
	});
	colorExpression.push('#000000'); // to handle "undefined"
	return colorExpression;
};

/**
 * Generates centroid from geojson data for use as label anchors, etc.
 *
 * @param {GeoJSON} data
 * @param {string} data_id
 * @returns {FeatureData}
 */
export const generateCentroids = (data, data_id) => {
	if (!data?.features?.[0]?.properties?.[data_id]) {
		throw ReferenceError("feature data doesn't contain the expected data_id");
	}
	return data.features.map((feature) => {
		const centroid = turf.centroid(feature);
		return {
			type: 'Feature',
			properties: {
				id: feature.properties.data_id,
				label: feature.properties.name,
			},
			geometry: centroid.geometry,
		};
	});
};
