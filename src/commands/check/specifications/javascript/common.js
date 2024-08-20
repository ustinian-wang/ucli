import {CollectorLevelDef} from "../../tools/ErrorCollector.js"
import types from "@babel/types";
import {uniAppCompatApiRules} from "./uniAppCompatApi.js"
import {getExceptionLine, isQQMapKey, parseFileNameByPath, isExpressionLikeFunction} from "../../tools/other.js"
import words from "../../config/sensitiveWords.js";
// import {checkFdpArguments} from "./fdp.js"
import { sameImplNameWithMallKit } from "./sameImplNameWithMallKit.js"
import {getPagesJsonObject, traverseObject} from "../../tools/tools.js";

function miniHumpWhenExportDefaultFunction(options) {
    let {
        filePath,
        errorCollector
    } = options;
    let filename = parseFileNameByPath(filePath);
    let declaredFuncNameList = []
    return {
        FunctionDeclaration({node}) {
            let name = node?.id?.name;
            declaredFuncNameList.push(name);
        },
        VariableDeclarator({node}) {
            if (node.init && isExpressionLikeFunction(node.init.type)) {
                declaredFuncNameList.push(node.id.name);
            }
        },
        ExportDefaultDeclaration({node}) {
            let name = node.declaration.name;
            let firstChar = name?.charAt(0) || '';
            let isFirstLowerCase = firstChar.toLowerCase() === firstChar;
            let isExportFunction = declaredFuncNameList.includes(name);
            if (isExportFunction) {
                if (name !== filename || !isFirstLowerCase) {//default type is Function of ArrowFunction, e.x. : var a =()=>{}; var a = function(){}; function a(){}
                    {//default name should equal filename
                        errorCollector.add({
                            filePath,
                            lineNo: node.declaration.loc.start.line,
                            msg: "当你export-default一个函数时，函数名用小驼峰，文件名需要和函数名一致"
                        })
                    }
                }
            }
        }
    }
}

function humpWhenExportedIsObject(options) {
    let {
        filePath,
        errorCollector
    } = options;
    let declaredNameList = []
    return {
        ClassDeclaration({node}) {
            let name = node.id.name;
            declaredNameList.push(name);
        },
        VariableDeclarator({node}) {
            if (node.init) {
                if (types.isClassExpression(node.init) || types.isObjectExpression(node.init)) {
                    declaredNameList.push(node.id.name);
                }
            }
        },
        ExportDefaultDeclaration({node}) {
            let name = node.declaration.name;
            let firstChar = name?.charAt(0) || '';
            let isFirstUpperCase = firstChar.toUpperCase() === firstChar;
            let isExportFunction = declaredNameList.includes(name);
            if (isExportFunction) {//like {}, class,
                if (!isFirstUpperCase) {
                    errorCollector.add({
                        filePath,
                        lineNo: node.declaration.loc.start.line,
                        msg: "当你export一个对象/类 时用大驼峰"
                    })
                }
            }
        }
    }
}

function mergeImport(options) {
    let {
        context: {
            registerFinalTask = () => {
            }
        },
        filePath,
        errorCollector
    } = options;

    let sourceMap = {}

    registerFinalTask(() => {
        Object.values(sourceMap).forEach(value => {
            if (value.value > 1) {
                errorCollector.add({
                    filePath,
                    level: CollectorLevelDef.ERROR,
                    lineNo: getExceptionLine(options, value.node),
                    msg: "一个路径只import一次module；import说明：从同一个路径下import多行会使代码难以维护",
                    advice: "将多个相同文件的import，进行合并"
                })
            }
        })
    })
    return {
        ImportDeclaration({node}) {
            if (sourceMap[node.source.value] === void 0) {
                sourceMap[node.source.value] = {
                    node,
                    value: 0
                };
            }
            sourceMap[node.source.value].value++;
        }
    }
}

