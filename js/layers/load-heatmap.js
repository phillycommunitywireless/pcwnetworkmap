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
		let pixelLength;
		switch (zoomLevel) {
			case 12:
				pixelLength = distanceInFeet * 0.03; // @3px for 100ft
				break;
			case 13:
				pixelLength = distanceInFeet * 0.07 // @7px for 100ft
				break;
			case 14:
				pixelLength = distanceInFeet * 0.11; // 11px for 100ft
				break;
			case 15:
				pixelLength = distanceInFeet * 0.24; // @24px for 100ft
				break;
			case 16:
				pixelLength = distanceInFeet * 0.4; // @40px for 100ft
				break;
			case 17:
				pixelLength = distanceInFeet * 0.9; // @90px for 100ft
				break;
			case 18:
				pixelLength = distanceInFeet * 1.4;// @140px for 100ft
				break;
			case 19:
				pixelLength = distanceInFeet * 3.1;// @310px for 100ft
				break;
			case 20:
				pixelLength = distanceInFeet * 4.8;// @480px for 100ft
				break;
			default:
				pixelLength = 1;

		}
		return Math.round(pixelLength);
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
