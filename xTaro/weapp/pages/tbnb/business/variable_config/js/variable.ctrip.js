import hostConfig from '../../../config/ctrip/host';
var ICON_PIC_TUJIA_HOST = hostConfig.ICON_PIC_TUJIA_HOST;
export default {
  platformName: 'ctrip',
  platformTitle: '携程',
  logoName: '携程民宿',
  globalColor: '#0086f6',
  nullDefaultImg: ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/ctrip_page_error.png",
  loadingLogoImg: ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/ctriplogo.png",
  defaultImage: ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/defaultImg_ctrip.png",
  collectionImgList: [ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/collection_white.png", ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/collection_red.png"],
  hearderCollectionImgList: [ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/header_collect.png", ICON_PIC_TUJIA_HOST + "/upload/festatic/mp/header_collected.png"]
};