<template lang="html">
  <div>

    <!-- Error messages -->
    <panel-alert
      type="error"
      :show="isError"
      :msg="error"
      v-on:hide-alert="hideError"
    />

    <!-- Loading indicator -->
    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <!-- Loading error message & reload button -->
    <reinit-widget v-else-if="onLoadError" v-on:reinit="init()" :msg="onLoadErrorMsg" />

    <template v-else-if="formData">
      <el-form size="mini" :model="formData" :rules="rules" ref="processForm" @submit.native.prevent>

        <el-form-item label="Заголовок" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="Введите заголовок">
          </el-input>
        </el-form-item>

        <el-form-item label="Описание" prop="description">
          <el-input
            type="textarea"
            placeholder="Введите описание"
            v-model="formData.description"
            :autosize="{ minRows: 2, maxRows: 12 }">
          </el-input>
        </el-form-item>

      </el-form>
    </template>

  </div>
</template>

<script>
import panelForm from '../../mixins/panelForm'
import ReinitWidget from '../helpers/ReinitWidget'
import PanelAlert from '../helpers/PanelAlert'
import { getErrorCode, t } from '@/helpers/errors'

const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

export default {
  mixins: [
    panelForm
  ],
  components: {
    ReinitWidget,
    PanelAlert
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },

  data() {
    return {
      rules: {
        name: [
          { required: true, message: 'Обязательно для заполнения', trigger: 'blur' },
          { validator: this.checkServerValidation, trigger: 'blur' }
        ],
        description: [
          { required: true, message: 'Обязательно для заполнения', trigger: 'blur' },
          { validator: this.checkServerValidation, trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    init: function() {
      this.formData = null
      this.loading = true

      this.$store.dispatch('bpm/designer/process/item', { id: this.id }).then(process => {
        this.formData = {
          id: process.id,
          name: process.name ? process.name : '',
          description: process.description ? process.description : ''
        }
      }).catch(error => {
        if (consoleDebug) console.warn(error)
        this.onLoadErrorMsg = t(getErrorCode(error))
      }).finally(() => {
        this.loading = false
        // DEBUG:
        // this.onLoadError = this.onLoadError || Boolean(Math.floor(Math.random() * 10) >= 5)
        // this.onLoadError = true
      })
    },

    // Do save using Store action.
    saveData: function ( data = null ) {
      this.clearErrors()
      this.$refs['processForm'].validate(valid => {
        if (valid) {
          this.$store.dispatch('bpm/designer/process/update', {
            id: data.id,
            name: data.name,
            description : data.description,
          }).then(response => {
            // Send bus event to update process name in all components
            this.$bus.$emit('process.updated', {
              id: data.id,
              name: data.name,
              description : data.description,
            })
          }).catch(error => {
            if (consoleDebug) console.warn(error)
            this.setError(error)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
