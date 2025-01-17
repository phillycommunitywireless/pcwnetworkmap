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

// https://stackoverflow.com/a/68805895/9807140
const getIntervals = (
	min,
	max,
	count,
	end = min + Math.ceil((max - min + 1) / count) - 1
) => {
	if (count < 1) {
		return [];
	}
	return [[min, end], ...getIntervals(end + 1, max, count - 1)];
};

/**
 * Generates a random color from geojson data for 'fill-color' prop
 *
 * @param {GeoJSON} data
 * @param {string} value_id
 * @param {string} [undefColor] - default gray #80
 * @param {string[]} [colorSteps] - colorSteps, defaults red -> green
 */
export const createRangeColorExpression = (
	data,
	value_id,
	undefColor = '#808080',
	colorSteps = [
		'#ff0000', // Red
		'#ff8000', // Orange
		'#ffff00', // Yellow
		'#80ff00', // Light green
		'#00ff00', // Green
	]
) => {
	if (!data?.features?.[0]?.properties?.[value_id]) {
		throw ReferenceError("Feature data doesn't contain the expected value_id");
	}
	const incomeValues = data.features.map(
		(feature) => feature.properties[value_id]
	);
	const intervals = getIntervals(
		Math.min(...incomeValues),
		Math.max(...incomeValues),
		colorSteps.length
	);
	const steps = intervals.reduce(
		(acc, [_, intervalMax], i) => acc.concat(intervalMax, colorSteps[i]),
		[]
	);

	return [
		'interpolate',
		['linear'],
		['coalesce', ['to-number', ['get', value_id]], -1],
		-1,
		undefColor,
		...steps,
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
