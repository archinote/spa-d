import moment from 'moment'
const getters = {
  /**
   * Перевод даты из UTC в локаль и временную зону пользователя
   */
  localizationDate: (state, getters, rootState, rootGetters) => date => {
    let timezone = rootGetters['app/account/accountTimeZone']
    let m = moment.utc(date).tz(timezone)
    //@todo Сделать получение и смену локали
    m.locale('ru-Ru')
    return m
  },
  /**
   * Форматирование даты и времени
   */
  formatDatetime: (state, getters, rootState, rootGetters) => (
    date,
    formats
  ) => {
    let m = getters.localizationDate(date)
    //Форматы даты и времени
    let f = Object.assign(
      {},
      {
        full: 'D MMMM YYYY, H:mm, dddd',
        middle: 'D MMMM YYYY, H:mm',
        short: 'D MMM, H:mm'
      },
      formats
    )
    return {
      full: m.format(f.full),
      middle: m.format(f.middle),
      short: m.format(f.short),
      date: m
    }
  },
  /**
   * Форматирование даты
   */
  formatDate: (state, getters, rootState, rootGetters) => (date, formats) => {
    let m = getters.localizationDate(date)
    //Форматы даты и времени
    let f = Object.assign(
      {},
      {
        full: 'D MMMM YYYY, dddd',
        middle: 'D MMMM YYYY',
        short: 'D MMM'
      },
      formats
    )
    return {
      full: m.format(f.full),
      middle: m.format(f.middle),
      short: m.format(f.short),
      date: m
    }
  }
}
export default {
  namespaced: true,
  getters
}
