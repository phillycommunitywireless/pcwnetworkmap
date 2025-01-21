import {
	createRangeColorExpression,
	fetchJSON,
	generateCentroids,
} from '../util.js';

const getZoneId = (feature) =>
	feature.properties.name.match(/^([A-Z0-9]+),\s/)?.[1];
const currencyFormatter = Intl.NumberFormat('en-US', {
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
const generateIncomeLabel = (feature, event) => {
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

	let currentPopup = null;
	let currentFeatureId = null;
	const cleanupPopup = () => {
		currentPopup?.remove();
		currentPopup = null;
		currentFeatureId = null;
	};

	map.on('close-income-popup', cleanupPopup);

	const handlePopup = (e) => {
		const [feature] = map.queryRenderedFeatures(e.point, {
			layers: ['income-layer'],
		});

		if (feature) {
			const incomeValue = feature.properties.median_household_income;
			const featureId = feature.properties.spatial_id;

			if (!document.getElementById('show-income-popup').checked) {
				return;
			}

			if (currentFeatureId !== featureId) {
				const featureCentroid = centroidDict[featureId];
				if (!currentPopup) {
					currentPopup = new mapboxgl.Popup({
						anchor: 'bottom',
						closeOnClick: false,
					});
					currentPopup.on('close', () => {
						currentPopup = null;
					});

					currentPopup.addTo(map);
				}

				const useLabel = generateIncomeLabel(feature, e);
				const formattedIncome = incomeValue
					? currencyFormatter.format(incomeValue)
					: 'Unknown';
				currentPopup
					.setLngLat(featureCentroid?.geometry.coordinates || e.lngLat)
					.setHTML(
						`<strong>Area:</strong> ${useLabel}<br>
                     <strong>Median Household Income:</strong> ${formattedIncome}`
					);

				currentFeatureId = featureId;
			}
		} else if (!feature && currentFeatureId && currentPopup) {
			cleanupPopup();
		}

		map.getCanvas().style.cursor = feature ? 'pointer' : '';
	};

	map.on('mousemove', 'income-layer', handlePopup);
	map.on('touchstart', 'income-layer', handlePopup);
	map.on('mouseleave', 'income-layer', (e) => {
		// close any open popup on leaving the parent layer
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['income-layer'],
		});
		if (!features.length) {
			map.fire('close-income-popup');
		}
	});
};
