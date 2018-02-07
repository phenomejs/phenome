const fs = require('fs');
const path = require('path');
const vueCompiler = require('./compilers/vue.js');
const reactCompiler = require('./compilers/react.js');
const webComponentCompiler = require('./compilers/web-component.js');

let file = './component.js';

if (process.argv.length > 1 && process.argv[2] === '--file') {
  file = path.resolve(process.argv[3]);
}

const filename = path.basename(file);
const dirname = path.dirname(file);

const componentString = fs.readFileSync(file, 'utf8');

vueCompiler(componentString, (code) => {
  fs.writeFileSync(path.resolve(dirname, filename.replace('.js', '.vue.js')), code, 'utf8');
});
reactCompiler(componentString, (code) => {
  fs.writeFileSync(path.resolve(dirname, filename.replace('.js', '.react.js')), code, 'utf8');
});
fs.writeFileSync(path.resolve(dirname, filename.replace('.js', '.web.js')), webComponentCompiler(componentString), 'utf8');

