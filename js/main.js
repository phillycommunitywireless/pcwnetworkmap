import bindElements from './bind-elements.js';
import bindPointsVisibility from './bind-points-visibility.js';
import TileStyleControl from './controls/tile-style.control.js';
import initMap from './map-init.js';
import mapOnLoad from './map-on-load.js';
import mapOnMouse from './map-on-mouse.js';
import mapOnStyleLoad from './map-on-style-load.js';
import testMobile from './util/test-mobile.util.js';

const isMobile = testMobile();

if (isMobile.phone) {
	document.body.classList.add("mobile");
}

initMap();
mapOnLoad();
mapOnMouse();
mapOnStyleLoad();
bindElements();
bindPointsVisibility();

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

// tile style
map.addControl(new TileStyleControl(), 'bottom-left');

// geocoder
const geocoder = new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl,
	marker: {color: 'blue'},
	placeholder: 'Search an address',
	enableGeolocation: true,
});
map.addControl(geocoder, isMobile.phone ? 'bottom' : 'top-left');
