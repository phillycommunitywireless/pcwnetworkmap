/**
 * @param {boolean} visible
 */
const setNeighborhoodFillViz = (visible) => {
	map.setLayoutProperty(
		'neighborhood-fill-layer',
		'visibility',
		visible ? 'visible' : 'none'
	);
};
/**
 * @param {boolean} visible
 */
const setNeighborhoodOutlineViz = (visible) => {
	map.setLayoutProperty(
		'neighborhood-outline-layer',
		'visibility',
		visible ? 'visible' : 'none'
	);
};
/**
 * @param {boolean} visible
 */
const setNeighborhoodLabelsViz = (visible) => {
	map.setLayoutProperty(
		'neighborhood-labels',
		'visibility',
		visible ? 'visible' : 'none'
	);

	// trade places with map-generated neighborhood labels as they conflict visually
	map.getStyle().layers.forEach((layer) => {
		if (layer.id.includes('settlement')) {
			map.setLayoutProperty(
				layer.id,
				'visibility',
				visible ? 'none' : 'visible'
			);
		}
	});
};

const setIncomeVisibility = (visible) => {
	map.setLayoutProperty(
		'income-layer',
		'visibility',
		visible ? 'visible' : 'none'
	);
};

/**
 * internally checks 'outline' checked state. could be passed, but eh.
 *
 * @param {boolean} showLayer
 */
export const setNeighborhoodLayer = (showLayer) => {
	const showOutline = document.getElementById(
		'neighborhood-outline-only'
	).checked;

	if (showLayer) {
		if (showOutline) {
			setNeighborhoodFillViz(false);
			setNeighborhoodOutlineViz(true);
		} else {
			setNeighborhoodFillViz(true);
			setNeighborhoodOutlineViz(false);
		}
	} else {
		setNeighborhoodFillViz(false);
		setNeighborhoodOutlineViz(false);
	}

	setNeighborhoodLabelsViz(showLayer);
};

/**
 * forces neighborhood layer on
 * implicitly sets checked state
 * @param {boolean} showLayer
 */
export const setNeighborhoodOutline = (showLayer) => {
	if (showLayer) {
		document.getElementById('neighborhood-boundaries').checked = true;
	}
	setNeighborhoodLayer(
		document.getElementById('neighborhood-boundaries').checked
	);
};

/**
 * @param {boolean} showLayer
 */
export const setIncomeLayer = (showLayer) => {
	setIncomeVisibility(showLayer);

	const showNeighborhoods = document.getElementById(
		'neighborhood-boundaries'
	).checked;

	if (showLayer && showNeighborhoods) {
		document.getElementById('neighborhood-outline-only').checked = true;
		setNeighborhoodOutline();
	}

	if (!showLayer) {
		map.fire('close-income-popup');
	}
};
