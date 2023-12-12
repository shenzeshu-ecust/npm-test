import ModelUtil from '../common/utils/model.js';
import util from '../common/utils/util';
import casReq from '../cas/casReq';
import hrequest from '../common/hpage/request';

const needCasReqList = ['getnearbyhotellist', 'getroomlistnew', 'gethotelcomment'];

const reqMethod = (name, params, onSuccess, onError) => {
    const request = needCasReqList.includes(name) ? casReq.request : hrequest.hrequest;
    request({
        url: ModelUtil.serveUrl(name),
        data: params,
        success: function (result) {
            if (util.successSoaResponse(result)) {
                onSuccess && onSuccess(result.data);
            } else {
                onError && onError();
            }
        },
        fail: function (error) {
            onError && onError(error);
        }
    });
};

export default {
    getRoomList: function () {
        reqMethod('getroomlistnew', ...arguments);
    },
    hotelDetail: function () {
        reqMethod('gethoteldetail', ...arguments);
    },
    operatorfavHotel: function () {
        reqMethod('operatorfavHotel', ...arguments);
    },
    isCutpriceHotelRequest (params) {
        return new Promise((resolve) => {
            hrequest.hrequest({
                url: ModelUtil.serveUrl('cutpricehotel'),
                data: params,
                success: function (result) {
                    resolve(util.successSoaResponse(result) && result.data.result === 1);
                },
                fail: function () {
                    resolve(false);
                }
            });
        });
    },
    getHotelProduct: function () {
        reqMethod('gethotelproduct', ...arguments);
    },
    nearbyHotelList: function () {
        reqMethod('getnearbyhotellist', ...arguments);
    },
    updateSharingListReq: function () {
        reqMethod('updateSharingList', ...arguments);
    },
    updateSharingList: function () {
        reqMethod('getMKTOpenID', ...arguments);
    },
    updateUser: function () {
        reqMethod('updateUser', ...arguments);
    },
    getPlanetBanner: function () {
        reqMethod('getPlanetBanner', ...arguments);
    },
    getHeadInfoQuery: function (hotelId, inday, outday, poiValue, rankId = '') {
        if (!hotelId) return;

        return `
            {
                hotel(id: ${hotelId}, checkIn: "${inday}", checkOut: "${outday}") {
                    getBaseInfo(rankId: "${rankId}") {
                        hotelName
                        hotelEnName
                        zoneName
                        address
                        openYear
                        fitmentYear
                        fuzzyAddressTip
                        commentScore
                        commentDesc
                        commentCount
                        bestCommentSentence
                        isOversea
                        cityId
                        cityName
                        totalPictureCount
                        mgrGroupId
                        hotelCategoryOutlineImages {
                            categoryName
                            pictureList {
                                url
                                urlBody
                                urlExtend
                            }
                        }
                        coordinate {
                            latitude
                            longitude
                        }
                        starInfo {
                            star
                        }
                        topAwardInfo {
                            listSubTitle
                            listUrl
                            awardIconUrl
                            lableId
                            rankId
                            annualListAwardIconUrl
                            annualListTagUrl
                        }
                    }
                    getTrafficDetail(filterValue: "${poiValue}") {
                        defaultTrafficText
                    }
                    getDetailTag {
                        starTag { icon }
                        dStarTag { icon }
                        medalTag { icon }
                        primeTag { icon }
                        facilityTags(limit: 3) { title }
                        categoryTag { title }
                    }
                }
            }
        `;
    },
    getDetailQuery: function (hotelId, inday, outday) {
        if (!hotelId) return;

        return `
            {
                hotel(id: ${hotelId}, checkIn: "${inday}", checkOut: "${outday}") {
                    getComment {
                        commentRating {
                            ratingAll
                            ratingLocation
                            ratingFacility
                            ratingService
                            ratingRoom
                            level
                            commentNum
                            positiveTip
                        }
                        commentTags(limit: 3) {
                            id
                            name
                            count
                        }
                        comment {
                            id
                            userInfo {
                                nickName
                                headPictureUrl
                                grade { 
                                    title
                                } 
                                levelInfo { 
                                    curLevelIcon
                                }
                            }
                            content
                            translatedContent
                            language
                            translatedSourceText
                            imageCuttingsList { 
                                smallImageUrl 
                                mediumImageUrl 
                                bigImageUrl 
                            }
                            videoList {
                                cover
                                url
                            }
                        }
                        similarCommentRating {
                            ratingAll
                            ratingLocation
                            ratingFacility
                            ratingService
                            ratingRoom
                            level
                            commentNum
                        }
                    }
                    getReservation {
                        topNoticeTips
                    }
                    getPolicy {
                        topPolicies
                    }
                    getMyCommentDetails {
                        waitCommentList(limit: 1) {
                            orderId 
                            encourageInfo
                        }
                    }
                }
            }
        `;
    },
    getWeComBanner: function () {
        reqMethod('getWeComBanner', ...arguments);
    },
    registerActivity: function () {
        reqMethod('registerActivity', ...arguments);
    },
    recordUserAction: function () {
        reqMethod('recordUserAction', ...arguments);
    },
    hotelSelling: function () {
        reqMethod('gethoteladditioninfo', ...arguments);
    },
    reqGroupArticle: function () {
        reqMethod('reqGroupArticle', ...arguments);
    },
    getNearbyFacilityInfo: function () {
        reqMethod('nearbyfacilityinfo', ...arguments);
    },
    getNewNearbyFacility: function () {
        reqMethod('newnearbyfacilities', ...arguments);
    },
    createTravelCouponOrder: function () {
        reqMethod('createTravelCouponOrder', ...arguments);
    }
};
