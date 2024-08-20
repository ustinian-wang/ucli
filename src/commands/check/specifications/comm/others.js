function existEmptyFile(options) {
    let {
        filePath,
        content,
        errorCollector
    } = options;

    if(content.trim().length === 0) {
        errorCollector.add({
            filePath,
            lineNo: 0,
            msg: '不允许提交空文件',
            advice: "请删除文件"
        })
    }
}

export default [
    existEmptyFile
]