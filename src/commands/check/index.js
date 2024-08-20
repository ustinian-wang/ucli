import {join, dirname} from "path";
import {getCwd, travelFile} from "../../utils.js";
import {readFileSync} from "fs";
import {fileURLToPath} from "url";
import {ErrorCollector} from "./tools/ErrorCollector.js";
import otherRules from "./specifications/comm/others.js";
import checkStyleFile from "./specifications/style/index.js";
import checkVueFile from "./specifications/vue/index.js";
import checkJavascriptFile from "./specifications/javascript/index.js";
import checkOtherFile from "./specifications/other/index.js";
// 获取当前目录的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * check file by business guide
 * @param nowPath
 * @returns {ErrorCollector}
 */
function checkFileBusinessGuide(nowPath = "") {
    let ignorePathKeywords = [
        "libs",
        ".test.",
        "fuviewPackage",
        "uni_modules",//it used conditional compiler so that double declaration causes compiler errors
    ];
    if (ignorePathKeywords.some(keyword => nowPath.includes(keyword))) {
        return ErrorCollector.getInstance();
    }

    let errorCollector = checkByFileType(nowPath);

    let content = readFileSync(nowPath, "utf8");
    otherRules.forEach(task => {
        task({
            errorCollector,
            filePath: nowPath,
            content
        })
    })

    return errorCollector;
}

/**
 * check file by ext name
 * @param nowPath
 * @returns {ErrorCollector}
 */
function checkByFileType(nowPath = "") {
    if (nowPath.endsWith(".vue")) {
        return checkVueFile(nowPath);
    } else if (nowPath.endsWith(".js")) {
        return checkJavascriptFile(nowPath)
    } else {
        if (nowPath.endsWith(".scss") || nowPath.endsWith(".css")) {
            return checkStyleFile(nowPath);
        } else {
            return checkOtherFile(nowPath);
        }
    }
}


/**
 * check all file of entry
 * @param entry
 * @returns {boolean}
 */
function checkAllFile(entry) {
    let res = []
    travelFile(entry, (nowPath) => {
        res.push(checkFileBusinessGuide(nowPath))
    });

    let errorCollector = ErrorCollector.getInstance();
    res.forEach(err => {
        errorCollector.assign(err);
    })

    let isError = errorCollector.isError();
    errorCollector.printAllMessage();

    return isError;
}

/**
 * check file list from temporary area of git
 * @returns {boolean}
 */
function checkGitTempAreaFile(content) {
    let testPathList = [
        "/demo/DemoFile.vue",
        "/demo/demo.js",
        "/demo/demo.scss",
        "/demo/demo.css",
    ].map(testPath => {
        let prePath = join(__dirname, "../check/");
        return join(prePath, testPath);
    });
    let contentArr = content.split("\n").filter(line => {
        return line.startsWith("M") || line.startsWith("A");
    }).map(line => {
        return line.slice(2).trim()
    }).filter(line => {
        return (line.startsWith("src") || line.startsWith("v3")) && !line.includes("uni_modules");
    }).map(line => {

        let prePath = getCwd();
        return join(prePath, line);
    }).concat(testPathList);

    return contentArr.map(filePath => {
        return checkFileBusinessGuide(filePath)
    }).filter(errorCollector => {
        errorCollector.printAllMessage();
        return false;//先清理完错误之后再恢复 errorCollector.isError();
    }).length > 0
}

function checkCommit(isCheckAll = false, gitContent) {
    let srcPath = join(getCwd());
    let startTime = Date.now();
    let checkRes = false;
    if (isCheckAll) {
        checkRes = checkAllFile(srcPath)
    } else {
        checkRes = checkGitTempAreaFile(gitContent)
    }
    if (checkRes) {//检查到true，说明有异常信息
        console.log(`耗时：${Date.now() - startTime}ms`);
    }
    return checkRes;
}

export {
    checkAllFile,
    checkGitTempAreaFile,
    checkCommit
}
