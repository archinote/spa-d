const initialState = {
  active: false,
  text: '',
  color: null,
  close: true,
  timeout: 6000,
  y: 'top',
  x: null,
  mode: '',
  resolve: null,
  reject: null,
}

const state = Object.assign({}, initialState)

const mutations = {
  'ACTIVATE': (state, payload) => {
    //
    // Setup necessary values.
    //

    // If 'color' is empty, show toast with default color.
    // payload.color = payload.color || initialState.color

    if (typeof payload.close === 'undefined') payload.close = initialState.close

    //
    payload.y = payload.y || initialState.y

    Object.assign(state, payload)

    // Return toaster to initial state after it closed.
    let timeout = typeof payload.timeout !== 'undefined'
    ? parseInt(payload.timeout)
    : initialState.timeout

    // Increase time for animations, etc.
    timeout = timeout + 1000

    setTimeout(() => {
      state = Object.assign(state, initialState)
      // console.log("Auto hide alert toaster.");
    }, timeout);
  },

  'DEACTIVATE': (state) => {
    state = Object.assign(state, initialState)
  }
}

const actions = {
  show: ({ commit }, { text, color, close, timeout, y, x, mode }) => {
    return new Promise((resolve, reject) => {
      commit('ACTIVATE', {
        active: true,
        text,
        color,
        close,
        timeout,
        y,
        x,
        mode,
        resolve,
        reject
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
