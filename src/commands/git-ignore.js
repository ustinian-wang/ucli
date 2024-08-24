import {join} from "path";
import {copyFileToPath, getCwd, getRoot} from "../utils.js";

export function gitIgnore(){
    let src = join(getRoot(), "templates/gitignore")
    let dist = join(getCwd(), ".gitignore")
    copyFileToPath(src, dist);
}