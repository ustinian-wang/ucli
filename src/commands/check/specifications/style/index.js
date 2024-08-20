import traverseScss from "./traverse.js";
import {isComponentFile} from "../../tools/other.js"
import {ErrorCollector} from "../../tools/ErrorCollector.js"
import {readFileSync} from "fs";

function isInvalidSelector(options) {
    let {
        errorCollector,
        filePath,
    } = options;

    if (!isComponentFile(filePath)) {
        return {};
    }
    return {
        selector(node) {
            node.content.filter(value => {
                return ['id', 'identifier', 'attribute'].includes(value.type);
            }).forEach(node => {
                (errorCollector.addWarning({
                    level: 2,
                    filePath,
                    lineNo: node.start.line,
                    msg: "禁止使用属性、id、元素选择符，否则会引发小程序控制台告警",
                    advice: "请改用普通的类名选择符，e.x. : .abc{xxx}"
                }))
            });
        },
    }
}

function existStaticDomain(options) {
    let {
        filePath,
        errorCollector
    } = options;
    let domainList = [
        ".com/"
    ];
    return {
        type(node) {
            if (node.content && !Array.isArray(node.content)) {
                for (let domain of domainList) {
                    if ((node.content + "").includes(domain)) {
                        errorCollector.add({
                            filePath,
                            lineNo: node.start.line,
                            msg: `不允许写死资源静态域名【${node.content}】`,
                            advice: "建议将域名更换为scss变量$RES_ROOT"
                        })
                    }

                }
            }
        }
    }
}


let common = [
    // isInvalidSelector,
    existStaticDomain,
]

function checkScssAst(filePath) {
    let errorCollector = ErrorCollector.getInstance();


    let content = readFileSync(filePath, 'utf8')+"";
    let ast;
    try {
        let gonzales = require('gonzales-pe');
        ast = gonzales.parse(content, {
            syntax: 'scss',
            content: "Node types"
        });
        // ast = parse(content);
    } catch (e) {
        // console.log("e", e);
        (errorCollector.addWarning({
            level: 2,
            filePath, lineNo: 0, msg: `scss文件存在语法不标注，诸如：字符串常量没有用引号包裹，url(xxx)而不是url('xxx'); 【解析报错信息】：${e.message}`,
            advice: "请将background-image: url(xxx)改成url('xxx'); 常量字符串用引号包裹 或参考【解析报错信息】进行处理"
        }));
        return errorCollector;
    }
    let options = createTraverseOptions([
        ...common
    ], {
        filePath,
        errorCollector,
    })
    traverseScss(ast, options);
    return errorCollector;
}


/**
 * check file of .css and .scss
 * @param filePath
 * @returns {ErrorCollector}
 */
export default function checkStyleFile(filePath = "") {
    return checkScssAst(filePath)
}
