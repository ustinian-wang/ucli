import {getPath} from "../utils/fsPath.js";
import {convertPngToJpg} from "../utils/file.js";

/**
 * @description convert png to jpg
 * @param {string} png
 * @returns {Promise<void>}
 */
export async function png2jpg(png){
    png = getPath(png);
    let jpg = png.replace(".png", ".jpg");
    await convertPngToJpg(png, jpg);
}