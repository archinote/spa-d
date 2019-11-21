/**
 * BPM Designer Store module
 */
// Utils
import propertyPanel from './utils/propertyPanel'
import diagramModes from './utils/diagramModes'

// Modules
import process from './modules/process'
import indicator from './modules/indicator'
import port from './modules/port'
import user from './modules/user'
import link from './modules/link'
import linkData from './modules/linkData'
import nestedProcess from './modules/nestedProcess'
import portStateBinding from './modules/portStateBinding'
import processParameter from './modules/processParameter'

export default {
  namespaced: true,

  state: {},
  getters: {},
  mutations: {},
  actions: {},

  modules: {
    propertyPanel,
    diagramModes,

    process,
    indicator,
    port,
    user,
    link,
    linkData,
    nestedProcess,
    portStateBinding,
    processParameter
  }
}
