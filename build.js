'use strict';

const packager = require('electron-packager');
const assign = require('object-assign');
const pkg = require('./package');
const devDependencies = Object.keys(pkg.devDependencies);

let required = {
  dir: './',
  name: 'ImageMinifier',
  version: '0.33.8'
};

let optional = {
  'app-bundle-id': 'net.1000ch.ImageMinifier',
  'app-version': pkg.version,
  overwrite: true,
  ignore: [
    '/fixtures($|/)',
    '/release($|/)',
    '/src($|/)'
  ].concat(devDependencies.map(name => '/node_modules/' + name + '($|/)'))
};

const archs = ['ia32', 'x64'];
const platforms = ['darwin'];//['win32', 'linux', 'darwin'];

for (let platform of platforms) {
  for (let arch of archs) {
    pack(platform, arch);
  }
}

function pack(platform, arch) {
  // there is no darwin ia32 electron
  if (platform === 'darwin' && arch === 'ia32') {
    return;
  }

  packager(assign({}, required, optional, {
    platform: platform,
    arch: arch,
    out: `release`
  }), () => {
    console.log(`Packaging ${platform}-${arch} is finished`);
  });
}
