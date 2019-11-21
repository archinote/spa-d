import Vue from 'vue'
import dialogVue from './component.vue'

const DialogBoxConstructor = Vue.extend(dialogVue)

let dialogsQueue = []

/**
 * Mount and show dialog
 *
 * @param {*} dialog
 */
const insertDialog = function(dialog) {
  let size = dialogsQueue.length
  if (size > 0) {
    let last = dialogsQueue[size - 1]
    //last.hide = true
  }
  dialogsQueue.push(dialog)
  dialog.$mount()
  document.body.appendChild(dialog.$el)
  dialog.visible = true
  return dialog
}
/**
 * Destory dialog and remove DOM
 *
 * @param {*} dialog
 */
const removeDialog = function(dialog) {
  dialog.$destroy()
  let index = dialogsQueue.findIndex(it => {
    return it == dialog
  })
  if (index !== -1) {
    dialogsQueue.splice(index, 1)
  }
  if (dialog.$el && dialog.$el.parentNode) {
    dialog.$el.parentNode.removeChild(dialog.$el)
  }
  let size = dialogsQueue.length
  if (size > 0) {
    let last = dialogsQueue[size - 1]
    last.hide = false
  }
}

/**
 *
 * @param {*} options
 */
const ShowDialog = function(options = {}) {
  const {
    listeners,
    dialogListeners,
    component,
    props,
    dialogProps,
    parent
  } = options
  let propsData = Object.assign(
    {},
    { maxWidth: '1024px', persistent: true, scrollable: false },
    dialogProps
  )

  let params = {
    props: Object.keys(propsData),
    propsData: propsData,
    data: {
      listeners,
      dialogListeners,
      component,
      props
    }
  }
  if (parent) {
    params.parent = parent
  }
  let dl = new DialogBoxConstructor(params)
  insertDialog(dl)
  dl.$on('close', _ => {
    dl.visible = false
    setTimeout(_ => {
      removeDialog(dl)
    }, 1000)
  })
  return dl
}

export { ShowDialog }
