import {isStartWithNote} from "../../tools/tools.js";

function existStaticDomain(line){
    if( !isStartWithNote(line) && line.includes("ma.faisys.com")){
        return "不允许写死域名【ma.faisys.com】，请替换成vuex_resRoot 或$RES_ROOT";
    }
}
export {
    existStaticDomain
}