function ifStatementWithBrackets(options) {
    let {
        filePath,
        errorCollector,
    } = options;
    return {
        IfStatement({node}) {
            if (!types.isBlockStatement(node.consequent)) {
                let line = getExceptionLine(options, node);
                errorCollector.add({
                    filePath,
                    lineNo: line,
                    msg: `if语句缺少花括号；变量信息：【${node?.test?.argument?.name}】`,
                    advice: "用大括号包裹一行或多行代码块"
                })
            }
        }
    }
}

function sensitiveWords(options) {
    let {
        filePath,
        errorCollector
    } = options;
    return {
        StringLiteral({node}) {
            words.forEach(word => {
                if (node.extra.raw.includes(word)) {
                    (errorCollector.addWarning({
                        level: 2,
                        filePath,
                        lineNo: node.loc.start.line,
                        msg: `代码中不可出现【${word}】字眼，请改成后台数据控制输出或自行删除`
                    }));
                }
            })

        }
    }
}

function JSONApiNeedTryCatch(options) {
    let {
        filePath,
        errorCollector
    } = options;
    return {
        MemberExpression(path) {
            let node = path.node;
            if (node.object.name === "JSON") {
                let isExceptionApi = ["parse"].includes(node.property.name);
                if (isExceptionApi) {
                    let nowParentPath = path.parentPath;
                    let isTryStatementExist = false;
                    while (nowParentPath) {
                        if (!Array.isArray(nowParentPath.container)) {
                            if (types.isTryStatement(nowParentPath.container)) {
                                isTryStatementExist = true;
                                break;
                            }
                        }
                        nowParentPath = nowParentPath.parentPath;
                    }
                    if (!isTryStatementExist) {
                        let errInfo = {
                            filePath,
                            lineNo: getExceptionLine(options, node),
                            msg: "JSON.parse缺少try-catch保护，可能导致空指针异常",
                            advice: "加上try-catch或使用jsonParse替代"
                        };
                        errorCollector.add(errInfo);
                    }

                }
            }
        }
    }
}


function existMoneyComputeExpression(options) {
    let {
        filePath,
        errorCollector
    } = options;
    return {
        BinaryExpression({node}) {
            let expressionLinked = getExpression(node);
            for (let expOrStr of expressionLinked) {
                if (expOrStr?.type === "StringLiteral") {
                    return;
                }
            }
            let optList = [];
            let nodeList = [];
            expressionLinked.forEach(nodeOrString => {
                if (isString(nodeOrString)) {
                    optList.push(nodeOrString)
                } else {
                    nodeList.push(nodeOrString);
                }
            });

            let priceNodeList = nodeList.filter(node => isPrice(node.name));
            let isAllNumOpt = optList.every(opt => isNumOpt(opt));

            if (isAllNumOpt && priceNodeList.length > 1) {
                let expression = getExpressionString(node);
                (errorCollector.addWarning({
                    level: 2,
                    filePath,
                    lineNo: getExceptionLine(options, node),
                    msg: `不推荐进行金额计算、拼接，问题表达式【${expression}】`,
                    advice: "请改成后端输出汇总后的金额字段"
                }))
            }

            function isNumOpt(opt) {
                return ['+', '-', '*', '/'].includes(opt);
            }

            function getExpressionString(binaryExpression) {
                return getExpression(binaryExpression).map(nodeOrString => isString(nodeOrString) ? nodeOrString : nodeOrString.name).join("");
            }

            function getExpression(binaryExpression) {
                let arr = [];
                let left = binaryExpression.left;
                arr.unshift(binaryExpression.right);
                arr.unshift(binaryExpression.operator);
                while (types.isBinaryExpression(left)) {
                    arr.unshift(left.right);
                    arr.unshift(left.operator);
                    left = left.left;
                }
                arr.unshift(left);

                return arr;
            }
        }
    };

    function isPrice(name = '') {
        let list = ['price', 'itg', 'deposit', 'balance'];
        return list.some(value => (name || '').toLowerCase().includes(value));
    }
}

function isString(value) {
    return typeof value === 'string';
}


