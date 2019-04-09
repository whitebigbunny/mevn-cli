#!/usr/bin/env node

'use strict';

// Require Modules
import * as program from 'commander';
import chalk from 'chalk';

// Initialize Command variables
const { versionInfo } = require('./commands/basic/version');
const { initializeProject } = require('./commands/basic/init');
const { generateFile } = require('./commands/basic/generate');
const { createComponent } = require('./commands/basic/component');
const { asyncRender } = require('./commands/basic/codesplit');
const { addPackage } = require('./commands/basic/package');
const { setupProject } = require('./commands/serve/setup');
const { dockerize } = require('./commands/deploy/docker');
const { createRepo } = require('./commands/deploy/gitRepo');
const { deploy } = require('./commands/deploy/herokuDeploy');

// Define Commands in CLI TOOL

program
  .command('version')
  .description('Outputs version along with local development environment information')
  .action(versionInfo);

program
  .command('init <appname>')
  .description('To init the project')
  .action(initializeProject);

program
  .command('create:component <componentname>')
  .description('To create component-file')
  .action(createComponent);

program
  .command('codesplit <componentname>')
  .description('To code split the required component')
  .action(asyncRender);

program
  .command('generate')
  .description('To generate model, route, controller and DB config files')
  .action(generateFile);

program
  .command('add:package')
  .description('To add a new package to the project')
  .action(addPackage);

program
  .command('serve')
  .description('To serve client/server')
  .action(setupProject);

program
  .command('dockerize')
  .description('To dockerize the app')
  .action(dockerize);

program
  .command('deploy')
  .description('To deploy the app to Heroku')
  .action(deploy);

program
  .command('create:git-repo')
  .description('To create a GitHub repository and fire the first commit')
  .action(createRepo);

program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp();
    console.log(`  ` + chalk.red(`\n  Unknown command ${chalk.yellow(cmd)}.`));
    console.log();
});

program.parse(process.argv);

// Shows help if just mevn-cli is fired in

if(!program.args.length){
  program.help();
}
