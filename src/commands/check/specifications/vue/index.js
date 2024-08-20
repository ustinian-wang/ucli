import compilerSFC from "@vue/compiler-sfc";
// import { javascriptWarningRules, javascriptErrorRules } from "../javascript/javascriptScan.js";
import babelParser from "@babel/parser";
import templateCompiler from "vue-template-compiler";
import traverse from "@babel/traverse";
import { ErrorCollector, CollectorLevelDef } from "../../tools/ErrorCollector.js";
import {readFileSync} from "fs";
import vueScriptRules from "./script.js";
import vueTemplateRules from "./template/template.js";
import vueTemplateTraverse from "./template/traverse.js";
import { parseFileToContentArr, createTraverseOptions } from "../../tools/other.js";
import { executeCheck } from "../../tools/task.js";
import { existWxsFile } from "./other.js";
import templateLineScan from "./template/templateLineScan.js";
import javascriptRules from "../javascript/common.js";
import {javascriptErrorRules, javascriptWarningRules} from "../javascript/javascriptScan.js";


function checkVueAst (filePath){
    let errorCollector = ErrorCollector.getInstance();
    let content = readFileSync(filePath) + "";
    let res = compilerSFC.parse(content);
    let {
        template,
        script,
        styles
    } = res.descriptor;
    let templateAllTagNameList = [];
    let templateBindingMethods = [];
    if (template) {
        let tplCompiler = templateCompiler.compile(template.content,{
            outputSourceRange: true
        });
        let tplAst = tplCompiler.ast;


        let options = createTraverseOptions([
            ...vueTemplateRules
        ], {
            filePath,
            errorCollector,
            content: template.content,
            context: {
                templateBindingMethods,
                templateAllTagNameList
            }
        });

        vueTemplateTraverse(tplAst, options);


        if (script) {

            let lastTaskList = [];
            let registerFinalTask = (task)=>{
                lastTaskList.push(task);
            };
            let executeLastTasks = ()=>{
                lastTaskList.forEach(task=>task());
            }

            let options = createTraverseOptions(
                [
                    ...vueScriptRules,
                    ...javascriptRules,
                ], {
                    filePath,
                    errorCollector,
                    vueTemplateContent: template.content,
                    context:{
                        templateBindingMethods,
                        templateAllTagNameList,
                        registerFinalTask
                    }
                })
            ;
            let result = babelParser.parse(script.content, {
                sourceType: "module"
            });
            traverse.default(result, options);
            executeLastTasks();
        } else {
            errorCollector.add({
                lineNo: 0, msg: "缺少script标签",
                advice:"请初始化script标签，例如<script>export default {}</script>",
                filePath: filePath
            })
        }

    }

    styles.forEach(style => {
        if (style.content.includes(".scss") && style.lang !== 'scss') {
            errorCollector.add({
                lineNo: style.loc.start.line, msg: "请为style标签补上lang='scss'属性",

                filePath: filePath
            })
        }
    })

    return errorCollector;
}

export default  function(filePath){
    let errorCollector = checkVueAst(filePath);

    let {contentArr} = parseFileToContentArr(filePath);
    let StatusDef = {
        TEMPLATE: 1,
        SCRIPT: 2,
        OTHER: 3
    };
    let status = StatusDef.TEMPLATE;
    let templateTasks = templateLineScan;
    let scriptTasks = [
        ...javascriptErrorRules
    ];

    let otherTasks = {
        existWxsFile
    };


    contentArr.forEach((line, index) => {

        if(line.startsWith("<template")){
            status = StatusDef.TEMPLATE
        }else if(line.startsWith("<script")){
            status = StatusDef.SCRIPT
        }else if(line.startsWith("</template>") || line.startsWith("</script>")){
            status = StatusDef.OTHER
        }

        let nowTaskList = [];
        let warningTaskList = []
        if (status === StatusDef.TEMPLATE) {
            nowTaskList = templateTasks;
        } else if(status === StatusDef.SCRIPT) {
            nowTaskList = scriptTasks;
            warningTaskList = [
                ...javascriptWarningRules
            ]
        } else if(status === StatusDef.OTHER){
            nowTaskList = otherTasks;
        }

        if(nowTaskList.length > 0){
            executeCheck(nowTaskList, {
                filePath,
                line,
                index,
                errorCollector
            })
        }

        if(warningTaskList.length>0){
            executeCheck(nowTaskList, {
                filePath,
                line,
                index,
                errorCollector
            }, CollectorLevelDef.WARNING);
        }
    });
    return errorCollector;
}