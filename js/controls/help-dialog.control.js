// Body content should follow alike <h2 class="txt-xl"><p>...<h2 class="txt-xl"><h3 class="txt-l"><p>...
const controlHTML = `
<button type="button" class="control-button">
	<svg class="icon"><use xlink:href="#icon-question"/></svg>
</button>
`;
const popupHTML = `
<div id="help-dialog-bg"></div>
<div id="help-dialog-container" class="px18 py24 round">
	<div id="help-dialog-header" class="round">
		<h1 class="txt-xl">Help</h1>
		<button type="button" id="help-dialog-close" class="px12">
			<svg class="icon"><use xlink:href="#icon-close"/></svg>
		</button>
	</div>
	<div id="help-dialog-body">
		<span>Click outside or X to close</span>
		<h2 class="txt-xl">Map Navigation</h2>
		<h3 class="txt-l">On desktop</h3>
		<p>Left-click and drag to move. Alternatively, use the arrow keys.</p>
		<p>Right-click and drag to change your view angle relative to the map's surface</p>
		<p>Scrolling, double-clicking, on-screen controls, or use the "+" and "-" keys on your keyboard to change the zoom level.<p>
		<p>Additionally, shift + double-clicking will zoom out</p>
		<h3 class="txt-l">On Mobile</h3>
		<p>Use normal two-finger gestures as well as on-screen controls</p>

		<h2 class="txt-xl">Sidebar</h2>
		<p>Click the arrow button on the top right of your screen to show / hide the sidebar</p>
		<p>The sidebar contains various overlays and extra information relevant to PCW</p>

		<h2 class="txt-xl">Points of Interest (POI)</h2>
		<p>Select a location from the sidebar POI dropdown.
		Your view will 'fly to' the designated location and shift to a 3D rendering.</p>
		<p>To reset this view to the normal 2D orientation, click the compass button
		in the lower-right of the map, below the zoom icons ( +, - )</p>
		
		<h2 class="txt-xl">Pre-centering the map via link</h2>
		<p>
			It may be useful in some instances to have the map pre-zoomed on a given location of interest
			instead of having to fly there manually. To do so, find the latitude, longitude, and desired zoom 
			level using <a class="help-dialog-link" href="https://labs.mapbox.com/location-helper">MapBox's geolocation helper</a>, and then add 
			the values to the URL like so: 
		</p>
		<a class="help-dialog-link" href="/?latitude=39.95239&longitude=-75.16364&zoom=16">
			https://phillycommunitywireless.github.io/pcwnetworkmap/?latitude=39.95239&longitude=-75.16364&zoom=16
		</a>
		<p>
			For example, the above URL is centered/zoomed on City Hall.
		</p>
	</div>
</div>
`;

const NAME = 'help-dialog';
const openDialog = () =>
	document.getElementById(NAME + '-super').classList.add('visible');
const closeDialog = () =>
	document.getElementById(NAME + '-super').classList.remove('visible');
export default class HelpDialogControl {
	constructor() {
		document.addEventListener('DOMContentLoaded', () => {
			const popupDiv = document.createElement('div');
			popupDiv.id = 'help-dialog-super';
			popupDiv.innerHTML = popupHTML;

			popupDiv
				.querySelector('#' + NAME + '-bg')
				.addEventListener('click', closeDialog);
			popupDiv
				.querySelector('#' + NAME + '-close')
				.addEventListener('click', closeDialog);

			document.body.appendChild(popupDiv);
		});
	}

	onAdd(_map) {
		const div = document.createElement('div');
		div.id = NAME + '-control';
		div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
		div.innerHTML = controlHTML;

		div.addEventListener('contextmenu', (e) => e.preventDefault());

		div.querySelector('.control-button').addEventListener('click', openDialog);

		return div;
	}
}
