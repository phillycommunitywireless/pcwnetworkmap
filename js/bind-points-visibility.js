// Create an object to track the visibility status of each layer
const visibilityStatus = {
	HS: true,
	RH: true,
	MN: true,
	LB: true,
};

// the network state year to show on the map (only show nodes installed before the specified year)
// these are starting values only - syncYearRangeToData() replaces them with the real range
// present in the data once it loads, so a new install year doesn't need a code change
let year_to_show = 2026
let year_start = 2020

let networkPointsData = null;

function updateNetworkStats() {
	if (!networkPointsData) return;
	const features = networkPointsData.features;
	// APs = rooftop hubs + mesh nodes (both broadcast WiFi); LBs are the point-to-point receivers
	const rhCount = features.filter(f => (f.properties.type === 'RH' || f.properties.type === 'MN') && Number(f.properties.year) >= year_start && Number(f.properties.year) <= year_to_show).length;
	const lbCount = features.filter(f => f.properties.type === 'LB' && Number(f.properties.year) >= year_start && Number(f.properties.year) <= year_to_show).length;
	const rhEl = document.getElementById('rh-count');
	const lbEl = document.getElementById('lb-count');
	if (rhEl) rhEl.textContent = rhCount;
	if (lbEl) lbEl.textContent = lbCount;
}

// Read the real span of install years out of the data and move the sliders to match.
// Without this the range is pinned to the years hardcoded in index.html, so the first
// node installed in a new year silently falls outside the timeline.
// The range starts one year before the first install so the timeline begins from zero.
function syncYearRangeToData() {
	const years = networkPointsData.features
		.map(f => Number(f.properties.year))
		.filter(y => Number.isFinite(y));
	if (!years.length) return;

	const min = Math.min(...years) - 1;
	const max = Math.max(...years);

	[document.getElementById('select-year-start'), document.getElementById('select-year')]
		.forEach(el => {
			el.min = min;
			el.max = max;
		});

	document.getElementById('select-year-start').value = min;
	document.getElementById('select-year').value = max;
	year_start = min;
	year_to_show = max;

	const ticks = document.querySelector('.year-tick-labels');
	if (ticks) {
		ticks.innerHTML = '';
		for (let y = min; y <= max; y++) {
			const span = document.createElement('span');
			span.textContent = y;
			ticks.appendChild(span);
		}
	}
}

export const setNetworkPointsData = (data) => {
	networkPointsData = data;
	syncYearRangeToData();
	updateNetworkStats();
};

