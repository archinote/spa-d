import Toaster from './src/component'
import toaster from './src/module.js'

function install(Vue, options = {}) {
  if (!options.store) console.log('Please provide a store!!')

  Vue.component(Toaster.name, Toaster)

  options.store.registerModule('toaster', toaster)
}

export default {
  install
}