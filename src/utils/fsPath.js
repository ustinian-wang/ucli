import {dirname, isAbsolute, join} from "path";
import {fileURLToPath} from "url";

export function getCwd() {
    return process.cwd();
}

export function getRoot() {
    // 获取当前目录的 __dirname
    const __filename = fileURLToPath(import.meta.url);
    return join(dirname(__filename), "../..");
}

/**
 *
 * @param {string} p path
 * @returns {*|string}
 */
export function getPath(p=""){
    return isAbsolute(p) ? p : join(getCwd(), p)
}