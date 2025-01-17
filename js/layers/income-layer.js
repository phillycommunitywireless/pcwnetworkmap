import { createRangeColorExpression, fetchJSON } from '/js/util.js';

export default async () => {
	const data_url = '/data/income-inequality.geojson';
	const data = await fetchJSON(data_url);
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
		// layout: {
		// 	visibility: 'none',
		// },
		paint: {
			'fill-color': colorExpression,
			'fill-opacity': 0.25,
		},
		filter: ['==', '$type', 'Polygon'],
	});

	let currentPopup = null;
	let currentFeatureId = null;
	map.on('mousemove', 'income-layer', function (e) {
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

			if (currentFeatureId !== featureId) {
				if (!currentPopup) {
					currentPopup = new mapboxgl.Popup({
						anchor: 'bottom',
					});
					currentPopup.on('close', () => {
						currentPopup = null;
					});
					currentPopup.addTo(map);
				}

				currentPopup.setLngLat(e.lngLat).setHTML(
					`<strong>ID:</strong> ${zoneId}<br>
                     <strong>Median Household Income:</strong> ${incomeValue}`
				);

				currentFeatureId = featureId;
			}
		} else if (!feature && currentFeatureId && currentPopup) {
			currentPopup.remove();
			currentPopup = null;
			currentFeatureId = null;
		}

		map.getCanvas().style.cursor = feature ? 'pointer' : '';
	});
};
