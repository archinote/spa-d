import Being from './src/being.js';

Being.install = function(Vue) {
  Vue.component(Being.name, Being); 
};

export default Being;