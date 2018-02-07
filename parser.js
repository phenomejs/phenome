const fs = require('fs');
const vueCompiler = require('./compilers/vue.js');
const reactCompiler = require('./compilers/react.js');
const webComponentCompiler = require('./compilers/web-component.js');

const componentString = fs.readFileSync('./component.js', 'utf8');

vueCompiler(componentString, (code) => {
  fs.writeFileSync('./component.vue.js', code, 'utf8');
});
reactCompiler(componentString, (code) => {
  fs.writeFileSync('./component.react.js', code, 'utf8');
});

// fs.writeFileSync('./component.web.js', webComponentCompiler(componentString), 'utf8');

