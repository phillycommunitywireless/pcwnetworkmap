import bindElements from './bind-elements.js';
import bindPointsVisibility from './bind-points-visibility.js';
import loadIcons from './load-icons.js';
import initMap from './map-init.js';
import mapOnLoad from './map-on-load.js';
import mapOnMouse from './map-on-mouse.js';
import mapOnStyleLoad from './map-on-style-load.js';

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

const geocoder = new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl,
	marker: {color: 'blue'},
	placeholder: "Search an address",
	enableGeolocation: true,
});

map.addControl(geocoder, 'top-left');