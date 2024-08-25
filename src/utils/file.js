import sharp from "sharp";
import {readdirSync, unlinkSync, createWriteStream, writeFileSync} from "fs";
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



import { createCanvas } from 'canvas';
import JPEG from 'jpeg-js';
import GIFEncoder from 'gifencoder';

// 生成随机颜色
const getRandomColor = () => `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;

// 生成 PNG 图片
const generatePNG = (canvas, filePath) => {
    const out = createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
        console.log(`PNG image created: ${filePath}`);
    });
};

// 生成 JPEG 图片
const generateJPEG = (canvas, filePath) => {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const jpegData = JPEG.encode(imgData, 80); // 80 is the quality (0-100)
    writeFileSync(filePath, jpegData.data);
    console.log(`JPEG image created: ${filePath}`);
};

// 生成 GIF 图片
const generateGIF = (canvas, filePath) => {
    const encoder = new GIFEncoder(canvas.width, canvas.height);
// stream the results as they are available into myanimated.gif
    encoder.createReadStream().pipe(createWriteStream(filePath));

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

// use node-canvas
    const ctx = canvas.getContext('2d');

// red rectangle
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    encoder.addFrame(ctx);

// green rectangle
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    encoder.addFrame(ctx);

// blue rectangle
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    encoder.addFrame(ctx);

    encoder.finish();
    console.log(`GIF image created: ${filePath}`);
};

/**
 * @description 生成指定格式的图片
* @param {number} [width=800]
* @param {number} [height=800]
* @param {string} [format='png']
 * @param {string} [filePath='output.png']
 */
export const generateImage = (width=800, height=800, format='png', filePath='output.png') => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(0, 0, width, height);

    switch (format.toLowerCase()) {
        case 'png':
            generatePNG(canvas, filePath);
            break;
        case 'jpeg':
            generateJPEG(canvas, filePath);
            break;
        case 'gif':
            generateGIF(canvas, filePath);
            break;
        default:
            console.log('Unsupported format. Please use png, jpeg, or gif.');
    }
};

// // 解析命令行参数
// const [,, width = '800', height = '600', format = 'png', outputPath = 'output.png'] = process.argv;
//
// // 调用函数
// generateImage(parseInt(width), parseInt(height), format, outputPath);