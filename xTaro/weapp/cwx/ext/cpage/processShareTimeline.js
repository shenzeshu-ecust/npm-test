export default function (originOptions, showShareToTimeline) {
    let shareData = {};
    if (typeof showShareToTimeline === "object") {
        shareData = showShareToTimeline;
    } else if (originOptions && Object.keys(originOptions).length) {
        let query = "";
        for (let key in originOptions) {
            query += (query ? "&" : "") + `${key}=${originOptions[key]}`;
        }
        shareData = { query };
    }

    return shareData;
}
