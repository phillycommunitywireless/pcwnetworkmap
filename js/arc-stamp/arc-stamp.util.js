export const degreeToRad = (deg) => (deg * Math.PI) / 180;

/**
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} radius - Arc radius in meters
 * @param {number} angle - Arc angle in degrees
 * @param {number} startAngle - Arc start angle in degrees
 **/
export const generateArcCoordinates = (lng, lat, radius, angle, startAngle) => {
	// could be rewritten with the Turf lib that we already import, but eh.
	const steps = Math.max(16, Math.floor(angle / 10)); // More steps for smoother arcs
	const coordinates = [[lng, lat]]; // Start from center

	// Convert radius from meters to degrees, approximate 
	const radiusInDegrees = radius / 111319.5; // meters to degrees conversion

	// Generate arc points
	const startRad = degreeToRad(startAngle);

	 // account for latitude-dependent longitude scaling
	 const latRadians = degreeToRad(lat);
	 const metersPerDegreeLat = 111319.5; // Meters per degree latitude (negligibly constant)
	 const metersPerDegreeLng = 111319.5 * Math.cos(latRadians);
	 
	 // Generate arc points
	 for (let i = 0; i <= steps; i++) {
			 const currentAngle = (i / steps) * (angle * Math.PI / 180);
			 
			 // Calculate offset in meters
			 const offsetX = radius * Math.cos(startRad + currentAngle);
			 const offsetY = radius * Math.sin(startRad + currentAngle);
			 
			 // Convert meter offsets to degree offsets
			 const lngOffset = offsetX / metersPerDegreeLng;
			 const latOffset = offsetY / metersPerDegreeLat;
			 
			 const x = lng + lngOffset;
			 const y = lat + latOffset;
			 coordinates.push([x, y]);
	 }

	// Close the shape back to center
	coordinates.push([lng, lat]);

	return coordinates;
};

/**
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} radius - Arc radius in meters
 * @param {number} angle - Arc angle in degrees
 * @param {number} startAngle - Arc start angle in degrees
 * @param {number} arcCounter - Arc index
 **/
export function createArcFeature (lng, lat, radius, angle, startAngle) {
	const coordinates = generateArcCoordinates(
		lng,
		lat,
		radius,
		angle,
		startAngle
	);

	return {
		type: 'Feature',
		properties: {
			id: `arc-${new Date().getTime()}`,
			radius,
			angle,
			startAngle,
			center: [lng, lat],
		},
		geometry: {
			type: 'Polygon',
			coordinates: [coordinates],
		},
	};

	this.arcCounter++;
};
