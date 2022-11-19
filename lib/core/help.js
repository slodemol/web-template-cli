import { program } from "commander";

export default () => {
  program
    .option("-V, --version", "package version")
    .option("-d, --dest <dest>", "destination folder")
    .option(
      "-f, --framework [framework]",
      "web components [vue/react/angular...]"
    );
};
