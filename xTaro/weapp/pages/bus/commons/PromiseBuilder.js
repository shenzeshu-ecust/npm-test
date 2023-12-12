// Promise.race()

function timeoutFnc(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: -1001002,
                message: "timeout",
            });
        }, time);
    });
}

export default function PromiseBuilder(
    promseMap = {},
    config = { timeout: 5000 }
) {
    const { timeout } = config;
    return new Promise((resolve) => {
        const resultMap = {};
        const keys = Object.keys(promseMap);
        let resolvedCnt = 0;
        if (keys.length === 0) {
            resolve(resultMap);
        } else {
            // eslint-disable-next-line no-inner-declarations
            function processValue(key, data) {
                resultMap[key] = data;
                // eslint-disable-next-line no-plusplus
                if (++resolvedCnt === keys.length) {
                    resolve(resultMap);
                }
            }
            const timer = timeoutFnc(timeout);
            keys.forEach((key) => {
                const promise = Promise.resolve(promseMap[key]);
                Promise.race([promise, timer])
                    .then((result) => {
                        if (result && result.code === -1001002) {
                            throw result;
                        } else {
                            processValue(key, result);
                        }
                    })
                    .catch((err) => {
                        console.warn(
                            `[Promise ${key} is error]`,
                            JSON.stringify(err)
                        );
                        processValue(key, undefined);
                    });
            });
        }
    });
}
