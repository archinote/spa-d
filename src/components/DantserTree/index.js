import Tree from './src/DantserTree.vue';
import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    new Sortable(el, binding.value || {})
  }
})

Tree.install = function(Vue) {
  Vue.component(Tree.name, Tree);
};

export default Tree;