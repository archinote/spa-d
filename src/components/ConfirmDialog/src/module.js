const initialState = {
  active: false,
  type: 'info',
  toolbar: true,
  width: 480,
  canCancel: true,
  confirmText: 'Подтвердить',
  cancelText: 'Отменить',
  title: '',
  body: '',
  component: null,
  form: null,
  props: null,
  resolve: null,
  reject: null,
  onSubmit: null
}

const state = Object.assign({}, initialState)

const mutations = {
  'ACTIVATE': (state, payload) => {
    //
    // Setup necessary values.
    //

    payload.type = payload.type || initialState.type

    payload.width = payload.width || initialState.width

    if (typeof payload.toolbar === 'undefined') payload.toolbar = initialState.toolbar
    
    // payload.confirmText = payload.confirmText || initialState.confirmText
    if (typeof payload.confirmText === 'undefined') {
      payload.confirmText = payload.isAlert 
        ? 'Ok' 
        : initialState.confirmText
    }

    // payload.canCancel = payload.canCancel || initialState.canCancel
    if (typeof payload.canCancel === 'undefined') payload.canCancel = initialState.canCancel

    if (payload.canCancel && !payload.isAlert) 
      payload.cancelText = payload.cancelText || initialState.cancelText

    Object.assign(state, payload)
  },
  'DEACTIVATE': (state) => {
    state = Object.assign(state, initialState)
  }
}

const actions = {
  ask: ({ commit }, { type, toolbar, width, canCancel, confirmText, cancelText, title, body, component, form, props, onSubmit }) => {
    return new Promise((resolve, reject) => {
      commit('ACTIVATE', {
        active: true,
        isConfirm: true,
        type,
        toolbar,
        width,
        canCancel,
        confirmText,
        cancelText,
        title,
        body,
        component,
        form,
        props,
        onSubmit,
        resolve,
        reject
      })
    })
  },
  alert: ({ commit }, { type, toolbar, width, canCancel = true, confirmText, cancelText = '', title, body }) => {
    return new Promise((resolve, reject) => {
      commit('ACTIVATE', {
        active: true,
        isAlert: true,
        type,
        toolbar,
        width,
        canCancel,
        confirmText,
        cancelText,
        title,
        body,
        resolve,
        reject
      })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
