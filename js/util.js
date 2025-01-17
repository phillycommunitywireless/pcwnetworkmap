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
 * Generates centroid from geojson data for use as label anchors, etc.
 *
 * @param {GeoJSON} data 
 * @param {string} data_id 
 * @returns {string[]} 
 */
export const createColorExpression = (data, data_id) => {
	const colorExpression = ['match', ['get', data_id]];
	if (!data?.features?.[0]?.[data_id]) {
		throw ReferenceError("feature data doesn't contain the expected data_id")
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
	if (!data?.features?.[0]?.[data_id]) {
		throw ReferenceError("feature data doesn't contain the expected data_id")
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