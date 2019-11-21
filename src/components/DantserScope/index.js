import ScopeComponent from './src/component.vue'

ScopeComponent.install = function(Vue) {
  Vue.component(ScopeComponent.name, ScopeComponent);
};

export default ScopeComponent;