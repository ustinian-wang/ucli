import colors from 'colors';
import {readdirSync, readFileSync, statSync, accessSync} from "fs";

const replaceRestRootCode = (code)=>{
    /*
        原来的：background: url(//ma.faisys.com/image/takeoutTemplate/cartIcon.png?v=1);
        替换后的：background: url($RES_ROOT + 'image/faiscoMallSideBtnNew.png?v=202206011714')

        原来的：background: url('//ma.faisys.com/image/takeoutTemplate/takeout_template_head_bg.png')
        替换后：background: url($RES_ROOT + 'image/takeoutTemplate/takeout_template_head_bg.png')


        * */
    code = code.replace(/url\('?(http|https)?(:?)\/\/ma\.faisys\.com\/(\S+[^'])('?)\)/,`url($RES_ROOT + '$3')`)

    return code;
}

const ReplaceContextType = {
    JAVASCRIPT: 1,
    TEMPLATE: 2,
    NORMAL: 3
};
const replaceRestRootCode4Vue = (code, contentArray, lineNo) =>{
    //往前回溯
    let preContentArr = contentArray.slice(0, lineNo) || '';
    let type = ReplaceContextType.NORMAL;
    for(let index=0; index<preContentArr.length-1; index++) {
        let preLine = contentArray[preContentArr.length-1-index];
        if(preLine.trim().startsWith("<template")){
            type = ReplaceContextType.TEMPLATE;
            break;
        }else if(preLine.trim().startsWith("<script")){
            type = ReplaceContextType.JAVASCRIPT;
            break;
        }
    }

    let urlRegexp =/'?(http|https)?(:?)\/\/ma\.faisys\.com\/(\S+[^'])('?)/
    if(type===ReplaceContextType.TEMPLATE){
        code = code.replace(urlRegexp,`vuex_resRoot + '$3'`)
    }else if(type === ReplaceContextType.JAVASCRIPT){
        code = code.replace(urlRegexp,`this.vuex_resRoot + '$3')`)
    }
    return code;
}



class FileUtils {
    static travelFile(dir, callBack) {
        readdirSync(dir).forEach((file) => {
            var pathname = path.join(dir, file);
            if (statSync(pathname).isDirectory()) {
                FileUtils.travelFile(pathname, callBack);
            } else {
                callBack(pathname);
            }
        });
    }
}


