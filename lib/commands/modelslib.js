const fs = require('fs');
const shell = require('shelljs');
//const inquirer = require('inquirer');
const chalk = require('chalk');
const os = require('os');

let userSchema = fs.readFileSync(__dirname + '/files/models/user_schema.js', 'utf8');

let modelsfunction = () => {

  let data = fs.readFileSync('./mevn.json', 'utf8');
  let appname = JSON.parse(data);
  shell.cd(appname.project_name);
  shell.cd('server');
  shell.cd('models');

	if(os.type() === 'Linux' || os.type() === 'darwin'){
	 shell.exec('rm default.js');
  } else{
	shell.exec('del default.js');
  }

  fs.writeFile('./user_schema.js', userSchema, (err) => {
    if (err) {
      throw err;
    } else {
      console.log(chalk.yellow('File created...!'));
    }
  })


}

exports.modelsfunction = modelsfunction;
