import { cwx, CPage, _ } from '../../../cwx/cwx.js';

const widgets = {
    calendar: '/pages/hotel/components/calendar/calendar',
    hourroomcalendar: '/pages/hotel/components/calendarHourroom/calendar',
    webview: '/pages/hotel/components/webview/webview',
    city: '/pages/hotel/components/city/city'
};

const component = {};
for (const name in widgets) {
    (function (name) {
        component[name] = function (data, callback) {
            let opts = data;
            if (arguments.length > 1 || name === 'webview') {
                opts = {
                    data,
                    callback
                };
            }
            const currentPage = cwx.getCurrentPage();
            opts.url = widgets[name];

            if (opts && opts.data) {
                if (typeof opts.data.isNavigate === 'undefined') {
                    opts.data.isNavigate = true; // navigateTo方式
                }
            }

            // 如果有指定不使用 Navigate, 则调用redirectTo, 把当前页面从History中替换掉
            if ((name === 'webview') && (!opts.data || opts.data.isNavigate === false)) {
                cwx.redirectTo({
                    url: opts.url + '?data=' + JSON.stringify(opts.data)
                });
                return;
            }

            currentPage.navigateTo(opts);
        };
    })(name);
}

export default component;
