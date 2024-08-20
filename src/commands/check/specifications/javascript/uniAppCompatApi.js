// const {getExceptionLine} = require("../../tools/other.js");
// const {CollectorLevelDef} = require("../../tools/ErrorCollector.js");
// const types = require("@babel/types");

import {getExceptionLine} from "../../tools/other.js";
import {CollectorLevelDef} from "../../tools/ErrorCollector.js";
import * as types from "@babel/types";

const PlatformDef = {
    APP_PLUS: "APP-PLUS",
    APP_NVUE: "APP-NVUE",
    H5: "H5",
    MP_WEIXIN: "MP-WEIXIN",
    MP_ALIPAY: "MP-ALIPAY",
    MP_BAIDU: "MP-BAIDU",
    MP_TOUTIAO: "MP-TOUTIAO",
    MP_LARK: "MP-LARK",
    MP_QQ: "MP-QQ",
    MP_KUAISHOU: "MP-KUAISHOU",
    MP_JD: "MP-JD",
    MP_360: "MP-360",
    MP: "MP",
    QUICKAPP_WEBVIEW: "QUICKAPP-WEBVIEW",
    QUICKAPP_WEBVIEW_UNION: "QUICKAPP-WEBVIEW-UNION",
    QUICKAPP_WEBVIEW_HUAWEI: "QUICKAPP-WEBVIEW-HUAWEI",
};
const ApiEnabledConditionMap = {
    // "uni.setClipboardData": true,
    // "uni.getClipboardData": true,
    // "uni.stopPullDownRefresh":true,
    // "uni.saveImageToPhotosAlbum":true,
    // "uni.removeStorage":true,
    // "uni.removeStorageSync":true,
    // "uni.setStorage":true,
    // "uni.downloadFile":true,
    // "uni.makePhoneCall":true,
    // "uni.getStorage":true,
    // "uni.navigateBack":true,
    // "uni.showActionSheet":true,
    // "uni.chooseImage":true,
    // "uni.createCanvasContext":true,
    // "uni.hideLoading":true,
    // "uni.getExtConfigSync":true,
    // "uni.getSystemInfo":true,
    // "uni.getSystemInfoSync":true,
    // "uni.showModal":true,
    // "uni.showToast":true,
    // "uni.setNavigationBarTitle":true,
    // "uni.showLoading":true,
    // "uni.getImageInfo":true,
    // "uni.getNetworkType":true,
    // "uni.request":true,
    // "uni.navigateTo":true,
    // "uni.upx2px":true,
    // "uni.toast":true,
    // "uni.previewImage":true,
    // "uni.switchTab":true,
    // "uni.createIntersectionObserver":true,
    // "uni.createSelectorQuery":true,
    // "uni.canvasToTempFilePath":true,

    "uni.openBusinessView":[
        PlatformDef.MP_WEIXIN
    ],
    "uni.getUserProfile":[
        PlatformDef.MP_WEIXIN
    ],
};
const ApiDisabledConditionMap = {
    "uni.chooseLocation": [
        PlatformDef.MP_KUAISHOU,
        PlatformDef.MP_JD,
    ],
    "uni.showShareMenu":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
    ],
    "uni.getMenuButtonBoundingClientRect":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
        PlatformDef.MP_LARK
    ],
    "uni.createVideoContext":[
        PlatformDef.H5,
    ],
    "uni.authorize":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
        PlatformDef.MP_ALIPAY,
        PlatformDef.MP_JD,
    ],
    "uni.createAnimation":[
        PlatformDef.MP_KUAISHOU,
        PlatformDef.MP_JD,
    ],
    "uni.setEnableDebug":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
        PlatformDef.MP_ALIPAY,
        PlatformDef.MP_TOUTIAO,
        PlatformDef.MP_LARK,
        PlatformDef.MP_KUAISHOU,
    ],
    "uni.hideShareMenu":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
        PlatformDef.MP_BAIDU,
    ],
    "uni.setNavigationBarColor":[
        PlatformDef.MP_ALIPAY,
    ],
    "uni.openLocation":[
        PlatformDef.MP_QQ,
        PlatformDef.MP_KUAISHOU,
        PlatformDef.MP_JD,
    ],
    "uni.getExtConfigSync":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
        PlatformDef.MP_ALIPAY,
        PlatformDef.MP_LARK,
        PlatformDef.MP_QQ,
        PlatformDef.MP_KUAISHOU,
        PlatformDef.MP_JD,
    ],
    "uni.getSetting":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
    ],
    "uni.openSetting":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
    ],
    "uni.checkSession":[
        PlatformDef.APP_PLUS,
        PlatformDef.H5,
        PlatformDef.MP_ALIPAY,
        PlatformDef.MP_JD,
    ],
    "uni.login":[
        PlatformDef.H5,
    ],
    "uni.getUserInfo":[
        PlatformDef.H5,
    ],
}
function uniAppCompatApi(memberExpression, supportList, disabledList) {


    let objName = memberExpression.split(".")[0];
    let memberName = memberExpression.split(".")[1];
    return (options) => {
        let {
            filePath,
            errorCollector
        } = options;

        return {

            VariableDeclaration(path) {
                let node = path.node;
                let varNode = node.declarations.find(types.isVariableDeclarator);
                let comments = node?.leadingComments?.map(item=>item.value) || [];
                let callee = varNode.init?.callee || {};
                let nowObjectName =  callee?.object?.name;
                let nowMemberName = callee?.property?.name;
                let reason =  supportList.length > 0 ? `【${memberExpression}】只支持如下平台：【${supportList}】` : `【${memberExpression}】不支持如下平台：【${disabledList}】`;
                let advice = "可能存在终端调用异常，请检查并加上对应的编译条件，可参考：https://uniapp.dcloud.net.cn/tutorial/platform.html#preprocessor";

                // let node = path.node;
                if (nowObjectName === objName && nowMemberName === memberName) {
                    if(!comments.some(value=>(value.includes("#ifdef") || value.includes("#ifndef")))){
                        errorCollector.addWarning({
                            level: CollectorLevelDef.WARNING,
                            filePath, lineNo: getExceptionLine(options, node), msg: reason,
                            advice
                        })
                    }

                }
            }
        }
    }
}
const     uniAppCompatApiRules = [
    ...Object.keys(ApiEnabledConditionMap).map(key=>{
    let value = ApiEnabledConditionMap[key];
    return uniAppCompatApi(key, value);
}),
...Object.keys(ApiDisabledConditionMap).map(key=>{
    let value = ApiDisabledConditionMap[key];
    return uniAppCompatApi(key, [], value);
}),
]

export {
    uniAppCompatApiRules
}