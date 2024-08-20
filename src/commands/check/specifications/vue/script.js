import { isFunctionProperty, parseFileNameByPath, getExceptionLine } from "../../tools/other.js";
import { CollectorLevelDef } from "../../tools/ErrorCollector.js";
import types from '@babel/types';
import tagWhite from "../../config/tagWhite.js";

function componentWithName(options) {
    let {
        filePath,
        errorCollector
    } = options
    return {
        ExportDefaultDeclaration({node}) {
            let properties = node.declaration.properties;
            let nameProperty = properties.find(item => item.key.name = 'name');

            if ( !nameProperty || !nameProperty.value || nameProperty.value.type !== "StringLiteral") {
                errorCollector.add({
                    lineNo: getExceptionLine(options, node),
                    msg: `请给组件加上name属性，或将name属性移动到第一行`,
                    filePath: filePath
                })
            }
        }
    }
}

function isInvalidData(options) {
    let {
        filePath,
        errorCollector
    } = options
    return {
        ExportDefaultDeclaration({node}) {
            let properties = node.declaration.properties;
            let dataProperty = properties.find(item => item.key.name === 'data');
            if (dataProperty) {
                if (!isFunctionProperty(dataProperty)) {
                    errorCollector.add({
                        lineNo: getExceptionLine(options, dataProperty),
                        msg: "请将data声明为函数，而不是对象，例如data: function(){ return {}; }",
                        filePath: filePath
                    })
                }
            } else {
                errorCollector.add({
                    lineNo: 0, msg: "组件的data函数不存在",
                    advice: "请声明data方法，例如:export default { data(){ return { }; } }",
                    filePath: filePath
                })
            }
        }
    }
}

function isInvalidMethods(options) {
    let {
        context = {},
        errorCollector,
        filePath
    } = options
    let {
        templateBindingMethods = []
    } = context;

    return {
        ExportDefaultDeclaration({node}) {

            if (filePath.includes("Calendar.vue")) {//Temporary filtering
                return;
            }

            // exportDefaultDeclarationObject.declaration.key.name='name';//component name
            let properties = node.declaration.properties;

            let methodsProperty = properties.find(item => item.key.name === 'methods');
            if (methodsProperty) {
                let methodNodeList = methodsProperty.value.properties.map(item => item?.key?.name).filter(Boolean);
                for (let item of templateBindingMethods) {
                    let tplMethodName = item.methodName;
                    if (!methodNodeList.includes(tplMethodName)) {
                        errorCollector.add({
                            lineNo: getExceptionLine(options, methodsProperty),
                            msg: `1、template的【${tplMethodName}】方法未注册到methods上，问题表达式：${item.expression}；2、存在诸如@click='computedObjA.func'，computedObjA注册在computed上`,
                            advice: "1. 对于1的情况，将表达式转成methods。2.对于2的情况：请在methods新增方法调用computedObjA.func; 例如<view @click='m1'></view>; methods:{ m1(event){ computedObjA.func(event) }; } ",
                            filePath: filePath
                        })
                    }
                }
            } else if (templateBindingMethods.length > 0) {
                errorCollector.add({
                    lineNo: 0, msg: "请声明methods对象",
                    filePath: filePath
                })
            }
        }
    }
}

function unusedFunction(options) {
    let {
        filePath,
        errorCollector,
        context: {
            templateBindingMethods,
            registerFinalTask
        }
    } = options;

    let thisCallMethodNameList = [];
    let methodNodeList = []

    registerFinalTask(() => {
        methodNodeList.forEach(item => {
            let {
                name,
                node
            } = item;
            let bindTplMethodNameList = templateBindingMethods.map(item => item.methodName);
            if (!thisCallMethodNameList.includes(name) && !bindTplMethodNameList.includes(name)) {
                (errorCollector.addWarning({
                    level: 2,
                    filePath,
                    lineNo: getExceptionLine(options, node),
                    msg: `方法【${name}】未使用`,
                    advice: "请进行确认无用后，删除未使用的方法或将that.xxx的调用改成this.xxx，如果是跨页面调用的方法，请忽略"
                }));
            }
        });

    })

    return {
        MemberExpression({node}) {
            if (types.isThisExpression(node.object)) {
                thisCallMethodNameList.push(node.property.name);
            }
        },
        ExportDefaultDeclaration({node}) {

            if (filePath.includes("Calendar.vue")) {//Temporary filtering
                return;
            }

            let properties = node.declaration.properties;

            let methodsProperty = properties.find(item => item.key.name === 'methods');
            if (methodsProperty) {
                let valueProp = methodsProperty.value.properties;
                methodNodeList = valueProp.filter(item => item?.key?.name).map(item => ({
                    node: item,
                    name: item?.key?.name
                }))

            }
        }
    }
}

