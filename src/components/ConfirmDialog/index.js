import ConfirmDialog from './src/component'
import confirmer from './src/module.js'

function install(Vue, options = {}) {
  if (!options.store) console.log('Please provide a store!!')

  Vue.component(ConfirmDialog.name, ConfirmDialog)

  options.store.registerModule('confirmer', confirmer)
}

export default {
  install
}
