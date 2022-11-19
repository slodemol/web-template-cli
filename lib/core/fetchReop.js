import { program } from "commander";
import { createProjectAction } from "./actions.js";

export default () => {
  program
    .command("create <project-name> [others...]")
    .description("Create a project using a template.")
    .action(createProjectAction);
};
