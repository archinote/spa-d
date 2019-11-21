<template lang="html">
  <div>

    <!-- Error messages -->
    <template v-if="isError">
      <el-alert
        :title="error"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </template>

    <!-- Loading indicator -->
    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <!-- Loading error message & reload button -->
    <template v-else-if="onLoadError">
      <p>
        <el-alert
          title="Во время загрузки данных произошла ошибка"
          type="error"
          show-icon
          :closable="false">
        </el-alert>
      </p>
      <p>
        <el-button size="mini" icon="el-icon-refresh" @click="() => init()">Обновить</el-button>
      </p>
    </template>

    <template v-else-if="formData">
      <el-form size="mini" :model="formData" @submit.native.prevent>

        <el-form-item label="Заголовок">
          <el-input v-model="formData.name" placeholder="Введите заголовок"></el-input>
        </el-form-item>

        <el-form-item class="ed-field">
          <div class="ed-field__label">
            <label class="el-form-item__label">Описание</label>
          </div>
          <div class="ed-field__content">
            <editor v-model="formData.description" :init="editorConfig" :api-key="editorApiKey" inline></editor>
          </div>
        </el-form-item>

        <!-- Only for input port -->
        <template v-if="formData.type == 'input'">

          <el-form-item label="Метка">
            <el-input v-model="formData.tag" placeholder="Введите метку порта"></el-input>
          </el-form-item>

          <div class="header-title">
            <span class="text-small"><strong>Параметры запуска</strong></span>
          </div>

          <el-form-item label="">
            <el-checkbox v-model="formData.deferred">Разрешить отложенный запуск</el-checkbox><br/>
            <el-checkbox v-model="formData.hold">Возможность заморозки</el-checkbox><br/>
            <el-checkbox v-model="formData.single">Монопольный запуск</el-checkbox>
          </el-form-item>

          <div class="header-title">
            <span class="text-small">Лимит времени</span>
          </div>

          <el-form-item label="Значение" size="mini" label-position="top">
            <!-- <el-input v-model="formData.timeLimitSec" placeholder="Введите значение временного лимита"></el-input> -->
            <el-input-number v-model="formData.timeLimitSec"
              :min="0"
              :max="100"
              size="mini"
              @change="onChangeTimeLimit()"
            />
            <el-radio-group v-model="formData.timeLimitFloor" size="mini">
              <el-radio-button v-for="(tlt, index) in timeLimitTypes" :label="tlt.floor" :key="index">
                {{ getNoun( formData.timeLimitSec, tlt.title ) }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="">
            <el-checkbox v-model="formData.time_limit_changeable">Разрешить изменение при запуске</el-checkbox>
          </el-form-item>

        </template>

      </el-form>
    </template>

  </div>
</template>

<script>
import { debounce } from 'lodash'
import time_limit from '../../../mixins/time_limit'
import visual_editor from '../../../mixins/visual_editor'
import panelForm from '../../mixins/panelForm'

export default {
  mixins: [
    time_limit, 
    visual_editor,
    panelForm
  ],

  props: {
    id: {
      type: [String, Number],
      default: null
    },
    processId: {
      type: [String, Number],
      default: null
    }
  },

  methods: {
    edSetup: function(editor) {
      let self = this

      editor.on('init', e => {
        setTimeout(() => {
          self.loading = false
          self.edReady = true
        }, 300)
      })
    },

    init: function () {
      this.formData = null
      this.onLoadError = false
      this.loading = true

      this.$store.dispatch('bpm/designer/port/item', {
        id: this.id,
        process_model_id: this.processId,
      }).then(processPort => {
        let portData = Object.assign({}, processPort)

        portData.timeLimitSec = processPort.time_limit
          ? this.getTimeValue( processPort.time_limit )
          : 0

        portData.timeLimitFloor = portData.timeLimitSec
          ? this.getTimeFloor( processPort.time_limit )
          : 0

        this.formData = Object.assign({}, portData)
      }).catch( error => {
        // TODO: set correct error message
        // this.error = "Произошла ошибка при получении данных...."
        this.onLoadError = true
      }).finally(() => {
        this.loading = false
      })
    },

    // Do save using Store action.
    saveData: function ( data = null ) {
      let portData = data 
        ? Object.assign({}, data)
        : Object.assign({}, this.formData)
      
      if (portData && portData.name) {
        portData.time_limit = portData.timeLimitSec * portData.timeLimitFloor
        
        this.$store.dispatch('bpm/designer/port/update', portData)

        // Send event on port has changed.
        this.$bus.$emit('port.changed', portData)
      } else {
        this.error = "Поле 'Заголовок' не должно быть пустым"
      }
    },

    onChangeTimeLimit: function () {
      // NOTE: 'timeLimitSec' must not be empty with 'timeLimitFloor'
      if (this.formData.timeLimitSec && this.formData.timeLimitFloor == 0) {
        this.formData.timeLimitFloor = 3600
      }
    }
  }
}
</script>

<style lang="scss">
.ed-field {
  &__label {
    label {
      display: block;
      float: none;
      color: #606266;
      text-align: left;
    }
  }
  &__content {
    .mce-content-body {
      padding: 4px 12px 0px 12px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;

      &.mce-edit-focus {
        outline: none !important;
      }
    }
  }
}
</style>
