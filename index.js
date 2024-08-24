#!/usr/bin/env node
import {Command} from 'commander';
import {copyFileToPath, getCwd, getPackageVersion} from "./src/utils.js";
import {dirname, join} from "path";
import {weRobots} from "./src/commands/we-robots.js";
import {gitWf} from "./src/commands/git-wf.js";
import {checkCommit} from "./src/commands/check/index.js";
import { execSync } from "child_process";
import {fileURLToPath} from "url";
import {mdOds} from "./src/commands/md-ods.js";

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
    .action(async () => {
        await gitWf()
    });


// 定义一个命令
program.command("git-ignore")
    .description("generate common .gitignore")
    .action(()=>{
        let cwd = getCwd();
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        let src = join(__dirname, "templates/.gitignore")
        let dist = join(getCwd(), ".gitignore")
        copyFileToPath(src, dist);
    })


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