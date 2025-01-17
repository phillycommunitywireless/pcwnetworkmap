import bindElements from './js/bind-elements.js';
import bindPointsVisibility from './js/bind-points-visibility.js';
import loadIcons from './js/load-icons.js';
import initMap from './js/map-init.js';
import mapOnLoad from './js/map-on-load.js';
import mapOnMouse from './js/map-on-mouse.js';
import mapOnStyleLoad from './js/map-on-style-load.js';

initMap();
loadIcons();
mapOnLoad();
mapOnMouse();
mapOnStyleLoad();
bindElements();
bindPointsVisibility();

const nav = new mapboxgl.NavigationControl({
	visualizePitch: true,
});
map.addControl(nav, 'bottom-right');
