let miniBuildVersion = "10406061_20220311145816_1.1.117";
try {
    if (typeof wx !== 'undefined') {
        wx["buildVersion"] = miniBuildVersion;
    }
} catch (e) {
}

module.exports = miniBuildVersion;
