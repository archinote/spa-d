import apiPublication from '../../api/publication/'

const state = {
  items: new Map(),
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
    let _item = null

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
  // Save process list
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
      // console.log("Catalog Publication Store, 'list' mutation, state.items:")
      // console.log(state.items)
    }
  },

  // Save process Port
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

  // Delete Port Data item
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
   * Get Catalog Processes list
   *
   * @return Array
   */
  // list ({ commit, getters }, { parentId = null }) {
  list ({ commit, getters }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      // TODO
      // let _items = getters.list( parentId )
      let _items = null

      if (_items && _items.length) {
        resolve( _items )
      } else {
        // apiPublication.list( parentId ).then(list => {
        apiPublication.list().then(list => {
          // console.log("Catalog Publication Store, 'list' action, API response:")
          // console.log(list)

          if (Array.isArray(list)) {
            // Save list in the Store.
            // TODO
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
  //       apiPublication.item(parentId, id).then(_item => {
  //         // console.log("Catalog Publication Store, 'item' action, API response:")
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

  // Get Start Process Form Items.
  form ({ dispatch, commit, getters }, { publicationId }) {
    return new Promise( (resolve, reject) => {
      apiPublication.form(publicationId).then(data => {
        // console.log("Catalog Publication Store, 'form' action, API response:")
        // console.log(data)

        // Save port data in the Store.
        // commit('item', { parentId, id, item: data })

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Starts BP for 'publication_id' with 'data'.
  start ({ commit, getters }, { publicationId, data }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPublication.start( publicationId, data ).then(response => {
        // console.log("Catalog Publication Store, 'start' action, API response:")
        // console.log(response)

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
