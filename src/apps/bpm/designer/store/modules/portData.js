/**
 *
 */
import apiPortData from '../../api/port/portData'

const state = {
  // Ports Data list
  portData: new Map()
}

const getters = {
  // List of port data
  list: (state) => (parentId) => {
    let _list = state.portData.get( parentId )

    _list = _list && Boolean(_list instanceof Map)
      ? Array.from( _list.values() )
      : null

    return _list
  },

  // Port data item
  item: (state) => ({ id, parentId }) => {
    let _item = null

    if (state.portData.has( parentId )) {
      let _parent = state.portData.get( parentId )

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
      let _parent = state.portData.get(parentId)

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

  // Save Port Data item
  item: (state, { id, parentId, item }) => {
    if (id && parentId && item && item.id) {
      // Get parent store list
      let _parent = state.portData.get(parentId)

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

  // Delete Port Data item
  delete: (state, { id, parentId }) => {
    if (id && parentId ) {
      // Get parent store list
      let _parent = state.portData.get(parentId)

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
  list ({ commit, getters }, { processId, portId }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      let _list = getters.list( portId )

      if (_list && _list.length) {
        resolve( _list )
      } else {
        apiPortData.list(processId, portId).then(__list => {
          // console.log("PortData Store, 'list' action, API response:")
          // console.log(__list)

          if (Array.isArray(__list)) {
            // Save port data in the Store.
            commit('list', { portId, ports: __list })

            resolve( __list )
          } else {
            reject("Error occurres while loading data from server")
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Get port data item.
  item ({ dispatch, commit, getters }, { id, portId }) {
    return new Promise( (resolve, reject) => {
      // Try to find it by ID in the store.
      let _item = getters.item( portId, id )

      if (_item) {
        resolve(_item)
      } else {
        apiPortData.item(processId, portId).then(_item => {
          // console.log("PortData Store, 'list' action, API response:")
          // console.log(_item)

          // Save port data in the Store.
          commit('item', { parentId: portId, id: _item.id, item: _item })

          resolve(_item)
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Create Port Data in the Store & server by its ID.
  create ({ commit, getters }, { processId, portId, data }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPortData.create( processId, portId, data ).then(response => {
        // console.log("PortData Store, 'create' action, API response:")
        // console.log(response)

        // Update port in the Store
        let id = response.id ? response.id : data.id
        if (id) {
          commit('item', { id, parentId: processId, item: data })
        }

        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Update Port Data in the Store & server by its ID.
  update ({ commit, getters }, { processId, portId, id, data }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPortData.update( processId, portId, id, data ).then(response => {
        // console.log("PortData Store, 'update' action, API response:")
        // console.log(response)

        // Update port in the Store
        commit('item', { id, parentId: processId, item: data })

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete Port Data in the Store & server by its ID.
  delete ({ commit, getters }, { processId, portId, id }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPortData.delete( processId, portId, id ).then(response => {
        // console.log("PortData Store, 'delete' action, API response:")
        // console.log(response)

        // Update port in the Store
        commit('delete', { id, parentId: processId })

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