// Create an object to store the filter expressions for each layer
// "all" requires all filter expressions to be met 
// "to-number" included because we have to cast both the property and the year_to_show var to integers 
let layerFilters = {
	HS: ['all', ['==', ['get', 'type'], 'HS'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	RH: ['all', ['==', ['get', 'type'], 'RH'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	MN: ['all', ['==', ['get', 'type'], 'MN'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	LB: ['all', ['==', ['get', 'type'], 'LB'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
};

// Object storing filter expressions for line layers 
let lineFilters = {
	Layer1: ['all', ['==', ['get', 'line_type'], 'Level1'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	Layer2: ['all', ['==', ['get', 'line_type'], 'Level2'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	Layer3: ['all', ['==', ['get', 'line_type'], 'Level3'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	Layer4: ['all', ['==', ['get', 'line_type'], 'Level4'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
}

// Object storing filter expressions for heatmap 
let heatmapFilters = {
	RH: ['all', ['==', ['get', 'type'], 'RH'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	MN: ['all', ['==', ['get', 'type'], 'MN'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
	LB: ['all', ['==', ['get', 'type'], 'LB'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
}

// the Signal tab shows access points only (rooftop hubs + mesh nodes, the same set the
// "Access Points" count covers); high sites and routers stay on the Network tab
const SIGNAL_TAB_TYPES = ['RH', 'MN'];
const onSignalTab = () =>
	document.querySelector('input[name="sidebar-tab"]:checked')?.value === 'tab-basic';

// Function to update the visibility of points based on filters
function updatePointsVisibility() {
	const filters = ['any'];
	const signal = onSignalTab();

	for (const type in layerFilters) {
		if (signal ? SIGNAL_TAB_TYPES.includes(type) : visibilityStatus[type]) {
			filters.push(layerFilters[type]);
		}
	}

	map.setFilter('network-points-layer', filters);
}

// Function to update the visibility of lines (eg - HS to LB) based on filters 
function updateLineVisibility() {
	const filters = ['any'];

	for (const type in lineFilters) {
		filters.push(lineFilters[type]);
	}
	
	/* 
		now set the filters for each line layer
		this could be optimized to only set the lineFilter for
		a given layer to a layer instead of applying all of them
	*/
	// the line layers load asynchronously, so skip any that aren't on the map yet;
	// each one picks up the current filter when it arrives (see 'line-layer-added' below)
	['highsite-line', 'wiredap-line', 'meshnode-line', 'ptp-line'].forEach((id) => {
		if (map.getLayer(id)) map.setFilter(id, filters);
	});

}

// Function to update the visbility of heatmap based on filters 
function updateHeatmapVisibility() {
	const filters = ['any'];

	for (const type in heatmapFilters) {
		filters.push(heatmapFilters[type]);
	}

	map.setFilter("heatmap-layer", filters)
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

	const year_selector_start = document.getElementById('select-year-start');
	const year_selector = document.getElementById('select-year');

	const updateSliderFill = () => {
		const min = Number(year_selector_start.min);
		const max = Number(year_selector_start.max);
		const startPct = ((year_selector_start.value - min) / (max - min)) * 100;
		const endPct = ((year_selector.value - min) / (max - min)) * 100;
		year_selector_start.style.setProperty('--fill-start', startPct + '%');
		year_selector_start.style.setProperty('--fill-end', endPct + '%');
		// When the two handles overlap, only the top one can be grabbed. Put the start handle on
		// top in the right half of the range and the end handle on top in the left half, so the
		// handle a visitor grabs can always move away from the edge instead of getting stuck.
		const overlapping = Number(year_selector_start.value) >= Number(year_selector.value);
		const inRightHalf = Number(year_selector.value) > (min + max) / 2;
		year_selector_start.style.zIndex = overlapping && inRightHalf ? 5 : 3;
	};
	updateSliderFill();
	year_selector_start.addEventListener('input', updateSliderFill);
	year_selector.addEventListener('input', updateSliderFill);

	const rebuildFilters = () => {
		layerFilters = {
			HS: ['all', ['==', ['get', 'type'], 'HS'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			RH: ['all', ['==', ['get', 'type'], 'RH'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			MN: ['all', ['==', ['get', 'type'], 'MN'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			LB: ['all', ['==', ['get', 'type'], 'LB'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
		};
		updatePointsVisibility();
		updateNetworkStats();
		lineFilters = {
			Layer1: ['all', ['==', ['get', 'line_type'], 'Level1'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			Layer2: ['all', ['==', ['get', 'line_type'], 'Level2'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			Layer3: ['all', ['==', ['get', 'line_type'], 'Level3'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			Layer4: ['all', ['==', ['get', 'line_type'], 'Level4'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
		};
		updateLineVisibility();
		heatmapFilters = {
			RH: ['all', ['==', ['get', 'type'], 'RH'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			MN: ['all', ['==', ['get', 'type'], 'MN'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
			LB: ['all', ['==', ['get', 'type'], 'LB'], ['>=', ['to-number', ['get', 'year']], year_start], ['<=', ['to-number', ['get', 'year']], year_to_show]],
		};
		updateHeatmapVisibility();
	};

	// 'input' rather than 'change' so the map follows the handle while it is being dragged.
	// On 'change' nothing moved until the handle was released, which read as a broken timeline.
	year_selector_start.addEventListener('input', () => {
		if (Number(year_selector_start.value) > Number(year_selector.value)) {
			year_selector_start.value = year_selector.value;
		}
		year_start = Number(year_selector_start.value);
		rebuildFilters();
		updateSliderFill();
	});

	year_selector.addEventListener('input', () => {
		if (Number(year_selector.value) < Number(year_selector_start.value)) {
			year_selector.value = year_selector_start.value;
		}
		year_to_show = Number(year_selector.value);
		rebuildFilters();
		updateSliderFill();
	});

	// Apply the filters once the layers exist. Until this ran, setFilter had never been
	// called, so the layers carried no filter at all on first paint and the timeline only
	// started working after the slider was touched.
	map.on('layers-ready', () => {
		rebuildFilters();
		updateSliderFill();
	});
	map.on('line-layer-added', updateLineVisibility);
	document.querySelectorAll('input[name="sidebar-tab"]').forEach((radio) => {
		radio.addEventListener('change', updatePointsVisibility);
	});

	const heatmapCheckbox = document.getElementById('heatmap-layer');
	heatmapCheckbox.addEventListener('change', () => {
		setHeatmapLayer(heatmapCheckbox.checked);
	});

	map.on('layer-style-reset', () => {
		heatmapCheckbox.checked = false;
		setHeatmapLayer(false);
	});
};
