export const fetchJSON = async (url) => {
	const r = await fetch(url);
	if (!r.ok) {
		throw new Error(`HTTP ${r.status} ${r.statusText} fetching ${url}`);
	}
	return r.json();
};

const darkLabels = ['dark'];
export const isDarkMode = (useMap) => {
	const activeSprite = (useMap || map).getStyle()?.sprite;
	if (!activeSprite) {
		console.warn('no active background layer');
		return false;
	}
	return darkLabels.some((label) => activeSprite?.includes(label));
};
