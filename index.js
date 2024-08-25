#!/usr/bin/env node
import {Command} from 'commander';
import {getCwd, getPackageVersion} from "./src/utils.js";
import {join, isAbsolute} from "path";
import {weRobots} from "./src/commands/we-robots.js";
import {gitWf} from "./src/commands/git-wf.js";
import {checkCommit} from "./src/commands/check/index.js";
import { execSync } from "child_process";
import {mdOds} from "./src/commands/md-ods.js";
import {gitIgnore} from "./src/commands/git-ignore.js";
import {convertPngToJpg, png2jpg} from "./src/commands/png2jpg.js";

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
    .action(async function(url, content, user){
    await weRobots(url, content, user)
})

program
    .command("md-ods")
    .description("add .obsidian into current dir for markdown writing")
    .action(mdOds)

program
    .command("md-png2jpg")
    .description("convert png to jpg in docs/*md and then delete png files")
    .action(async()=>{
        let cwd = getCwd()
        await png2jpg(join(cwd, "docs"));
    })

program
    .command("png2jpg")
    .argument('<file>', 'file path; like ./a.png')
    .description("convert png to jpg")
    .action(async(file)=>{
        let cwd = getCwd()
        let pngFilePath = isAbsolute(file) ? file : join(cwd, file)
        let jpgFilePath = pngFilePath.replace(".png", ".jpg")
        await convertPngToJpg(pngFilePath, jpgFilePath);
    })


// 定义一个命令
program
    .command('test')
    .action(async () => {
        // // 使用 inquirer 进行交互
        // const cwd = getCwd();
        // const src = join(cwd, "./templates/.github/workflows/");
        // const dest = join(cwd, "./.github/workflows/");
        // copyDirectorySync(src, dest);
        //
        // let {
        //     name,
        //     branch,
        //     run,
        //     build
        // } = {
        //     name: "ucli",
        //     branch: "main",
        //     run: "echo test",
        //     build: "/"
        // };
        // const actionsYml = join(getCwd(), "./templates/.github/workflows/actions.yml");
        // let actionsContent = readFileSync(actionsYml).toString("utf8");
        // actionsContent = actionsContent
        //     .replace("${name}", name)
        //     .replace("${branch}", branch)
        //     .replace("${run}", run)
        //     .replace("${build}", build);
        // writeFileSync(actionsYml, actionsContent);

        // console.log(`${answers.greeting}, ${answers.name}!`);
    });


// 解析命令行参数
program.parse(process.argv);