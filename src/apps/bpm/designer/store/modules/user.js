import { api } from '@/api/index'

let $isDev = Boolean(process.env.NODE_ENV == 'development')

let usersTree = [
  {
    id: "465f6b84-30d7-11e8-a46a-53efaccdd5c6",
    name: "Новая компания",
    parent_id: null,
    posts: [
      {
        id: "4661fad4-30d7-11e8-9186-357761c322aa",
        name: "Учредитель",
        fullname: "ФИО не указано"
      },
    ],
    children: [
      {
        id: "465f6b84-30d7-11e8-a46a-53efaccdd5c7",
        name: "Дочерняя компания 1",
        parent_id: "465f6b84-30d7-11e8-a46a-53efaccdd5c6",
        posts: [
          {
            id: "4661fad4-30d7-11e8-9186-357761c322a0",
            name: "Должность 1 - 1",
            fullname: "ФИО не указано"
          },
          {
            id: "4661fad4-30d7-11e8-9186-357761c322a1",
            name: "Должность 1 - 2",
            fullname: "ФИО не указано"
          }
        ]
      },
      {
        id: "465f6b84-30d7-11e8-a46a-53efaccdd5c8",
        name: "Дочерняя компания 2",
        parent_id: "465f6b84-30d7-11e8-a46a-53efaccdd5c6",
        posts: [
          {
            id: "4661fad4-30d7-11e8-9186-357761c322a2",
            name: "Должность 2 - 1",
            fullname: "ФИО не указано"
          },
          {
            id: "4661fad4-30d7-11e8-9186-357761c322a3",
            name: "Должность 2 - 2",
            fullname: "ФИО не указано"
          }
        ]
      }
    ]
  }
]

let usersList = [
  {
    id: "4661fad4-30d7-11e8-9186-357761c322aa",
    name: "Учредитель"
  },
  {
    id: "465f6b84-30d7-11e8-a46a-53efaccdd5c7",
    name: "Дочерняя компания 1"
  },
  {
    id: "4661fad4-30d7-11e8-9186-357761c322a0",
    name: "Должность 1 - 1"
  },
  {
    id: "4661fad4-30d7-11e8-9186-357761c322a1",
    name: "Должность 1 - 2"
  },
  {
    id: "465f6b84-30d7-11e8-a46a-53efaccdd5c8",
    name: "Дочерняя компания 2"
  },
  {
    id: "4661fad4-30d7-11e8-9186-357761c322a2",
    name: "Должность 2 - 1"
  },
  {
    id: "4661fad4-30d7-11e8-9186-357761c322a3",
    name: "Должность 2 - 2"
  }
]

const state = {

  items: new Map(),

}


