import { cwx } from './cwx/index';

export function ubtTrace(key, data) {
    return cwx.sendUbtByPage.ubtTrace(key, data);
}
export function ubtDevTrace(key, data) {
    return cwx.sendUbtByPage.ubtDevTrace(key, data);
}
export function ubtMetric(data) {
    return cwx.sendUbtByPage.ubtMetric(data);
}
export function ubtExposure(name, data) {
    return cwx.sendUbtByPage.ubtExposure(name, data);
}
export function withTrace(func) {
    return function (e) {
        traceClickEvent(e);
        return func(e);
    };
}
export function traceClickEvent(e) {
    let target = e?.currentTarget;
    if (target && target.id) {
        let data = {};
        let traceData = target.dataset.trace;
        if (traceData) {
            data = {
                ...traceData,
            };
        }

        let key = (target.id || '').replace(/\.\_\_index\_.*/i, '');
        traceClick(`${key}_click`, data);
    }
}

export function traceClick(key, data = {}) {
    const currentPage = cwx.getCurrentPage() || {};
    const pageId = currentPage.pageId;
    return cwx.sendUbtByPage.ubtTrace(key, {
        PageId: pageId,
        ...data,
    });
}

export function exposureElementById(options) {
    let exposeData = getExposeData(options);
    return ubtExposure(exposeData.ubtName, exposeData.exposeData);
}
export function exposureElement(key, exposedData) {
    let ubtData = completeExposeData(exposedData);
    return ubtExposure(key, ubtData);
}

export function completeExposeData(data = {}) {
    const currentPage = cwx.getCurrentPage();
    return {
        PageId: currentPage.pageId,
        ...data,
    };
}

export function getExposeData(options) {
    const ubtData = completeExposeData(options?.exposeData);
    let key = (options?.id || '').replace(/\.\_\_index\_.*/i, '');
    return {
        ubtName: key + '_exposure',
        exposeData: ubtData,
    };
}

export default {
    ubtDevTrace,
    ubtTrace,
    ubtMetric,
    ubtExposure,
    withTrace,
    traceClickEvent,
    traceClick,
    exposureElementById,
    exposureElement,
    getExposeData,
};
