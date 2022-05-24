module.exports = runChild;

const { spawn, SpawnOptionsWithoutStdio } = require('child_process');

/**
 * RunChild - Spawn a system command.
 * @param {String} cmd - Command line to fork launch (Spawn).
 * @param {Array<String>} argv - Argument to pass to the forked command.
 * @param {SpawnOptionsWithoutStdio} options - Options of Spawn (Child Process).
 * @returns
 */
function runChild(cmd, argv, options = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((res, rej) => {
    let child;
    let response = '';
    let error = '';

    if (argv && !Array.isArray(argv) && !Object.keys(options).length) {
      options = argv;
      argv = undefined;
    }
    options = { ...options, signal };
    child = !argv ? spawn(cmd, options) : spawn(cmd, argv, options);

    child.stdout.on('data', (data) => (response = response + data));
    child.stderr.on('data', (data) => (error = error + data));

    child.on('exit', (code) => {
      if (code) {
        if (error) rej(new Error(error));
        else rej(new Error(`Exit with code: ${code}`));
      } else res(response);
      controller.abort();
    });
    child.on('error', (data) => {
      if (error || data) rej(error || data);
      controller.abort();
    });
    if (!child) rej('Failed to spawn...');
  });
}
