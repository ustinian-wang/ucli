import {isStartWithNote} from "../../tools/tools.js";

/**
 * @description 判断当前行是否包含_h.jsp，就是这么直接暴力
 * @param { string } line
 * @returns { string }
 */
// const {isStartWithNote} = require("../../../tool.js");
const checkRequestPathIsNoMvc = (line) => {
    let pathName = '';
    const reg = /(?<=('|"|\/)).*?(_h.jsp)/ig;
    if (line.includes('_h.jsp') && line.match(reg)) {
        pathName = line.match(reg)[0];
    }

    if (pathName) {
        return `存在非MVC请求路径名：${pathName}`
    }
}

function existGlobalData(line) {
    if (line.includes(".globalData.") && !line.includes("//")) {
        return "不允许使用globalData，请将其迁移到vuex或自行声明为临时变量";
    }
}

function existRequire(line) {
    let regExp = /(.*)(require\()(.*)(\)).*/;
    if (regExp.test(line) && !line.includes("//")) {

        let requireRegExp = /require\(.*\.(png|jpg|jpeg|gif).*\)/;
        if(line.match(requireRegExp) ){
           return;
        }

        return "不支持require，请使用ESM规范";
    }
}

function existSelectComponent(line) {
    if (line.includes(".selectComponent")) {
        return "请将selectComponent改成this.$refs['xxxx']的引用";
    }
}

function detectIsEmptyLogic(line) {
    let isJsonRegExp = /(.*)(JSON\.stringify)\((.*)\)(\s?)(===?)(\s?)(['"]){}(['"])(.*)/;
    let isObjectKeysExp = /(.*)(Object\.keys)\((.*)\)\.length(\s?)(===?)(\s?)0(.*)/g;
    let isGetOwnPropertyNamesExp = /(.*)(Object\.getOwnPropertyNames)\((.*)\)\.length(\s?)(===?)(\s?)0(.*)/;
    if(!isStartWithNote(line)){
        let isMatch = [
            isJsonRegExp,
            isObjectKeysExp,
            isGetOwnPropertyNamesExp
        ].some(regExg=>regExg.test(line));
        if(isMatch){
            return "请使用isEmptyObj方法判断空对象";
        }
    }
}
const javascriptWarningRules = [
    detectIsEmptyLogic
]
const javascriptErrorRules = [
    // existGlobalData,
    existRequire,
    // existSelectComponent,
    checkRequestPathIsNoMvc,
]
export {
    javascriptWarningRules,
    javascriptErrorRules
}
