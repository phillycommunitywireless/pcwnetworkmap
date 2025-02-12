import MapboxURLManager from "./util/url-state.js";

const accessToken =
	'pk.eyJ1IjoiZm12YWxkZXpnODQiLCJhIjoiY2xqajJzZXZ2MDU3ZTNybHBrdHo4OWo4aSJ9.ENnejUYGtJT-74gG0opSQA';

export default () => {
	window.map = new MapboxURLManager({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v12',
		zoom: 13.39,
		center: [-75.14034, 39.98718],
		pitch: 0,
		bearing: 0,
	}, {
		mapboxAccessToken: accessToken
	});
}
