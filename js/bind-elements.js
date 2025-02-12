import {
	setBroadbandLayer,
	setIncomeLayer,
	setNeighborhoodLayer,
	setNeighborhoodOutline,
} from './bind-elements.util.js';
import { FlyToDefaults, NavBookmarks } from './const.js';

export const toggleSidebar = () => {
	const sidebar = document.getElementById('right-sidebar');
	const isCollapsed = sidebar.classList.toggle('collapsed');
	if (isCollapsed) {
		document.getElementById('sidebar-advanced-ui').classList.add('collapsed');
	}
};
export const toggleAdvancedSidebar = () => {
	const sidebar = document.getElementById('sidebar-advanced-ui');
	sidebar.classList.toggle('collapsed');
};

const navigateToBookmark = (bookmarkId) => {
	if (!NavBookmarks[bookmarkId]) {
		console.error('No bookmark for', bookmarkId);
		return;
	}
	map.flyTo({
		...FlyToDefaults,
		...NavBookmarks[bookmarkId],
	});
	toggleSidebar();
};

export default () => {
	document
		.getElementById('sidebar-toggle')
		.addEventListener('click', toggleSidebar);
	document
		.getElementById('sidebar-advanced-options')
		.addEventListener('click', toggleAdvancedSidebar);

	// visibility bindings
	document
		.getElementById('toggleNetworkLinks')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'line-dashed',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	document
		.getElementById('toggleNetworkLinks2')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'new-line-dashed',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	document
		.getElementById('toggleNetworkLinks3')
		.addEventListener('change', function () {
			map.setLayoutProperty(
				'new-line-dashed2',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
		});

	document
		.getElementById('neighborhood-boundaries')
		.addEventListener('click', function () {
			setNeighborhoodLayer(this.checked);
		});

	document
		.getElementById('neighborhood-outline-only')
		.addEventListener('change', function () {
			setNeighborhoodOutline(this.checked);
		});

	document
		.getElementById('income-blocks')
		.addEventListener('change', function () {
			setIncomeLayer(this.checked);
		});

	document
		.getElementById('show-income-popup')
		.addEventListener('change', function () {
			if (!this.checked) {
				map.fire('close-income-popup');
			}
		});

	document
		.getElementById('broadband-blocks')
		.addEventListener('change', function () {
			setBroadbandLayer(this.checked);
		});

	document
		.getElementById('show-broadband-popup')
		.addEventListener('change', function () {
			if (!this.checked) {
				map.fire('close-broadband-popup');
			}
		});

	// navigation bindings
	document.getElementById('poi-select').addEventListener('change', (e) => {
		const poi = e.target.value;
		if (!poi || poi === 'null') {
			return;
		}
		navigateToBookmark(poi);
	});
};
