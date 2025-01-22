import bindElements from './bind-elements.js';
import bindPointsVisibility from './bind-points-visibility.js';
import loadIcons from './load-icons.js';
import initMap from './map-init.js';
import mapOnLoad from './map-on-load.js';
import mapOnMouse from './map-on-mouse.js';
import mapOnStyleLoad from './map-on-style-load.js';
import initSearchBar from './search-bar-init.js';

initMap();
loadIcons();
mapOnLoad();
mapOnMouse();
mapOnStyleLoad();
bindElements();
bindPointsVisibility();
initSearchBar();

const nav = new mapboxgl.NavigationControl({
	visualizePitch: true,
});
map.addControl(nav, 'bottom-right');
