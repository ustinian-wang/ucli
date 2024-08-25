import {join} from "path";
import {copyFileToPath} from "../utils.js";
import {getCwd, getRoot} from "../utils/fsPath.js";

export function gitIgnore(){
    let src = join(getRoot(), "templates/gitignore")
    let dist = join(getCwd(), ".gitignore")
    copyFileToPath(src, dist);
}