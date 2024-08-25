import {existsSync, readdirSync, readFileSync, writeFileSync} from "fs";
import {join, extname} from "path";
import {convertPngToJpg, deletePngFiles} from "../utils/file.js";
import {getCwd} from "../utils/fsPath.js";
// 函数：更新 Markdown 文件
export async function mdPng2jpg () {
    let directory = join(getCwd(), "docs");
    try {
        const files = readdirSync(directory);

        for (const file of files) {
            const filePath = join(directory, file);

            if (extname(file) === '.md') {
                let content = readFileSync(filePath, 'utf-8');

                const pngImages = [...content.matchAll(/!\[.*?\]\((.*?\.png)\)/g)];

                for (const match of pngImages) {
                    const pngPath = match[1];
                    const jpgPath = pngPath.replace(/\.png$/, '.jpg');
                    const fullPngPath = join(directory, pngPath);
                    const fullJpgPath = join(directory, jpgPath);

                    // 转换 PNG 为 JPG
                    if (existsSync(fullPngPath)) {
                        await convertPngToJpg(fullPngPath, fullJpgPath);
                        // 替换 Markdown 内容中的 PNG 路径为 JPG 路径
                        content = content.replace(pngPath, jpgPath);
                    } else {
                        console.warn(`PNG file not found: ${fullPngPath}`);
                    }
                }

                // 写回更新后的 Markdown 文件
                writeFileSync(filePath, content, 'utf-8');
                console.log(`Updated markdown file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }

    deletePngFiles(directory);
}
