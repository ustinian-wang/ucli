function traverseScss(ast, callbacks){
    let node = ast;

    if(node.type === 'comment_multiline'){
        return;
    }

    if(callbacks[node.type]){
        callbacks[node.type](node);
    }
    if(callbacks.type && node.type){
        callbacks.type(node);
    }

    if(Array.isArray(node.content)){
        node.content.forEach(function(value){
            traverseScss(value, callbacks);
        })
    }
}
export default {
    traverseScss
}