function setInvalidPropertyOfData(options) {
    let {
        filePath,
        errorCollector
    } = options;
    let allDataObjPropNodes = [];
    let allReturnObjProperties = [];
    let advice = "1.请声明属性，避免赋值后没有双向绑定，2.如果是obj[xxx]=xxx的方式赋值，请改用this.$set设置值或Object.assign的方式; 3.如果是this[xxx]=xx的方式，可以用Object,assign(this, { xxx:xxx })的方式解决赋值问题. 4. 和视图无关的且data用不到的临时数据，不要挂this，自行声明临时变量记录; 5. 你也可以选择废弃setData";
    return {
        ExportDefaultDeclaration({node}) {
            let properties = node.declaration.properties;
            let dataProperty = properties.find(item => item.key.name === 'data');
            let returnObjProperties = []
            if(dataProperty?.value && types.isFunctionExpression(dataProperty.value)){
                returnObjProperties = dataProperty.value?.body?.body?.find(types.isReturnStatement)?.argument?.properties || [];
            }else{
                returnObjProperties = dataProperty?.body?.body?.find(types.isReturnStatement)?.argument?.properties || [];
            }

            allDataObjPropNodes = returnObjProperties.filter(types.isObjectProperty)
            allReturnObjProperties = returnObjProperties;

        },
        CallExpression({node}){
            let allPropNameList = allReturnObjProperties.filter(item=>item?.key?.name).map(item=>item.key.name);
            let callee = node.callee;
            if(["that", "this"].includes(callee?.object?.name) || types.isThisExpression(callee?.object)){
                if(callee.property.name === "setData"){
                    let setDataObj = node.arguments.find(types.isObjectExpression);
                    if(setDataObj?.properties){
                        let props = setDataObj.properties;
                        for(let prop of props){
                            if(types.isSpreadElement(prop)){
                                continue;
                            }

                            if(prop?.key?.name){
                                if(!allPropNameList.includes(prop?.key?.name)){
                                    errorCollector.add({
                                        level: CollectorLevelDef.ERROR,
                                        filePath,
                                        lineNo: getExceptionLine(options, node),
                                        msg: `属性【${prop.key.name}】未在data的成员上声明1`,
                                        advice
                                    })
                                }
                            }else if(types.isUnaryLike(prop.value)){
                                let name = prop?.value?.argument?.object?.property?.name;
                                if(name && !allPropNameList.includes(name)){
                                    errorCollector.add({
                                        level: CollectorLevelDef.ERROR,
                                        filePath,
                                        lineNo: getExceptionLine(options, node),
                                        msg: `属性【${name}】未在data的成员上声明2`,
                                        advice
                                    })
                                }
                            }else{
                                let name = "";
                                if(types.isStringLiteral(prop.key)){
                                    name = prop.key.value;
                                    name = name.split(".")[0];
                                }else{
                                    name = prop.key.name;
                                }

                                if(!allPropNameList.includes(name)){
                                    let name = prop.key.name;
                                    if(prop?.key?.quasis && types.isTemplateElement(prop?.key?.quasis[0])){
                                        name = prop.key.quasis[0].value.raw;
                                    }else if(prop?.key.type==='BinaryExpression' && prop?.key?.right.type==='TemplateLiteral'){
                                        name = prop?.key?.right.quasis[0].value.raw;
                                    }

                                    errorCollector.add({
                                        level: CollectorLevelDef.ERROR,
                                        filePath,
                                        lineNo: getExceptionLine(options, node),
                                        msg: `属性【${name}】未在data的成员上声明5`,
                                        advice
                                    })
                                }
                            }

                        }
                    }

                }
            }
        },
        AssignmentExpression({node}) {
            let allPropNameList = allReturnObjProperties.map(item=>{
                return item?.key?.name;
            });
            let left = node.left;
            // let right = node.right;
            if(types.isThisExpression(left.object) || ["that"].includes(left?.object?.name)){
                if(!allPropNameList.includes(left.property.name)){
                    reportError();
                }

            }else if (allDataObjPropNodes && left?.object?.object && types.isThisExpression(left?.object?.object)) {//face to object
                let tmpLeft = left;
                let leftList = [tmpLeft];
                while (tmpLeft.object) {
                    leftList.unshift(tmpLeft.object);
                    tmpLeft = tmpLeft.object;
                }
                // let express = `this.${leftList.filter(item => item?.property?.name).map(item => item.property.name).join(".")}=${right.value}`;
                let propName = left.object.property.name;
                let matchedNode = allDataObjPropNodes.find(node => {
                    return propName === node.key.name;
                })

                if (matchedNode && matchedNode.value.properties) {
                    let isExist = matchedNode.value.properties.find(prop => prop.key.name === left.property.name);
                    if (!isExist) {

                        reportError();
                    }
                }
            }

            function reportError() {
                errorCollector.add({
                    level: CollectorLevelDef.ERROR,
                    filePath,
                    lineNo: getExceptionLine(options, node),
                    msg: `属性【${left.property.name}】未在data的成员上声明`,
                    advice
                })
            }
        }
    }
}


function unRegisterTag(options) {
    let importSourceNameList = [];
    let {
        context: {
            registerFinalTask,
            templateAllTagNameList
        },
        filePath,
        errorCollector
    } = options;

    let tagWhitelist = tagWhite.map(toHumpString);

    registerFinalTask(() => {
        let humpTemplateAllTagNameList = templateAllTagNameList.map(toHumpString);
        let humpImportSourceNameList = importSourceNameList.map(toHumpString);
        let unImportNameList = humpTemplateAllTagNameList.filter(name => {
            return !name.includes("Fa") && !name.startsWith("Global") && !tagWhitelist.includes(name);
        }).filter(name => (!humpImportSourceNameList.includes(name)));
        unImportNameList.forEach(name => {
            errorCollector.addWarning({
                filePath: filePath,
                lineNo: 0,
                msg: `存在未注册的标签【${name}】，行号`,
                advice: "请引入组件、删除非法标签、通知jser或自行补充tagWhite.js的白名单。若为自定义全局组件，自行命名以global开头"
            })
        })
    })

    return {
        ImportDeclaration({node}) {
            let value = node.source.value;
            let name = parseFileNameByPath(value);
            importSourceNameList.push(name);
            let specNameList = node.specifiers.map(item => item.local.name);
            importSourceNameList.push(...specNameList);
        },
    }
}

function toHumpString(str) {
    let finalStr = str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
    let result = finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
    return result;
}

export default  [
    componentWithName,
    isInvalidData,
    isInvalidMethods,
    unusedFunction,
    setInvalidPropertyOfData,
    unRegisterTag
]
