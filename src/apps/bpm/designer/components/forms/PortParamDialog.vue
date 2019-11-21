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

    <div class="" v-if="formDataCurrent && formDataCurrent.param">
      <div class="mb-4">
        <el-alert
          :title="getParameterLabelByType(formDataCurrent.type)"
          type="info"
          show-icon
          :closable="false">
        </el-alert>
        <!-- <h4>Тип параметра: <strong>{{ getParameterLabelByType(formDataCurrent.type) }}</strong></h4> -->
      </div>

      <el-form label-position="top" label-width="160px" size="mini" :model="formDataCurrent">

        <el-form-item label="Префикс">
          <el-input v-model="formDataCurrent.param.symbol"></el-input>
        </el-form-item>

        <el-form-item label="Заголовок">
          <el-input v-model="formDataCurrent.param.name"></el-input>
        </el-form-item>

        <el-form-item label="Описание">
          <el-input v-model="formDataCurrent.param.description" type="textarea" :rows="2"></el-input>
        </el-form-item>

        <el-checkbox v-model="formDataCurrent.param.required">Обязательное</el-checkbox><br/>
        <el-checkbox v-model="formDataCurrent.param.single">Монопольно</el-checkbox>

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
        initialFormData: {
          type: 0,
          param: {
            id: 0,
            symbol: '',
            name: '',
            description: '',
            type: 0,
            required: false,
            single: false
          },
        }
      }
    },

    methods: {
      validate: function () {
        this.clearErrors()

        if (this.formDataCurrent.param.symbol == '') {
          this.errors.push("Поле 'Префикс' не должно быть пустым.")
        }
        if (this.formDataCurrent.param.name == '') {
          this.errors.push("Поле 'Заголовок' не должно быть пустым.")
        }
      },

      updateCurrentData: function () {
        this.formDataCurrent = this.formData ? {
          type: this.formData.type ? this.formData.type : 0,
          param: {
            id: this.formData.param.id ? this.formData.param.id : this.initialFormData.param.id,
            symbol: this.formData.param.symbol ? this.formData.param.symbol : this.initialFormData.param.symbol,
            name: this.formData.param.name ? this.formData.param.name : this.initialFormData.param.name,
            description: this.formData.param.description ? this.formData.param.description : this.initialFormData.param.description,
            type: this.formData.param.type ? this.formData.param.type : this.initialFormData.param.type,
            required: this.formData.param.required ? this.formData.param.required : this.initialFormData.param.required,
            single: this.formData.param.single ? this.formData.param.single : this.initialFormData.param.single,
          }
        } : Object.assign({}, this.initialFormData)

        // console.log("PortParamDialog, formDataCurrent")
        // console.log(this.formDataCurrent)
      },

      collectResults: function () {
        return {
          id: this.formDataCurrent.param.id
            ? this.formDataCurrent.param.id
            : this.initialFormData.param.id,
          symbol: this.formDataCurrent.param.symbol
            ? this.formDataCurrent.param.symbol
            : this.initialFormData.param.symbol,
          name: this.formDataCurrent.param.name
            ? this.formDataCurrent.param.name
            : this.initialFormData.param.name,
          description: this.formDataCurrent.param.description
            ? this.formDataCurrent.param.description
            : this.initialFormData.param.description,
          type: this.formDataCurrent.type
            ? this.formDataCurrent.type
            : this.initialFormData.type,
          required: this.formDataCurrent.param.required
            ? this.formDataCurrent.param.required
            : this.initialFormData.param.required,
          single: this.formDataCurrent.param.single
            ? this.formDataCurrent.param.single
            : this.initialFormData.param.single,
        }
      }
    }
  }
</script>

<style lang="scss">
</style>
