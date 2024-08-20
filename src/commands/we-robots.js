import axios from "axios";

/**
 * @param {string} webhookUrl
 * @param {string} content
 * @param {string} [user=""]
 * @example
 * ucli we-robots https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=3dfe1462-813c-4c48-845d-8e5bf7cfd9eb test jser
 * @returns {Promise<void>}
 */
export async function weRobots(webhookUrl="", content="", user=""){
    // let config = getConfig();
    // if(isEmptyObj(config)){
    //     //todo 请配置密钥
    //     return;
    // }

    // text = text
    //     ? text
    //     : `${projectName}小程序端已更新版本：${this.version}`;
    //
    // // let author = gitContent.match(/Author:\s(\w+)\s</)[1];
    // let author = execSync(`${gitCommand} config --global user.name`, {
    //     encoding: 'utf-8',
    // })
    //     .toString('utf-8')
    //     .trim();
    //
    // const envName = this.mode === 'dev' ? '本地' : 'dep';
    // const requestData = {
    //     msgtype: 'markdown',
    //     markdown: {
    //         content: `<@${author}> 【${envName}环境】${text}${gitContentText}`,
    //     },
    // };

    let atUser = user ? `<@${user}> ` : " ";
    // 消息内容，包括 @ 用户
    const message = {
        msgtype: 'markdown',
        markdown: {
            content: `${atUser}${content}`,
        }
    };

    // 发送请求
    await axios.post(webhookUrl, message).then(function (response) {/*console.log("jser response ",response);*/}, function (error) {
        console.log("jser error: " + error)
    });
}