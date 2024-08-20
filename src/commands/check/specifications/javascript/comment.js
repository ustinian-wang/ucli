/**
 *
 * @param {{
 *     filePath: string,
 *     errorCollector: ErrorCollector
 * }} options
 * @returns {{}}
 */
function functionWithComments(options){
    let {
        filePath,
        errorCollector
    } = options
    return {
        ExportNamedDeclaration({node:item}){
            if(item.declaration){
                if(item.declaration.type === 'FunctionDeclaration'){
                    if(!item.leadingComments){
                        errorCollector.add({
                            lineNo: item.loc.start.line, msg: `函数【${item.declaration.id.name}】缺少注释`,
                            filePath,
                            advice: "请加上注释"
                        })
                    }
                }else if(item.declaration.type==='VariableDeclaration'){
                    let {
                        type
                    } = item.declaration.declarations[0]?.init || {};
                    if(['FunctionExpression', 'ArrowFunctionExpression'].includes(type)){
                        if(!item.leadingComments){
                            errorCollector.add({
                                lineNo: item.loc.start.line, msg: `函数【${item.declaration.declarations[0].id.name}】需要添加注释`,
                                filePath,
                                advice: "添加注释，注释格式参考jsdocs，详见：https://jsdoc.app/"
                            })
                        }
                    }
                }
            }
        }
    }
}

export {
    functionWithComments
};