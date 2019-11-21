<template lang="html">
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="true"
    :before-close="doCancel"
    append-to-body
    width="480px"
    >

    <template v-if="loading">
      <loading />
    </template>

    <div v-if="errors && errors.length" style="margin-bottom: 16px;">
      <el-alert
        title="Возникли ошибки"
        :description="getErrors()"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </div>

    <div class="" v-if="formDataCurrent">
      <div class="mb-4">
        <el-alert
          :title="getParameterLabelByType(formDataCurrent.type)"
          type="info"
          show-icon
          :closable="false">
        </el-alert>
      </div>

      <el-form label-position="top" label-width="160px" size="mini" :model="formDataCurrent">

        <div style="border: 1px dotted grey; margin-bottom: 18px; padding: 12px;">
          <el-form-item label="Заголовок *">
            <el-input v-model="formDataCurrent.name"></el-input>
          </el-form-item>

          <el-form-item label="Описание *">
            <el-input v-model="formDataCurrent.description" type="textarea" :rows="2"></el-input>
          </el-form-item>

          <div><small>* &ndash; эти поля будут видны пользователю</small></div>
        </div>

        <el-form-item label="Префикс">
          <el-input v-model="formDataCurrent.symbol"></el-input>
        </el-form-item>

        <!-- <el-checkbox v-model="formDataCurrent.required">Обязательное</el-checkbox><br/> -->
        <!-- <el-checkbox v-model="formDataCurrent.single">Монопольно</el-checkbox><br/> -->
        <el-checkbox v-model="formDataCurrent.multi">Мультизначный параметр</el-checkbox><br/>

      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="doCancel()" size="small">{{ cancelText }}</el-button>
      <el-button v-show="!loading" :loading="loadingSubmit" type="primary" @click="doSubmit()" size="small">{{ submitText }}</el-button>
    </span>

  </el-dialog>
</template>

<script>
// mixins
import dialogForm from '../../../mixins/dialogForm'
import designer from '../../mixins/designer'

export default {
  mixins: [
    dialogForm,
    designer
  ],

  data() {
    return {
    }
  },

  methods: {
    validate: function () {
      this.clearErrors()

      if (this.formDataCurrent.symbol == '') {
        this.errors.push("Поле 'Префикс' не должно быть пустым.")
      }
      if (this.formDataCurrent.name == '') {
        this.errors.push("Поле 'Заголовок' не должно быть пустым.")
      }
    },

    updateCurrentData: function () {
      this.formDataCurrent = Object.assign({}, this.formData)
    },

    collectResults: function () {
      return this.formDataCurrent
    }
  }
}
</script>

<style lang="scss">
</style>