const getters = {

  // Get List of items
  list: (state) => () => {
    // let list = state.items.get( parentId )
    //
    // list = list && Boolean(list instanceof Map)
    //   ? Array.from( list.values() )
    //   : null

    let list = usersList

    return list
  },

  // Get users Tree
  tree: (state) => () => {
    // let tree = state.items.get( parentId )
    //
    // tree = tree && Boolean(tree instanceof Map)
    //   ? Array.from( tree.values() )
    //   : null

    let tree = usersTree

    return tree
  },

  // // Get item
  // item: (state) => ({ id, parentId }) => {
  //   let _port = null
  //
  //   if (state.items.has( parentId )) {
  //     let _items = state.items.get( parentId )
  //
  //     if (_items instanceof Map && _items.has( id )) {
  //       _item = _items.get( id )
  //     }
  //   }
  //
  //   // console.log("id, parentId: " + id + ", " + parentId);
  //   // console.log(_item);
  //
  //   return _item
  // }

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
      // console.log("User Store, 'list' mutation, state.items:")
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
   * Get users list
   *
   * @return Array
   */
  list ({ commit, getters }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      let _items = getters.list()

      if (_items && _items.length) {
        resolve( _items )
      } else {
        resolve( [] )
        // api.user.list().then(list => {
        //   // console.log("User Store, 'list' action, API response:")
        //   // console.log(list)
        //
        //   if (Array.isArray(list)) {
        //     // Save list in the Store.
        //     commit('list', { list })
        //
        //     resolve( list )
        //   } else {
        //     reject("Error occurres while loading data from server")
        //   }
        // }).catch(error => {
        //   reject(error)
        // })
      }
    })
  },

  // Get users tree.
  tree ({ dispatch, commit, getters }) {
    return new Promise( (resolve, reject) => {
      // Try to find them in the Store.
      let tree = getters.tree()

      if (tree && tree.length) {
        resolve( tree )
      } else {
        resolve( [] )
        // api.user.tree().then(tree => {
        //   // console.log("User Store, 'tree' action, API response:")
        //   // console.log(tree)
        //
        //   if (Array.isArray(tree)) {
        //     // Save tree in the Store.
        //     commit('tree', { tree })
        //
        //     resolve( tree )
        //   } else {
        //     reject("Error occurres while loading data from server")
        //   }
        // }).catch(error => {
        //   reject(error)
        // })
      }
    })
  },

  // Get users tree.
  info ({ dispatch, commit, getters }, { users }) {
    return new Promise( (resolve, reject) => {
      let info = [
        {
          id: "4661fad4-30d7-11e8-9186-357761c322aa",
          name: "Учредитель"
        },
        {
          id: "465f6b84-30d7-11e8-a46a-53efaccdd5c7",
          name: "Дочерняя компания 1"
        },
        {
          id: "4661fad4-30d7-11e8-9186-357761c322a0",
          name: "Должность 1 - 1"
        },
        {
          id: "4661fad4-30d7-11e8-9186-357761c322a1",
          name: "Должность 1 - 2"
        },
        {
          id: "465f6b84-30d7-11e8-a46a-53efaccdd5c8",
          name: "Дочерняя компания 2"
        },
        {
          id: "4661fad4-30d7-11e8-9186-357761c322a2",
          name: "Должность 2 - 1"
        },
        {
          id: "4661fad4-30d7-11e8-9186-357761c322a3",
          name: "Должность 2 - 2"
        }
      ]

      resolve( info )
    })
  },

  // // Get process port.
  // item ({ dispatch, commit, getters }, { id }) {
  //   return new Promise( (resolve, reject) => {
  //     // Try to find it by ID in the store.
  //     let _item = getters.item({ id })
  //
  //     if (_item) {
  //       resolve(_item)
  //     } else {
  //       // Not found in the Store. Take from server
  //       api.user.item(id).then(item => {
  //         // console.log("User Store, 'item' action, API response:")
  //         // console.log(_item)
  //
  //         // Save port data in the Store.
  //         commit('item', { id, item })
  //
  //         resolve(_item)
  //       }).catch(error => {
  //         reject(error)
  //       })
  //     }
  //   })
  // },

  // // Create Port Data in the Store & server by its ID.
  // create ({ commit, getters }, { parentId, id, item }) {
  //   return new Promise( (resolve, reject) => {
  //     // Try to send data on the server.
  //     api.user.create( parentId, item ).then(item => {
  //       console.log("User Store, 'create' action, API response:")
  //       console.log(item)
  //
  //       // Update port in the Store
  //       commit('item', { id: item.id, parentId, item })
  //
  //       resolve(item)
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // // Update process in the Store & srever by its ID.
  // update ({ commit, getters }, { parentId, id, item }) {
  //   return new Promise( (resolve, reject) => {
  //     // Try to send data on the server.
  //     api.user.update( parentId, id, item ).then(response => {
  //       // console.log("User Store, 'update' action, API response:")
  //       // console.log(response)
  //
  //       // Update port in the Store
  //       commit('item', { id, parentId, item })
  //
  //       resolve(item)
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // // Delete Port Data in the Store & server by its ID.
  // delete ({ commit, getters }, { parentId, id }) {
  //   return new Promise( (resolve, reject) => {
  //     // Try to send data on the server.
  //     api.user.delete( parentId, id ).then(response => {
  //       // console.log("User Store, 'delete' action, API response:")
  //       // console.log(response)
  //
  //       // Update port in the Store
  //       commit('delete', { id, parentId })
  //
  //       resolve(response)
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // }

} // actions


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
