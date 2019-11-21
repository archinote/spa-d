/**
 *
 */

import apiIndicatorState from '../../api/indicator/indicatorState'

const state = {
  items: new Map()
}

const getters = {
  // Get list of state data
  list: (state) => (parentId) => {
    let _list = state.items.get( parentId )

    _list = _list && Boolean(_list instanceof Map)
      ? Array.from( _list.values() )
      : null

    return _list
  },

  // Get a state data item
  item: (state) => ({ id, parentId }) => {
    let _item = null

    if (state.items.has( parentId )) {
      let _parent = state.items.get( parentId )

      if (_parent instanceof Map && _parent.has( id )) {
        _item = _parent.get( id )
      }
    }

    return _item
  }
}

const mutations = {
  // Save data list
  list: (state, { parentId, list }) => {
    if (parentId && list) {
      // Get parent store list
      let _parent = state.items.get(parentId)

      if (_parent === undefined) {
        _parent = new Map()
      }

      list.forEach(_item => {
        if (_item.id) {
          _parent.set(_item.id, _item)
        }
      })
    }
  },

  // Save state item
  item: (state, { id, parentId, item }) => {
    if (id && parentId && item && item.id) {
      // Get parent store list
      let _parent = state.items.get(parentId)

      if (_parent === undefined) {
        _parent = new Map()
      }

      // Update the same key in the Store, if such exists.
      if (_parent.has(id)) {
        let _item = _parent.get(id)
        item = Object.assign({}, _item, item)
      }

      _parent.set(item.id, item)
    }
  },

  // Delete state item
  delete: (state, { id, parentId }) => {
    if (id && parentId ) {
      // Get parent store list
      let _parent = state.items.get(parentId)

      if (_parent instanceof Map) {
        _parent.delete(id)
      }
    }
  }
}

const actions = {
  /**
   * Get list
   *
   * @return Array
   */
  list ({ commit, getters }, { processId, parentId }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      let _list = getters.list( parentId )

      if (_list && _list.length) {
        resolve( _list )
      } else {
        apiIndicatorState.list(processId, parentId).then(_list => {
          if (Array.isArray(_list)) {
            // Save item in the Store.
            commit('list', { parentId, list: _list })

            resolve( _list )
          } else {
            reject("Error occurres while loading data from server")
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Get store item.
  item ({ dispatch, commit, getters }, { id, parentId, processId }) {
    return new Promise( (resolve, reject) => {
      // Try to find it by ID in the store.
      let _item = getters.item( parentId, id )

      if (_item) {
        resolve(_item)
      } else {
        apiIndicatorState.item(processId, parentId).then(_item => {
          // Save item in the Store.
          commit('item', { parentId: parentId, id: _item.id, item: _item })

          resolve(_item)
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Create new item in the Store & server.
  create ({ commit, getters }, { processId, parentId, item }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiIndicatorState.create( processId, parentId, item ).then(response => {
        // Update item in the Store
        let id = response.id ? response.id : item.id
        if (id) {
          commit('item', { id, parentId: parentId, item: item })
        }

        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Update item in the Store & server by its ID.
  update ({ commit, getters }, { processId, parentId, id, item }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiIndicatorState.update( processId, parentId, id, item ).then(response => {
        // Update item in the Store
        commit('item', { id, parentId: parentId, item: item })

        resolve(item)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete item from the Store & server by its ID.
  delete ({ commit, getters }, { processId, parentId, id }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiIndicatorState.delete( processId, parentId, id ).then(response => {
        // Update item in the Store
        commit('delete', { id, parentId: parentId })

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
