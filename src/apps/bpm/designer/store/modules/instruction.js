/**
 * Store module
 * BPM PROCESS INSTRUCTION
 */
import Vue from 'vue'
import apiExecution from '../../api/execution'

import _state from '../../../store/lib/state'
import _getters from '../../../store/lib/getters'
import _mutations from '../../../store/lib/mutations'
// import _actions from '../../../store/lib/actions'

function removeHtmlTags(str) {
  return str.replace(/<(?:.|\n)*?>/gm, '')
}

export default {
  namespaced: true,

  state: function() {
    return Object.assign({}, _state, { apiClient: apiExecution, items: {} })
  },
  
  getters: Object.assign({}, _getters),
  mutations: Object.assign({}, _mutations, {
    setItem (state, item) {
      // Remove HTML tags.
      item.content = item && item.contentHTML ? removeHtmlTags(item.contentHTML) : ''
      Vue.set(state.items, item.id, item)
    }
  }),
  actions: {
    getItem({ state, commit, getters }, payload) {
      return new Promise((resolve, reject) => {
        let item = getters.item(payload.id)
        resolve(item)
      })
    },
    updateItem({ commit, getters }, { parentId, item }) {
      return new Promise((resolve, reject) => {
        // Remove HTML tags.
        item.content = item && item.contentHTML ? removeHtmlTags(item.contentHTML) : ''
        commit('updateItem', item)
        resolve(item)
      })
    }
  },
}
