/**
 * execute task list with options argument
 * @param taskList
 * @param options
 * @returns {*}
 */

import {CollectorLevelDef}  from "./ErrorCollector.js";

function executeCheck(taskList, options, level=CollectorLevelDef.ERROR) {
    let {
        filePath, line, index,
        errorCollector
    } = options;
    return taskList.map(task => {
        let msg = task(line);
        if (msg) {
            errorCollector.add({
                level,
                filePath,
                lineNo:index,
                msg
            });
        }
        return msg
    }).filter(value => value);
}

export {
    executeCheck
}