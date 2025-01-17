import { NavBookmarks } from "./const.js";

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

	const toggleCheckbox = document.getElementById('toggleNetworkLinks');
	toggleCheckbox.addEventListener('change', () => {
		map.setLayoutProperty(
			'line-dashed',
			'visibility',
			toggleCheckbox.checked ? 'visible' : 'none'
		);
	});

	const newLayerCheckbox = document.getElementById('toggleNetworkLinks2');
	newLayerCheckbox.addEventListener('change', () => {
		map.setLayoutProperty(
			'new-line-dashed',
			'visibility',
			newLayerCheckbox.checked ? 'visible' : 'none'
		);
	});

	const newLayerCheckbox2 = document.getElementById('toggleNetworkLinks3');
	newLayerCheckbox2.addEventListener('change', () => {
		map.setLayoutProperty(
			'new-line-dashed2',
			'visibility',
			newLayerCheckbox2.checked ? 'visible' : 'none'
		);
	});

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
