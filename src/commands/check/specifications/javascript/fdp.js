// // const path = require("path");
// // const types = require("@babel/types");
// // const {CollectorLevelDef} = require("../../tools/ErrorCollector.js");
// // const {arrayDiff} = require("../../../tool.js");
// // const generate = require('@babel/generator').default
// let fdpContextCache = null;
//
// /**
//  * @return {{fdpTree: {}, eventPropDefKey: string, eventPropNameKey: string, fdpDefFilePath: string}|null}
//  */
// function getFdpContext() {
//     if (fdpContextCache) {
//         return fdpContextCache;
//     } else {
//         const XLSX = require('xlsx');
//         const fdpDefFilePath = path.join(__dirname, '../res/商城FDP事件库.xlsx');
//         const workbook = XLSX.readFile(fdpDefFilePath);
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const data = XLSX.utils.sheet_to_json(worksheet);
//         let dataList = data.slice(1, data.length - 1);
//         let eventNameKey = "";
//         let eventPropNameKey = "";
//         let eventPropDefKey = ""
//         Object.keys(dataList[0]).forEach((key) => {
//             if (dataList[0][key] === "事件名（必填）") {
//                 eventNameKey = key;
//             }
//             if (dataList[0][key] === "属性名") {
//                 eventPropNameKey = key;
//             }
//             if (dataList[0][key] === "属性显示名") {
//                 eventPropDefKey = key;
//             }
//         })
//         let rows = dataList.slice(0, dataList.length - 1);
//         let currentEventName = 0;
//         let fdpTree = {};
//         rows.forEach((row) => {
//             if (row[eventNameKey]) {
//                 currentEventName = row[eventNameKey];
//                 let rowKeys = Object.keys(row);
//                 let firstPropKeyIndex = rowKeys.findIndex(key => key === eventPropNameKey);
//                 let restOfRow = {};
//                 rowKeys.slice(firstPropKeyIndex, rowKeys.length).forEach(key => {
//                     restOfRow[key] = row[key];
//                 })
//                 fdpTree[currentEventName] = {
//                     root: row,
//                     children: [
//                         restOfRow
//                     ]
//                 }
//             } else {
//                 if (fdpTree[currentEventName]) {
//                     fdpTree[currentEventName].children.push(row);
//                 }
//             }
//
//         })
//
//         fdpContextCache = {
//             fdpDefFilePath,
//             fdpTree,
//             eventPropNameKey,
//             eventPropDefKey,
//         };
//         return fdpContextCache;
//     }
// }
//
// function checkFdpArguments(options) {
//     let {
//         errorCollector,
//         filePath
//     } = options;
//
//
//     return {
//         CallExpression(path) {
//             try {
//                 let node = path.node;
//                 if (node?.callee?.name === "logFdpTrack") {
//                     let args = node.arguments;
//                     let eventNameArgument = args[0];
//                     let propertiesArgument = args[1];
//
//                     let {
//                         fdpDefFilePath,
//                         fdpTree,
//                         eventPropNameKey,
//                         eventPropDefKey,
//                     } = getFdpContext();
//
//                     if (types.isStringLiteral(eventNameArgument) && types.isObjectExpression(propertiesArgument)) {
//
//                         let eventName = eventNameArgument.value;
//                         let properties = propertiesArgument.properties;
//                         let allKeys = properties.map(item => item?.key?.name);
//                         let calledObject = {};
//                         properties.forEach(prop => {
//                             if(prop?.key?.name){
//                                 calledObject[prop.key.name] = generate(prop.value).code
//                             }
//                         });
//                         let eventObject = fdpTree[eventName];
//                         if (eventObject) {
//                             let propInfo = {};
//                             eventObject.children.forEach(prop => {
//                                 let key = prop[eventPropNameKey];
//                                 if(!["mall_content_terminal", "mall_mem_id"].includes(key)){
//                                     propInfo[prop[eventPropNameKey]] = prop[eventPropDefKey];
//                                 }
//                             });
//
//                             let diffKeys = arrayDiff(Object.keys(propInfo).filter(key => propInfo[key]), allKeys);
//                             if (diffKeys.length > 0) {
//                                 errorCollector.add({
//
//                                     level: CollectorLevelDef.WARNING,
//                                     lineNo: node.loc.start.line,
//                                     filePath,
//                                     msg: `fpd: ${eventName}事件属性参数和事件定义数量不匹配`,
//                                     advice: `fpd: 请检查表的定义和代码调用是否匹配或重新下载更新文件, 文件路径:${fdpDefFilePath}
//
// 事件定义：${JSON.stringify(propInfo, null, 2)}
//
// 代码调用参数：${JSON.stringify(calledObject, null, 2)}
//
// 问题参数：${JSON.stringify(diffKeys, null, 2)}
//
// fdp定义文件：${fdpDefFilePath}
//                                 `
//                                 });
//                             }
//                         } else {
//                             errorCollector.add({
//
//                                 level: CollectorLevelDef.WARNING,
//                                 lineNo: node.loc.start.line,
//                                 filePath,
//                                 msg: `当前${eventName}事件名称没有定义`,
//                                 advice: `请检查fdp表中事件是否存在或重新下载更新文件, 文件路径:${fdpDefFilePath}`
//                             });
//                         }
//
//                     }
//                 }
//             }catch (e) {
//                 console.log("e", e);
//             }
//         }
//     }
// }
//
// export default  {
//     checkFdpArguments
// }
