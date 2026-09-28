import { toggleSidebar } from './bind-elements.js';
import testMobile from './util/test-mobile.util.js';
// js/config.js is not committed: the deploy workflow writes it from the
// MAPBOX_API secret, and locally it's a copy of js/config.example.js
import { MAPBOX_API } from './config.js';

mapboxgl.accessToken = MAPBOX_API;

// Default values for map center and zoom
// Set distinct map center/zoom via query parameter
// eg - /?latitude=39.999330&longitude=-75.109110&zoom=15
const DEFAULT_MAP_CENTER = [-75.1255526, 39.9899471];
let map_center = [];

const DEFAULT_MAP_ZOOM = 13.70;
let map_zoom = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Query values arrive as strings - passing a bad one (eg ?latitude=abc) straight to
// the Map constructor throws, leaving a blank page. Only accept a finite
// number within range; otherwise warn and let the caller fall back to the default.
const parseNumberParam = (name, min, max) => {
	if (!urlParams.has(name)) {
		return undefined;
	}
	const raw = urlParams.get(name);
	// Number('') is 0, so a blank value would silently pass the range check
	const value = raw.trim() === '' ? NaN : Number(raw);
	if (Number.isFinite(value) && value >= min && value <= max) {
		return value;
	}
	console.warn(`Ignoring invalid "${name}" URL parameter: "${raw}"`);
	return undefined;
};

const latitude = parseNumberParam('latitude', -90, 90);
const longitude = parseNumberParam('longitude', -180, 180);
const zoom = parseNumberParam('zoom', 0, 22);

// long/lat - only override the center when both are supplied and valid
if (latitude !== undefined && longitude !== undefined) {
	map_center = [longitude, latitude];
} else {
	// a lone valid coordinate is dropped too, so say so rather than fail silently
	if (latitude !== undefined || longitude !== undefined) {
		console.warn('Ignoring map center: both "latitude" and "longitude" URL parameters are required');
	}
	map_center = DEFAULT_MAP_CENTER;
}
// zoom
if (zoom !== undefined) {
	map_zoom = zoom;
} else {
	map_zoom = DEFAULT_MAP_ZOOM;
}

/*
	load w/ menu closed if a small screen that isn't a phone - see map-on-load.js)
*/

// ?menu_closed, ?menu_closed=true and ?menu_closed=1 close the menu; any other
// value (eg ?menu_closed=false) leaves it open
const menuClosedValue = urlParams.has('menu_closed')
	? urlParams.get('menu_closed').toLowerCase()
	: null;
const menu_closed = menuClosedValue !== null && ['', 'true', '1'].includes(menuClosedValue);

if (menu_closed && testMobile().phone === false){
	toggleSidebar();
}

export default () => {
	window.map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/infopcw/cmphejix900bi01sc3hbhb0lx',
		// Mapbox GL JS v3 defaults to the globe projection, and `line-z-offset`
		// (used to elevate the connection lines in network-layers.js) is "not
		// supported for globe projection" — it is silently ignored there. Mercator
		// is required for the elevated lines to render. The map is always viewed at
		// city zoom levels, where globe and mercator look identical anyway.
		projection: 'mercator',
		zoom: map_zoom,
		center: map_center,
		pitch: 0,
		bearing: 0,
	});
}
