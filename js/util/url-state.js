/**
 * @typedef {{
 * 	container: string;
 * 	style: string;
 * 	zoom: number;
 * 	center: number[];
 * 	pitch?: number;
 * 	bearing?: number;
 * }} MapOptions
 */
/**
 * @typedef {{
 * 	mapboxAccessToken: string;
 * 	centerKey: 'center';
 * 	zoomKey: 'zoom';
 * 	layersKey: 'layers';
 * 	delimiter: ',';
 * }} MapManagerOptions
 */

export default class MapboxURLManager {
	/**
	 * @constructor
	 * @param {MapOptions} mapOptions
	 * @param {MapManagerOptions} options
	 */
	constructor(mapOptions, options) {
		this.options = {
			centerKey: 'center',
			zoomKey: 'zoom',
			layersKey: 'layers',
			delimiter: ',',
			mapboxAccessToken: null,
			...options,
		};

		mapboxgl.accessToken = this.options.mapboxAccessToken;

		const initialState = this.getInitialStateFromURL();

		const mergedOptions = {
			...mapOptions,
			center: initialState.center || mapOptions.center,
			zoom: initialState.zoom || mapOptions.zoom,
		};

		this.map = new mapboxgl.Map(mergedOptions);
		this.map.on('style.load', () => {
			this.applyLayersFromState(initialState.layers);
			this.setupEventListeners();
		});

		return this.map;
	}

	getInitialStateFromURL() {
		const params = new URLSearchParams(window.location.search);

		const center = params.get(this.options.centerKey)
			? params
					.get(this.options.centerKey)
					.split(this.options.delimiter)
					.map(Number)
			: null;

		const zoom = params.get(this.options.zoomKey)
			? Number(params.get(this.options.zoomKey))
			: null;

		const layers = params.get(this.options.layersKey)
			? params.get(this.options.layersKey).split(this.options.delimiter)
			: [];

		return {center, zoom, layers};
	}

	applyLayersFromState(layers) {
		layers.forEach((layerId) => {
			if (this.map.getLayer(layerId)) {
				this.map.setLayoutProperty(layerId, 'visibility', 'visible');
			}
		});
	}

	updateURL() {
		const center = this.map.getCenter();
		const zoom = this.map.getZoom();
		const layers = this.getVisibleLayers();

		const params = new URLSearchParams(window.location.search);
		params.set(
			this.options.centerKey,
			`${center.lng.toFixed(5)}${this.options.delimiter}${center.lat.toFixed(
				5
			)}`
		);
		params.set(this.options.zoomKey, zoom.toFixed(2));
		params.set(this.options.layersKey, layers.join(this.options.delimiter));

		const newURL = `${window.location.pathname}?${params.toString()}`;
		history.replaceState(null, '', newURL);
	}

	syncFromURL() {
		const {center, zoom, layers} = this.getInitialStateFromURL();

		if (center) {
			this.map.setCenter(center);
		}
		if (zoom) {
			this.map.setZoom(zoom);
		}
		if (layers.length > 0) {
			this.applyLayersFromState(layers);
		}
	}

	getVisibleLayers() {
		const layers = [];
		this.map.getStyle().layers.forEach((layer) => {
			if (this.map.getLayoutProperty(layer.id, 'visibility') === 'visible') {
				layers.push(layer.id);
			}
		});
		return layers;
	}

	setupEventListeners() {
		this.map.on('moveend', () => this.updateURL());
		this.map.on('zoomend', () => this.updateURL());
		window.addEventListener('popstate', () => this.syncFromURL());
	}
}
