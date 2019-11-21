/**
 * DMS base app Store
 */
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import app from './app'

const store = new Vuex.Store({
  namespaced: true,
  modules: {
    app
  }
})

export default store
