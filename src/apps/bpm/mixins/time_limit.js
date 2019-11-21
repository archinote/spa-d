import commons from './commons'

export default {

  mixins: [commons],

  data() {
    return {
      timeLimitTypes: [
        {
          title: ['сутки', 'суток', 'суток'],
          floor: 86400
        },
        {
          title: ['час', 'часа', 'часов'],
          floor: 3600
        },
        {
          title: ['минута', 'минуты', 'минут'],
          floor: 60
        },
      ]
    }
  },

  methods: {
    getTimeST: function ( timeInSeconds, resType ) {
      let res = ''

      timeInSeconds = parseInt( timeInSeconds, 10 )

      this.timeLimitTypes.every( function ( element ) {
        if (timeInSeconds % element.floor == 0) {
          if (resType === 'value') {
            res = Math.floor( timeInSeconds / element.floor )
          } else if (resType === 'floor') {
            res = element.floor
          } else if (resType === 'title') {
            res = this.getNoun( Math.floor( timeInSeconds / element.floor ), element.title )
          }
          return false
        } else {
          return true
        }
      }.bind( this ) )

      return res
    },

    getTimeValue: function ( timeInSeconds ) {
      return this.getTimeST( timeInSeconds, 'value' )
    },

    getTimeFloor: function ( timeInSeconds ) {
      return this.getTimeST( timeInSeconds, 'floor' )
    },

    getTimeTitle: function ( timeInSeconds ) {
      return this.getTimeST( timeInSeconds, 'title' )
    },
  }
}
