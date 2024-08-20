/**
 * check file of other type
 * @param filePath
 * @returns {ErrorCollector}
 */
import {ErrorCollector} from "../../tools/ErrorCollector.js";

// const {ErrorCollector} = require("../../tools/ErrorCollector.js");
export default function checkOtherFile(filePath = "") {
    let errorCollector = ErrorCollector.getInstance();
    if (filePath.includes("ext.json")) {
        // errorCollector.add({
        //     lineNo: 0, msg: "禁止修改ext.json文件",
        //     filePath
        // })
    }
    return errorCollector;
}