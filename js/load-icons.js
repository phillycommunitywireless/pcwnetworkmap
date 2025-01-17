export default () => {
	[
		{
			imageUrl:
				'https://raw.githubusercontent.com/phillycommunitywireless/pcwnetworkmap/main/icons/high_sites.png',
			id: 'HS_icon',
		},
		{
			imageUrl:
				'https://raw.githubusercontent.com/phillycommunitywireless/pcwnetworkmap/main/icons/RooftopHub.png',
			id: 'RH_icon',
		},
		{
			imageUrl:
				'https://raw.githubusercontent.com/phillycommunitywireless/pcwnetworkmap/main/icons/icon1.png',
			id: 'MN_icon',
		},
		{
			imageUrl:
				'https://raw.githubusercontent.com/phillycommunitywireless/pcwnetworkmap/main/icons/Rooftophubs2.png',
			id: 'LB_icon',
		},
	].forEach((img) =>
		map.loadImage(img.imageUrl, (error, res) => {
			if (error) {
				throw error;
			}
			map.addImage(img.id, res);
		})
	);
};
