const { parse, findAll } = require("css-tree");
const fs = require("fs-extra");
const path = require("path");

const handleScssImport = filePath => {
    if (fs.existsSync(filePath) && /\.(sa|sc)ss$/.test(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        let tree = parse(content);
        // find 出所有引入 css 节点及字体节点
        const list = findAll(tree, node => {
            return node.type === "Atrule" && (node.name === "import" || node.name === "font-face");
        });
        if (list && list.length) {
            let result = [];
            list.forEach(node => {
                // 字体处理
                if (node.name === "font-face") {
                    node.block.children.forEach(item => {
                        if (item.property === "src") {
                            item.value.children.forEach(subItem => {
                                const sub = subItem.value;
                                const value = sub
                                    ? typeof sub === "string"
                                        ? sub
                                        : sub.value
                                    : "";
                                // 处理引用字体
                                if (
                                    value &&
                                    /\.(eot|woff|ttf)$/.test(value) &&
                                    value.indexOf("http") === -1
                                ) {
                                    const scssFilePath = getFilePath(value, filePath);
                                    result.push(scssFilePath);
                                }
                            });
                        }
                    });
                }
                // css 处理
                if (node.name === "import") {
                    node.prelude &&
                        node.prelude.children.forEach(function (c) {
                            if (c.type === "String" && c.value) {
                                const scssFilePath = getFilePath(c.value, filePath);
                                result.push(scssFilePath);
                                const subCssPath = handleScssImport(scssFilePath); // 递归处理
                                if (subCssPath) {
                                    result = result.concat(subCssPath);
                                }
                            }
                        });
                }
            });
            return result;
        }
    }
};

const getFilePath = (value, filePath) => {
    let iPath = value.trim().replace(/"/g, "");
    const ext = path.extname(iPath);
    if (ext) {
        iPath = iPath.slice(0, -ext.length);
    }
    const folderPath = path.dirname(filePath);
    const scssFilePath = path.join(folderPath, iPath + (ext || ".scss"));
    return scssFilePath;
};

module.exports = (filePath, callback) => {
    const result = handleScssImport(filePath, callback);
    return result;
};
