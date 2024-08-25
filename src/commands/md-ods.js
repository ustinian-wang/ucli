import {copyDirectorySync} from "../utils.js";
import { join } from "path";
import {getCwd, getRoot} from "../utils/fsPath.js";

export function mdOds(){
    let src = join(getRoot(), "./templates/.obsidian");
    let dest = join(getCwd(), "./.obsidian");
    copyDirectorySync(src, dest)
}