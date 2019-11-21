import store from '@/store'

/**
 * Выставление состояния загрузки приложения
 * @todo Нужен ли метод?
 * @param {*} loading
 */
function setAppLoading(loading) {
  store.commit('app/layout/setAppLoading', loading)
}

export { setAppLoading }
