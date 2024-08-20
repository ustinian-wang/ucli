import {linkText} from "./tools.js";


const CollectorLevelDef = {
    NORMAL: 1,
    WARNING: 2,
    ERROR: 3
}

/**
 * @typedef {object} ErrorCollectorMsg
 * @property {1|2} [level=1]
 * @property {string} filePath
 * @property {number} lineNo
 * @property {string} msg
 * @property {string} advice
 */
class ErrorCollector {
    constructor() {
        this.msgList = []
    }

    static levelDef = CollectorLevelDef

    /**
     * @param {ErrorCollectorMsg} info
     */
    addWarning(info){
        info.level = CollectorLevelDef.WARNING;
        this.add(info);
    }
    /**
     * @param {ErrorCollectorMsg} info
     */
    add(info = {
        level: CollectorLevelDef.ERROR,//默认是错误 2是警告
        filePath: "",
        lineNo: 0,
        msg: "",
        advice: ""
    }) {
        if (info.level === void 0) {
            info.level = CollectorLevelDef.ERROR;
        }
        this.msgList.push(info);
    }

    static getInstance() {
        return new ErrorCollector();
    }

    getList() {
        return JSON.parse(JSON.stringify(this.msgList));
    }

    getMsgListByLevel(level = CollectorLevelDef.NORMAL) {
        return this.msgList.filter(errMsg => errMsg.level === level);
    }

    existLevel(level = CollectorLevelDef.NORMAL) {
        return this.getMsgListByLevel(level).length > 0;
    }

    /**
     *
     * @param {ErrorCollectorMsg} msgItem
     * @returns {string}
     */
    formatMsg(msgItem) {
        this.printOneMessage(msgItem);
    }

    //去重错误信息
    msgToList() {
        let list = this.msgList.filter(item=>item.level === CollectorLevelDef.ERROR).map(item => JSON.stringify(item))
        list = [...new Set(list)];
        return list;
    }

    isError(){
        return this.msgList.filter(item=>item.level === CollectorLevelDef.ERROR).length>0;
    }

    assign(errorCollector) {
        this.msgList.push(...errorCollector.getList());
    }

    /**
     * @param {ErrorCollectorMsg} msgInfo
     */
    printOneMessage(msgInfo) {
        let {
            level,
            lineNo,
            msg,
            advice,
            filePath
        } = msgInfo;
        let type = "";
        if (level === CollectorLevelDef.ERROR) {
            type = "red";
            console.log("    错误消息："[type])
        } else {
            type = "yellow";
            console.log("    提示消息："[type])
        }
        let link = filePath + ":" + lineNo;
        console.log('        ' + linkText(link, link));
        console.log(`        行号：${lineNo}`[type]);
        console.log(`        原因：${msg}`[type]);
        console.log(`        建议：${advice}`[type]);
        console.log();
    }

    printAllMessage() {
        let errorList = [];
        let warningList = [];
        this.msgList.forEach(item => {
            if (item.level === CollectorLevelDef.WARNING) {
                warningList.push(item);
            } else {
                errorList.push(item);
            }
        });
        objArrUniq(errorList).forEach(this.printOneMessage);
        objArrUniq(warningList).forEach(this.printOneMessage);
    }
}

function objArrUniq(arr){
    return [...new Set(arr.map(JSON.stringify))].map(JSON.parse)
}

export {
    ErrorCollector,
    CollectorLevelDef
}