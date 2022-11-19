import { renderFile } from "ejs";
import { resolve as rsp } from "node:path";
import { program } from "commander";
import { writeFile, mkdir } from "node:fs/promises";

import repos from "../config/repos.js";
import temps from "../config/templates.js";
import { existsSync } from "node:fs";

// 渲染ejs文件，返回渲染后的数据(promisify)
function renderEJS(path, data) {
  return new Promise((resolve, reject) => {
    renderFile(path, data, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// 确认存储库
function whichFrameRepo() {
  const opts = program.opts();
  return opts.framework in repos ? repos[opts.framework] : repos["default"];
}

// 确认要添加的模版
function whichTemplate(tag) {
  const opts = program.opts();
  const f = temps.find((item) => item === opts.framework) || "vue2";
  switch (tag) {
    case "comp":
      return [[`${f}-component.vue.ejs`, ".vue"]];
    case "store":
      return [
        [`${f}-store.js.ejs`, "index.js"],
        [`${f}-types.js.ejs`, "type.js"],
      ];
    case "view":
      return [
        [`${f}-component.vue.ejs`, ".vue"],
        [`${f}-view.js.ejs`, "router.js"],
      ];
  }
}

// 格式化文件名
function formatVarName(str, restName = "") {
  const temp = { upperCamel: "", kebab: "", snake: "", lowerCamel: "" };

  const arr = str.split("-");
  if (arr.length < 2) {
    temp.upperCamel = UpperFirstLetter(arr[0], restName);
    temp.lowerCamel = arr[0].toLowerCase() + UpperFirstLetter(restName);
    temp.kebab = joinWithLowerCase("-", arr[0], restName);
    temp.snake = joinWithLowerCase("_", arr[0], restName);
  } else {
    temp.upperCamel = UpperFirstLetter(...arr);
    temp.lowerCamel = arr[0].toLowerCase() + UpperFirstLetter(...arr.slice(1));
    temp.kebab = joinWithLowerCase("-", ...arr);
    temp.snake = joinWithLowerCase("_", ...arr);
  }

  function UpperFirstLetter(...strs) {
    let s = "";
    strs.forEach((elem) => {
      s += elem.charAt(0).toUpperCase() + elem.slice(1);
    });
    return s;
  }

  function joinWithLowerCase(tag = "", ...strs) {
    if (strs[strs.length - 1] === "") strs = strs.slice(0, -1);
    return strs
      .reduce((pre, cur) => pre + tag + cur.toLowerCase(), "")
      .slice(1);
  }

  return temp;
}

// 如果目录不存在，创建目录
async function insureDirectory(path) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

/**
 * 添加一个组件
 * @param  {string[]} names
 */
async function addComponents(names, d = "src/components") {
  // 模版路径
  const tempPath = rsp(process.__dirname, "lib/templates");
  // 组件路径
  const dest = rsp(process.cwd(), d);

  // 确保目录存在
  await insureDirectory(dest);

  // 使用哪个模版
  const targetTemplates = whichTemplate("comp");
  // 创建每个组件
  names.forEach((name) => {
    const formatedName = formatVarName(name);
    // 渲染ejs模版
    targetTemplates.forEach(async (template) => {
      const data = await renderEJS(rsp(tempPath, template[0]), formatedName);

      // 用渲染后的数据创建组件
      await writeFile(rsp(dest, formatedName.upperCamel + template[1]), data);
    });
  });
}

/**
 * 添加一个store模块
 * @param  {string[]} names
 */
function addStore(names) {
  // 模版路径
  const tempPath = rsp(process.__dirname, "lib/templates");

  // 文件路径
  const dest = rsp(process.cwd(), "src/store/modules");

  // 使用哪个模版
  const targetTemplates = whichTemplate("store");

  // 创建每个组件
  names.forEach(async (name) => {
    const formatedName = formatVarName(name);
    const finalDest = rsp(dest, formatedName.upperCamel);
    // 确保目录存在
    await insureDirectory(finalDest);
    // 渲染ejs模版
    targetTemplates.forEach(async (template) => {
      const data = await renderEJS(rsp(tempPath, template[0]), formatedName);

      // 用渲染后的数据创建组件
      await writeFile(rsp(finalDest, template[1]), data);
    });
  });
}

/**
 * 添加一个view
 * @param  {string[]} names
 */
function addView(names) {
  // 模版路径
  const tempPath = rsp(process.__dirname, "lib/templates");

  // 文件路径
  const dest = rsp(process.cwd(), "src/views");

  // 使用哪个模版
  const targetTemplates = whichTemplate("view");

  // 创建每个组件
  names.forEach(async (name) => {
    const formatedName = formatVarName(name, "view");
    const finalDest = rsp(dest, formatedName.upperCamel);
    // 确保目录存在
    await insureDirectory(finalDest);
    // 渲染ejs模版
    targetTemplates.forEach(async (template, i) => {
      const data = await renderEJS(rsp(tempPath, template[0]), formatedName);

      // 用渲染后的数据创建组件
      if (i === 0) {
        await writeFile(
          rsp(finalDest, finalDest.upperCamel + template[1]),
          data
        );
      } else {
        await writeFile(rsp(finalDest, template[1]), data);
      }
    });
  });
}

export { addComponents, addStore, addView, whichFrameRepo };
