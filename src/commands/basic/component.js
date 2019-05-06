'use strict';

import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

import { appData } from '../../utils/projectConfig';
import { checkIfConfigFileExists } from '../../utils/messages';
import { deferExec } from '../../utils/defer';
import { showBanner } from '../../external/banner';

let componentTemplate = [
  '<template >',
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

const toLowerCamelCase = str => {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
};

const validateInput = componentName => {
  if (componentName === '') {
    console.log('Kindly provide a name');
    return false;
  } else {
    return true;
  }
};

exports.generateComponent = async () => {
  showBanner();

  await deferExec(100);
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
    template === 'Nuxt-js' ? 'pages' : 'client/src/components';
  process.chdir(componentPath);

  if (fs.existsSync(`${componentName}.vue`)) {
    console.log(
      chalk.cyan.bold(`\n Info: ${componentName}.vue already exists`),
    );
    process.exit(1);
  }

  fs.writeFileSync(`./${componentName}.vue`, componentTemplate.join('\n'));

  // Nuxt-js automatically sets up the routing configurations
  if (template === 'Nuxt-js') process.exit(1);

  let routeConfig = {
    path: '/',
    name: '',
    component: '',
  };

  routeConfig.path = `/${componentName.toLowerCase()}`;
  routeConfig.name = componentName;
  routeConfig.component = `${componentName}`;

  console.log(chalk.green.bold('\n File generated'));
  console.log(chalk.cyan.bold(`\n Couple of things to be done further`));
  console.log(
    chalk.cyan.bold(
      `\n Insert the following content into ${chalk.bold.yellow(
        'client/src/components/router/index.js',
      )}`,
    ),
  );
  console.log(
    chalk.green.bold(
      `\n 1. import ${componentName} from @/components/${componentName} ${chalk.cyan.bold(
        ' on the top.',
      )}`,
    ),
  );
  console.log(chalk.cyan.bold(`\n 2. Insert this object to the routes array.`));
  console.log(chalk.green.bold(`\n  {`));
  Object.keys(routeConfig).map(key =>
    console.log(chalk.green.bold(`\t${key}: ${routeConfig[key]}`)),
  );
  console.log(chalk.green.bold(`\n  }`));
};
