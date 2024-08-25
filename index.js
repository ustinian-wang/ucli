#!/usr/bin/env node
import {Command} from 'commander';
import {getPackageVersion} from "./src/utils.js";
import {weRobots} from "./src/commands/we-robots.js";
import {gitWf} from "./src/commands/git-wf.js";
import {checkCommit} from "./src/commands/check/index.js";
import { execSync } from "child_process";
import {mdOds} from "./src/commands/md-ods.js";
import {gitIgnore} from "./src/commands/git-ignore.js";
import {mdPng2jpg} from "./src/commands/md-png2jpg.js";
import {png2jpg} from "./src/commands/png2jpg.js";
import {generateImage, img2base64url} from "./src/utils/file.js";
import {getCwd, getPath} from "./src/utils/fsPath.js";
import {join} from "path";
import {readFileSync} from "fs";

const version = getPackageVersion();

const program = new Command();

// 使用从 package.json 中读取的版本号
program
    .version(version)
    .description('A CLI tool using inquirer and commander');

// 定义一个命令
program
    .command('git-wf')
    .description('generate workflows of git pages')
    .action(gitWf);


// 定义一个命令
program.command("git-ignore")
    .description("generate common .gitignore")
    .action(gitIgnore)


// 定义一个命令
program.command("git-check")
    .description("check git commit")
    .argument('<all>', 'check all file')
    .action(async function(all){
        let gitContent = execSync("git status -s", { encoding: "utf-8" }).toString("utf-8");
        checkCommit(all==='true', gitContent)
    })


program
    .command("we-robots")
    .description("send message to WeCom")
    .argument('<url>', 'robot webhook url')
    .argument('<content>', 'message content')
    .argument('<user>', 'notice user')
    .action(weRobots)

program
    .command("md-ods")
    .description("add .obsidian into current dir for markdown writing")
    .action(mdOds)

program
    .command("md-png2jpg")
    .description("convert png to jpg in docs/*md and then delete png files")
    .action(mdPng2jpg)

program
    .command("png2jpg")
    .argument('<file>', 'file path; like ./a.png')
    .description("convert png to jpg")
    .action(png2jpg)

program
    .command("fs-g")
    .description("generate random file with specified extension")
    .option('-w, --width <width>', 'Specify the width(800)', parseInt, 800)  // 带有默认值的选项
    .option('-h, --height <height>', 'Specify the height(800)', parseInt, 800)  // 带有默认值的选项
    .option('-t, --type <type>', 'Specify file ext(png)', "png")  // 带有默认值的选项，使用解析函数
    .option('-n, --name <name>', 'Specify name(output)', "output")  // 带有默认值的选项，使用解析函数
    .description("convert png to jpg")
    .action(async(options)=>{
        let {
            width, height,
            type,
            name,
        } = options;

        let outputPath = getPath(join(getCwd(), name));
        outputPath+= "."+type;
        // 调用函数
        generateImage(parseInt(width), parseInt(height), type, outputPath);
})

program.command("img2base64url")
    .description("convert img to base64")
    .argument('<file>', 'file path; like ./a.png')
    .action((file)=>{
        file = getPath(file);
        let base64 = img2base64url(file)
        console.log(base64);
    })

// 解析命令行参数
program.parse(process.argv);