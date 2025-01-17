// Create an object to track the visibility status of each layer
const visibilityStatus = {
	HS: true,
	RH: true,
	MN: true,
	LB: true,
};

// Create an object to store the filter expressions for each layer
const layerFilters = {
	HS: ['==', ['get', 'type'], 'HS'],
	RH: ['==', ['get', 'type'], 'RH'],
	MN: ['==', ['get', 'type'], 'MN'],
	LB: ['==', ['get', 'type'], 'LB'],
};

// Function to update the visibility of points based on filters
function updatePointsVisibility() {
	const filters = ['any'];

	for (const type in layerFilters) {
		if (visibilityStatus[type]) {
			filters.push(layerFilters[type]);
		}
	}

	map.setFilter('network-points-layer', filters);
}

function toggleHeatmapLayer() {
	map.setLayoutProperty(
		'heatmap-layer',
		'visibility',
		this.checked ? 'visible' : 'none'
	);
}

export default () => {
	// Add event listeners to the checkbox inputs for each layer
	const layer1Checkbox = document.getElementById('layer1');
	layer1Checkbox.addEventListener('change', () => {
		visibilityStatus.HS = layer1Checkbox.checked;
		updatePointsVisibility();
	});

	const layer2Checkbox = document.getElementById('layer2');
	layer2Checkbox.addEventListener('change', () => {
		visibilityStatus.RH = layer2Checkbox.checked;
		updatePointsVisibility();
	});

	const layer3Checkbox = document.getElementById('layer3');
	layer3Checkbox.addEventListener('change', () => {
		visibilityStatus.MN = layer3Checkbox.checked;
		updatePointsVisibility();
	});

	const layer4Checkbox = document.getElementById('layer4');
	layer4Checkbox.addEventListener('change', () => {
		visibilityStatus.LB = layer4Checkbox.checked;
		updatePointsVisibility();
	});

	const layer5Checkbox = document.getElementById('layer5');
	layer5Checkbox.addEventListener('change', toggleHeatmapLayer);
};
