/**
 * Store module
 * BPM PROCESS
 */
import apiProcess from '../../api/process'

import execution from './execution'
import instruction from './instruction'

import _state from '../../../store/lib/state'
import _getters from '../../../store/lib/getters'
import _mutations from '../../../store/lib/mutations'
import _actions from '../../../store/lib/actions'

export default {
  namespaced: true,

  state: function() {
    return Object.assign({}, _state, { apiClient: apiProcess, items: {} })
  },
  
  getters: Object.assign({}, _getters),
  mutations: Object.assign({}, _mutations, {
    processes: _mutations.updateItems,
    process: _mutations.updateItem,
    delete: _mutations.deleteItem
  }),
  actions: Object.assign({}, _actions),

  modules: {
    execution,
    instruction
  }
}
