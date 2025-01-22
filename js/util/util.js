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

const defaultColor = {
	undefColor: '#808080',
	colorSteps: [
		'#ff0000', // Red
		'#ff8000', // Orange
		'#ffff00', // Yellow
		'#80ff00', // Light green
		'#00ff00', // Green
	],
	invert: false,
};
/**
 * Generates a linear, interpolated gradient from geojson data for `paint.fill-color`
 *
 * @param {GeoJSON} data
 * @param {string} value_id
 * @param {Object} param2
 * @param {string[]} [param2.colorSteps] - colorSteps, defaults red -> green in 5 steps
 * @param {boolean} [param2.invert] - if true, inverts the colorSteps array
 * @param {string} [param2.undefColor] - default gray #80
 */
export const createRangeColorExpression = (data, value_id, coloring) => {
	const {undefColor, colorSteps, invert} = {
		...defaultColor,
		...coloring,
	};

	if (!data?.features?.[0]?.properties?.hasOwnProperty(value_id)) {
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
	const useColorSteps = invert ? colorSteps.reverse() : colorSteps;
	const steps = intervals.reduce(
		(acc, [_, intervalMax], i) => acc.concat(intervalMax, useColorSteps[i]),
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
	if (!data?.features?.[0]?.properties?.hasOwnProperty(data_id)) {
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
 * @param {string | (feature: FeatureData) => string} label_ref - if a string, provide the key within the properties obj
 * @returns {FeatureData}
 */
export const generateCentroids = (data, data_id, label_ref) => {
	if (!data?.features?.[0]?.properties?.hasOwnProperty(data_id)) {
		throw ReferenceError("feature data doesn't contain the expected data_id");
	}
	return data.features.map((feature) => {
		const centroid = turf.centroid(feature);
		const label =
			typeof label_ref === 'string'
				? feature.properties[label_ref]
				: label_ref(feature);
		return {
			type: 'Feature',
			properties: {
				id: feature.properties[data_id],
				label,
			},
			geometry: centroid.geometry,
		};
	});
};

/**
 * Extract a census zone ID from a feature
 *
 * e.g.
 * ```
 * feature = {"name": "BG0004013, Philadelphia County, PA"} => "BG0004013"
 * ```
 *
 * @param {FeatureData} feature
 * @returns {string}
 */
export const getZoneId = (feature) =>
	feature.properties.name.match(/^([A-Z0-9]+),\s/)?.[1];

/**
 * Normalized currency formatter for en-US.
 * Strips trailing zeros if value is a whole number
 *
 * e.g.
 * ```
 * currencyFormatter.format(VALUE) => $123
 * ```
 *
 * @returns {Intl.NumberFormat}
 */
export const currencyFormatter = Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	trailingZeroDisplay: 'stripIfInteger',
});

/**
 * Generates a label for the income block (feature). Leverages (event) to get
 * cursor LatLng to cross-reference against the neighborhood-source
 *
 * Falls-back to income-source geojson census ID if a neighborhood label can't be found
 *
 * @param {FeatureData} feature
 * @param {MapMouseEvent} event
 * @returns {string}
 */
export const generateLabelFromNeighborhood = (feature, event) => {
	if (!map) {
		throw ReferenceError(
			'generateIncomeLabel must be called after map has been loaded'
		);
	}
	if (!turf) {
		throw ReferenceError(
			'generateIncomeLabel must be called after turfJS has been loaded'
		);
	}
	const zoneId = feature.properties.name.match(/^([A-Z0-9]+),\s/)?.[1];
	if (!zoneId) {
		console.warn("couldn't match expression for zoneId");
	}
	const point = turf.point(event.lngLat.toArray());
	const neighborhood = map
		.getSource('neighborhood-source')
		._data.features.find((feature) =>
			turf.booleanPointInPolygon(point, feature)
		);
	return neighborhood?.properties.name || zoneId;
};

const darkLabels = ['dark'];
export const isDarkMode = (useMap) => {
	const activeSprite = (useMap || map).getStyle()?.sprite;
	if (!activeSprite) {
		console.warn('no active background layer');
		return false;
	}
	return darkLabels.some((label) => activeSprite?.includes(label));
};
