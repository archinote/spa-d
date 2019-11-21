<template>
  <div>
    <template v-if="loading">
      <loading flat message="Загружаются данные формы. Пожалуйста, подождите." />
    </template>
    <template v-else-if="error">
      <v-alert :value="true" type="error">
        Произошла ошибка. Процесс не может быть запущен.
      </v-alert>
    </template>
    <template v-else>
      <!-- Flex form data -->
      <div v-if="currentFormData && Array.isArray(currentFormData) && currentFormData.length" class="mb-4">

        <v-form ref="form" v-model="valid" lazy-validation>
          <div v-for="(formItem, index) in currentFormData" :key="formItem.id">
            <template v-if="formItem.type == 1 || formItem.type > 5">
              <!-- Text field -->
              <v-text-field
                :label="formItem.name"
                prepend-icon="mdi-cursor-text"
                :hint="formItem.description"
                persistent-hint
                :required="Boolean(formItem.required)"
                :rules="Boolean(formItem.required) ? [rules.required] : []"
                v-model="currentFormData[index].value"
              />
            </template>

            <template v-else-if="formItem.type == 2">
              <!-- Multiline text field -->
              <v-textarea
                :label="formItem.name"
                prepend-icon="mdi-cursor-text"
                :hint="formItem.description"
                persistent-hint
                :required="Boolean(formItem.required)"
                :rules="Boolean(formItem.required) ? [rules.required] : []"
                v-model="currentFormData[index].value"
              />
            </template>

            <template v-else-if="formItem.type == 3">
              <!-- E-mail text field -->
              <v-text-field
                :label="formItem.name"
                prepend-icon="mdi-at"
                :hint="formItem.description"
                persistent-hint
                v-model="currentFormData[index].value"
                :required="Boolean(formItem.required)"
                :rules="Boolean(formItem.required) ? [rules.required, rules.email] : [rules.email]"
              />
            </template>

            <template v-else-if="formItem.type == 4">
              <!-- Date field -->
              <v-menu
                :close-on-content-click="true"
                v-model="formMenus[index]"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  :label="formItem.name"
                  prepend-icon="event"
                  v-model="currentFormData[index].value"
                  :required="Boolean(formItem.required)"
                  :rules="Boolean(formItem.required) ? [rules.required] : []"
                  readonly
                  clearable
                />
                <v-date-picker
                  v-model="currentFormData[index].value"
                  no-title
                  :first-day-of-week="1"
                  locale="ru-ru"
                />
              </v-menu>
            </template>

            <template v-else-if="formItem.type == 5">
              <!-- Checkbox -->
              <v-checkbox
                :label="formItem.name"
                :hint="formItem.description"
                persistent-hint
                v-model="currentFormData[index].value"
              />
            </template>

            <template v-else>
              <v-alert :value="true" color="error" outline>
                Указан неподдерживаемый тип поля формы ({{ formItem.type }}).
              </v-alert>
            </template>
          </div>
          <!-- <small>* эти поля обязательны для заполнения</small> -->
        </v-form>
      </div>

      <!-- Time limit data -->
      <div v-if="timeLimitSec" class="mb-4">
        <p class="title">Ограничение на время выполнения бизнес-процесса</p>
        <p>Установлено ограничение на время выполнения бизнес-процесса: <strong>{{ getTimeValue( timeLimitSec ) }} {{ getTimeTitle( timeLimitSec ) }}</strong>.</p>

        <template v-if="isTimeLimitChangeable">
          <v-expansion-panel>
            <v-expansion-panel-content>
              <div slot="header">Изменить</div>
              <v-card>
                <v-card-text class="grey lighten-4">
                  <!-- <v-container grid-list-sm>
                    <v-layout row wrap>
                        <v-flex md12> -->
                          <v-text-field
                            label="Лимит времени"
                            v-model="timeLimit">
                          </v-text-field>
                        <!-- </v-flex>
                        <v-flex md12> -->
                          <!-- <select class="" name="" v-model="timeLimitFloor">
                            <option v-for="tlt in timeLimitTypes" :value="tlt.floor">{{ getNoun( timeLimit, tlt.title ) }}</option>
                          </select> -->
                          <v-radio-group v-model="timeLimitFloor" row>
                            <v-radio v-for="tlt in timeLimitTypes" :key="tlt.floor"
                              :label="getNoun( timeLimit, tlt.title )"
                              :value="tlt.floor">
                            </v-radio>
                          </v-radio-group>
                        <!-- </v-flex>
                    </v-layout>
                  </v-container> -->
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>
        <template v-else>
          <p>Изменить ограничение времени исполнения нельзя.</p>
        </template>
      </div>

      <!-- Отложенный запуск -->
      <div v-if="isDeferred" class="mb-4">
        <!-- <p class="title">Отложенный запуск</p> -->
        <!-- <p>Можно Указать дату и время запуска бизнес-процесса.</p> -->
        <div class="" style="min-height: 48px;">
          <v-switch label="Отложить запуск" v-model="letDeferrer"></v-switch>
        </div>
        <v-slide-y-transition>
          <v-card v-if="letDeferrer">
            <v-card-text class="grey lighten-4">
              <div class="title my-3">Установите дату и время отложенного запуска</div>
              <v-container grid-list-md>
                <v-layout v-bind="binding">
                  <v-flex sm12 md6>
                    <v-date-picker
                      :first-day-of-week="1"
                      locale="ru-ru"
                      v-model="deferrerDate"
                    ></v-date-picker>
                  </v-flex>
                  <v-flex sm12 md6 lg6>
                    <v-time-picker v-model="deferrerTime" format="24hr"></v-time-picker>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
        </v-slide-y-transition>
      </div>

      <!-- Выбор исполнителя -->
      <div v-if="contractors">
        <p class="title">Исполнитель</p>
        <p class="body-1">
          Вы можете выбрать исполнителя бизнес-процесса.
          <br />
          Если оставить это поле пустым, исполнитель будет определен позднее.
        </p>
        <d-being-selector
          :ids="contractors"
          :postIds="postIds"
          :containerIds="containerIds"
          label="Исполнитель"
          hint="Выберите исполнителя из списка"
          v-model="contractor"
          :use-faker="false"
        />
      </div>

      <template v-if="false && emptyParams">
        <p>Данный бизнес-процесс не имеет входных параметров.</p>
        <!-- <p>Подтвердите запуск бизнес-процесса.</p> -->
      </template>
    </template>
  </div>
