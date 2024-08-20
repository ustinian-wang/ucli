// const { getExceptionLine } = require("../../tools/other");
import {getExceptionLine} from "../../tools/other.js";

const kitList = [
  "createNodeInDocumentBody",
  "renderVueComponentInDocumentBody",
  "asyncLoadQQMapScript",
  "setSelectorOfDOM",
  "bindNativeEvent",
  "removeNode",
  "openFileSelectionWindowarray2Map",
  "insertArrayToCircleArray",
  "getElementsOfCircleArray",
  "sortByFieldAndOrder",
  "removeElementsOfArray",
  "awaitPromiseResDiskCache",
  "MemoryCacheformatTimeToStr",
  "getDateMap",
  "getLeftTimeObj",
  "compareToNowTime",
  "getFileExtension",
  "getUrlFileExtensionformatTime",
  "formatNumber",
  "getGbLen",
  "subGbStr",
  "divideGbStr2line",
  "checkBit",
  "encodeHtml",
  "formatDouble",
  "dividePrice",
  "toObject",
  "getter",
  "parseSharedOption",
  "isEmptyObj",
  "equals",
  "noEquals",
  "isEmptyStr",
  "promisify",
  "sleep",
  "sleepSecond",
  "pxToRpx",
  "decodeHtml",
  "noop",
  "setter",
  "eachObject",
  "getCombinationOfObject",
  "parseJSON",
  "RgbtoHex",
  "forEach",
  "getTriggerLock",
  "LockerWrapper",
  "TriggerLock",
  "getWidthByProportion",
  "getHeightByProportion",
  "getAliasValue4NumberCalculate",
  "getAliasValue",
  "getAliasValue4KeyPath",
  "getQueryObject",
  "addPageQuery",
  "queryString2Object",
  "queryObject2String",
  "addZero",
  "isNormalEventName",
  "ellipsis",
  "isJSON",
  "safeJsonParse",
  "jsonParse",
  "jsonStringify",
  "objectToHttpString",
  "round10000Int2Str",
  "isStringArray",
  "isPromise",
  "isMatch",
  "isArray",
  "isObject",
  "isFunction",
  "isNumber",
  "isBoolean",
  "isNull",
  "isUndefined",
  "isDate",
  "isRegExp",
  "isEmpty",
  "isFalsy",
  "isString",
  "isEmptyArr",
  "isEmptyObject",
  "isObjectString",
  "memorize",
  "debounce",
  "throttle",
  "cloneDeep",
  "deepAssign",
  "getUrlParam",
  "getUrlSearchParam",
  "getCurrUrlParam",
  "setCurrUrlParam",
  "setUrlParam",
  "setUrlRandomParam",
  "request",
  "cloneRequest",
  "logDog",
  "logFdpTrack",
  "logFdpTrackWithVer"
]


export function sameImplNameWithMallKit(options) {
  return {
    ImportDeclaration(path) {
      let node = path.node;
      const specifiers = path.node.specifiers;
      const source = path.node.source.value;
      specifiers.forEach(specifier => {
        // console.log("specifier", specifier);
        // const importedName = specifier.imported.name;
        const localName = specifier.local.name;

        let funcInfo = {
          name: localName,
          from: source
        };
        report(options, funcInfo, node)
      });
    },
    FunctionDeclaration(path) {
      let node = path.node;
      const functionName = path?.node?.id?.name;
      let funcInfo = {
        name: functionName,
        from: null
      }
      report(options, funcInfo, node)
    },
    FunctionExpression(path) {
      let node = path.node;
      const functionName = path.node.id && path.node.id.name;
      let funcInfo = {
        name: functionName || "(anonymous)",
        from: null
      }
      report(options, funcInfo, node)
    }
  }
}

function report(options, funcInfo, node){

  let {
    filePath,
    errorCollector
  } = options;
  let {
    name,
    from
  } = funcInfo;
  if(kitList.includes(name) && from && from!=='@mall/kit'){
    let data = {
      filePath,
      lineNo: getExceptionLine(options, node),
      msg: `方法【${name}】已经存在@mall/kit下`,
      advice: `请将方法【${name}】替换为@mall/kit下的同名方法`
    }
    errorCollector.addWarning(data);
  }
}

export default {
  sameImplNameWithMallKit
}
