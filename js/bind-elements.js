import { NavBookmarks } from '/js/const.js';

export const toggleSidebar = () => {
	const sidebar = document.getElementById('right-sidebar');
	const isCollapsed = sidebar.classList.toggle('collapsed');
	const padding = isCollapsed ? 0 : 300;
	// Use `map.easeTo()` with a padding option to adjust the map's center accounting for the position of sidebars.
	map.easeTo({
		padding: {right: padding},
		duration: 1000, // In ms. This matches the CSS transition duration property.
	});
};

const navigateToBookmark = (bookmarkId) => {
	if (!NavBookmarks[bookmarkId]) {
		console.error('No bookmark for', bookmarkId);
		return;
	}
	map.flyTo({
		...NavBookmarks[bookmarkId],
		speed: 0.8,
		curve: 1.2,
	});
};

export default () => {
	const rightSidebar = document.getElementById('right-sidebar');
	rightSidebar.addEventListener('click', toggleSidebar);

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
			map.setLayoutProperty(
				'neighborhood-layer',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
			map.setLayoutProperty(
				'neighborhood-labels',
				'visibility',
				this.checked ? 'visible' : 'none'
			);
			// trade places with map-generated neighborhood labels as they conflict visually
			map.getStyle().layers.forEach((layer) => {
				if (layer.id.includes('settlement')) {
					map.setLayoutProperty(
						layer.id,
						'visibility',
						this.checked ? 'none' : 'visible'
					);
				}
			});
		});

	// navigation bindings
	const norrisSq = 'norris_square';
	const norrisSqBtn = document.getElementById(norrisSq);
	norrisSqBtn.addEventListener('click', () => {
		navigateToBookmark(norrisSq);
	});
	const fairhillSq = 'fairhill_square';
	const fairhillSqBtn = document.getElementById(fairhillSq);
	fairhillSqBtn.addEventListener('click', () => {
		navigateToBookmark(fairhillSq);
	});
	const mcphersonSq = 'mcpherson_square';
	const mcphersonSqBtn = document.getElementById(mcphersonSq);
	mcphersonSqBtn.addEventListener('click', () => {
		navigateToBookmark(mcphersonSq);
	});
};
