/**
 * Common 'index.js' file for all components
 */

import Test from './components/test/index.js'
// import yourComponent2 from './components/yourComponent2.vue'

// import yourModule from './modules/yourModule/index.js'


// const components = [
//   Test,
//   // yourComponent2
// ]

function install(Vue, options = {}) {
  // if (!options.store) console.log('Please provide a store!!')

  // components.map(component => {
  //   Vue.component(component.name, component);
  // });
  Vue.component(Test.name, Test)

  // /* istanbul ignore if */
  // if (typeof window !== 'undefined' && window.Vue) {
  //   install(window.Vue);
  // }

  // options.store.registerModule('desiredName', yourModule)
}

// module.exports = {
//   Test
// }
// module.exports.default = module.exports

export default {
  install
}



// // usage:
// import YourPackage from 'yourpackage'
// import store from './store' // their store, without your module

// Vue.use(YourPackage, { store })


// ====================================================================

//
// Vuetify version
//

// import * as components from './components'
// import * as directives from './directives'

// function Vuetify (Vue, args) {
//   const Vuetify = components.Vuetify

//   Vue.use(Vuetify, {
//     components,
//     directives,
//     ...args
//   })
// }

// Vuetify.version = process.env.VUETIFY_VERSION

// if (typeof window !== 'undefined' && window.Vue) {
//   window.Vue.use(Vuetify)
// }

// export default Vuetify