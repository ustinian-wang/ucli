import {dirname, join} from 'path';
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync} from "fs";
import {getRoot} from "./utils/fsPath.js";

export function getPackageVersion() {
    // 获取当前目录的 __dirname

    // 构造 package.json 文件路径
    const packageJsonPath = join(getRoot(), "./package.json");

    try {
        // 读取和解析 package.json
        const data = readFileSync(packageJsonPath, 'utf8');
        return JSON.parse(data).version;
    } catch (error) {
        console.error('Error reading package.json:', error);
        throw error;
    }
}
export function copyDirectorySync(src, dest) {
    // 确保目标目录存在
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    // 获取源目录的所有条目
    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            // 如果是目录，递归调用
            copyDirectorySync(srcPath, destPath);
        } else if (entry.isFile()) {
            // 如果是文件，复制文件
            copyFileSync(srcPath, destPath);
        }
    }
}

export function copyFileToPath(srcFile, destFilePath) {
    // 获取目标文件的目录
    const destDir = dirname(destFilePath);

    // 确保目标目录存在
    if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
    }
    copyFileSync(srcFile, destFilePath);
}

/**
 * @param dir
 * @param callBack
 */
export function travelFile(dir, callBack) {
    readdirSync(dir).forEach((file) => {
        let pathname = join(dir, file);
        if (statSync(pathname).isDirectory()) {
            travelFile(pathname, callBack);
        } else {
            callBack(pathname);
        }
    });
}