import apiExecution from '../../api/execution'

const state = {
  // Process executions
  items: new Map(),

  // Process supervising.
  supervising: new Map()
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
  list ({ commit, getters }, { parentId, role }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      let _items = getters.list( parentId, role )

      if (_items && _items.length) {
        resolve( _items )
      } else {
        apiExecution.list( parentId, role ).then(data => {
          // console.log("Execution Store, 'list' action, API response:")
          // console.log(data)

          // if (Array.isArray(data)) {
            // Save list in the Store.
            // commit('list', { parentId, role, list })

            resolve( data )
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
  // update ({ commit, getters }, { parentId, role, contractors }) {
  //   return new Promise( (resolve, reject) => {
  //     if (parentId && role) {
  //       // Try to send data on the server.
  //       // http.post(apiHosts.executor.update, {
  //       //   process_model_id: id,
  //       //   role: 1,
  //       //   execution_type: execution.execution_type,
  //       //   extended_finish: execution.extended_finish,
  //       //   instruction: execution.instruction,
  //       //   contractors: execution.contractors,
  //       // }).then(response => {
  //       //   console.log("Execution Store, 'update' action, server response:")
  //       //   console.log(response)
  //       //
  //       //   if (response.data.success) {
  //       //     // Update execution in the Store with mutation
  //       //     commit('execution', { key: id, execution})
  //       //
  //       //     resolve(true)
  //       //   } else {
  //       //     reject("Error occurres while sending data to the server.")
  //       //   }
  //       // }).catch(error => {
  //       //   reject(error)
  //       // })
  //     }
  //   })
  // },

  // Update process execution data by process ID.
  update ({ commit, getters }, { parentId, item }) {
    return new Promise( (resolve, reject) => {
      // Try to send data on the server.
      apiExecution.update( parentId, item ).then(response => {
        // console.log("Execution Store, 'update' action, API response:")
        // console.log(response)

        // Update item in the Store
        // commit('item', { role, parentId, item })

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
