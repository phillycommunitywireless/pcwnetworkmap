export default (network_points_data) => {
	const filteredData = network_points_data.features.filter(
		(feature) =>
			feature.properties.type === 'RH' ||
			feature.properties.type === 'MN' ||
			feature.properties.type === 'LB'
	);
	map.addSource('heatmap-source', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: filteredData,
		},
	});

	function ConvertFeetToPixels(zoomLevel, distanceInFeet) {
		let pixelLegnth;
		switch (zoomLevel) {
			case 12:
				pixelLegnth = distanceInFeet * 0.01; // @1px for 100ft
				break;
			case 13:
				pixelLegnth = distanceInFeet * 0.04 // @4px for 100ft
				break;
			case 14:
				pixelLegnth = distanceInFeet * 0.07; // @7px for 100ft
				break;
			case 15:
				pixelLegnth = distanceInFeet * 0.24; // @24px for 100ft
				break;
			case 16:
				pixelLegnth = distanceInFeet * 0.4; // @40px for 100ft
				break;
			case 17:
				pixelLegnth = distanceInFeet * 1.4; // @140px for 100ft
				break;
			case 18:
				pixelLegnth = distanceInFeet * 2.4;// @240px for 100ft
				break;
			case 19:
				pixelLegnth = distanceInFeet * 8.4;// @840px for 100ft
				break;
			case 20:
				pixelLegnth = distanceInFeet * 14.4;// @1440px for 100ft
				break;
			default:
				pixelLegnth = 1;

		}
		return Math.round(pixelLegnth);
	}

	const heatmapLayer = {
		id: 'heatmap-layer',
		type: 'heatmap',
		source: 'heatmap-source',
		minzoom: 12,
		maxzoom: 20,
		paint: {
			'heatmap-weight': 1,
			'heatmap-intensity': 1,
			'heatmap-color': [
				'interpolate',
				['linear'],
				['heatmap-density'],
				0,
				'rgba(0, 0, 255, 0)',
				0.2,
				'rgba(255, 0, 0, 1)',
				0.4,
				'rgba(255, 165, 0, 1)',
				0.6,
				'rgba(255, 255, 0, 1)',
				0.8,
				'rgba(0, 255, 0, 1)',
			],
			'heatmap-radius': [
				'interpolate',
				['linear'],
				['zoom'],
				// 'ap_type' instead of 'type' to go by specific router used instead of general Mesh or Access Point check
				12, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(12, 500), 'MN', ConvertFeetToPixels(12, 500), 'LB', 1, 1], // map zoomed out
				14, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(14, 500), 'MN', ConvertFeetToPixels(14, 500), 'LB', 1, 1],
				16, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(16, 500), 'MN', ConvertFeetToPixels(16, 500), 'LB', 1, 1],
				18, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(18, 500), 'MN', ConvertFeetToPixels(18, 500), 'LB', 1, 1],
				20, ['match', ['get', 'type'], 'RH', ConvertFeetToPixels(20, 500), 'MN', ConvertFeetToPixels(20, 500), 'LB', 1, 1], // map zoomed in
			],
			'heatmap-opacity': {
				default: 1,
				stops: [
					[14, 0.5],
					[20, 0.2],
				],
			},
		},
		layout: {
			visibility: 'none',
		},
	};

	map.addLayer(heatmapLayer);
};
