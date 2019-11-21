import apiPortPublication from '../../api/publication'

const state = {
  items: new Map()
}

const getters = {
  // Get List of items
  list: (state) => (parentId) => {
    let _lists = state.items.get( parentId )

    _lists = _lists && Boolean(_lists instanceof Map)
      ? Array.from( _lists.values() )
      : null

    return _lists
  },

  // Get item
  item: (state) => ({ id, parentId }) => {
    let _port = null

    if (state.items.has( parentId )) {
      let _items = state.items.get( parentId )

      if (_items instanceof Map && _items.has( id )) {
        _item = _items.get( id )
      }
    }

    // console.log("id, parentId: " + id + ", " + parentId);
    // console.log(_item);

    return _item
  }
}

const mutations = {
  // Save items list in the store.
  list: (state, { parentId, list }) => {
    if (parentId && list) {

      let _list = state.items.get(parentId)

      if (!(_list instanceof Map)) {
        _list = new Map()
      }

      list.forEach( item => {
        if (item.id) {
          _list.set(item.id, item)
        }
      })

      state.items.set( parentId, _list )
      // console.log("PortPublication Store, 'list' mutation, state.items:")
      // console.log(state.items)
    }
  },

  // Save an item in the store.
  item: (state, { id, parentId, item }) => {
    if (id && parentId && item) {

      let _items = state.items.get( parentId )

      if ( !(_items instanceof Map) ) {
        _items = new Map()
      }

      // Update the same key in the Store, if such exists.
      if (_items.has(id)) {
        let _item = _items.get(id)
        item = Object.assign({}, _item, item)
      }

      _items.set( id, item )
    }
  },

  // Delete an item from the store.
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
   * Get items list
   *
   * @return Array
   */
  list ({ commit, getters }, { parentId }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      // TODO
      // let _items = getters.list( parentId )
      let _items = null

      if (_items && _items.length) {
        resolve( _items )
      } else {
        apiPortPublication.list( parentId ).then(list => {
          // console.log("PortPublication Store, 'list' action, API response:")
          // console.log(list)

          if (Array.isArray(list)) {
            // Save list in the Store.
            // commit('list', { parentId, list })

            resolve( list )
          } else {
            reject("Error occurres while loading data from server")
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // // Get Store item..
  // item ({ dispatch, commit, getters }, { id, parentId }) {
  //   return new Promise( (resolve, reject) => {
  //     // Try to find it by ID in the store.
  //     let _item = getters.item({ parentId, id })
  //
  //     if (_item) {
  //       resolve(_item)
  //     } else {
  //       // Not found in the Store. Take from server
  //       apiPortPublication.item(parentId, id).then(_item => {
  //         // console.log("PortPublication Store, 'item' action, API response:")
  //         // console.log(_item)
  //
  //         // Save port data in the Store.
  //         commit('item', { parentId, id, item: _item })
  //
  //         resolve(_item)
  //       }).catch(error => {
  //         reject(error)
  //       })
  //     }
  //   })
  // },

  // Create item in the Store & server by its ID.
  create ({ commit, getters }, { parentId, item }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPortPublication.create( parentId, item ).then(item => {
        // console.log("PortPublication Store, 'create' action, API response:")
        // console.log(item)

        // Update item in the Store
        // commit('item', { id: item.id, parentId, item })

        resolve(item)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // // Update item in the Store & server by its ID.
  // update ({ commit, getters }, { parentId, id, item }) {
  //   return new Promise( (resolve, reject) => {
  //     // Try to send data on the server.
  //     apiPortPublication.update( parentId, id, item ).then(response => {
  //       // console.log("PortPublication Store, 'update' action, API response:")
  //       // console.log(response)
  //
  //       // Update item in the Store
  //       commit('item', { id, parentId, item })
  //
  //       resolve(item)
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // Delete item from the Store & server by its ID.
  delete ({ commit, getters }, { parentId, id }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPortPublication.delete( parentId, id ).then(response => {
        // console.log("PortPublication Store, 'delete' action, API response:")
        // console.log(response)

        // Update item in the Store
        // commit('delete', { id, parentId })

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
