/**
 *
 * @param {支持的证件列表} suports
 * @returns
 */
export function formatSupportPassengerTypes(suports) {
    const asupports = suports || ["身份证"];
    return asupports.join("|");
}
