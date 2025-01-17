mapboxgl.accessToken =
	'pk.eyJ1IjoiZm12YWxkZXpnODQiLCJhIjoiY2xqajJzZXZ2MDU3ZTNybHBrdHo4OWo4aSJ9.ENnejUYGtJT-74gG0opSQA';

// Default values for map center and zoom
// Set distinct map center/zoom via query parameter
// eg - /?latitude=39.999330&longitude=-75.109110&zoom=15
const DEFAULT_MAP_CENTER = [-75.14034, 39.98718];
let map_center = [];

const DEFAULT_MAP_ZOOM = 13.39;
let map_zoom = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
// long/lat
if (urlParams.has('latitude') & urlParams.has('longitude')) {
	map_center = [urlParams.get('longitude'), urlParams.get('latitude')];
} else {
	map_center = DEFAULT_MAP_CENTER;
}
// zoom
if (urlParams.has('zoom')) {
	map_zoom = urlParams.get('zoom');
} else {	
	map_zoom = DEFAULT_MAP_ZOOM;
}

export default () => {
	window.map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/dark-v11',
		zoom: map_zoom,
		center: map_center,
		pitch: 0,
		bearing: 0,
	});
}
