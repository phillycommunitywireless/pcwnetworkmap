// via https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
/**
 * @typedef  {{
 * 	result: {
 *		input : object;
 *		addressMatches: Array.<{
 *			coordinates: {
 *				x: number; // lng
 *				y: number; // lat
 *	  	}
 *	 }>
 * }
 * }} GeocodingResponse
 */


export default {
	baseUrl: 'https://geocoding.geo.census.gov/geocoder',
	defaultBenchmark: 'Public_AR_Current',
	defaultFormat: 'json',

	/**
	 * Can be used independently, but leveraged by #singleRecordGeocode
	 *
	 * @returns {string}
	 */
	buildUrl({
		returnType,
		searchType,
		benchmark,
		vintage,
		address,
		layers,
		format,
		callback,
	}) {
		const params = new URLSearchParams({
			benchmark: benchmark || this.defaultBenchmark,
			format: format || this.defaultFormat,
		});

		if (address)
			params.append(
				searchType === 'onelineaddress' ? 'address' : 'street',
				address
			);
		if (vintage) params.append('vintage', vintage);
		if (layers) params.append('layers', layers);
		if (callback) params.append('callback', callback);

		return `${this.baseUrl}/${returnType}/${searchType}?${params.toString()}`;
	},

	/**
	 * Ping Census.gov geocoding API
	 *
	 * @returns {Promise<{latitude: number; longitude: number;} | null>}
	 */
	async singleRecordGeocode({
		returnType = 'locations',
		searchType = 'onelineaddress',
		address = '',
		benchmark = this.defaultBenchmark,
		vintage = null,
		layers = null,
		format = this.defaultFormat,
		callback = null,
	}) {
		if (!address) {
			console.error('Address is required for geocoding.');
			return Promise.reject(
				ReferenceError('Address is required for geocoding.')
			);
		}

		const url = this.buildUrl({
			returnType,
			searchType,
			benchmark,
			vintage,
			address,
			layers,
			format,
			callback,
		});
		console.debug('Geocoding Request URL:', url);

		try {
			// const {result} = await fetchJSON(url);
			if (true) {
			// if (result.addressMatches.length) {
				const {x: longitude, y: latitude} = {
					x: -75.592073606609,
					y: 40.183709814469,
				};
				// result.addressMatches[0].coordinates;
				return {latitude, longitude};
			} else {
				return null;
			}
		} catch (err) {
			console.error('Error fetching geocoding data:', err);
			return null;
		}
	},
};

// Example usage:
// const address = "4600 Silver Hill Rd, Washington, DC 20233";
// geocodingAPI
//   .singleRecordGeocode({ address })
//   .then(data => console.log("Geocoding Result:", data));
