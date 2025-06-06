/**
 * @fileoverview Mapbox Arc Stamp Control - A custom control for adding variable arc stamps to Mapbox maps
 * @author Your Name
 * @version 1.0.0
 */
import {
	createControlContainer,
	createPanelHTML,
	initializePanelControls,
	toggleStampMode,
	updateEditModeUI,
} from './arc-stamp-elements.js';
import { createArcFeature } from './arc-stamp.util.js';

/**
 * Custom Mapbox control for adding arc stamps to the map
 * @class ArcStampControl
 */
class ArcStampControl {
	/**
	 * Initialize the Arc Stamp Control
	 * @constructor
	 * @param {Object} options - Configuration options for the control
	 * @param {number} [options.minRadius=100] - Minimum radius in meters
	 * @param {number} [options.maxRadius=5000] - Maximum radius in meters
	 * @param {string} [options.strokeColor='#3b82f6'] - Arc stroke color
	 * @param {number} [options.strokeWidth=2] - Arc stroke width
	 * @param {number} [options.strokeOpacity=0.8] - Arc stroke opacity
	 * @param {string} [options.fillColor='#3b82f6'] - Arc fill color
	 * @param {number} [options.fillOpacity=0.1] - Arc fill opacity
	 */
	constructor(options = {}) {
		this.options = {
			minRadius: 100,
			maxRadius: 5000,
			strokeColor: '#3b82f6',
			strokeWidth: 2,
			strokeOpacity: 0.8,
			fillColor: '#3b82f6',
			fillOpacity: 0.1,
			...options,
		};

		this.map = null;
		this.container = null;
		this.isActive = false;
		this.currentStartAngle = 0;
		this.currentArcAngle = 90;
		this.currentRadius = 500;
		this.clickHandler = null;
		this.mouseMoveHandler = null;
		this.selectedArcId = null;
		this.isEditMode = false;
		this.eventCoords = null;

		this.onMapClick = this.onMapClick.bind(this);
		this.onMapMouseMove = this.onMapMouseMove.bind(this);
		this.createArcFeature = createArcFeature.bind(this);

		this.toggleStampMode = toggleStampMode.bind(this);
		this.initializePanelControls = initializePanelControls.bind(this);
		this.createControlContainer = createControlContainer.bind(this);
		this.updateEditModeUI = updateEditModeUI.bind(this);
		this.createPanelHTML = createPanelHTML.bind(this);
	}

	/**
	 * Called when the control is added to the map
	 * @param {mapboxgl.Map} map - The Mapbox map instance
	 * @returns {HTMLElement} The control container element
	 */
	onAdd(map) {
		this.map = map;
		this.container = this.createControlContainer();

		this.map.on('style.load', () => {
			this.initializeMapSource();
			console.log('Arc Stamp Control: Initialized source');
		});

		return this.container;
	}

	onRemove() {
		if (this.container && this.container.parentNode) {
			this.container.parentNode.removeChild(this.container);
		}
		if (this.clickHandler) {
			this.map.off('click', this.clickHandler);
		}
		if (this.mouseMoveHandler) {
			this.map.off('mousemove', this.mouseMoveHandler);
		}
		this.map.off('click', 'arc-stamps-fill', this.onArcClick);
		this.map = null;
	}

	/**
	 * @param {Object} e - Mapbox click event
	 * @private
	 */
	onMapClick(e) {
		console.log(e.originalEvent);
		if (!this.isActive) return;

		if (
			this.eventCoords?.lng === e.lngLat.lng &&
			this.eventCoords?.lat === e.lngLat.lat
		) {
			return;
		}

		if (this.isEditMode && this.selectedArcId) {
			this.applyEdit();
		} else {
			const {lng, lat} = e.lngLat;
			this.addArcStamp(lng, lat);
		}
	}

	/**
	 * Initializes the arc stamp sources / layers
	 * @private
	 */
	initializeMapSource() {
		if (!this.map) {
			console.warn('Arc Stamp Control: Cannot initialize without map');
			return;
		}

		const initializedResources = {};

		try {
			if (!this.map.getSource('arc-stamps')) {
				initializedResources['arc-stamps'] = true;
				this.map.addSource('arc-stamps', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: [],
					},
				});
			}

