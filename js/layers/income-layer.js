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
		currentPopup.remove();
		currentPopup = null;
		currentFeatureId = null;
	};
	const handlePopup = (e) => {
		const [feature] = map.queryRenderedFeatures(e.point, {
			layers: ['income-layer'],
		});

		if (feature) {
			const incomeValue = feature.properties.median_household_income;
			const featureId = feature.properties.spatial_id;
			const zoneId = feature.properties.name.match(/^([A-Z0-9]+),\s/)?.[1];
			if (!zoneId) {
				console.warn("couldn't match expression for zoneId");
			}

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

					map.on('close-income-popup', cleanupPopup);

					currentPopup.addTo(map);
				}

				const formattedIncome = currencyFormatter.format(incomeValue);
				currentPopup
					.setLngLat(featureCentroid?.geometry.coordinates || e.lngLat)
					.setHTML(
						`<strong>ID:</strong> ${zoneId}<br>
                     <strong>Median Household Income:</strong> ${
												incomeValue ? formattedIncome : 'Unknown'
											}`
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
