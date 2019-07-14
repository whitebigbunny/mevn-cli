'use strict';

import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import showBanner from 'node-banner';
import path from 'path';

import appData from '../../utils/projectConfig';
import { checkIfConfigFileExists } from '../../utils/messages';
import { validateInput } from '../../utils/validate';

const componentTemplate = [
  '<template >',
  '<center>',
  '<br />',
  '<h1> SFC </h1>',
  '</center>',
  '</template>',
  '',
  '<script >',
  '    export default {',
  '        data() {',
  '            return {',
  '',
  '            }',
  '        },',
  '    } ',
  '</script>',
  '',
  '<style scoped >',
  '',
  '</style>',
];

/**
 * Converts a given string into lower camel case
 *
 * @param {String} str - Text to be converted
 * @returns {String}
 */

const toLowerCamelCase = str =>
  str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();

/**
 * Generates a Vue SFC
 *
 * @returns {Promise<void>}
 */

const generateComponent = async () => {
  await showBanner('Mevn CLI', 'Light speed setup for MEVN stack based apps.');
  checkIfConfigFileExists();

  let { componentName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'componentName',
      message: 'Kindly provide a name for the new component',
      validate: validateInput,
    },
  ]);

  componentName = toLowerCamelCase(componentName);

  const { template } = await appData();
  const componentPath =
    template === 'Nuxt-js' ? 'client/pages' : 'client/src/views';
  process.chdir(componentPath);

  if (fs.existsSync(`${componentName}.vue`)) {
    console.log();
    console.log(chalk.cyan.bold(` Info: ${componentName}.vue already exists`));
    return;
  }

  fs.writeFileSync(`./${componentName}.vue`, componentTemplate.join('\n'));

  // Nuxt-js automatically sets up the routing configurations
  if (template === 'Nuxt-js') return;

  process.chdir(path.join(process.cwd(), '..'));

  let routesConfig = fs
    .readFileSync('./router.js', 'utf8')
    .toString()
    .split('\n');

  const postImportIndex = routesConfig.indexOf(
    routesConfig.find(item => item === ''),
  );

  routesConfig[
    postImportIndex
  ] = `import ${componentName} from "./views/${componentName}.vue";`;

  routesConfig.splice(postImportIndex + 1, 0, '');

  const routesArrayEndsWithIndex = routesConfig.indexOf(
    routesConfig.find(item => item.trim() === ']'),
  );

  routesConfig[routesArrayEndsWithIndex - 1] = '\t},';

  routesConfig.splice(routesArrayEndsWithIndex, 0, '\t{');
  routesConfig.splice(
    routesArrayEndsWithIndex + 1,
    0,
    `\t  path: "/${componentName.toLowerCase()}",`,
  );
  routesConfig.splice(
    routesArrayEndsWithIndex + 2,
    0,
    `\t  name: "${componentName.toLowerCase()}",`,
  );
  routesConfig.splice(
    routesArrayEndsWithIndex + 3,
    0,
    `\t  component: ${componentName}`,
  );
  routesConfig.splice(routesArrayEndsWithIndex + 4, 0, '\t}');

  fs.writeFileSync('./router.js', routesConfig.join('\n'));
  /*
  let routeConfig = {
    path: '/',
    name: '',
    component: '',
  };

  routeConfig.path = `"/${componentName.toLowerCase()}"`;
  routeConfig.name = `"${componentName.toLowerCase()}"`;
  routeConfig.component = `${componentName}`;

  console.log();
  console.log(chalk.green.bold(' File generated'));
  console.log();
  console.log(chalk.cyan.bold(` Couple of things to be done further`));
  console.log();
  console.log(
    chalk.cyan.bold(
      ` Insert the following content into ${chalk.bold.yellow(
        'client/src/router.js',
      )}`,
    ),
  );

  console.log();
  console.log(
    chalk.green.bold(
      ` 1. import ${componentName} from ./views/${componentName} ${chalk.cyan.bold(
        ' on the top.',
      )}`,
    ),
  );

  console.log();
  console.log(chalk.cyan.bold(` 2. Insert this object to the routes array.`));
  console.log();
  console.log(chalk.green.bold(`  {`));

  Object.keys(routeConfig).map(key =>
    console.log(chalk.green.bold(`\t${key}: ${routeConfig[key]}`)),
  );

  console.log();
  console.log(chalk.green.bold(`  }`));
  */
};

module.exports = generateComponent;
