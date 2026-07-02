/**
 * User-visible error notice for when map data fails to load (issue #10).
 *
 * Idempotent: repeated calls reuse a single banner instead of stacking, so a
 * full API outage (every layer failing at once) shows one message, not five.
 */
let bannerEl = null;

export const showMapError = (
	message = 'Some map data could not be loaded. Please try again later.'
) => {
	if (!bannerEl) {
		bannerEl = document.createElement('div');
		bannerEl.id = 'map-error';
		bannerEl.setAttribute('role', 'alert');
		bannerEl.innerHTML = `
			<span id="map-error-text"></span>
			<button type="button" id="map-error-close" aria-label="Dismiss">
				<svg class="icon"><use xlink:href="#icon-close"/></svg>
			</button>
		`;
		bannerEl
			.querySelector('#map-error-close')
			.addEventListener('click', () => bannerEl.classList.remove('visible'));
		document.body.appendChild(bannerEl);
	}
	bannerEl.querySelector('#map-error-text').textContent = message;
	bannerEl.classList.add('visible');
};
