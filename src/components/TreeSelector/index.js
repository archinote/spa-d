import TreeSelector from './src/selector.vue';

TreeSelector.install = function(Vue) {
  Vue.component(TreeSelector.name, TreeSelector);
};

export default TreeSelector;