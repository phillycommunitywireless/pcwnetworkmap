import bindElements from './bind-elements.js';
import bindPointsVisibility from './bind-points-visibility.js';
import TileStyleControl from './controls/tile-style.control.js';
import initMap from './map-init.js';
import mapOnLoad from './map-on-load.js';
import mapOnMouse from './map-on-mouse.js';
import mapOnStyleLoad from './map-on-style-load.js';

initMap();
mapOnLoad();
mapOnMouse();
mapOnStyleLoad();
bindElements();
bindPointsVisibility();

const nav = new mapboxgl.NavigationControl({
	visualizePitch: true,
});
map.addControl(nav, 'bottom-right');

map.addControl(new TileStyleControl(), 'bottom-left')