import inquirer from "inquirer";
import {copyDirectorySync, getCwd} from "../utils.js";
import {join} from "path";
import {readFileSync, writeFileSync} from "fs";

export async function gitWf(){
    // 使用 inquirer 进行交互
    const options = await getParamsByInquirer()

    const cwd = getCwd();
    const src = join(cwd, "./templates/.github/workflows/");
    const dest = join(cwd, "./.github/workflows/");
    copyDirectorySync(src, dest);

    genWorkflowsFile(options);
}

function getParamsByInquirer(){
    return inquirer.prompt([
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
            message: 'specify shell, like yarn install && yarn build',
            default: 'echo run'
        },
        {
            type: 'input',
            name: 'build',
            message: 'specify build directory',
            default: 'build'
        },
    ]);
}

/**
 *
 * @param {object} params
 * @param {string} params.name actions name
 * @param {string} params.branch branch name
 * @param {string} params.run shell
 * @param {string} params.build build directory
 */
function genWorkflowsFile(params){
    let {
        name,
        branch,
        run,
        build
    } = params
    const actionsYml = join(getCwd(), "./templates/.github/workflows/actions.yml");
    let actionsContent = readFileSync(actionsYml).toString("utf8");
    actionsContent = actionsContent
        .replace("${name}", name)
        .replace("${branch}", branch)
        .replace("${run}", run)
        .replace("${build}", build);
    writeFileSync(actionsYml, actionsContent);
}