import { program } from "commander";
import { addAction } from "./actions.js";

export default () => {
  program
    .command("add <action> [names...]")
    .description("Add page, router or store.")
    .action(addAction);
};
