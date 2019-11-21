import time_limit from './time_limit'
import commons from './commons'
import monitor from './monitor'

export default {

  mixins: [time_limit, commons, monitor],

  data() {
    return {
      isInputDataVisible: false,
      isOutputDataVisible: false,
      isInstructionVisible: false,

      loadingItemDataId: null,
    }
  },

  methods: {
    getMonitorItemProperties: function (item, propertyCodes) {
      let properties = []

      propertyCodes.forEach(code => {
        switch (code) {

          // Пользователь, запустивший процесс
          case 'customer':
            if (item.customer) {
              properties.push({
                avatar: true,
                image: item.customer.image ? item.customer.image : '',
                avatarIcon: 'face',
                title: item.customer.name,
                subTitle: 'Стартер (запустивший процесс)',
                command: '',
                action: false,
                actionIcon: '',
                user: item.customer
              })
            }
            break;

          // Исполнитель
          case 'contractor':
            let hasContractor = item.contractor
            properties.push({
              avatar: true,
              image: hasContractor && item.contractor.image ? item.contractor.image : '',
              avatarIcon: hasContractor ? 'face' : 'mdi-account-off',
              title: hasContractor ? item.contractor.name : 'Не назначен',
              subTitle: 'Исполнитель',
              command: '',
              action: false,
              actionIcon: '',
              user: hasContractor ? item.contractor : null
            })
            break;

          // Заголовок процесса
          case 'processTitle':
            if (item.titleProcess) {
              properties.push({
                avatar: false,
                avatarIcon: 'info_outline',
                title: item.titleProcess,
                subTitle: 'Процесс',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Заголовок порта процесса.
          case 'processPort':
            if (item.titlePort) {
              properties.push({
                avatar: false,
                avatarIcon: 'info_outline',
                title: item.titlePort,
                subTitle: 'Порт запуска',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Дата создания
          case 'created':
            if (item.created_at) {
              properties.push({
                avatar: false,
                avatarIcon: 'event',
                title: this.getHumanDateFromSec( item.created_at ),
                subTitle: 'Дата и время создания',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Дата запуска
          case 'started':
            if (item.started_at) {
              properties.push({
                avatar: false,
                avatarIcon: 'event',
                title: this.getHumanDateFromSec( item.started_at ),
                subTitle: 'Дата и время запуска',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Дата исполнения
          case 'executed':
            if (item.status && item.status !== 'canceled' && item.executed_at) {
              properties.push({
                avatar: false,
                avatarIcon: 'event',
                title: ['running', 'finished'].includes(item.status)
                  ? this.getHumanDateFromSec( item.executed_at )
                  : 'Ожидает исполнения',
                subTitle: 'Дата и время начала выполнения',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Дата завершения
          case 'finished':
            if (item.finished_at) {
              properties.push({
                avatar: false,
                avatarIcon: 'event',
                title: ['finished'].includes(item.status)
                  ? this.getHumanDateFromSec( item.finished_at )
                  : 'В исполнении',
                subTitle: 'Дата и время завершения',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Лимит времени выполнения
          case 'time_limit':
            if (item.time_limit) {
              properties.push({
                avatar: false,
                avatarIcon: item.time_limit ? 'alarm_on' : 'alarm_off',
                title: item.time_limit
                  ? this.getTimeValue( item.time_limit ) + " " + this.getTimeTitle( item.time_limit ) + " (до " + this.getHumanDateFromSec( item.started_at + item.time_limit, "D MMMM YYYY, H:mm" ) + ")"
                  : 'Не установлен',
                subTitle: 'Лимит времени выполнения',
                command: ''
              })
            }
            break;

          // Инструкция по выполнению
          case 'instruction':
            if (item.instruction) {
              properties.push({
                avatar: false,
                avatarIcon: 'info_outline',
                title: 'Инструкция по выполнению',
                subTitle: '',
                command: function () {
                  this.isInstructionVisible = !this.isInstructionVisible
                }.bind( this ),
                action: true,
                actionIcon: this.isInstructionVisible ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
              })
            }
            break;

          // Исполнение приостановлено
          case 'hold':
            if (['hold'].includes(item.status)) {
              properties.push({
                avatar: false,
                avatarIcon: 'pause_circle_outline',
                title: 'Исполнение приостановлено',
                subTitle: '',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Исполнение отменено
          case 'canceled':
            if (['canceled'].includes(item.status)) {
              properties.push({
                avatar: false,
                avatarIcon: 'stop',
                title: 'Исполнение отменено',
                subTitle: '',
                command: '',
                action: false,
                actionIcon: ''
              })
            }
            break;

          // Срок выполнения
          case 'deadline':
            if (!['canceled', 'finished'].includes(item.status)) {
              properties.push({
                avatar: false,
                avatarIcon: item.time_limit ? 'alarm_on' : 'alarm_off',
                title: item.time_limit
                  ? this.getProgressValue( item ) + " (" + this.getHumanDateFromSec( item.started_at + item.time_limit, "D MMMM YYYY, H:mm" ) + ")"
                  : 'Не установлен',
                subTitle: 'Срок выполнения',
              })
            }
            break;

          // Входящие данные
          case 'input':
            if (['running', 'hold', 'finished'].includes(item.status)) {
              let dataExists = Boolean(item.data && item.data.input && Array.isArray(item.data.input) && item.data.input.length)
              let loading = this.loadingItemDataId == item.id
              let subTitle = loading
                ? 'идёт обновление...'
                : (dataExists ? 'Присутствуют' : 'Отсутствуют')

              properties.push({
                avatar: false,
                avatarIcon: 'assignment',
                title: 'Входящие данные',
                subTitle: subTitle,
                command: function () {
                  this.isInputDataVisible = !this.isInputDataVisible
                }.bind( this ),
                action: true,
                actionIcon: this.isInputDataVisible ? 'keyboard_arrow_down' : 'keyboard_arrow_up',
                loading: loading,
                disabled: loading
              })
            }
            break;

          // Выходящие данные
          case 'output':
            if (['finished'].includes(item.status)) {
              let dataExists = Boolean(item.data && item.data.output && Array.isArray(item.data.output) && item.data.output.length)
              let loading = this.loadingItemDataId == item.id
              let subTitle = loading
                ? 'идёт обновление...'
                : (dataExists ? 'Присутствуют' : 'Отсутствуют')

              properties.push({
                avatar: false,
                avatarIcon: 'assignment',
                title: 'Исходящие данные',
                subTitle: subTitle,
                command: function () {
                  this.isOutputDataVisible = !this.isOutputDataVisible
                }.bind( this ),
                action: true,
                actionIcon: this.isOutputDataVisible ? 'keyboard_arrow_down' : 'keyboard_arrow_up',
                loading: loading,
                disabled: loading
              })
            }
            break;

          // Статус процесса
          case 'status':
            if (item.status) {
              properties.push({
                avatarIcon: 'info_outline',
                title: this.getStatusName( item.status ),
                subTitle: 'Статус процесса',
              })
            }
            break;

          //
          case '':
            break;
        } // switch
      })

      return properties
    }
  }
}
