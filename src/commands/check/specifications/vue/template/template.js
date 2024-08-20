

import { CollectorLevelDef } from "../../../tools/ErrorCollector.js";
import { isComponentFile, isLowerCase, parseFileNameByPath } from "../../../tools/other.js";
import { existStaticDomain } from "../../style/checkStyle.js";
import vueTemplateTraverse from "./traverse.js";
import words from "../../../config/sensitiveWords.js"


function vIfAndVShowExistConstants({filePath, errorCollector, content}) {

    return {
        ASTElement(node) {
            let attrsMap = node.attrsMap;
            Object.keys(attrsMap).filter(key => {
                return ["v-if", "v-show"].includes(key)
            }).forEach(key => {
                let value = attrsMap[key] || '';

                let list = ['true', 'false', '!true', '!false'];
                if (value && list.includes(value.trim().replace(/\s/g, ""))) {
                    let expression = `${key}='${value}'`
                    errorCollector.add({
                        filePath,
                        lineNo: parseContentLine(content, node.start),
                        msg: `v-if、v-show的值不可以是常量，问题表达式：【${expression}】`,
                        advice: "请删除相关代码或者优化表达式"
                    });
                }
            });
        }
    }
}

function vIfAndVForShouldNotExist(options) {
    let {
        filePath,
        errorCollector,
        content,
    } = options;
    return {
        ASTElement(node) {
            let keys = Object.keys(node.attrsMap)
            if (keys.includes("v-if") && keys.includes("v-for")) {
                errorCollector.add({
                    filePath,
                    lineNo: parseContentLine(content, node.start),
                    msg: "永远不要把 v-if 和 v-for 同时用在同一个元素上。"
                })
            }
        }
    }
}

function vForNeedKey(options) {
    let {
        filePath,
        errorCollector,
        content,
    } = options;
    return {
        ASTElement(node) {
            let keys = Object.keys(node.attrsMap);
            if (keys.includes("v-for")) {
                if (!keys.includes(":key")) {
                    errorCollector.add({
                        level: CollectorLevelDef.WARNING,
                        filePath,
                        lineNo: parseContentLine(content, node.start),
                        msg: "在组件上总是必须用 key 配合 v-for，以便维护内部组件及其子树的状态"
                    })
                }
            }
        }
    }
}

function staticDomainShouldNotExist(options) {
    let {
        filePath,
        errorCollector,
        content
    } = options;
    return {
        ASTElement(node) {
            let values = Object.values(node.attrsMap);
            for (let attrValue of values) {
                let msg = existStaticDomain(attrValue);
                let isStaticDomainExist = !!msg;
                if (isStaticDomainExist) {
                    errorCollector.add({

                        lineNo: parseContentLine(content, node.start), msg,
                        filePath: filePath
                    })
                }
            }

        }
    }
}

function collectTemplateAllMethods(options) {
    let {
        context
    } = options;
    let {
        templateBindingMethods
    } = context;
    return {
        ASTElement(node) {
            if (node.attrsMap) {
                Object.keys(node.attrsMap).forEach(key => {
                    let attrValue = node.attrsMap[key];
                    if (key.startsWith("@")) {
                        let lineValue = attrValue.trim().replace(/\\n/g, "").replace(/\r/g, "").replace(/\s/g, '');
                        let funcExpReg = /(\s*)?([a-zA-Z0-9_$@]+)(\(.*\))?(.*)?/;
                        if (funcExpReg.test(lineValue)) {
                            lineValue = lineValue.replace(funcExpReg, "$2").trim();
                            let expression = `${key}="${attrValue}"`;
                            templateBindingMethods.push({
                                methodName: lineValue,
                                expression
                            });
                        }

                    }
                })
            }
        }
    }
}

function wxSyntaxShouldNotAllow(options) {
    let {
        filePath,
        errorCollector,
        content
    } = options;
    return {
        ASTElement(node) {
            let keys = Object.keys(node.attrsMap);
            if (keys.some(key => key.includes("wx:"))) {
                errorCollector.add({
                    filePath,
                    lineNo: parseContentLine(content, node.start),
                    msg: "wx:相关语法不支持"
                })
            }

        }
    }
}

function complexExpressions(options) {
    let {
        filePath,
        errorCollector,
        content
    } = options;
    return {
        ASTElement(node) {
            Object.keys(node.attrsMap).forEach(key => {
                if (key.startsWith(":") || key.startsWith("@")) {
                    let value = node.attrsMap[key];
                    checkExpression(node, value);
                }
            })
        },
        ASTExpression(node) {
            node.tokens.forEach(item => {
                let expression = item['@binding'];
                if (expression) {
                    checkExpression(node, expression);
                }
            })

        }
    }

    function checkExpression(node, expression) {
        if (isComplexExpression(expression)) {
            (errorCollector.addWarning({
                level: 2,
                filePath,
                lineNo: parseContentLine(content, node.start),
                msg: `表达式过于复杂，表达式【${expression}】`,
                advice: "建议改成computed属性计算，或简化表达式"
            }))
        }
    }
}

