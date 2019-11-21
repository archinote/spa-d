const initialState = {
  active: false,
  visible: true
}

const state = Object.assign({}, initialState)


const getters = {
  isEnabled: (state) => () => {
    return state.active
  },
  isVisible: (state) => () => {
    return state.visible
  }
}

const mutations = {
  init: (state, payload) => {
    Object.assign(state, payload)
  },
  enable: (state, payload) => {
    state.active = true
  },
  disable: (state) => {
    state.active = false
  },
  show: (state) => {
    state.visible = true
  },
  hide: (state) => {
    state.visible = false
  },
  switch: (state) => {
    state.visible = !state.visible
  },
}

const actions = {
  // init: ({ commit }) => {
  //   return new Promise((resolve, reject) => {
  //     commit('INIT')
  //   })
  // },
  // enable: ({ commit }) => {
  //   return new Promise((resolve, reject) => {
  //     commit('ACTIVATE', {
  //       active: true,
  //       resolve,
  //       reject
  //     })
  //   })
  // },
  // disable: ({ commit }) => {
  //   return new Promise((resolve, reject) => {
  //     commit('DEACTIVATE')
  //   })
  // },
  // show: ({ commit }) => {
  //   return new Promise((resolve, reject) => {
  //     commit('SHOW')
  //   })
  // },
  // hide: ({ commit }) => {
  //   return new Promise((resolve, reject) => {
  //     commit('HIDE')
  //   })
  // },
  // switch: ({ commit }) => {
  //   return new Promise((resolve, reject) => {
  //     commit('SWITCH')
  //   })
  // }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
