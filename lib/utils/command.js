import { spawn } from "node:child_process";

export function commandSpawn(command, args, options) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
    childProcess.on("close", () => {
      resolve();
    });
  });
}