			if (!this.map.getSource('arc-preview')) {
				initializedResources['arc-preview'] = true;
				this.map.addSource('arc-preview', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: [],
					},
				});
			}

			if (!this.map.getLayer('arc-stamps-fill')) {
				initializedResources['arc-stamps-fill'] = true;
				this.map.addLayer({
					id: 'arc-stamps-fill',
					type: 'fill',
					source: 'arc-stamps',
					paint: {
						'fill-color': [
							'case',
							['==', ['get', 'selected'], true],
							'#f59e0b', // Orange for selected
							this.options.fillColor,
						],
						'fill-opacity': this.options.fillOpacity,
					},
				});
			}

			if (!this.map.getLayer('arc-stamps-stroke')) {
				initializedResources['arc-stamps-stroke'] = true;
				this.map.addLayer({
					id: 'arc-stamps-stroke',
					type: 'line',
					source: 'arc-stamps',
					paint: {
						'line-color': [
							'case',
							['==', ['get', 'selected'], true],
							'#f59e0b', // Orange for selected
							this.options.strokeColor,
						],
						'line-width': [
							'case',
							['==', ['get', 'selected'], true],
							this.options.strokeWidth + 1,
							this.options.strokeWidth,
						],
						'line-opacity': this.options.strokeOpacity,
					},
				});
			}
			if (!this.map.getLayer('arc-preview-fill')) {
				initializedResources['arc-preview-fill'] = true;
				this.map.addLayer({
					id: 'arc-preview-fill',
					type: 'fill',
					source: 'arc-preview',
					paint: {
						'fill-color': this.options.fillColor,
						'fill-opacity': this.options.fillOpacity * 0.5,
					},
				});
			}

			if (!this.map.getLayer('arc-preview-stroke')) {
				initializedResources['arc-preview-stroke'] = true;
				this.map.addLayer({
					id: 'arc-preview-stroke',
					type: 'line',
					source: 'arc-preview',
					paint: {
						'line-color': this.options.strokeColor,
						'line-width': this.options.strokeWidth,
						'line-opacity': this.options.strokeOpacity * 0.7,
						'line-dasharray': [2, 2], // Dashed line for preview
					},
				});
			}
			if (Object.keys(initializedResources).length !== 6) {
				throw Error('Missing required source / layer');
			}
		} catch (error) {
			console.warn('Arc Stamp Control: Could not initialize map layers', error);
		}
	}

	/**
	 * Adds an arc stamp to the map at the specified location
	 * @param {number} lng - Longitude
	 * @param {number} lat - Latitude
	 * @private
	 */
	addArcStamp(lng, lat) {
		const source = this.map.getSource('arc-stamps');
		if (!source) {
			console.warn('Arc Stamp Control: Map source not ready');
			return;
		}

		const feature = this.createArcFeature(
			lng,
			lat,
			this.currentRadius,
			this.currentArcAngle,
			this.currentStartAngle
		);
		const data = source._data;

		data.features.push(feature);
		source.setData(data);
	}

	/**
	 * Clears all arc stamps from the map
	 * @private
	 */
	clearAllArcs() {
		const source = this.map.getSource('arc-stamps');
		if (source) {
			source.setData({
				type: 'FeatureCollection',
				features: [],
			});
		}
		this.cancelEdit();
	}

	/**
	 * Handles mouse movement for preview arc
	 * @param {Object} e - Mapbox mousemove event
	 * @private
	 */
	onMapMouseMove(e) {
		if (!this.isActive || this.isEditMode) return;

		const {lng, lat} = e.lngLat;
		this.showPreview(
			lng,
			lat,
			this.currentRadius,
			this.currentArcAngle,
			this.currentStartAngle
		);
	}

	/**
	 * Gets all current arc stamps
	 * @returns {Array} Array of arc features
	 * @public
	 */
	getArcs() {
		const source = this.map.getSource('arc-stamps');
		return source ? source._data.features : [];
	}

	updatePreviewOrEdit() {
		if (this.isEditMode && this.selectedArcId) {
			const source = this.map.getSource('arc-stamps');
			if (!source) {
				console.warn('arc-stamps source not found');
				return;
			}

			const data = source._data;
			const selectedFeature = data.features.find(
				(f) => f.properties.id === this.selectedArcId
			);
			if (selectedFeature) {
				const center = selectedFeature.properties.center;
				this.showPreview(
					center[0],
					center[1],
					this.currentRadius,
					this.currentArcAngle,
					this.currentStartAngle
				);
			}
		}
	}

	/**
	 * Sets the arc stamp options
	 * @param {Object} newOptions - New options to merge
	 * @public
	 */
	setOptions(newOptions) {
		this.options = {...this.options, ...newOptions};

		// Update layer styles if they exist
		if (this.map.getLayer('arc-stamps-fill')) {
			this.map.setPaintProperty(
				'arc-stamps-fill',
				'fill-color',
				this.options.fillColor
			);
			this.map.setPaintProperty(
				'arc-stamps-fill',
				'fill-opacity',
				this.options.fillOpacity
			);
		}

		if (this.map.getLayer('arc-stamps-stroke')) {
			this.map.setPaintProperty(
				'arc-stamps-stroke',
				'line-color',
				this.options.strokeColor
			);
			this.map.setPaintProperty(
				'arc-stamps-stroke',
				'line-width',
				this.options.strokeWidth
			);
			this.map.setPaintProperty(
				'arc-stamps-stroke',
				'line-opacity',
				this.options.strokeOpacity
			);
		}
	}

	// PREVIEW

	/**
	 * Shows a preview arc at the given location
	 * @param {number} lng - Longitude
	 * @param {number} lat - Latitude
	 * @param {number} radius - Arc radius
	 * @param {number} angle - Arc angle
	 */
	showPreview(lng, lat, radius, angle) {
		const previewSource = this.map.getSource('arc-preview');
		if (!previewSource) {
			console.warn('arc-preview unavailable');
			return;
		}
		const previewFeature = this.createArcFeature(
			lng,
			lat,
			radius,
			angle,
			this.currentStartAngle
		);
		previewSource.setData({
			type: 'FeatureCollection',
			features: [previewFeature],
		});
	}

	clearPreview() {
		const previewSource = this.map.getSource('arc-preview');
		if (previewSource) {
			previewSource.setData({
				type: 'FeatureCollection',
				features: [],
			});
		}
	}

	// EDIT

	updateSliderValues() {
		const angleSlider = this.container.querySelector('#angle-slider');
		const angleValue = this.container.querySelector('#angle-value');
		const radiusSlider = this.container.querySelector('#radius-slider');
		const radiusValue = this.container.querySelector('#radius-value');

		if (angleSlider && angleValue) {
			angleSlider.value = this.currentAngle;
			angleValue.textContent = `${this.currentAngle}°`;
		}

		if (radiusSlider && radiusValue) {
			radiusSlider.value = this.currentRadius;
			radiusValue.textContent = `${this.currentRadius}m`;
		}
	}

	/**
	 * Handles clicking on existing arcs for editing
	 * @param {Object} e - Mapbox click event
	 */
	onArcClick(e) {
		if (!this.isActive) return;

		e.preventDefault();
		const feature = e.features[0];
		if (!feature) return;

		this.selectArcForEdit(feature.properties.id, feature.properties);
		// e.originalEvent.stopPropagation() is illegal for some reason?
		this.eventCoords = e.lngLat;
	}

	/**
	 * Selects an arc for editing
	 * @param {string} arcId - The arc ID to select
	 * @param {Object} properties - Arc properties
	 */
	selectArcForEdit(arcId, properties) {
		this.selectedArcId = arcId;
		this.isEditMode = true;
		this.currentAngle = properties.angle;
		this.currentRadius = properties.radius;

		// Update UI
		this.updateEditModeUI(true);
		this.updateSliderValues();
		this.highlightSelectedArc(arcId);
		this.clearPreview();
	}

	/**
	 * Highlights the selected arc
	 * @param {string} arcId - The arc ID to highlight
	 */
	highlightSelectedArc(arcId) {
		const source = this.map.getSource('arc-stamps');
		if (!source) {
			console.warn('arc-stamps source not found');
			return;
		}

		const data = source._data;
		data.features.forEach((feature) => {
			feature.properties.selected = feature.properties.id === arcId;
		});
		console.log(data.features)
		source.setData(data);
	}

	applyEdit() {
		if (!this.selectedArcId) return;

		const source = this.map.getSource('arc-stamps');
		if (!source) return;

		const data = source._data;
		const featureIndex = data.features.findIndex(
			(f) => f.properties.id === this.selectedArcId
		);

		if (featureIndex !== -1) {
			const oldFeature = data.features[featureIndex];
			const center = oldFeature.properties.center;

			// Create new arc with updated properties
			const newFeature = this.createArcFeature(
				center[0],
				center[1],
				this.currentRadius,
				this.currentArcAngle,
				this.currentStartAngle
			);
			newFeature.properties.selected = false;
			console.log(newFeature)
			data.features.splice(featureIndex, 1);
			data.features.push(newFeature);
			console.log(data)
			source.setData(data);
		}

		this.cancelEdit();
	}

	cancelEdit() {
		this.selectedArcId = null;
		this.isEditMode = false;
		this.updateEditModeUI(false);
		this.clearPreview();

		// Remove selection highlighting
		const source = this.map.getSource('arc-stamps');
		if (source) {
			const data = source._data;
			data.features.forEach((feature) => {
				delete feature.properties.selected;
			});
			source.setData(data);
		}
	}
}

/**
 * Factory function to create and add the Arc Stamp Control to a map
 * @param {mapboxgl.Map} map - The Mapbox map instance
 * @param {Object} [options] - Configuration options
 * @returns {ArcStampControl} The created control instance
 * @public
 */
export function addArcStampControl(map, options = {}) {
	const control = new ArcStampControl(options);
	map.addControl(control, 'bottom-left');
	return control;
}
