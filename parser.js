const fs = require('fs');
const vueCompiler = require('./compilers/vue.js');
const reactCompiler = require('./compilers/react.js');
const webComponentCompiler = require('./compilers/web-component.js');

const componentString = fs.readFileSync('./component.js', 'utf8');

fs.writeFileSync('./component.vue.js', vueCompiler(componentString), 'utf8');
fs.writeFileSync('./component.react.js', reactCompiler(componentString), 'utf8');
fs.writeFileSync('./component.web.js', webComponentCompiler(componentString), 'utf8');

