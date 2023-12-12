import { cwx } from '../../../../../cwx/cwx';
import requtil from '../../requtil';
import trace from '../../../common/trace/ordercommittrace';
const IMAGE_LIMIT = 20; // 上传图片限制张数
Component({
    properties: {
        token: {
            type: String,
            value: ''
        },
        orderId: {
            type: Number
        }
    },
    data: {
        showUploadIcon: true, // 是否展示上传图片入口
        pictures: [] // 当前的图片
    },
    methods: {
        /**
         * 点击上传图片事件
         */
        uploadImage () {
            const { pictures } = this.data;
            const choosePictureApi = cwx.chooseMedia || cwx.chooseImage;
            const chooseMediaParams = cwx.chooseMedia
                ? {
                    mediaType: ['image'] // 目前只支持上传图片
                }
                : {};
            choosePictureApi({
                count: IMAGE_LIMIT - pictures.length,
                ...chooseMediaParams,
                success: (res) => {
                    trace.chooseMediaSuccessTrace(res);
                    if (res.tempFiles.length < 1) {
                        return;
                    }
                    const tempPics = res.tempFiles.map(item => {
                        return ({
                            url: item.tempFilePath || item.path,
                            size: item.size,
                            status: '上传中'
                        });
                    });
                    const totalPictures = pictures.concat(tempPics);
                    this.setData({
                        showUploadIcon: IMAGE_LIMIT - totalPictures.length > 0,
                        pictures: totalPictures
                    }, this.handleUploadPictures);
                },
                fail: (res) => {
                    trace.chooseMediaFailTrace(res);
                }
            });
            this.triggerEvent('acceptTraceType', { actionType: 4 });
        },
        /**
         * 选择完图片后，一张张将图片上传到图片上传接口，防止最后点击提交时统一上传耗时较长
         */
        handleUploadPictures () {
            const { pictures } = this.data;
            this.triggerEvent('conveyImages', { pictures });

            const needUploadPictures = pictures.filter(pic => !pic.uploaded);
            if (needUploadPictures.length) {
                // 防止用户在图片上传过程中继续上传图片会同事调用多个上传请求
                this.uploadNextPicture();
            }
        },
        /**
         * 图片转base64
         * @param file
         * @returns {Promise<unknown>}
         */
        getBase64Image (file) {
            return new Promise((resolve, reject) => {
                cwx.getFileSystemManager().readFile({
                    filePath: file.url,
                    encoding: 'base64',
                    success: function (res) {
                        resolve(res);
                    },
                    fail: function (err) {
                        reject(err);
                    }
                });
            });
        },
        /**
         * 上传图片&更新图片状态
         */ async processUploadPicture () {
            const { pictures } = this.data;
            const picToUpload = pictures.find(pic => !pic?.uploaded && !pic?.isFail);
            if (!picToUpload) {
                this.triggerEvent('conveyImages', { pictures });
                return;
            }
            const index = pictures.findIndex(it => it.url === picToUpload.url);
            if (index < 0) return;

            const token = this.properties.token;

            const onError = (err) => {
                this.setData({
                    [`pictures[${index}]`]: {
                        ...pictures[index],
                        status: '重新上传',
                        isFail: true,
                        uploaded: false
                    }
                });
                this.uploadImageTrace(err, pictures[index]?.size);
            };

            const onSuccess = (res = {}) => {
                const { result, file } = res;
                // 更新这张照片的状态
                if (result === 0 && file) {
                    this.setData({
                        [`pictures[${index}]`]: {
                            ...pictures[index],
                            file,
                            status: '',
                            uploaded: true
                        }
                    });
                    this.uploadImageTrace(res, pictures[index]?.size);
                } else {
                    onError(res);
                }
            };

            // 一次传一张
            const base64Info = await this.getBase64Image(picToUpload);
            const params = {
                token,
                data: 'data:image/jpeg;base64,' + base64Info.data
            };
            requtil.uploadImage(params, onSuccess, onError, this.uploadNextPicture.bind(this));
        },
        // 继续处理下一张
        uploadNextPicture () {
            setTimeout(() => this.processUploadPicture(), 0);
        },
        uploadAgain (e) {
            const idx = e.currentTarget.dataset.idx;
            const pictures = this.data.pictures;
            this.setData({
                [`pictures[${idx}]`]: {
                    ...pictures[idx],
                    status: '上传中',
                    isFail: false
                }
            }, () => {
                this.uploadNextPicture();
            });
        },
        removePicture (e) {
            const idx = e.currentTarget.dataset.idx;
            const pictures = this.data.pictures;

            cwx.showModal({
                content: '确定删除此图吗？',
                success: (res) => {
                    if (res.confirm) {
                        pictures.splice(idx, 1);
                        this.setData({
                            pictures
                        }, () => {
                            this.triggerEvent('conveyImages', { pictures });
                        });
                    }
                }
            });
        },
        previewPicture (e) {
            const idx = e.currentTarget.dataset.idx;
            const curPicture = this.data.pictures[idx] || '';
            const previewUrls = [];
            this.data.pictures.forEach(function (pic, i) {
                pic && previewUrls.push(pic.url);
            });
            cwx.previewImage({
                current: curPicture.url, // 当前显示图片的http链接
                urls: previewUrls
            });
        },
        uploadImageTrace (data, picSize) {
            if (!data) return;
            const traceValue = {
                orderid: this.properties.orderId,
                statusCode: data.result,
                resultMessage: data.resultMessage,
                size: picSize,
                file: data.file
            };
            const tPage = cwx.getCurrentPage() || {};
            tPage.ubtTrace && tPage.ubtTrace('htl_c_applet_comment_wri_image_click', traceValue);
        }
    }
});