const globalDataSetRegExp =  /(\s+)?(getApp\(\)|app)\.globalData\.(\w+)\s+=\s+([a-zA-Z0-9.'"]+);?/ ;
const replaceGlobalDataSetCode = (code)=>{

    if(!isStartWithNote(code)){
        //      getApp().globalData.communityMoudleGrouperId = option.id;
        code = code.replace(globalDataSetRegExp,'$1uni.$fu.vuex("vuex_$3", $4);')
    }

    return code;
}

const replaceGlobalDataGetCode = (code)=>{

    if(globalDataSetRegExp.test(code)){
        return code;
    }else{
        //判断当前的表达式是否为set，如果是，则不进行处理，如果不是，则进行更换
        let regExp = /(.*)(getApp\(\)|app)\??\.?globalData\??\.?(\w*)(.*)/;
        return code.replace(regExp, "$1uni.$store.state.vuex_$3$4");
    }
}

function isStartWithNote(code){
    return code.trim().startsWith("//") || code.trim().startsWith("/*")
}

const replaceTheme4VueTemplate = (code)=>{
    let regExp = /(\s+<view :class="'[\w-\s]+ )jz-theme' \+ themeId(.+)/;
    code = code.replace(regExp, "$1jz-theme mall-theme'$2");
    code = code.replace(`    <view :class="'jz-theme' + themeId">`, `<view :class="'jz-theme mall-theme'">`);
    code = code.replace(`    <view :class="'jz-theme' + setting.themeId">`, `    <view :class="'jz-theme mall-theme'">`);
    code = code.replace("jz-theme", "");

    return code;
};
const replaceTheme4HtmlAttr = (code)=>{
    let regExp = /(\s+):themeId\s?=\s?"themeId"(.+)/;
    return code.replace(regExp, "$1$2");
};
const replaceTheme4ComponentProps = (code)=>{
    if(!isStartWithNote(code)){
        let regExp = /(\s+)themeId: Number(.+)/;
        return code.replace(regExp, "");
    }

    return code;

};

function replaceCommWxsTag(code){
    let regExp = /(<script\s+module="comm"\s+lang="wxs"\s+src=").+(".+)/;
    return code.replace(regExp, '$1@/wxs/comm.wxs$2');
}

function cleanScssOldThemImport(code){
    return code.replace(/@import.+(theme|icomoon|icon)\.css.+/, '');
}

function replaceMixinCompute(code){
    code = code.replace("mixins: [computedBehavior]","");
    return code.replace("const computedBehavior = require('@/miniprogram_npm/miniprogram-computed');", "");
}

function replaceTemplateTagToComponent(code){
    let templateRegExp = /<!-- parse (<template is=")([\w-]*)(" )(.*)(:data="[a-zA-Z, :.\-0-9\(\)\[\]]*")(.*)?(><.*>) -->/

    return code.replace(templateRegExp, function($0, $1, $2, $3, $4, $5, $6){
        let htmlProps = $5.replace(/:data="(.*)"/, function($$0, $$1){
            return $$1.split(",").map(name=>{
                name=name.trim();
                let value;
                if(name.includes(":")){
                    let pair = name.split(":");
                    name = pair[0];
                    value = pair[1];
                }else{
                    value = name;
                }

                return `:${name}="${value}"`
            }).join(" ");
        });

        return `<!-- parse by jser <${$2} ${$4} ${htmlProps}${$6||''}></${$2}> -->`;
    });

}

const dateFormat = (date, fmt) => {
    date = new Date(date)
    var a = ['日', '一', '二', '三', '四', '五', '六']
    var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds(), // 毫秒
        'w': date.getDay(), // 周
        'W': a[date.getDay()], // 大写周
        'T': 'T'
    }
    if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
    }
    return fmt
};

function replaceImgVersion(code, nowPath){
    if(nowPath.includes("memberinfo")){
        return code;
    }
    let regExp = /(.*\.)(jpg|png|gif)('|")(.*)/;
    let version = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss').replace(/[-: ]/g, "");

    return code.replace(regExp, `$1$2?v=${version}$3$4`);
}

function checkStoreSetters(content="", srcPath="") {
    content.split("\n").some((line)=>{
        let regExp = /\s+uni.\$store.state.vuex_.*\s?=\s?./;
        let isError = regExp.test(line);
        if(isError){
            console.log("srcPath", srcPath);
            console.log("line", line);
        }

        return isError
    });
}

const printError = (msg)=>{
    console.error("错误级别的消息："+colors.red(msg));
}
const printWarning = (msg)=>{
    console.warn("提示级别的消息："+colors.yellow(msg));
}

const ESC = '\u001B[';
const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';

function link(text, url){
    return [
        OSC,
        '8',
        SEP,
        SEP,
        url,
        BEL,
        text,
        OSC,
        '8',
        SEP,
        SEP,
        BEL
    ].join('');
}


function linkText(text, url){
    // if (true) {
    //
    //     return `(\u200B${url}\u200B)`
    // }
    return link(text, url);

}

let pageJsonObjCache;
function getPagesJsonObject(){
    if(pageJsonObjCache){
        return pageJsonObjCache;
    }else{
        let filePath = path.join(__dirname, "../src/pages.json");
        const JSON5 = require("json5");
        let json = readFileSync(filePath, "utf-8") + "";
        pageJsonObjCache = JSON5.parse(json);
        return pageJsonObjCache;
    }

}

function traverseObject(obj, callback){

    if(isObject(obj)){
        callback(obj);
        Object.keys(obj).forEach(key=>{
            traverseObject(obj[key], callback);
        })
    }else if(isArray(obj)){
        obj.forEach(item=>{
            traverseObject(item, callback)
        });
    }
}
function isArray(value){
    return Array.isArray(value);
}
function isObject(value){
    return value instanceof Object && !isArray(value);
}

function isFileExist(filePath){
    try{
        accessSync(filePath)
        return true;
    }catch (e) {
        return false
    }
}

function getProjectPath(){
    return path.resolve(__dirname, "../");
}

function getExtJsonPath(){
    return path.resolve(getProjectPath(), "src/ext.json");
}
function getPrivateProjectConfigJsonPath(){
    return path.join(getProjectPath(), "dist/dev/mp-weixin/project.private.config.json");
}

function getProjectConfigJsonPath(){
    return path.join(getProjectPath(), "dist/dev/mp-weixin/project.config.json");
}

/**
 * @description get diff element between arrays
 * @param {array} arr1
 * @param {array} arr2
 */
const arrayDiff = (arr1=[], arr2=[]) => {
    return arr1.filter(x => !arr2.includes(x));
}
export {
    replaceRestRootCode,
    replaceGlobalDataSetCode,
    FileUtils,
    replaceRestRootCode4Vue,
    replaceTheme4VueTemplate,
    replaceTheme4HtmlAttr,
    replaceTheme4ComponentProps,
    replaceCommWxsTag,
    isStartWithNote,
    cleanScssOldThemImport,
    replaceMixinCompute,
    replaceGlobalDataGetCode,
    replaceTemplateTagToComponent,
    replaceImgVersion,
    checkStoreSetters,
    printError,
    printWarning,
    linkText,
    getPagesJsonObject,
    traverseObject,
    isFileExist,
    getExtJsonPath,
    getPrivateProjectConfigJsonPath,
    getProjectPath,
    getProjectConfigJsonPath,
    arrayDiff
}


