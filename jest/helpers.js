'use strict';

import 'babel-polyfill';
import runTest from 'cli-prompts-test';
import execa from 'execa';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve('bin', 'mevn.js');

// sync version
export const run = (args, options = {}) => execa.sync(CLI_PATH, args, options);

// Test cases that require simulating user input
export const runPromptWithAnswers = (args, answers, testPath) => {
  return runTest([CLI_PATH].concat(args), answers, {
    testPath,
    timeout: 2000,
  });
};

// Cleanup
export const rmTempDir = (tempDirPath) => {
  if (fs.existsSync(tempDirPath)) {
    fs.rmdirSync(tempDirPath, { recursive: true });
  }
}

// .mevnrc
export const fetchProjectConfig = (genPath) =>
  JSON.parse(fs.readFileSync(path.join(genPath, '.mevnrc'), 'utf8'));