function checkInvalidApiCall(memberExpression, validApi, isErrorLevel=false) {
    let objName = memberExpression.split(".")[0];
    let memberName = memberExpression.split(".")[1];
    return (options) => {
        let {
            filePath,
            errorCollector
        } = options;

        return {
            MemberExpression(path) {
                let node = path.node;
                let match1 = node?.object?.name === objName && node.property.name === memberName;
                let match2 = node?.object?.property?.name === objName && node.property.name === memberName
                if (match1 || match2) {
                    (errorCollector.addWarning({
                        level: isErrorLevel ? CollectorLevelDef.ERROR:CollectorLevelDef.WARNING,
                        filePath, lineNo: getExceptionLine(options, node), msg: `不推荐使用${memberExpression}`,
                        advice: `请使用${validApi}替代`
                    }))
                }
            }
        }
    }
}

function functionArgumentsTooLong(options) {
    let {
        filePath, errorCollector
    } = options;
    return {
        FunctionDeclaration({node}) {
            tip(node, node.params, node?.id?.name);
        },
        DeclareFunction({node}) {
            tip(node, node.params);
        },
        ArrowFunctionExpression({node}) {
            tip(node, node.params)
        },
        FunctionExpression({node}) {
            tip(node, node.params)
        },
        ObjectMethod({node}) {
            tip(node, node.params, node.key.name);
        },
    }

    function tip(node, params, name) {
        if (params.length > 3 && !filePath.includes("store")) {
            (errorCollector.addWarning({
                level: 2,
                filePath, lineNo: getExceptionLine(options, node),
                msg: `函数[${name || 'anonymous'}]参数不可以超过3个`,

                advice: "缩减参数或改成对象传参"
            }))
        }
    }
}

function checkRouterCall(options, checkCallback){
    let {
        errorCollector,
        filePath
    } = options;
    return {
        CallExpression(path) {
            let node = path.node;
            let callee = node.callee;
            let objectName = callee?.object?.property?.name;
            let methodName = callee?.property?.name;
            if (objectName === "$Router" && ["push", "replace", "replaceAll"].includes(methodName)) {
                checkCallback(path);
            }

        }
    }
}

function isInvalidRouterName(options) {
    let {
        errorCollector,
        filePath
    } = options;
    return checkRouterCall(options, ({node})=>{
        let optionsNode = node.arguments[0];
        if (types.isObjectExpression(optionsNode)) {
            let nameProperty = optionsNode.properties.find(node => node.key.name === 'name');
            let value = nameProperty?.value?.value;
            if (value) {
                let pages = getPagesJsonObject();
                let isMatch = false
                traverseObject(pages, (obj) => {
                    if (obj?.name && obj.name === value) {
                        isMatch = true;
                    }
                });
                if (!isMatch) {
                    errorCollector.add({
                        filePath,
                        lineNo: getExceptionLine(options, node),
                        msg: `路由名称【${value}】在pages.json不存在`,
                        advice: "请参考pages.json填写正确的路由名称"
                    })
                }
            }

        }
    })
}

function isDisabledRouterPath(options) {

    let {
        errorCollector,
        filePath
    } = options;
    return checkRouterCall(options, ({node})=>{
        let optionsNode = node.arguments[0];
        if (types.isObjectExpression(optionsNode)) {
            let pathProperty = optionsNode.properties.find(node => node.key.name === 'path');
            if(pathProperty){
                errorCollector.addWarning({
                    filePath,
                    lineNo: getExceptionLine(options, node),
                    msg: "禁用path属性",
                    advice: "请使用name替代path，例如, uni.$Router.push({ name: 'cusCol' })"
                })
            }
        }
    })
}

function getterNeedReturnStatement(options){
    let {
        filePath,
        errorCollector,
    } = options
    return {
        FunctionDeclaration({node}){
            if(node?.id?.name?.startsWith('get')){
                let returnNode = node.body.body.find(types.isReturnStatement);
                if(!returnNode){
                    errorCollector.addWarning({
                        filePath,
                        lineNo: getExceptionLine(options, node),
                        msg: `【${node.id.name}】函数必须有返回值`,
                        advice: "请添加return语句"
                    })
                }
            }
        }
    }
}

