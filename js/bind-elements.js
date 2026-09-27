export const toggleSidebar = () => {
	document.getElementById('right-sidebar').classList.toggle('collapsed');
};

const getActiveTab = () => {
	const active = document.querySelector('input[name="sidebar-tab"]:checked');
	return active ? active.value : 'tab-basic';
};

// Connection-line checkboxes and the layer each one drives. The layers arrive
// asynchronously and are rebuilt on every basemap switch, so every layer call
// below checks map.getLayer first.
const LINE_LAYER_CHECKBOXES = [
	['toggleNetworkLinks',  'highsite-line'],
	['toggleNetworkLinks2', 'wiredap-line'],
	['toggleNetworkLinks3', 'meshnode-line'],
	['toggleNetworkLinks4', 'ptp-line'],
];

// Enforces which layers are visible based on the active tab.
// Heatmap belongs to Basic; connections belong to Links. Nodes show on both - on Basic
// they are narrowed to access points only (see updatePointsVisibility).
// Called on every tab switch and once after the map reaches idle on load.
const syncTabLayers = (tabId) => {
	const onBasic = tabId === 'tab-basic';
	const onLinks = tabId === 'tab-links';

	if (map.getLayer('heatmap-layer')) {
		const heatmapChecked = document.getElementById('heatmap-layer').checked;
		map.setLayoutProperty(
			'heatmap-layer',
			'visibility',
			onBasic && heatmapChecked ? 'visible' : 'none'
		);
	}

	if (map.getLayer('network-points-layer')) {
		map.setLayoutProperty(
			'network-points-layer',
			'visibility',
			onBasic || onLinks ? 'visible' : 'none'
		);
	}

	LINE_LAYER_CHECKBOXES.forEach(([cbId, layerId]) => {
		if (map.getLayer(layerId)) {
			const checked = document.getElementById(cbId).checked;
			map.setLayoutProperty(
				layerId,
				'visibility',
				onLinks && checked ? 'visible' : 'none'
			);
		}
	});
};

export default () => {
	document
		.getElementById('sidebar-toggle')
		.addEventListener('click', toggleSidebar);

	// connection line visibility
	LINE_LAYER_CHECKBOXES.forEach(([cbId, layerId]) => {
		document.getElementById(cbId).addEventListener('change', function () {
			// the layer may not have arrived yet, or may be mid-reload after a style switch
			if (!map.getLayer(layerId)) return;
			map.setLayoutProperty(
				layerId,
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});
	});

	// tab switching
	document.querySelectorAll('input[name="sidebar-tab"]').forEach((radio) => {
		radio.addEventListener('change', () => {
			document.querySelectorAll('.sidebar-tab-panel').forEach(p => p.classList.remove('active'));
			document.getElementById(radio.value).classList.add('active');
			syncTabLayers(radio.value);
			document.querySelector('.sidebar-year-slider').style.display =
				radio.value === 'tab-zones' ? 'none' : '';
			// the camera stays where the visitor left it when switching tabs
		});
	});

	// Sync on every style load (initial + tile-style changes).
	// 'layers-ready' is fired by map-on-style-load.js after all synchronous
	// layers have been added, guaranteeing network-points-layer and
	// heatmap-layer exist when syncTabLayers runs.
	map.on('layers-ready', () => syncTabLayers(getActiveTab()));

	// setStyle() drops every line layer, so clear and lock all four checkboxes until
	// loadNetworkLayers re-enables each one as its layer comes back. Previously only
	// the animated lines were unchecked, leaving the wired checkbox on with nothing
	// to show, and any checkbox could be toggled while its layer was mid-reload.
	map.on('layer-style-reset', () => {
		LINE_LAYER_CHECKBOXES.forEach(([cbId]) => {
			const checkbox = document.getElementById(cbId);
			checkbox.checked = false;
			checkbox.disabled = true;
		});
	});
};
