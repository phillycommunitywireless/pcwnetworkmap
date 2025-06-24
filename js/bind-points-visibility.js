// Create an object to track the visibility status of each layer
const visibilityStatus = {
	HS: true,
	RH: true,
	MN: true,
	LB: true,
};

// the network state year to show on the map (only show nodes installed before the specified year)
let year_to_show = 2025

// Create an object to store the filter expressions for each layer
// "all" requires all filter expressions to be met 
// "to-number" included because we have to cast both the property and the year_to_show var to integers 
let layerFilters = {
	HS: ['all', ['==', ['get', 'type'], 'HS'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	RH: ['all', ['==', ['get', 'type'], 'RH'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	MN: ['all', ['==', ['get', 'type'], 'MN'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	LB: ['all', ['==', ['get', 'type'], 'LB'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
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

const setHeatmapLayer = (state) => {
	map.setLayoutProperty(
		'heatmap-layer',
		'visibility',
		state ? 'visible' : 'none'
	);
};

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

	const year_selector = document.getElementById('select-year');
	year_selector.addEventListener('change', ()=>{
		year_to_show = Number(year_selector.value)
		// regenerate layerfilters for the new year 
		layerFilters = {
			HS: ['all', ['==', ['get', 'type'], 'HS'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			RH: ['all', ['==', ['get', 'type'], 'RH'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			MN: ['all', ['==', ['get', 'type'], 'MN'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			LB: ['all', ['==', ['get', 'type'], 'LB'], ['<=', ['to-number', ['get', 'year']], year_to_show]],
		};
		updatePointsVisibility();
		
		let year_display = document.getElementById('year-display')
		year_display.innerHTML = year_to_show
	})

	const heatmapCheckbox = document.getElementById('heatmap-layer');
	heatmapCheckbox.addEventListener('change', () => {
		setHeatmapLayer(heatmapCheckbox.checked);
	});

	map.on('layer-style-reset', () => {
		heatmapCheckbox.checked = false;
		setHeatmapLayer(false);
	});
};
