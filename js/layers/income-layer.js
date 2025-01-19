import popupHandler from '../util/popup-handler.js';
import {
	createRangeColorExpression,
	currencyFormatter,
	fetchJSON,
	generateCentroids,
	generateLabelFromNeighborhood,
	getZoneId,
} from '../util/util.js';

export default async () => {
	const data_url = '/data/income-inequality.geojson';
	const data = await fetchJSON(data_url);
	const centroids = generateCentroids(data, 'spatial_id', getZoneId);
	const centroidDict = centroids.reduce((acc, c) => {
		acc[c.properties.id] = c;
		return acc;
	}, {});
	const colorExpression = createRangeColorExpression(
		data,
		'median_household_income'
	);

	map.addSource('income-source', {
		type: 'geojson',
		data,
	});

	map.addLayer({
		id: 'income-layer',
		type: 'fill',
		source: 'income-source',
		layout: {
			visibility: 'none',
		},
		paint: {
			'fill-color': colorExpression,
			'fill-opacity': 0.25,
		},
		filter: ['==', '$type', 'Polygon'],
	});

	const popupHtml = (feature, e) => {
		const incomeValue = feature.properties.median_household_income;
		const useLabel = generateLabelFromNeighborhood(feature, e);
		const formattedIncome = incomeValue
			? currencyFormatter.format(incomeValue)
			: 'Unknown';
		return `<strong>Area:</strong> ${useLabel}<br>
						<strong>Median Household Income:</strong> ${formattedIncome}`;
	};

	popupHandler({
		centroids,
		onCloseEventLabel: 'close-income-popup',
		popupCheckboxId: 'show-income-popup',
		popupHtml,
		targetFeatureIdKey: 'spatial_id',
		targetLayerLabel: 'income-layer',
	});
};
