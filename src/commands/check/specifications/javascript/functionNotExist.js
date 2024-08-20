// const {getParamName} = require("../../tools/other.js");
// const {isExpressionLikeFunction} = require("../../tools/other.js");
// const jsGlobalList = require("./jsGlobalList.js");
import jsGlobalList from "./jsGlobalList.js";

import {getParamName, isExpressionLikeFunction} from "../../tools/other.js";

function functionNotExist(options) {
    let {
        context,
        filePath,
        errorCollector
    } = options;

    let {
         registerFinalTask= ()=>{},
    } = context;

    let importedNameList = [];//name like 'import { xxx } from "aaa.js"'
    let declaredFuncNameList = [];//name like 'function name(){}'
    let varFuncNameList = [];//name like 'var a = ()=>{}' and 'var b = function(){}'
    let callFuncNameList = [];//it like 'func();'
    let exportNameList = [];
    let functionParamNameList = [];
    let objectPropertyNameList = [];
    registerFinalTask(()=>{
        callFuncNameList.forEach(({name, loc}) => {
            let isImported = importedNameList.includes(name);
            let isDeclared = declaredFuncNameList.includes(name);
            let isVarName = varFuncNameList.includes(name);
            let isExported = exportNameList.includes(name);
            let isGlobal = jsGlobalList.includes(name);
            let isParamFunc = functionParamNameList.includes(name);
            let isObjProp = objectPropertyNameList.includes(name);
            let isNotExisted = [isImported, isDeclared, isVarName, isExported, isGlobal, isParamFunc, isObjProp].every(value => !value);
            if (isNotExisted) {
                errorCollector.add({
                    lineNo: loc.start.line,
                    msg: `1、函数【${name}】不存在。处理方式：请自行补上函数引用，若确认是系统函数，则补充名称到jsGlobalList.js。2、变量初始赋值不是函数类型会导致调用异常。处理方式：初始赋值为函数类型，例如: let a = ()=>{}`,
                    filePath
                });
            }
        });
    });

    return {
        enter(){},
        ImportDeclaration(res) {
            let nameList = res.node.specifiers.map(spec => spec?.imported?.name).filter(Boolean);
            importedNameList.push(...nameList)
        }
        ,
        ClassMethod({node}) {
            let nameList = node.params.map(item => getParamName(item)).filter(Boolean);
            functionParamNameList.push(...nameList);
        }
        ,
        ClassPrivateMethod({node}) {
            let nameList = node.params.map(item => getParamName(item)).filter(Boolean);
            functionParamNameList.push(...nameList);
        }
        ,
        ArrowFunctionExpression({node}) {
            let nameList = node.params.map(item => getParamName(item)).filter(Boolean);
            functionParamNameList.push(...nameList);
        }
        ,
        FunctionDeclaration({node}) {
            let nameList = node.params.map(item => getParamName(item)).filter(Boolean);
            functionParamNameList.push(...nameList);
            declaredFuncNameList.push(node?.id?.name);
        },
        CallExpression({node}) {
            if (node.callee.name) {
                callFuncNameList.push({
                    name: node.callee.name,
                    loc: node.loc
                });
            }

        }
        ,
        VariableDeclarator({node}) {
            if (isExpressionLikeFunction(node?.init?.type)) {
                varFuncNameList.push(node.id.name);
                let nameList = node.init.params.map(param => getParamName(param));
                functionParamNameList.push(...nameList);
            } else {
                varFuncNameList.push(node.id.name);
            }
        }
        ,
        ObjectProperty({node}) {
            objectPropertyNameList.push(node.key.name);
        }
        ,
        ExportDeclaration({node}) {
            if (node.declaration && ['VariableDeclaration', 'FunctionDeclaration'].includes(node.declaration.type)) {

                if (node.declaration.type === 'FunctionDeclaration') {
                    exportNameList.push(node?.declaration?.id?.name)
                } else if (['VariableDeclaration', 'VariableDeclarator'].includes(node.declaration.type)) {
                    node.declaration.declarations.forEach(item => {
                        exportNameList.push(item.id.name);
                    })
                }
            }


        }
    }
}

export  {
    functionNotExist
}