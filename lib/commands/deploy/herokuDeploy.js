'use strict';

const inquirer = require('inquirer');
const os = require('os');
const shell = require('shelljs');

const { appData } = require('../../utils/projectConfig');
const { configFileExists } = require('../../utils/messages');
const { showBanner } = require('../../external/banner');
const { validateInstallation } = require('../../utils/validations');

exports.deploy = () => {
  showBanner();

  setTimeout(async () => {
    configFileExists();
    validateInstallation('heroku');

    let templateIsNuxt;
    await appData().
    then((data) => {
      templateIsNuxt = data.template === 'Nuxt-js';
    });

    let serverPath = templateIsNuxt ? `/${process.cwd()}/server` : '../server';
    let moveCmd = os.type() === 'Windows_NT' ? 'move' : 'mv';


    if (!templateIsNuxt) {
        shell.cd('client');
    }

    const buildCommands = [
      'npm install',
      'npm run build',
      `${moveCmd} /${process.cwd()}/dist ${serverPath}`,
      `sudo docker login --username=_ --password=$(heroku auth:token) registry.heroku.com`,
    ];
      await Promise.all(buildCommands.map(cmd => {
        shell.exec(cmd, {silent: true});
      }))
      .catch((err) => {
        throw err;
      })
      shell.echo('\n Creating a heroku app');
      await shell.exec('heroku create');

      inquirer.prompt([{
        name: 'appName',
        type: 'input',
        message: 'Please enter the name of heroku app(url)',
      }])
      .then(async (userInput) => {
        try {
          await shell.exec(`sudo heroku container:push web -a ${userInput.appName}`);
          await shell.exec(`sudo heroku container:release web -a ${userInput.appName}`);
          await shell.exec(`heroku open -a ${appName}`);
       } catch (err) {
         throw err;
       }
      })
  }, 100);
  ;
};
