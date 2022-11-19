#!/usr/bin/env node

import { program } from "commander";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import helpOptions from "./lib/core/help.js";
import create from "./lib/core/create.js";
import add from "./lib/core/add.js";

helpOptions();
create();
add();

process.__dirname = resolve(fileURLToPath(import.meta.url), "../");

program.version(
  (
    await readFile(resolve(process.__dirname, "package.json"), {
      encoding: "utf-8",
    })
  ).match(/"version": "(.*?)"/)?.[1]
);

program.parse(process.argv);
