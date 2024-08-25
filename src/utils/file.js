import sharp from "sharp";
import {readdirSync, unlinkSync} from "fs";
import {extname, join} from "path";

/**
 * @description convert png to jpg
 * @param {string} pngPath
 * @param {string} jpgPath
 * @returns {Promise<void>}
 */
export async function convertPngToJpg (pngPath, jpgPath) {
    try {
        await sharp(pngPath)
            .jpeg()
            .toFile(jpgPath);
        console.log(`Converted ${pngPath} to ${jpgPath}`);
    } catch (error) {
        console.error(`Error processing ${pngPath}:`, error);
    }
}

// 函数：删除目录下的所有 PNG 文件
export function  deletePngFiles (directory) {
    try {
        const files = readdirSync(directory);

        for (const file of files) {
            const filePath = join(directory, file);

            if (extname(file) === '.png') {
                unlinkSync(filePath);
                console.log(`Deleted ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting PNG files:', error);
    }
}