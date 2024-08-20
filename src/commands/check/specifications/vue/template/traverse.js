/* eslint-disable no-unused-vars */

function noop(){}

let AstTypeDef = {
    ASTElement: 1,
    ASTText: 3,
    ASTExpression: 2,
}
/**
 *
 * @param ast
 * @param config
 */
export default  function (ast, config={}) {
    let {
        ASTElement= noop(),
        ASTText= noop(),
        ASTExpression= noop(),
        attrsMap= noop()
    } = config;
    eachAllChildren(ast, (node)=>{
        let {
            type
        } = node;

        Object.keys(AstTypeDef).forEach(key=>{
            if(type === AstTypeDef[key]){
                config[key] && config[key](node);
            }
        })
    });
}

function eachAllChildren(node, callback) {
    if(node){
        callback(node);
        if(node.ifConditions){
            node.ifConditions.forEach(child=>{
                callback(child.block);
                if(child.block.children){
                    child.block.children.forEach(child=>{
                        eachAllChildren(child, callback);
                    })
                }

                // eachAllChildren(, callback)
            });
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach(child=>{
                eachAllChildren(child, callback);
            })
        }
    }
}