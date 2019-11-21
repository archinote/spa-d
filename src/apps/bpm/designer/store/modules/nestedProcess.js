/**
 * Store module
 * BPM NESTED MODEL
 */
import apiNestedProcess from '../../api/nestedProcess'

import _state from '../../../store/lib/state'
import _getters from '../../../store/lib/getters'
import _mutations from '../../../store/lib/mutations'
import _actions from '../../../store/lib/actions'

export default {
  namespaced: true,

  state: function () {
    return Object.assign({}, _state, { apiClient: apiNestedProcess })
  },
  
  getters: Object.assign({}, _getters),
  mutations: Object.assign({}, _mutations),
  actions: Object.assign({}, _actions)
}
