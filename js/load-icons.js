const iconData = [
	{
		imageUrl: 'icons/high_sites.png',
		id: 'HS_icon',
	},
	{
		imageUrl: 'icons/RooftopHub.png',
		id: 'RH_icon',
	},
	{
		imageUrl: 'icons/icon1.png',
		id: 'MN_icon',
	},
	{
		imageUrl: 'icons/Rooftophubs2.png',
		id: 'LB_icon',
	},
];

// map.loadImage is callback-only and returns void, so wrap it in a promise
// the caller can actually await before adding the symbol layer.
const loadImage = (url) =>
	new Promise((resolve, reject) => {
		map.loadImage(url, (err, image) => (err ? reject(err) : resolve(image)));
	});

export default async () => {
	await Promise.all(
		iconData.map(async ({ imageUrl, id }) => {
			try {
				const image = await loadImage(imageUrl);
				// Images are dropped on setStyle, so a basemap switch mid-load can
				// re-run this and hit "image already exists" without the guard.
				if (!map.hasImage(id)) {
					map.addImage(id, image);
				}
			} catch (err) {
				// One broken icon shouldn't stop the whole points layer from loading.
				console.error(`Failed to load icon "${id}" from ${imageUrl}`, err);
			}
		})
	);
};
