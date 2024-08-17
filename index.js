#!/usr/bin/env node
import {Command} from 'commander';
import inquirer from 'inquirer';
import {copyDirectorySync, copyFileToPath, getCwd, getPackageVersion} from "./src/utils.js";
import {dirname, join} from "path";
import {readFileSync, writeFileSync} from "fs";

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

        // 使用 inquirer 进行交互
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'specify actions name',
                default: 'deployment'
            },
            {
                type: 'input',
                name: 'branch',
                message: 'specify branch of trigger action',
                default: 'main'
            },
            {
                type: 'input',
                name: 'run',
                message: 'specify shell',
                default: 'yarn install && yarn build'
            },
            {
                type: 'input',
                name: 'build',
                message: 'specify build directory',
                default: 'build'
            },
        ]);

        const cwd = getCwd();
        const src = join(cwd, "./template/github/workflows/");
        const dest = join(cwd, "./github/workflows/");
        copyDirectorySync(src, dest);

        let {
            name,
            branch,
            run,
            build
        } = answers
        const actionsYml = join(__dirname, "./template/github/workflows/actions.yml");
        let actionsContent = readFileSync(actionsYml).toString("utf8");
        actionsContent = actionsContent
            .replace("${name}", name)
            .replace("${branch}", branch)
            .replace("${run}", run)
            .replace("${build}", build);
        writeFileSync(actionsYml, actionsContent);

        // console.log(`${answers.greeting}, ${answers.name}!`);
    });


// 定义一个命令
program.command("git-ignore")
    .description("generate common .gitignore")
    .action(()=>{
        let cwd = getCwd();
        let src = join(cwd, "template/.gitignore")
        let dist = join(cwd, ".gitignore")
        copyFileToPath(src, dist);
    })

// 解析命令行参数
program.parse(process.argv);
