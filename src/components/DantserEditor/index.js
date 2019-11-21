import DEditor from './src/DantserEditor.vue'

DEditor.install = function(Vue) {
  Vue.component(DEditor.name, DEditor)
}

export default DEditor
