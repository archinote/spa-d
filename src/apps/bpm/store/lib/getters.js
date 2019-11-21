/**
 * 
 */
const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

let items = (state) => () => Object.values(state.items)

let filteredItems = (state) => (filters) => Object.values(state.items).filter(item => {
  let res = true

  for (const prop in filters) {
    if (!(item.hasOwnProperty(prop) && item[prop] == filters[prop])) res = false 
  }

  return res
})

let item = (state) => (id) => state.items[id]
// TODO: replace with:
/*let item = (state) => (id) => {
  if (state.items[id]) {
    return state.items[id]
  } else {
    // No such element found.
    // Put it in 'later load' query
    state.laterLoadIds.push(id)
    return Object.assign({}, state.loadingItem, { id })
  }
}*/

let getters = {
  items,
  filteredItems,
  list: items,
  filteredList: filteredItems,
  item
}

export { 
  getters as default, 
  items, 
  items as list, 
  item
}
