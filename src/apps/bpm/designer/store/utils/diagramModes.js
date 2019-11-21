const initialState = {
  isParametersOn: false,
  isIndicationOn: false
}

const state = Object.assign({}, initialState)

const getters = {
}

const mutations = {
  init: (state, payload) => {
    Object.assign(state, initialState, payload)
  },
  setParametersStatus: (state, status) => {
    state.isParametersOn = status
  },
  setIndicationStatus: (state, status) => {
    state.isIndicationOn = status
  }
}

export default {
  namespaced: true,

  state,
  getters,
  mutations
}
