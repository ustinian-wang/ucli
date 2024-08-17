import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, readdirSync, existsSync, copyFileSync } from "fs";

export function getPackageVersion() {
    // 获取当前目录的 __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // 构造 package.json 文件路径
    const packageJsonPath = new URL('../package.json', `file://${__dirname}`);

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

    // 复制文件到目标路径
    copyFileSync(srcFile, destFilePath);

    console.log(`File copied to ${destFilePath}`);
}

export function getCwd(){
    return process.cwd();
}