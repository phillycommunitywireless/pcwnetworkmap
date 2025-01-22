// See a list of Mapbox-hosted public styles at
// https://docs.mapbox.com/api/maps/styles/#mapbox-styles
const innerHTML = `
<button>
	<span>Layer</span>
	<label id="active-label">dark</label>
</button>
<div id="tile-style-menu">
	<div>
		<input id="satellite-streets-v12" type="radio" name="rtoggle" value="satellite">
		<label for="satellite-streets-v12">aerial</label>
	</div>
		<div>
		<input id="light-v11" type="radio" name="rtoggle" value="light">
		<label for="light-v11">light</label>
	</div>
		<div>
		<input id="dark-v11" type="radio" name="rtoggle" value="dark" checked="checked">
		<label for="dark-v11">dark</label>
	</div>
		<div>
		<input id="streets-v12" type="radio" name="rtoggle" value="streets">
		<label for="streets-v12">streets</label>
	</div>
		<div>
		<input id="outdoors-v12" type="radio" name="rtoggle" value="outdoors">
		<label for="outdoors-v12">nature</label>
	</div>
</div>
`;

// mapbox is a hot mess https://github.com/mapbox/mapbox-gl-js/issues/4006
export default class TileStyleControl {
	onAdd(map) {
		const div = document.createElement('div');
		div.id = 'tile-style-control';
		div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
		div.innerHTML = innerHTML;

		div.addEventListener('contextmenu', (e) => e.preventDefault());
		div.querySelector('button').addEventListener('click', () => {
			document.getElementById('tile-style-menu').classList.toggle('visible');
		});

		const inputs = div.getElementsByTagName('input');
		for (const input of inputs) {
			input.onclick = (layer) => {
				map.fire('layer-style-reset');
				const layerId = layer.target.id;
				document.getElementById('active-label').innerText =
					layerId.match(/\w*/)[0]; // strip version
				map.setStyle('mapbox://styles/mapbox/' + layerId);
			};
		}

		return div;
	}
}
