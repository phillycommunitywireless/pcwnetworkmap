export function scrollListener(e) {
	e.preventDefault();
	const {originalEvent: oe} = e;

	let dataRef;
	if (this.isEditMode) {
		dataRef = this.getSelectedArcToEdit();
	} else {
		dataRef = this.map.getSource('arc-preview')?._data?.features?.[0];
	}
	if (!dataRef) {
		console.warn('Expected to have feature ref');
		return;
	}
	const [lng, lat] = dataRef.properties?.center;
	if (!lat && !lng) {
		console.warn('Expected feature ref to have center');
		return;
	}

	const modScrollUp = (toMod, max = 360, min = 0, modBy = 5) => {
		if (this[toMod] + modBy <= max) {
			this[toMod] += modBy;
		} else {
			this[toMod] = min;
		}
	};
	const modScrollDown = (toMod, max = 360, min = 0, modBy = 5) => {
		if (this[toMod] - modBy >= min) {
			this[toMod] -= modBy;
		} else {
			this[toMod] = max;
		}
	};

	if (oe.deltaY < 0) {
		// scroll 'up'
		if (oe.shiftKey) {
			modScrollUp('currentArcAngle');
		} else if (oe.altKey) {
			modScrollUp('currentRadius', 5000, 0, 100);
		} else {
			modScrollUp('currentStartAngle');
		}
	} else if (oe.deltaY > 0) {
		// scroll 'down'
		if (oe.shiftKey) {
			modScrollDown('currentArcAngle');
		} else if (oe.altKey) {
			modScrollDown('currentRadius', 5000, 0, 100);
		} else {
			modScrollDown('currentStartAngle');
		}
	}

	if (oe.shiftKey) {
		this.arcAngleSlider.value = this.currentArcAngle;
		this.arcAngleValue.textContent = `${this.currentArcAngle}°`;
	} else if (oe.altKey) {
		this.radiusSlider.value = this.currentRadius;
		this.radiusValue.textContent = `${this.currentRadius}m`;
	} else {
		this.arcAngleStartSlider.value = this.currentStartAngle;
		this.arcAngleStartValue.textContent = `${this.currentStartAngle}°`;
	}

	this.showPreview(
		lng,
		lat,
		this.currentRadius,
		this.currentArcAngle,
		this.currentStartAngle
	);
}
