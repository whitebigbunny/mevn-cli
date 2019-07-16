'use strict';

import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import showBanner from 'node-banner';

import {
  checkIfConfigFileExists,
  checkIfTemplateIsNuxt,
} from '../../utils/messages';
import Spinner from '../../utils/spinner';

let storeFile = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'templates/vuex/store.js'),
  'utf8',
);

/**
 * Adds the respective plugin
 *
 * @param {String} pluginToInstall
 * @returns {Promise<void>}
 */

const installPlugin = async pluginToInstall => {
  const fetchSpinner = new Spinner(`Installing ${pluginToInstall} `);
  fetchSpinner.start();

  try {
    await execa('npm', ['install', '--save', pluginToInstall]);
  } catch (err) {
    fetchSpinner.fail(`Failed to install ${pluginToInstall}`);
    throw err;
  }
  fetchSpinner.succeed(`Successfully installed ${pluginToInstall}`);
};

/**
 * Choose additional plugins to install on the go
 *
 * @returns {Promise<void>}
 */

const addPlugin = async () => {
  await showBanner('Mevn CLI', 'Light speed setup for MEVN stack based apps.');
  checkIfConfigFileExists();

  // Exit for the case of Nuxt-js boilerplate template
  await checkIfTemplateIsNuxt();

  // Available plugins to be installed
  const availablePlugins = ['vee-validate', 'axios', 'vuex', 'vuetify'];

  // Hop in to the client directory and fetch the dependencies from package.json
  process.chdir('client');
  const { dependencies } = JSON.parse(
    fs.readFileSync('./package.json', 'utf8').toString(),
  );

  // Show up only those plugins that aren't installed already
  const installablePlugins = availablePlugins.filter(
    plugin => !dependencies.hasOwnProperty(plugin),
  );

  // Warn the user if all available plugins are installed already
  if (!installablePlugins.length) {
    console.log();
    console.log(chalk.red.bold(' All the plugins are already installed'));
    return;
  }

  const { plugin } = await inquirer.prompt({
    type: 'list',
    name: 'plugin',
    message: 'Which plugin do you want to install?',
    choices: installablePlugins,
  });

  await installPlugin(plugin);

  if (plugin === 'vuex') {
    process.chdir('src');
    // Getting the file content as an array where each line represents the corresponding element.
    let config = fs
      .readFileSync('main.js', 'utf8')
      .toString()
      .split('\n');
    // Creates a new store.js file within the client/src directory.
    fs.writeFile('store.js', storeFile, err => {
      if (err) {
        throw err;
      }
    });

    let storeNotImported = true;
    // Iterates through the array, assuming that there is a blank line between import statements and rest part of the code.
    for (let index = 0; index < config.length; index++) {
      if (config[index] === "import store from './store'") {
        break;
      }

      if (config[index] === '' && storeNotImported) {
        config[index] = "import store from './store'";
        storeNotImported = false;
      }

      // Searches for the line where Vue is getting instantiated
      if (config[index] === 'new Vue({') {
        // This is the first line after the creation of the Vue instance
        let indexWithin = index + 1;
        while (config[indexWithin] !== '})') {
          // Terminating line of creating a Vue instance.
          indexWithin++;
        }
        // Inserting store within the Vue instance
        let tempVal = config[indexWithin - 1];
        config[indexWithin - 1] = '  store,';
        config[indexWithin] = tempVal;
        config[indexWithin + 1] = '})';
      }
    }
    let content = config.join('\n');
    fs.writeFile('main.js', content, err => {
      if (err) {
        throw err;
      }
    });
  } else if (plugin === 'vuetify') {
    // Navigate to the src directory and read contents from main.js
    process.chdir('src');

    let config = fs
      .readFileSync('main.js', 'utf8')
      .toString()
      .split('\n');

    // Import Vuetify and minified css towards the top of the config file
    [
      `import Vuetify from 'vuetify';`,
      `import 'vuetify/dist/vuetify.min.css';`,
    ].forEach((item, i) => config.splice(i + 1, 0, item));

    // Fetch the index after which the respective config should come up
    const preIndex = config.indexOf(
      config.find(line => line.includes('Vue.config.productionTip')),
    );

    // Inserting the respective Vuetify config
    ['Vue.use(Vuetify);', ''].forEach((item, i) =>
      config.splice(preIndex + i, 0, item),
    );

    // Write back the updated config
    fs.writeFileSync('main.js', config.join('\n'));
  }
};

module.exports = addPlugin;
