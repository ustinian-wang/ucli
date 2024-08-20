import {CollectorLevelDef, ErrorCollector} from "../../tools/ErrorCollector.js";
import {functionWithComments} from "./comment.js";
import {functionNotExist} from "./functionNotExist.js";
import jsCommonRules from "./common.js";
import babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import fs, {readFileSync} from "fs";
import {createTraverseOptions} from "../../tools/other.js";
import {javascriptErrorRules, javascriptWarningRules} from "./javascriptScan.js";


function checkJsAst(filePath = "") {

    let errorCollector = ErrorCollector.getInstance();
    //check if function is with comment
    let lastTaskList = [];
    let registerFinalTask = (task)=>{
        lastTaskList.push(task);
    };
    let executeLastTasks = ()=>{
        lastTaskList.forEach(task=>task());
    }

    let options = createTraverseOptions([
        functionWithComments,
        functionNotExist,
        ...jsCommonRules,
    ], {
        filePath,
        errorCollector,
        context: {
            registerFinalTask
        }
    });

    let content = readFileSync(filePath) + "";
    let result = babelParser.parse(content, {
        sourceType: "module"
    });

    traverse.default(result, options);
    executeLastTasks();
    return errorCollector;
}

/**
 * check file of .js
 * @param filePath
 * @returns {ErrorCollector}
 */
export default function checkJavascriptFile(filePath = "") {

    let errorCollector = checkJsAst(filePath);

    const content = readFileSync(filePath) + "";
    const contentArr = content.split('\n');
    contentArr.forEach((line, index) => {
        let checkTasks = [
            ...javascriptErrorRules
        ];

        checkTasks.map(task => {

            let msg = task(line);
            if (msg) {
                errorCollector.add({
                    filePath: filePath, lineNo: index, msg,
                    advice: ""
                })
            }
            return msg
        })

        let checkWarningTasks = [
            ...javascriptWarningRules
        ];

        checkWarningTasks.map(task => {

            let msg = task(line);
            if (msg) {
                errorCollector.addWarning({
                    level: CollectorLevelDef.WARNING,
                    filePath: filePath, lineNo: index, msg,
                    advice: ""
                })
            }
            return msg
        })
    });

    return errorCollector
}
