import { promisify } from "node:util";
import { resolve } from "node:path";

import { program } from "commander";
import download from "download-git-repo";

import repos from "../config/repos.js";
import { commandSpawn } from "../utils/command.js";
import {
  addComponents,
  addStore,
  addView,
  whichFrameRepo,
} from "./../utils/compile.js";

const downLoad = promisify(download);

/**
 * 创建项目
 * @param  {string} projectName
 * @param  {string[]} others
 */
async function createProjectAction(projectName, others) {
  const opts = program.opts();

  // 从远程仓库拉取模版
  try {
    await downLoad(`github:${whichFrameRepo()}`, projectName);
  } catch (error) {
    console.error(error);
  }

  // 按装依赖(npm install)
  const commandStr = process.platform === "win32" ? "npm.cmd" : "npm";
  await commandSpawn(commandStr, ["install"], { cwd: resolve(projectName) });

  // 启动项目(npm run serve)
  commandSpawn(commandStr, ["run", "serve"], { cwd: projectName });
}

/**
 * 为项目创建 view ｜ sotre ｜ router
 * @param  {string} projectName
 * @param  {string[]} others
 */
async function addAction(action, names) {
  switch (action) {
    case "page":
    case "view":
    case "views":
    case "pages":
      addView(names);
      break;
    case "store":
    case "stores":
      addStore(names);
      break;
    case "comp":
    case "components":
      addComponents(names);
      break;
  }
}

export { createProjectAction, addAction };