</template>

<script>
import time_limit from '../mixins/time_limit'
import monitor from '../mixins/monitor'
import formMixin from '@/mixins/form'

import { getValidationData } from '@/helpers/errors'

import DBeingSelector from '@/components/BeingSelector'

const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

export default {
  name: 'RunPublication',

  mixins: [time_limit, monitor, formMixin],

  components: { DBeingSelector },

  props: {
    // ID of publication to show start form to.
    id: {
      type: [String, Number],
      default: null
    }
  },

  data() {
    return {
      loading: false,
      error: false,

      confirmText: 'Запустить',
      cancelText: 'Отменить',

      // formData: '',
      formMenus: [],
      menu2: false,
      date: null,
      valid: true,

      // Time limits data
      timeLimitSec: 0,
      timeLimit: '',
      timeLimitFloor: 60,
      isTimeLimitChangeable: false,

      isDeferred: false,
      letDeferrer: false,
      deferrerDate: null,
      deferrerTime: null,

      contractors: null,
      postIds: null,
      containerIds: null,
      contractor: null,

      emptyParams: false,

      // Form fields validation rules
      rules: {
        required: (value) => !!value || 'Обязательно для заполнения.',
        email: (value) => {
          const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return value ? (pattern.test(value) || 'Неверный формат электронного адреса.') : true
        }
      }
    }
  },

  computed: {
    rulesEmail() {
      return [this.fieldRequired('email')]
    },
    rulesPassword() {
      return [this.fieldRequired('password')]
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init: function () {
      this.loading = true
      this.error = false

      // Initial form data
      // this.formData = ''
      this.letDeferrer = false
      this.deferrerDate = null
      this.deferrerTime = null

      this.emptyParams = false

      // Load form data & show the form.
      this.$store.dispatch('bpm/catalog/publication/form', { publicationId: this.id }).then(data => {
        // this.formData = []
        if (Array.isArray(data.data) && data.data.length) {
          // this.formData = data.data
          this.setFormData(data.data)

          // clear date field menu widget flag
          this.currentFormData.forEach((element, index) => {
            this.formMenus[index] = false
          })
        }

        // Does 'Time Limit' value can be changed?
        this.timeLimitSec = data.time_limit ? data.time_limit : 0
        this.isTimeLimitChangeable = data.time_limit_changeable ? data.time_limit_changeable : false
        //
        this.timeLimit = this.getTimeValue( this.timeLimitSec )
        this.timeLimitFloor = this.getTimeFloor( this.timeLimitSec )

        // isDeferred
        this.isDeferred = data.deferred ? data.deferred : false

        // Contactors.
        this.contractor = null
        this.contractors = data.contractors ? data.contractors : null
        this.postIds = data.contractors_posts ? data.contractors_posts : null
        this.containerIds = data.contractors_containers ? data.contractors_containers : null

        // Set flag if run publication form has no any params.
        if (!(this.formData.length || this.timeLimitSec || this.isDeferred 
          || this.contractors || this.postIds || this.containerIds)
        ) {
          this.emptyParams = true
        }

        // TODO: implement loading contracts later
      }).catch(error => {
        this.error = true

        console.log(error)
        this.$dmsErrorNoty('Произошла ошибка при обращении к серверу.')
      }).finally(() => {
        this.loading = false
      })
    },

    onSubmit: function() {
      return new Promise((resolve, reject) => {
        // Submit the form.

        // Form data validation (frontend)
        let validationResult = this.currentFormData && Array.isArray(this.currentFormData) && this.currentFormData.length 
          ? this.$refs.form.validate()
          : true

        if (validationResult) {
          // Prepare request params.
          let params = {
            data: this.currentFormData,
          }

          // Add time limit
          if (this.timeLimitSec) {
            params.timeLimit = this.timeLimitSec
          }

          // Add time limit changed state.
          if (this.isTimeLimitChangeable) {
            params.timeLimit = this.timeLimit * this.timeLimitFloor
          }

          // Add Deferred state.
          if (this.isDeferred && this.letDeferrer && this.deferrerDate) {
            if (this.deferrerTime) {
              this.deferrerDate = this.deferrerDate + " " + this.deferrerTime
            }
            params.started_at = Math.floor( Date.parse(this.deferrerDate) / 1000 )
          }

          // Add contractor id.
          if (this.contractor) {
            params.contractor_id = this.contractor
          }

          // Send data to server
          this.$store.dispatch('bpm/catalog/publication/start', {
            publicationId: this.id,
            data: params
          }).then(response => {
            // TODO: remove 'response.status' check. Implement reaction on success response only.

            if ([200, 201].includes(response.status)) {
              this.$dmsSuccessNoty('Процесс успешно стартовал.')

              // Закрываем диалоговое окно формы запуска.
              resolve(true)
            } else 
            // TODO: move this code to error handler section after backend is ready
            if (response.status == 423) {
              this.$dmsWarningNoty('Процесс с аналогичными параметрами уже был запущен. Повторный запуск невозможен.')

              // Пока НЕ закрываем диалоговое окно формы запуска.
              resolve(false)
            } else {
              // NOTE: wrong server response
              if (consoleDebug) console.error('Wrong server response on run BP publiction from Catalog.')
              // При ошибке НЕ закрываем диалоговое окно формы запуска.
              resolve(false)
            }
          }).catch(error => {
            if (consoleDebug) console.warn(error)

            if (error.response.status == 422) {
              // Form validation error (server)
              let validationData = getValidationData(error)
              if (validationData) {
                // TODO: implement server error handler.
                this.setErrors(validationData.errors)
              }

              this.$dmsErrorNoty('Обнаружена ошибка в данных формы запуска.')
            } else 
            if (error.response.status == 423) {
              // Ошибка нарушения монопольного запуска
              this.$dmsWarningNoty('Процесс с аналогичными параметрами уже был запущен. Повторный запуск невозможен.')
            } else {
              // Another error - 500, etc.

              this.$dmsErrorNoty('Произошла ошибка при запуске процесса.')
            }

            // При ошибке НЕ закрываем диалоговое окно формы запуска.
            resolve(false)
          })
        } else {
          // Form validation failed (frontend)
          if (consoleDebug) console.log('Publication form validation failed.')
          resolve(false)
        }
      })
    }
  }
}
</script>
