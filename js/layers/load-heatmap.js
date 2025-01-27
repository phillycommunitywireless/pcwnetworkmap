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

	const heatmapLayer = {
		id: 'heatmap-layer',
		type: 'heatmap',
		source: 'heatmap-source',
		minzoom: 12,
		maxzoom: 20,
		paint: {
			'heatmap-weight': 5,
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
			'heatmap-radius': {
				stops: [
					[9, 2],
					[11, 10],
					[13, 20],
					[15, 100],
					[17, 200],
					[19, 500],
					[23, 1000],
				],
			},
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
