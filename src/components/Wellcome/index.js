import Wellcome from './src/component.vue'

Wellcome.install = function(Vue) {
  Vue.component(Wellcome.name, Wellcome)
}

export default Wellcome
