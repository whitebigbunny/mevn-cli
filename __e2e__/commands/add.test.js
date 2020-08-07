import { runPromptWithAnswers, DOWN, ENTER, SPACE } from '../../jest/helpers';

import fs from 'fs';
import path from 'path';

// Create a temp directory
const tempDirPath = path.join(__dirname, 'add-cmd');
fs.mkdirSync(tempDirPath);

const genPath = path.join(tempDirPath, 'my-app');

// The client directory
const clientPath = path.join(genPath, 'client');

// The server directory
const serverPath = path.join(genPath, 'server');

// Deletes temporary directory
const rmTmpDir = () => fs.rmdirSync(tempDirPath, { recursive: true });

describe('mevn add', () => {
  afterAll(() => rmTmpDir());

  it('installs Nuxt.js modules if no args were passed in', async () => {
    await runPromptWithAnswers(
      ['init', 'my-app'],
      [
        `${DOWN}${DOWN}${DOWN}${ENTER}`, // Choose Nuxt.js
        `${SPACE}${ENTER}`, // Opt for @nuxtjs/axios module
        `${DOWN}${ENTER}`, // Choose spa as the rendering mode
        `${DOWN}${ENTER}`, // Choose static as the deploy target
        `Y${ENTER}`, // Requires server directory
      ],
      tempDirPath,
    );

    // Invoke the add command
    await runPromptWithAnswers(
      ['add'],
      [ENTER, `${DOWN}${SPACE}${DOWN}${DOWN}${SPACE}${ENTER}`], // Choose @nuxtjs/pwa module and the vuex addon
      genPath,
    );

    // nuxt.config.js
    const nuxtConfig = require(path.join(clientPath, 'nuxt.config.js')).default;
    expect(nuxtConfig.buildModules).toContain('@nuxtjs/pwa');
    expect(nuxtConfig.modules).toContain('@nuxtjs/axios');

    // .mevnrc
    const projectConfig = JSON.parse(
      fs.readFileSync(path.join(genPath, '.mevnrc')),
    );
    expect(projectConfig.modules).toContain('pwa');
    expect(projectConfig.modules).toContain('vuex');
    expect(projectConfig.modules).toContain('axios');

    // package.json
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(clientPath, 'package.json')),
    );
    expect(pkgJson.devDependencies['@nuxtjs/pwa']).toBeTruthy();

    // @nuxtjs/axios should be installed via mevn serve since it was opted at first
    expect(pkgJson.devDependencies['@nuxtjs/axios']).not.toBeTruthy();

    // vuex-store
    expect(
      fs.readFileSync(path.join(clientPath, 'store', 'index.js')),
    ).toBeTruthy();
  });

  it('installs the respective dependency passed as an arg', async () => {
    await runPromptWithAnswers(['add', 'v-tooltip'], [ENTER], genPath);

    // package.json
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(clientPath, 'package.json')),
    );
    expect(pkgJson.dependencies['v-tooltip']).toBeTruthy();
  });

  it('installs the respective devDependency passed as an arg for the server directory', async () => {
    await runPromptWithAnswers(
      ['add', 'husky', '--dev'],
      [`${DOWN}${ENTER}`],
      genPath,
    );

    // package.json
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(serverPath, 'package.json')),
    );
    expect(pkgJson.devDependencies['husky']).toBeTruthy();
  });

  it('shows a warning if no args were passed in for server directory', async () => {
    const stdout = await runPromptWithAnswers(
      ['add'],
      [`${DOWN}${ENTER}`], // opts for server directory
      genPath,
    );
    expect(stdout).toContain(' Please specify the dependencies to install');
  });
});