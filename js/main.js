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

// nav
const nav = new mapboxgl.NavigationControl({
	visualizePitch: true,
});
map.addControl(nav, 'bottom-right');

// tile style
map.addControl(new TileStyleControl(), 'bottom-left')

// geocoder 
const geocoder = new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl,
	marker: {color: 'blue'},
	placeholder: "Search an address",
	enableGeolocation: true,
});
map.addControl(geocoder, 'top-left');

// add basic controls
map.addControl(
	new mapboxgl.NavigationControl({
		visualizePitch: true,
	}),
	'bottom-right'
);

// add fullscreen control
map.addControl(
	new mapboxgl.FullscreenControl({container: document.querySelector('body')}),
	'bottom-right'
);
