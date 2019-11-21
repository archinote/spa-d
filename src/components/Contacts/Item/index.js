import DContact from './src/contact.js'

DContact.install = function(Vue) {
  Vue.component(DContact.name, DContact)
}

export default DContact
