// Create an object to track the visibility status of each layer
const visibilityStatus = {
	HS: true,
	RH: true,
	MN: true,
	LB: true,
};

// the install-year range shown on the map: nodes installed within [year_start, year_to_show],
// plus any node with no usable year (see yearInRange below)
// these are starting values only - syncYearRangeToData() replaces them with the real range
// present in the data once it loads, so a new install year doesn't need a code change
let year_to_show = 2026
let year_start = 2020

let networkPointsData = null;

// A year that isn't a positive number (missing, blank or text in the spreadsheet) is "no year".
// Such a node is always shown, so this must agree with yearInRange() below.
const hasUsableYear = (year) => {
	const y = Number(year);
	return Number.isFinite(y) && y > 0;
};

// Mapbox expression: true when the feature was installed within [start, end].
// A node with no usable year must stay visible rather than vanish from the timeline:
// "to-number" turns a missing or blank year into 0 and, via the fallback argument, text
// it can't parse into -1, so anything <= 0 means "no year" and always passes.
const yearInRange = (start, end) => {
	const year = ['to-number', ['get', 'year'], -1];
	return ['any', ['<=', year, 0], ['all', ['>=', year, start], ['<=', year, end]]];
};

function updateNetworkStats() {
	if (!networkPointsData) return;
	const features = networkPointsData.features;
	// a node without a year is on the map for every range, so count it in every range too
	const inRange = (f) =>
		!hasUsableYear(f.properties.year) ||
		(Number(f.properties.year) >= year_start && Number(f.properties.year) <= year_to_show);
	// APs = rooftop hubs + mesh nodes (both broadcast WiFi); LBs are the point-to-point receivers
	const rhCount = features.filter(f => (f.properties.type === 'RH' || f.properties.type === 'MN') && inRange(f)).length;
	const lbCount = features.filter(f => f.properties.type === 'LB' && inRange(f)).length;
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
		.map(f => f.properties.year)
		.filter(hasUsableYear)
		.map(Number);
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

// Nodes without a usable install year are shown for every range, so the timeline itself
// can't reveal that one is missing; flag them once per load so the spreadsheet gets fixed.
function warnAboutMissingYears() {
	const missing = networkPointsData.features
		.filter(f => !hasUsableYear(f.properties.year))
		.map(f => `${f.properties.name} (id ${f.properties.id})`);
	if (missing.length) {
		console.warn(`${missing.length} network point(s) have no usable install year and are shown for every year range: ${missing.join(', ')}`);
	}
}

export const setNetworkPointsData = (data) => {
	networkPointsData = data;
	warnAboutMissingYears();
	syncYearRangeToData();
	updateNetworkStats();
};

// Build the filter expressions for the current year range, keyed by node/line type.
// "all" requires all filter expressions to be met; the year clause lives in yearInRange()
// so the points, line and heatmap layers can never disagree about which years are shown.
const buildFilters = () => {
	const inRange = yearInRange(year_start, year_to_show);
	const byType = (type) => ['all', ['==', ['get', 'type'], type], inRange];
	const byLineType = (lineType) => ['all', ['==', ['get', 'line_type'], lineType], inRange];
	return {
		// network points layer
		layerFilters: { HS: byType('HS'), RH: byType('RH'), MN: byType('MN'), LB: byType('LB') },
		// line layers
		lineFilters: { Layer1: byLineType('Level1'), Layer2: byLineType('Level2'), Layer3: byLineType('Level3'), Layer4: byLineType('Level4') },
		// heatmap
		heatmapFilters: { RH: byType('RH'), MN: byType('MN'), LB: byType('LB') },
	};
};

let { layerFilters, lineFilters, heatmapFilters } = buildFilters();

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

	// the layer is missing when the points fetch failed, and a checkbox can be
	// clicked before it exists; setFilter on a missing layer fires a Mapbox error event
	if (map.getLayer('network-points-layer')) map.setFilter('network-points-layer', filters);
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

	// same guard as the points layer: the heatmap is only added once the points loaded
	if (map.getLayer('heatmap-layer')) map.setFilter('heatmap-layer', filters);
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
		({ layerFilters, lineFilters, heatmapFilters } = buildFilters());
		updatePointsVisibility();
		updateNetworkStats();
		updateLineVisibility();
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
