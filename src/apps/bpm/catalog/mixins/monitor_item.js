import time_limit from './time_limit'

export default {

  mixins: [time_limit],

  props: {
    process: {
      type: Object,
      default: {}
    }
  },

  data() {
    return {
      statusClass: ''
    }
  },

  methods: {

    p_id: function () {
      if (typeof this.process.id !== 'undefined' && this.process.id) {
        return this.process.id
      }
      return ''
    },

    p_tag: function () {
      // Set default 'tag' value if it not exists.
      if (this.process && (!this.process.tag || typeof this.process.tag === 'undefined')) {
        this.process.tag = "#" + this.process.id
      }

      return (this.process && this.process.tag)
        ? this.process.tag
        : ''
    },

    p_title: function () {
      if (this.process.process_model
        && this.process.process_model.attribute
        && this.process.process_model.attribute.name
      ) {
        return this.process.process_model.attribute.name
      }
      return ''
    },

    p_started: function () {
      if (typeof this.process.started_at !== 'undefined' && this.process.started_at) {
        return true
      }
      return false
    },

    p_inPool: function () {
      if (this.process.contractor_id === null
        && !this.p_started()
        && !this.p_finished()
      ) {
        return true
      }
      return false
    },

    p_finished: function () {
      if (typeof this.process.finished_at !== 'undefined' && this.process.finished_at) {
        return true
      }
      return false
    },

    p_status: function () {
      if (this.p_inPool()) {
        this.statusClass = 'isPool'
        return 'В пуле задач'
      } else if ( this.p_finished() ) {
        this.statusClass = 'isFinished'
        return 'Завершён (В архиве)'
      } else if ( this.p_started() ) {
        this.statusClass = 'isProgress'
        return 'На исполнении'
      }
      this.statusClass = 'isWaiting'
      return 'В ожидании'
    },

    p_timeLimit: function () {
      return this.getTimeValue( this.process.time_limit )
        + ' '
        + this.getTimeTitle( this.process.time_limit )
    },

    p_instruction: function () {
      let text = ''

      if ( this.process.process_model
        && this.process.process_model.contractor
        && this.process.process_model.contractor.json
      ) {
        let tmp = ''

        try {
          tmp = JSON.parse( this.process.process_model.contractor.json )
        } catch (e) {
          //
        }

        // console.log(tmp)

        if (tmp && tmp.instuctionText) {
          text = tmp.instuctionText
        }
      }

      return text
    },

    p_data: function () {
      if (typeof this.process.data !== 'undefined' && this.process.data.length) {
        return this.process.data
      }

      return []
    },

    p_startPortName: function () {
      var portName = ''

      if (this.process.process_model
        && this.process.process_model.port
        && this.process.process_model.port.input
        && this.process.process_model.port.input.length
      ) {
        this.process.process_model.port.input.every( function ( element, index, array ) {
          if (element.id == this.process.start_port_id) {
            portName = element.name
            return false
          }
          return true
        }.bind( this ) )
      }

      return portName
    },

    p_finishPorts: function () {
      if (typeof this.process.process_model.port.output !== 'undefined'
        && this.process.process_model.port.output.length
      ) {
        return this.process.process_model.port.output
      }

      return []
    },

  }
}
