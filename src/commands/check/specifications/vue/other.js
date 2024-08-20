function existWxsFile (line){
    if(line.includes(`lang="wxs"`)){
        return "不允许使用wxs语法，自行改成computed属性";
    }
}

export {
    existWxsFile
}