function isComplexExpression(expression) {
    let keywordList = [
        // "+",
        // "-",
        // "*",
        // "/",
        "?",
        // ":"
    ]
    let count = 0;
    for (let i = 0; i < expression.length; i++) {
        let char = expression[i];
        if (keywordList.includes(char)) {
            count++;
        }
    }
    return count > 2;
}

function parseContentLine(content, start) {
    let prevContent = content.slice(0, start);
    return prevContent.split('\n').length;
}

function humpVueFileName(options) {

    let {
        filePath,
        errorCollector
    } = options;

    if (!isComponentFile(filePath)) {
        return {};
    }

    let fileName = parseFileNameByPath(filePath)
    if (fileName) {
        if (isLowerCase(fileName.charAt(0)) || fileName.includes('-')) {
            (errorCollector.addWarning({
                level: 2,
                filePath, lineNo: 0, msg: "组件名称没有使用驼峰写法",
                advice: "改成驼峰写法，并且首字母大写，不允许使用横杠"
            }));
        }
    }
}

function disabledElement(element, advice, disabled=false){
    let elementArray = Array.isArray(element) ? element : [element];
    return (options)=>{
        let {
            filePath,
            errorCollector,
            content
        } = options;
        return {
            ASTElement(node){
                if(elementArray.includes(node.tag)){
                    errorCollector.add({
                        level: disabled? CollectorLevelDef.ERROR : CollectorLevelDef.WARNING,
                        filePath,
                        lineNo: parseContentLine(content, node.start),
                        msg: `禁用【${node.tag}】标签`,
                        advice
                    })
                }
            }
        }
    }
}
function checkNestingOfTag(options){
    let {
        filePath,
        errorCollector
    } = options;
    return {
        ASTElement(node){
            if(node.tag === 'text'){
                let allChild = [];
                for(let nowChild of node.children){
                    vueTemplateTraverse(nowChild, {
                        ASTElement(nowNode){
                            allChild.push(nowNode);
                        }
                    })

                    let allNodeName = allChild.map(item=>item.tag).filter(name=>!['template', 'block', 'text'].includes(name));
                    if(allNodeName.length>0){
                        errorCollector.add({
                            level: CollectorLevelDef.ERROR,
                            filePath,
                            lineNo: parseContentLine(options.content, node.start),
                            msg: "text标签不能嵌套其他标签",
                            advice: "请修改当前的text嵌套关系"
                        })
                    }
                    return;
                }


            }
        }
    }
}

function getAllAstTag(options) {
    let {
        context: {
            templateAllTagNameList
        }
    } = options;
    return {
        ASTElement(node){
            if(!templateAllTagNameList.includes(node.tag)){
                templateAllTagNameList.push(node.tag);
            }
        }
    }
}


function useMpHtml(options) {
    let {
        filePath,
        errorCollector
    } = options;
    return {
        ASTElement(node){
            if(["parse", "rich-text"].includes(node.tag)){
                errorCollector.addWarning({
                    filePath: filePath,
                    lineNo: parseContentLine(options.content, node.start),
                    msg: "不建议使用rich-text实现富文本效果",
                    advice: "请改用mp-html方式实现"
                })
            }
        }
    }
}

function imageLazyAttr(options){

    let {
        filePath,
        errorCollector
    } = options;
    return {
        ASTElement(node){
            if(["image"].includes(node.tag)){
                if(!Object.keys(node.attrsMap).includes("lazy-load")){
                    errorCollector.addWarning({
                        filePath: filePath,
                        lineNo: parseContentLine(options.content, node.start),
                        msg: "图片需要加上lazy-load，优化性能",
                        advice: "请添加lazy-load属性"
                    })
                }

            }
        }
    }
}

function checkTemplateSensitiveWords(options){
    let {
        filePath,
        errorCollector
    } = options;
    return {
        ASTText(node){
            words.forEach(word=>{
                if(node.text.includes(word)){
                    errorCollector.add({
                        level: CollectorLevelDef.ERROR,
                        filePath: filePath,
                        lineNo: parseContentLine(options.content, node.start),
                        msg: `代码中不可出现【${word}】字眼`,
                        advice: "请改成后台数据控制输出或自行删除"
                    })
                }
            })

        }
    }
}

function recommendImageMode(options){
    let {
        filePath,
        errorCollector
    } = options;
    return {
        ASTElement(node){
            if(node?.tag === "image" && !node?.attrsMap?.mode?.includes("aspectFit")){
                errorCollector.addWarning({
                    filePath: filePath,
                    lineNo: parseContentLine(options.content, node.start),
                    msg: `设计规范推荐使用mode="aspectFit"，如设计师有特殊要求，可忽略`,
                    advice: `请给图片加上mode="aspectFit"`
                })
            }
        }
    }
}

export default [
    vIfAndVForShouldNotExist,
    vForNeedKey,
    staticDomainShouldNotExist,
    collectTemplateAllMethods,
    // wxSyntaxShouldNotAllow,
    // complexExpressions,
    humpVueFileName,
    vIfAndVShowExistConstants,
    // disabledElement('navigator',  "请使用uni.$Router的replace、path等方式替代，如果需要打开小程序，可调用toMiniProgram方法"),
    checkNestingOfTag,
    getAllAstTag,
    // useMpHtml,
    imageLazyAttr,
    checkTemplateSensitiveWords,
    recommendImageMode
]
