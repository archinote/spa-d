/**
 * 
 */
const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

let loadItems = ({ state, commit, getters }, payload) => {
  return new Promise((resolve, reject) => {
    // TODO: load all items from 'laterLoadIds' array
    // ...
    
    state.apiClient.list(payload).then(items => {
      commit('updateItems', items)
      resolve(items)
    }).catch(error => {
      reject(error)
    })
  })
}

let getItems = ({ state, commit, getters }, payload) => {
  return new Promise((resolve, reject) => {
    let items = payload ? getters.filteredList(payload) : getters.items()

    if (items && items.length) {
      resolve(items)
    } else {
      state.apiClient.list(payload).then(items => {
        commit('updateItems', items)
        resolve(items)
      }).catch(error => {
        reject(error)
      })
    }
  })
}

// Get item ID.
let getItem = ({ state, commit, getters }, payload) => {
  return new Promise((resolve, reject) => {
    let item = getters.item(payload.id)

    if (item) {
      resolve(item)
    } else {
      state.apiClient.item(payload).then(item => {
        commit('setItem', item)
        resolve(item)
      }).catch(error => {
        reject(error)
      })
    }
  })
}

// Create item in the Store & server.
let createItem = ({ state, commit, getters }, item) => {
  return new Promise((resolve, reject) => {
    state.apiClient.create(item).then(item => {
      commit('setItem', item)
      resolve(item)
    }).catch(error => {
      reject(error)
    })
  })
}

// Update item in the Store & server by ID.
let updateItem = ({ state, commit, getters }, item) => {
  return new Promise((resolve, reject) => {
    state.apiClient.update(item).then(_item => {
      commit('updateItem', item)
      resolve(item)
    }).catch(error => {
      reject(error)
    })
  })
}

// Delete item from the Store & server by ID.
let deleteItem = ({ state, commit }, payload) => {
  return new Promise((resolve, reject) => {
    state.apiClient.delete(payload).then(response => {
      commit('deleteItem', payload)
      resolve(response)
    }).catch(error => {
      reject(error)
    })
  })
}

let actions = {
  loadItems,
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,

  load: loadItems,
  list: getItems,
  item: getItem,
  create: createItem,
  update: updateItem,
  delete: deleteItem
}

export { 
  actions as default,

  loadItems,
  getItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem,

  loadItems as load,
  getItems as list,
  getItem as item,
  createItem as create,
  updateItem as update,
  deleteItem as delete
}
