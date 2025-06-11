	/**
	 * Toggles the stamp mode on/off
	 */
	export function toggleStampMode() {
		this.isActive = !this.isActive;
		const toggleBtn = this.container.querySelector('.arc-stamp-toggle');
		const panel = this.container.querySelector('.arc-stamp-panel');

		if (this.isActive) {
			toggleBtn.style.backgroundColor = '#3b82f6';
			toggleBtn.style.color = 'white';
			panel.style.display = 'block';
			this.map.getCanvas().style.cursor = 'crosshair';
			this.map.on('preclick', 'arc-stamps-fill', this.onArcClick.bind(this));
			this.map.on('click', this.onMapClick);
			this.map.on('mousemove', this.onMapMouseMove);
			this.map.on('wheel', this.scrollListener);
			// Add click handler for existing arcs
			// this.map.on('click', 'arc-stamps-fill', this.onArcClick.bind(this));
			// Change cursor when hovering over existing arcs
			this.map.on('mouseenter', 'arc-stamps-fill', () => {
				this.map.getCanvas().style.cursor = 'pointer';
			});
			this.map.on('mouseleave', 'arc-stamps-fill', () => {
				this.map.getCanvas().style.cursor = this.isActive ? 'crosshair' : '';
			});
		} else {
			toggleBtn.style.backgroundColor = 'transparent';
			toggleBtn.style.color = 'black';
			panel.style.display = 'none';
			this.map.getCanvas().style.cursor = '';
			this.map.off('click', this.onMapClick);
			this.map.off('mousemove', this.onMapMouseMove);
			this.map.off('click', 'arc-stamps-fill', this.onArcClick);
			this.map.off('mouseenter', 'arc-stamps-fill');
			this.map.off('mouseleave', 'arc-stamps-fill');
			this.map.off('wheel', this.scrollListener);
			this.clearPreview();
			this.cancelEdit();
		}
	}

	/**
	 * Initializes event listeners for panel controls
	 * @param {HTMLElement} panel - The panel element
	 */
	export function initializePanelControls(panel) {
		const arcAngleSlider = panel.querySelector('#arc-angle-slider');
		const arcAngleValue = panel.querySelector('#arc-angle-value');
		const arcAngleStartSlider = panel.querySelector('#arc-angle-start-slider');
		const arcAngleStartValue = panel.querySelector('#arc-angle-start-value');
		const radiusSlider = panel.querySelector('#radius-slider');
		const radiusValue = panel.querySelector('#radius-value');
		const clearBtn = panel.querySelector('#clear-arcs');
		const cancelEditBtn = panel.querySelector('#cancel-edit');
		const closeBtn = panel.querySelector('#close-panel');

		if (arcAngleSlider && arcAngleValue) {
			arcAngleSlider.addEventListener('input', (e) => {
				this.currentArcAngle = parseInt(e.target.value);
				arcAngleValue.textContent = `${this.currentArcAngle}°`;
			});
		}

		if (arcAngleStartSlider && arcAngleStartValue) {
			arcAngleStartSlider.addEventListener('input', (e) => {
				this.currentStartAngle = parseInt(e.target.value);
				arcAngleStartValue.textContent = `${this.currentStartAngle}°`;
			});
		}

		if (radiusSlider && radiusValue) {
			radiusSlider.addEventListener('input', (e) => {
				this.currentRadius = parseInt(e.target.value);
				radiusValue.textContent = `${this.currentRadius}m`;
			});
		}

		if (clearBtn) {
			clearBtn.addEventListener('click', () => this.clearAllArcs());
		}

		if (cancelEditBtn) {
			cancelEditBtn.addEventListener('click', () => this.cancelEdit());
		}

		if (closeBtn) {
			closeBtn.addEventListener('click', () => this.toggleStampMode());
		}
	}

	/**
	 * Creates the main control container with UI elements
	 * @returns {HTMLElement} The container element
	 */
	export function createControlContainer() {
		const container = document.createElement('div');
		container.id = 'arc-stamp-control';
		container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
		container.style.cssText = `
					position: relative;
					background: white;
					border-radius: 4px;
					box-shadow: 0 2px 4px rgba(0,0,0,0.1);
					margin: 0 0 30px 10px;
					height: 64px; width: 64px;
					display: flex;
					justify-content: center;
					align-items: center;
			`;

		const toggleBtn = document.createElement('button');
		toggleBtn.className = 'arc-stamp-toggle';
		toggleBtn.innerHTML = '<span>Arc</span><span>Stamp</span><span>Tool</span>';
		toggleBtn.style.cssText = `
					background: none;
					border: none;
					width: 100%;
					height: 100%;
					cursor: pointer;
					font-size: 12px;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					transition: background-color 0.2s;
			`;

		// Control panel (initially hidden)
		const panel = document.createElement('div');
		panel.className = 'arc-stamp-panel';
		panel.style.cssText = `
					position: absolute;
					bottom: 100%;
					left: 0;
					background: white;
					border-radius: 4px;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
					padding: 12px;
					min-width: 200px;
					margin-bottom: 8px;
					display: none;
					z-index: 1000;
			`;

		panel.innerHTML = this.createPanelHTML();

		// Event listeners
		toggleBtn.addEventListener('click', this.toggleStampMode);
		toggleBtn.addEventListener('mouseenter', () => {
			if (!this.isActive) {
				toggleBtn.style.backgroundColor = '#f0f0f0';
			}
		});
		toggleBtn.addEventListener('mouseleave', () => {
			if (!this.isActive) {
				toggleBtn.style.backgroundColor = 'transparent';
			}
		});

		container.appendChild(toggleBtn);
		container.appendChild(panel);

		// Initialize panel controls after DOM insertion
		setTimeout(() => this.initializePanelControls(panel), 0);

		return container;
	}

	/**
	 * Updates the UI for edit mode
	 * @param {boolean} editing - Whether we're in edit mode
	 * @private
	 */
	export function updateEditModeUI(editing) {
		const editIndicator = this.container.querySelector('#edit-mode-indicator');
		const cancelBtn = this.container.querySelector('#cancel-edit');
		const instructionText = this.container.querySelector('#instruction-text');

		if (editing) {
			editIndicator.style.display = 'block';
			cancelBtn.style.display = 'inline-block';
			instructionText.textContent =
				'Adjust settings and click outside to apply changes.';
		} else {
			editIndicator.style.display = 'none';
			cancelBtn.style.display = 'none';
			instructionText.textContent = 
				'Click on map to place arc stamps.';
		}
	}

	/**
	 * Creates the HTML content for the control panel
	 * @returns {string} HTML string for the panel
	 */
	export function createPanelHTML() {
		return `
					<div style="margin-bottom: 8px;">
								<span><strong style="font-size: 12px; color: #333;">Arc Stamp Tool</strong>
								for estimating new node placement</span>
							<div id="edit-mode-indicator" style="display: none; font-size: 10px; color: #f59e0b; margin-top: 2px;">
									✏️ Editing Arc
							</div>
					</div>
					
					<div style="margin-bottom: 12px;">
							<label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px;">
									Arc: <span id="arc-angle-value">${this.currentArcAngle}°</span>
							</label>
							<input type="range" id="arc-angle-slider" 
										 min="15" 
										 max="360" 
										 value="${this.currentArcAngle}"
										 style="width: 100%; height: 4px; background: #ddd; border-radius: 2px;">
					</div>

					<div style="margin-bottom: 12px;">
							<label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px;">
									Arc Start: <span id="arc-angle-start-value">${this.currentStartAngle}°</span>
							</label>
							<input type="range" id="arc-angle-start-slider" 
										 min="0" 
										 max="360"
										 value="${this.currentStartAngle}"
										 style="width: 100%; height: 4px; background: #ddd; border-radius: 2px;">
					</div>

					<div style="margin-bottom: 12px;">
							<label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px;">
									Radius: <span id="radius-value">${this.currentRadius}m</span>
							</label>
							<input type="range" id="radius-slider" 
										 min="${this.options.minRadius}" 
										 max="${this.options.maxRadius}" 
										 value="${this.currentRadius}"
										 style="width: 100%; height: 4px; background: #ddd; border-radius: 2px;">
					</div>
					
					<div style="display: flex; gap: 8px;">
							<button id="clear-arcs" style="
									flex: 1;
									padding: 4px 8px;
									font-size: 12px;
									background: #ef4444;
									color: white;
									border: none;
									border-radius: 3px;
									cursor: pointer;
							">Clear All</button>
							
							<button id="cancel-edit" style="
									flex: 1;
									padding: 4px 8px;
									font-size: 12px;
									background: #f59e0b;
									color: white;
									border: none;
									border-radius: 3px;
									cursor: pointer;
									display: none;
							">Cancel Edit</button>

							<button id="close-panel" style="
									flex: 1;
									padding: 4px 8px;
									font-size: 12px;
									background: #6b7280;
									color: white;
									border: none;
									border-radius: 3px;
									cursor: pointer;
							">Close</button>
					</div>
					
					<div style="margin-top: 8px; font-size: 10px; color: #888;">
							<span id="instruction-text">Click on map to place arc stamps.</span>
							<br/>
							<span> Scroll to spin. Shift + Scroll for angle, Alt + Scroll for radius.</span>
					</div>
			`;
	}

