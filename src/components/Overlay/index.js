import Overlay from './src/overlay.js';

Overlay.install = function(Vue) {
  Vue.component(Overlay.name, Overlay); 
};

export default Overlay;