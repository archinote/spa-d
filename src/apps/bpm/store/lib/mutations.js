/**
 *
 */
import Vue from 'vue'

const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

let setItems = (state, items) => {
  state.items = {}

  items.forEach(item => {
    Vue.set(state.items, item.id, item)
  })
}

let insertItems = (state, items) => {
  items.forEach(item => {
    Vue.set(state.items, item.id, item)
  })
}

let updateItems = (state, items) => {
  items.forEach(item => {
    if (state.items[item.id]) {
      // If item with such key (ID) exists
      // update it with new values.
      item = Object.assign({}, state.items[item.id].item)
    }
    Vue.set(state.items, item.id, item)
  })
}

let setItem = (state, item) => {
  Vue.set(state.items, item.id, item)
}

let updateItem = (state, item) => {
  if (state.items[item.id]) {
    // If item with such key (ID) exists
    // update it with new values.
    item = Object.assign({}, state.items[item.id], item)
  }
  Vue.set(state.items, item.id, item)
}

// Delete item
let deleteItem = (state, item) => {
  Vue.delete(state.items, item.id)
}

let mutations = {
  setItems,
  insertItems,
  updateItems,
  setItem,
  updateItem,
  deleteItem
}

export {
  mutations as default,
  setItems,
  insertItems,
  updateItems,
  setItem,
  updateItem,
  deleteItem
}
