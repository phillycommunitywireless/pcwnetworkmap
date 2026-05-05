import {
	setNeighborhoodLayer,
	setNeighborhoodOutline,
} from './bind-elements.util.js';

export const toggleSidebar = () => {
	document.getElementById('right-sidebar').classList.toggle('collapsed');
};

const getActiveTab = () => {
	const active = document.querySelector('input[name="sidebar-tab"]:checked');
	return active ? active.value : 'tab-basic';
};

// Enforces which layers are visible based on the active tab.
// Heatmap belongs to Basic; nodes and connections belong to Links.
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
			onLinks ? 'visible' : 'none'
		);
	}

	[
		['toggleNetworkLinks',  'highsite-line'],
		['toggleNetworkLinks2', 'wiredap-line'],
		['toggleNetworkLinks3', 'meshnode-line'],
		['toggleNetworkLinks4', 'ptp-line'],
	].forEach(([cbId, layerId]) => {
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
	document
		.getElementById('toggleNetworkLinks')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'highsite-line',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	document
		.getElementById('toggleNetworkLinks2')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'wiredap-line',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	document
		.getElementById('toggleNetworkLinks3')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'meshnode-line',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	document
		.getElementById('toggleNetworkLinks4')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'ptp-line',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	// neighborhood outline toggle — resets hidden fill checkbox on toggle-off
	// so setNeighborhoodOutline doesn't accidentally re-show the fill layer
	document
		.getElementById('neighborhood-outline-only')
		.addEventListener('change', function () {
			if (!this.checked) {
				document.getElementById('neighborhood-boundaries').checked = false;
			}
			setNeighborhoodOutline(this.checked);
		});

	// tab switching
	document.querySelectorAll('input[name="sidebar-tab"]').forEach((radio) => {
		radio.addEventListener('change', () => {
			document.querySelectorAll('.sidebar-tab-panel').forEach(p => p.classList.remove('active'));
			document.getElementById(radio.value).classList.add('active');
			syncTabLayers(radio.value);
		});
	});

	// Sync on every style load (initial + tile-style changes).
	// 'layers-ready' is fired by map-on-style-load.js after all synchronous
	// layers have been added, guaranteeing network-points-layer and
	// heatmap-layer exist when syncTabLayers runs.
	map.on('layers-ready', () => syncTabLayers(getActiveTab()));
};
