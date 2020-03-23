'use strict';

import execa from 'execa';
import fs from 'fs';

import exec from '../../utils/exec';
import Spinner from '../../utils/spinner';
import { validateInstallation } from '../../utils/validate';

/**
 * Checks whether the user is logged in on Heroku
 *
 * @returns {Boolean}
 */

const isLoggedIn = async () => {
  try {
    await execa.shell('heroku whoami');
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Deploy the webapp to Heroku
 *
 * @returns {Promise<void>}
 */

const deployToHeroku = async () => {
  validateInstallation('heroku');
  validateInstallation('git help -g');

  const spinner = new Spinner(`We're getting things ready for you`);
  spinner.start();

  // Navigate to the client directory
  process.chdir('client');

  if (!fs.existsSync('.git')) {
    await execa.shell('git init');
  } else {
    const { stdout } = await execa.shell('git status');
    if (stdout.includes('nothing to commit')) {
      spinner.fail('No changes detected!');
      process.exit(1);
    }
  }

  const staticConfig = {
    root: 'dist',
    clean_urls: true,
    routes: {
      '/**': 'index.html',
    },
  };

  if (!fs.existsSync('./static.json')) {
    fs.writeFileSync('./static.json', JSON.stringify(staticConfig, null, 2));
  }

  const starterSource = [
    'const express = require("express");',
    'const serveStatic = require("serve-static");',
    'const path = require("path");',
    'app = express();',
    'app.use(serveStatic(path.join(__dirname, "dist")));',
    'const port = process.env.PORT || 80;',
    'app.listen(port);',
  ];

  spinner.text = 'Installing dependencies';

  await exec(
    'npm install --save express serve-static',
    spinner,
    'Successully installed express and serve-static',
  );

  let pkgJson = JSON.parse(fs.readFileSync('./package.json'));

  pkgJson = {
    ...pkgJson,
    scripts: {
      ...pkgJson.scripts,
      postinstall:
        'if test "$NODE_ENV" = "production" ; then npm run build ; fi',
      start: 'node server.js',
    },
  };

  if (!fs.existsSync('./server.js')) {
    fs.writeFileSync('./server.js', starterSource.join('\n'));
    fs.writeFileSync('./package.json', JSON.stringify(pkgJson));
  }

  await execa.shell('git add .');
  await execa.shell(`git commit -m "Add files"`);

  if (!(await isLoggedIn())) {
    await execa.shell('heroku login', { stdio: 'inherit' });
  }
};

module.exports = deployToHeroku;