function argumentNeedArrayFuncProp4CallExpression(options){
    let {
        errorCollector,
        filePath,
    } = options;
    return {
        CallExpression({node}){
            let nameList = ["success", "fail", "complete", "callback"];
            let objList = node.arguments.filter(types.isObjectExpression);
            for(let obj of objList) {
                let methodProps = obj.properties.filter((item)=>{
                    return types.isObjectMethod(item) || types.isFunctionExpression(item.value);
                });
                for(let method of methodProps) {
                    if(nameList.includes(method.key.name)){
                        errorCollector.addWarning({
                            filePath,
                            lineNo: getExceptionLine(options, method),
                            msg: `不建议使用非箭头函数的方式声明回调`,
                            advice: `请以箭头函数的方式声明方法【${method.key.name}】，避免回调中的this上下文异常问题`
                        });
                    }
                }
            }
        }
    }
}

function checkQQMapKey(options){
    let {
        errorCollector,
        filePath,
    } = options;

    return {
        StringLiteral({node}){
            if(isQQMapKey(node.value)){
                errorCollector.addWarning({
                    filePath,
                    lineNo: getExceptionLine(options, node),
                    msg: `【${node.value}】地图密钥不允许写死在C端`,
                    advice: "请通过getQQMapKey方法获取"
                })
            }
        }
    }
}
export default [
    // checkInvalidApiCall("$fu.route", "uni.$Router.push"),
    // checkInvalidApiCall("uni.navigateTo", "uni.$Router.push"),
    // checkInvalidApiCall("uni.redirectTo", "uni.$Router.replace"),
    // checkInvalidApiCall("uni.getStorageSync", "DiskCache.getCache"),
    // checkInvalidApiCall("uni.setStorageSync", "DiskCache.setCache"),
    // checkInvalidApiCall("uni.getStorage", "DiskCache.getCache"),
    // checkInvalidApiCall("uni.setStorage", "DiskCache.setCache"),
    // checkInvalidApiCall("uni.previewImage", "previewImage"),
    // checkInvalidApiCall("uni.createIntersectionObserver", "IntersectionObserverManager"),
    // checkInvalidApiCall("uni.requestSubscribeMessage", "requestSubscribeMessage"),
    // checkInvalidApiCall("uni.getSetting", "getAuthSetting"),
    // checkInvalidApiCall("uni.chooseImage", "chooseImage"),
    // checkInvalidApiCall("uni.downloadFile", "downloadFile"),
    // checkInvalidApiCall("uni.showToast", "ToastTool.info/error/warning"),
    // checkInvalidApiCall("uni.showLoading", "ToastTool.loading"),
    // checkInvalidApiCall("uni.hideLoading", "ToastTool.clear"),
    // checkInvalidApiCall("uni.getUserInfo", "getUserInfo"),
    // checkInvalidApiCall("uni.showModal", "showModal"),
    // checkInvalidApiCall("uni.setClipboardData", "setClipboardData"),
    // checkInvalidApiCall("uni.authorize", "asyncAuthorize"),
    // checkInvalidApiCall("uni.getImageInfo", "getImageInfo"),
    // checkInvalidApiCall("uni.navigateBack", "navigateBack"),
    // checkInvalidApiCall("uni.request", "uni.$fu.get/post"),
    miniHumpWhenExportDefaultFunction,
    humpWhenExportedIsObject,
    mergeImport,
    ifStatementWithBrackets,
    sensitiveWords,
    JSONApiNeedTryCatch,
    existMoneyComputeExpression,
    functionArgumentsTooLong,
    isInvalidRouterName,
    isDisabledRouterPath,
    getterNeedReturnStatement,
    argumentNeedArrayFuncProp4CallExpression,
    ...uniAppCompatApiRules,
    // checkFdpArguments,
    checkQQMapKey,
    sameImplNameWithMallKit
]
