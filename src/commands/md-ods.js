import {copyDirectorySync, getCwd, getRoot} from "../utils.js";
import { join } from "path";

export function mdOds(){
    let src = join(getRoot(), "./templates/.obsidian");
    let dest = join(getCwd(), "./.obsidian");
    copyDirectorySync(src, dest)
}