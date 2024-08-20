import {printError} from "./tools.js";
import {readFileSync} from "fs";

function mergeTraverseOptions(optionsList=[]){
    let finallOptions = {};
    optionsList.forEach(options=>{
        options && Object.keys(options).forEach(key=>{
            let method = options[key];
            if(method instanceof Function){
                if(!finallOptions[key]){
                    finallOptions[key] = [];
                }
                finallOptions[key].push(method)
            }
        })
    });

    let mergedOption = {};
    Object.keys(finallOptions).forEach(key=>{
        mergedOption[key] = function () {
            finallOptions[key].forEach((method)=>{
                method.bind(this)(...arguments);
            })
        }
    })
    return mergedOption;
}

function createTraverseOptionList(taskList=[], options={
    filePath: "",
    errorCollector: {}
}){

    return taskList.map(task=>{
        return task(options);
    })
}

function createTraverseOptions(taskList=[], options={}){
    return mergeTraverseOptions(createTraverseOptionList(taskList, options));
}
function isExpressionLikeFunction(type) {
    return ['FunctionExpression', 'ArrowFunctionExpression'].includes(type);
}
function getParamName(param){
    if(param.type === "AssignmentPattern"){
        return param.left.name;
    }else{
        return param.name;
    }
}

function parseFileNameByPath(filePath){
    let splitChar = "/";
    if(filePath.includes("\\")) {
        splitChar = "\\"
    }
    return filePath.slice(filePath.lastIndexOf(splitChar)+1).split(".")[0]
}
function isFunctionProperty(property) {

    if (property.type === 'ObjectMethod') {
        return true;
    }
    if (property.value) {
        return ['FunctionExpression', 'ArrowFunctionExpression'].includes(property.value.type);
    }

    return false;
}

function isStringWrapSingleQuote(value) {
    return value.startsWith("'") && value.endsWith("'");
}

const parseFileToContentArr = (filePath) => {
    let content = readFileSync(filePath) + "";
    return {
        content,
        contentArr: content.split("\n")
    }
}

function parseErrorMessage(obj = {
    filePath: "",
    index: "",
    msg: ""
}){
    let {
        filePath,
        index,
        msg
    } = obj;
    return         `
   文件：${filePath}
   行号：${index}
   原因：${msg}
`
}

function printErrorObject(obj = {
    filePath: "",
    index: "",
    msg: ""
}) {
    printError(parseErrorMessage(obj));
}


function isLowerCase(char) {
    let firstChar = char || '';
    return firstChar.toLowerCase() === firstChar;
}
function isUpperCase(char) {
    let firstChar = char || '';
    return firstChar.toUpperCase() === firstChar;
}

function isComponentFile(filePath){

    let checkList = [
        "components",
        "comp",
        "script"
    ];
    if(filePath.includes("pages")){
        if(!checkList.some(key=>filePath.includes(key))){
            return false;
        }
    }else{
        if(!checkList.some(key=>filePath.includes(key))){
            return false;
        }
    }

    return true;
}

function getExceptionLine(options, node){
    let {
        filePath,
        vueTemplateContent,
    } = options;
    if(filePath.endsWith("vue") && vueTemplateContent){
        let prevLine = vueTemplateContent.split("\n").length+1;
        return prevLine + node.loc.start.line;
    }else{
        return node.loc.start.line;
    }
}
/**
 * @param {string} key
 * @return {boolean}
 */
const isQQMapKey =(key)=>{
    //BSXBZ-XFPRK-RMDJR-A6N36-E6C3O-NRBC6
    return (typeof key === "string") && /(([A-Z0-9]+){5}-?){6}/.test(key);
}
export  {
    mergeTraverseOptions,
    createTraverseOptionList,
    createTraverseOptions,
    isExpressionLikeFunction,
    getParamName,
    isFunctionProperty,
    parseFileNameByPath,
    isStringWrapSingleQuote,
    parseFileToContentArr,
    printErrorObject,
    isLowerCase,
    isUpperCase,
    isComponentFile,
    getExceptionLine,
    isQQMapKey
}
