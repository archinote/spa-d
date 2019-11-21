import apiPortPublicationAccess from '../../api/execution/portPublicationAccess'

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
  // Save process list
  list: (state, { parentId, role, list }) => {
    if (parentId && role && list) {

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
    }
  },

  // Save process Port
  item: (state, { id, parentId, role, item }) => {
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
  // Get process execution data by process ID.
  list ({ commit, getters }, { processId, portId }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      let list = getters.list( processId )

      if (list && list.length) {
        resolve( list )
      } else {
        apiPortPublicationAccess.list( processId, portId ).then(list => {
          // console.log("Port Publication Access Store, 'list' action, API response:")
          // console.log(list)

          // if (Array.isArray(data)) {
            // Save list in the Store.
            // commit('list', { processId, role, list })

            resolve( list )
          // } else {
          //   reject("Error occurres while loading data from server")
          // }
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // Update process execution data by process ID.
  update ({ commit, getters }, { processId, item }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiPortPublicationAccess.update( processId, item ).then(response => {
        // console.log("Port Publication Access Store, 'update' action, API response:")
        // console.log(response)

        // Update item in the Store
        // commit('item', { role, processId, item })

        resolve(item)
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
