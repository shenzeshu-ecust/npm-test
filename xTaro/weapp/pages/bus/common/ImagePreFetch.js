export default function (imageList) {
    const imageLoader = function (src) {
        try {
            wx.getImageInfo({
                src: src,
                success: (res) => {
                    console.log('image loaded !!!', src, res);
                },
                fail: () => {
                    console.log('image loaded error!!!', src);
                },
            });
        } catch (err) {
            console.warn('image loaded error !!!', src);
        }
    };
    for (let index = 0; index < imageList.length; index++) {
        imageLoader(imageList[index]);
    }
}
