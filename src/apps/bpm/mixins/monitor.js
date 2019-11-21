// import time_limit from './time_limit'
// import moment from 'moment'
var moment = require('moment');
moment.locale('ru');

export default {
  // mixins: [time_limit],

  props: {
    // process: {
    //   type: Object,
    //   default: {}
    // }
  },

  data() {
    return {
      // statusClass: ''
    }
  },

  methods: {
    getProgressValue: function ( item ) {
      let val = ""

      if ( ['pool','pending', 'running', 'hold'].includes(item.status) ) {
        if (item.time_limit) {
          // Установлен лимит времени
          // let finish_ms = (item.created_at + item.time_limit + 3500000) * 1000
          let finish_ms = ( item.created_at + item.time_limit ) * 1000

          if ( finish_ms > Date.now() ) {
            // Не просрочен
            val = "Истекает "
          } else {
            // Просрочен
            val = "Просрочен "
          }

          val = val + String( moment( finish_ms ).fromNow() ) // + " (" + String( finish_ms - Date.now() ) + ")"
        } else {
          // Нет лимита времени
          // val = "отсутствует"
        }
      }

      return val;
    },

    getExecutorName: function () {
      return window.$globals.being_name ? window.$globals.being_name : "ФИО не указано"
    },

    getStatusName: function ( status ) {
      switch (status) {
        case 'pool':
          return 'В пуле'
          break;
        case 'pending':
          return 'В ожидании'
          break;
        case 'progress':
        case 'running':
          return 'В работе'
          break;
        case 'hold':
          return 'Заморожен'
          break;
        case 'finished':
          return 'Завершён'
          break;
        case 'canceled':
          return 'Отменён'
          break;
      }
      return ''
    },

    getStatusColor: function ( status ) {
      switch (status) {
        case 'pool':
          return 'red lighten-1'
          break;
        case 'pending':
          return 'pink lighten-1'
          break;
        case 'running':
          return 'deep-orange lighten-1'
          break;
        case 'hold':
          return 'cyan lighten-1'
          break;
        case 'finished':
          return 'green lighten-1'
          break;
        case 'canceled':
          return 'blue-grey lighten-1'
          break;
      }
      return ''
    },

    /**
     * Returns random avatar url
     *
     * @param sex String, 'men' | 'women'
     */
    getUserAvatarPath: function (sex = '') {
      let sexVal = ['men', 'women']

      if ( !sexVal.includes( sex ) ) {
        // Get random sex value.
        let index = Math.floor(Math.random() * sexVal.length)
        sex = sexVal[ index ]
      }
      return 'https://randomuser.me/api/portraits/' + sex + '/'+ String(Math.floor(Math.random() * 99) + 1) +'.jpg'
    },

    getMessageIcon: function ( messageType = 'info' ) {
      switch (messageType) {
        case "success":
          return "check_circle"
          break;
        case "info":
          return "info"
          break;
        case "warning":
          return "priority_high"
          break;
        case "error":
          return "warning"
          break;
        default:
          return "info"
      }
      return "info"
    }
  } // methods
}
