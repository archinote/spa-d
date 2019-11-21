/**
 * EXAMPLE Store module
 * For private use
 */
import apiExample from '../../api'

// PRIVATE Store state must be declared as function
function state() {
  return {
    items: []
  }
}

const getters = {
  getList: (state) => () => {
    return state.items
  },

  getItem: (state) => (id) => {
    return state.items[id] ? state.items[id] : null
  }
}

const mutations = {
  // Save (with replacing existing items) process list as Map object.
  saveList: (state, list) => {
    state.list = list
  },
  
  // Save process
  saveItem: (state, { id, data }) => {
    state.items[id] = data
  },

  // Delete Process
  deleteItem: (state, id) => {
    if (id && state.items[id]) {
      delete state.items[id]

      // Make changes reactive.
      state.items = { ...state.items }
    }
  }
}

const actions = {
  /**
   * Get items list
   *
   * @return Array
   */
  list ({ commit, getters }) {
    return new Promise( (resolve, reject) => {
      // Try to get list from the Store.
      let _list = getters.list()

      if (_list && _list.length) {
        resolve( _list )
      } else {
        apiExample.list().then(_list => {
          // Save list in the Store.
          commit('saveList', _list)

          resolve( _list )
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Get item by its ID.
  item ({ commit, getters }, id) {
    return new Promise( (resolve, reject) => {
      // Try to find it by ID in the Store.
      let _item = getters.item( id )

      if ( _item ) {
        resolve( _item )
      } else {
        // Try to get it with API.
        apiExample.item( id ).then(_item => {
          if (_item) {
            // Save new Process in the Store.
            commit('saveItem', { id: _item.id, process: _item })

            resolve( _item )
          } else {
            reject("Error occurres while loading data from server")
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Create Process in the Store & server.
  create ({ commit, getters }, data) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiExample.create(data).then(item => {
        // Update item in the Store
        commit('saveItem', { id: item.id, data: item })
        resolve(item)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Update process in the Store & srever by its ID.
  update ({ commit, getters }, data) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiExample.update(data).then(response => {
        // Update item in the Store
        commit('saveItem', { id: item.id, data: item })
        resolve({ id, name, description })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete Port Data in the Store & server by its ID.
  delete ({ commit, getters }, id) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiExample.delete( id ).then(response => {
        // Delete item from the Store
        commit('delete', id)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }
} // actions

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
