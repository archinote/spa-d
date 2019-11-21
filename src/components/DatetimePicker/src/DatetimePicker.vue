<template>
  <v-dialog class="dms-datetime-picker" v-model="display" persistent lazy full-width :width="width">
    <v-text-field slot="activator" v-bind="componentAttrs" persistent-hint :value="formattedDatetime" readonly v-on="componentHandlers"></v-text-field>
    <v-card>
      <v-card-text style="padding: 0;">
        <v-tabs fixed-tabs v-model="activeTab">
          <v-tab key="calendar">
            <v-icon>event</v-icon>
          </v-tab>
          <v-tab key="timer" :disabled="!dateSelected">
            <v-icon>access_time</v-icon>
          </v-tab>
          <v-tab-item key="calendar">
            <v-date-picker full-width v-model="datePart" scrollable :locale="locale" actions>
            </v-date-picker>
          </v-tab-item>
          <v-tab-item key="timer">
            <v-time-picker ref="timer" full-width class="v-time-picker-custom" v-model="timePart" scrollable :format="timePickerFormat" actions>
            </v-time-picker>
          </v-tab-item>
        </v-tabs>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey lighten-1" flat @click.native="closeHandler">{{cancelText}}</v-btn>
        <v-btn color="green darken-1" flat @click="okHandler">{{okText}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_TIME_FORMAT = 'HH:mm'

//@todo Добавить работу с секундами, добавит настрокий выбора даты и времени
export default {
  name: 'd-datetime-picker',
  model: {
    prop: 'datetime',
    event: 'input'
  },
  inheritAttrs: false,
  props: {
    clearable: {
      type: Boolean,
      default: false
    },
    datetime: {
      type: [Date, String],
      default: null
    },
    width: {
      type: Number,
      default: 320
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    outputFormat: {
      type: String,
      default: 'D MMMM YYYY, H:mm, dddd'
    },
    timePickerFormat: {
      type: String,
      default: '24hr'
    },
    locale: {
      type: String,
      default: 'ru-Ru'
    },
    cancelText: {
      type: String,
      default: 'Отмена'
    },
    okText: {
      type: String,
      default: 'Ok'
    }
  },
  data() {
    return {
      display: false,
      dateSelected: false,
      timeSelected: false,
      activeTab: 0,
      currentDatetime: moment(),
      selectDatetime: moment()
    }
  },
  watch: {
    datetime: {
      handler: 'initDate',
      immediate: true
    }
  },
  computed: {
    ...mapState('app/account', {
      userProfile: 'profile'
    }),
    timezone() {
      return this.userProfile && this.userProfile.timezone
    },
    componentAttrs() {
      let result = this.$attrs
      if (this.clearable && this.datetime) {
        if (!result['append-icon']) {
          result['append-icon'] = 'clear'
        }
      }
      return result
    },
    componentHandlers() {
      let result = {}
      if (this.clearable && this.datetime) {
        result['click:append'] = this.clearHandler
      }
      return result
    },
    datePart: {
      get() {
        return this.selectDatetime.format(DEFAULT_DATE_FORMAT)
      },
      set(val) {
        this.dateSelected = true
        this.activeTab = 1
        let date = moment(val, DEFAULT_DATE_FORMAT)
        let hour = this.selectDatetime.hour()
        let minute = this.selectDatetime.minute()
        this.selectDatetime = moment()
          .year(date.year())
          .month(date.month())
          .date(date.date())
          .hour(hour)
          .minute(minute)
          .second(0)
      }
    },
    timePart: {
      get() {
        return this.selectDatetime.format(DEFAULT_TIME_FORMAT)
      },
      set(val) {
        if (this.$refs.timer.selectingHour) {
          return
        }
        this.timeSelected = true
        let time = moment(val, DEFAULT_TIME_FORMAT)
        this.selectDatetime = moment(this.selectDatetime)
          .hour(time.hour())
          .minute(time.minute())
          .second(0)
      }
    },
    formattedDatetime() {
      if (this.datetime) {
        return this.currentDatetime.format(this.outputFormat)
      }
      return ''
    }
  },
  methods: {
    initDate() {
      let date = moment().utc()
      this.dateSelected = true
      if (this.datetime instanceof Date) {
        date = moment(this.datetime)
      } else if (typeof this.datetime == 'string') {
        date = moment.utc(this.datetime, this.format)
      }
      if (this.timezone) {
        this.currentDatetime = date.tz(this.timezone)
      } else {
        this.currentDatetime = date
      }
      this.resetSelectDatetime()
    },
    resetSelectDatetime() {
      this.selectDatetime = this.currentDatetime.clone()
    },
    okHandler() {
      let result = this.selectDatetime
        .clone()
        .utc()
        .format(this.format)
      this.closeHandler()
      this.$emit('input', result)
    },
    closeHandler() {
      this.display = false
      this.activeTab = 0
      this.$refs.timer.selectingHour = true
      this.initDate()
    },
    clearHandler() {
      this.closeHandler()
      this.$emit('input', null)
    }
  }
}
</script>

<style lang="scss">
//@todo Проверить все стили для разного оформелния полей ввода
.dms-datetime-picker {
  margin-top: 4px;
  .v-text-field {
    margin-top: 0;
  }
  .v-time-picker-custom {
    .v-picker__title {
      height: 84px;
      padding-top: 10px;
    }
  }
}
</style>