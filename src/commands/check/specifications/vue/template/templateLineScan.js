function existWxExpression(line){
    let res = [
        `wx:`,
    ].some(value => line.includes(value));
    if(res && !line.includes("<!--")){
        return "wx:相关语法不支持";
    }
}


function existTemplateName(line){
    let regExp = /.*(<template name=").*(").*/;
    if(regExp.test(line)){
        return "不允许使用小程序的模板语法，请调整为组件用法";
    }
}

export default  [
    existWxExpression,
    existTemplateName
]