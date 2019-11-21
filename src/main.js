/**
 * App main script file
 */
//
// Fonts & Icons
//
// Material Design Icons
import 'material-design-icons/iconfont/material-icons.css'
// Material Design Fonts (@mdi/font)
import '@mdi/font/css/materialdesignicons.min.css'
// Roboto font face
import 'roboto-fontface/css/roboto/roboto-fontface.css'
// Custom styles
import '@/styles/style.scss'
//
import Vue from 'vue'
import App from './App'

// Store
import store from '@/store/'
// NOTE Here is way to import & register apps store public (common) modules
// NOTE Or use @store/app/index.js to implement the same import
// import orgStoreModule from '@/apps/org/store/common'
// store.registerModule(['app', 'org'], orgStoreModule)
window.store = store // DEBUG

// Router
import router from '@/router/'

// Vuetify
// import 'vuetify/dist/vuetify.min.css'
// import Vuetify from 'vuetify'
require('vuetify/src/stylus/app.styl')
import Vuetify from 'vuetify/es5'
Vue.use(Vuetify)

// Moment
import moment from 'moment-timezone'
Vue.prototype.$moment = moment
window.moment = moment // DEBUG

//
// Import Dantser UI components:
// - App Header
// - ConfirmDialog & Toaster components
//
import Loading from '@/components/Loading/'
Vue.use(Loading)
import DHeader from '@/components/Header/'
Vue.use(DHeader)
import DConfirmDialog from '@/components/ConfirmDialog'
Vue.use(DConfirmDialog, { store })
import DToaster from '@/components/Toaster'
Vue.use(DToaster, { store })
import DantserTree from '@/components/DantserTree'
Vue.component('dantser-tree', DantserTree)

//Helpers
import dmsHelpers from '@/helpers'
Vue.use(dmsHelpers)

//
// Common Vue properties
//
// Event bus
Vue.prototype.$bus = new Vue()
// Store
Vue.prototype.$store = store
Vue.config.productionTip = false

//Init WS
import { initWS } from '@/sockets'
Vue.prototype.$socket = initWS(`wss://${location.host}/wss`, Vue.prototype.$bus)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
