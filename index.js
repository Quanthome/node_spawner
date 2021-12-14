module.exports = runChild;

const { spawn } = require("child_process");

/**
 * RunChild - Spawn a system command.
 * @param {String} cmd - Command line to fork launch (Spawn).
 * @param {Array<String>} argv - Argument to pass to the forked command.
 * @param {Object} options - Options of Spawn (Child Process).
 * @param {Boolean} options.debug - Print logs of Spawn.
 * @param {String} options.cwd - Path of Spawn Bin folder.
 * @returns 
 */
function runChild(cmd, argv, options = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((res, rej) => {
    let child;
    let response = '';

    if (argv && !Array.isArray(argv) && !Object.keys(options).length) {
      options = argv;
      argv = undefined;
    }
    const { debug, ...rest } = options;
    options = debug 
      ? { ...rest, stdio: ['inherit', 'inherit', 'inherit'], signal }
      : { ...rest, signal };
    child = !argv ? spawn(cmd, options) : spawn(cmd, argv, options);

    !debug && child.stdout.on('data', (data) => {
      response = response + data;
    });
    !debug && child.stderr.on('error', (data) => {
      console.error(`ERROR: ${data}`);
      controller.abort()
      rej(data);

    });
    child.on('exit', (code) => {
      if (code) {
        rej(code);
      }
      else res(response);
      controller.abort();
    });
    child.on('error', (data) => {
      if (data) rej(data);
      controller.abort()
    });
    if (!child) rej('Failed to spawn...');
    return child;
  });
}
