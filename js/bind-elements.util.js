export const toggleNeighborhoodLayer = (showLayer) => {
	const showOutline = document.getElementById(
		'neighborhood-outline-only'
	).checked;

	if (showOutline) {
		map.setLayoutProperty(
			'neighborhood-outline-layer',
			'visibility',
			showLayer ? 'visible' : 'none'
		);
	} else {
		map.setLayoutProperty(
			'neighborhood-fill-layer',
			'visibility',
			showLayer ? 'visible' : 'none'
		);
	}

	map.setLayoutProperty(
		'neighborhood-labels',
		'visibility',
		showLayer ? 'visible' : 'none'
	);

	// trade places with map-generated neighborhood labels as they conflict visually
	map.getStyle().layers.forEach((layer) => {
		if (layer.id.includes('settlement')) {
			map.setLayoutProperty(
				layer.id,
				'visibility',
				showLayer ? 'none' : 'visible'
			);
		}
	});
};

export const toggleNeighborhoodOutline = (showOutline) => {
	document.getElementById('neighborhood-boundaries').checked = true;
	toggleNeighborhoodLayer(true);

	if (showOutline) {
		map.setLayoutProperty('neighborhood-fill-layer', 'visibility', 'none');
		map.setLayoutProperty(
			'neighborhood-outline-layer',
			'visibility',
			'visible'
		);
	} else {
		map.setLayoutProperty('neighborhood-fill-layer', 'visibility', 'visible');
		map.setLayoutProperty('neighborhood-outline-layer', 'visibility', 'none');
	}
};
