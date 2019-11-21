// const state = Object.assign({}, initialState)

const state = {
  contacts: []
}

const getters = {

}

const mutations = {

}

const actions = {
  list ({ dispatch, commit, getters, rootGetters }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let items = []
        let total = 0

        if (state.contacts.length < 1) {
          // Contacts list is empty.
          // Generate dummy list & store it.

          for (let i = 1; i <= 10; i++) {
            let sex = i % 2 ? 'men' : 'women'

            items.push({
              id: i,
              fullname: rootGetters['faker/randomLastname'](sex) + ' ' + rootGetters['faker/randomName'](sex) + ' ' + rootGetters['faker/randomMiddlename'](sex),
              avatar: rootGetters['faker/avatar'](sex),
              phone: '(phone) ' + i + i + i + ' - ' + i + i + i,
              email: 'email-' + i + '@gmail.com',
              lastComDate: '03-фев-2018 11:35',
              comment: rootGetters['faker/lorem']
            })
          } // for

          // Save items in Store.
          // commit('someMutation', items)

          total = items.length
        } else {
          // Get items from Store.
        }

        resolve({
          items,
          total
        })
      }, 60)
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
