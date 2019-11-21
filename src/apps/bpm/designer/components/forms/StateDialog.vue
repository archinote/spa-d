<template lang="html">
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="true"
    :before-close="doCancel"
    append-to-body
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

    <div v-if="formDataCurrent && formDataCurrent.state && formDataCurrent.state.indicator_id">
      <el-form label-position="right" label-width="200px" size="mini" :model="formDataCurrent">

        <el-form-item label="Родительский индикатор" prop="type">
          <el-select v-model="formDataCurrent.state.indicator_id" placeholder="Выберите родительский индикатор">
            <el-option v-for="item in formDataCurrent.indicators"
              :key="item.id"
              :label="item.name"
              :value="item.id">
              <span v-if="item.iconClass"><i :class="item.iconClass"></i></span>
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <template v-if="formDataCurrent.state.indicator_id">

          <el-form-item label="Заголовок">
            <el-input v-model="formDataCurrent.state.name"></el-input>
          </el-form-item>

          <!-- NOTE: State has no 'description' property at this moment. -->
          <!-- <el-form-item label="Описание">
            <el-input v-model="formDataCurrent.state.description" type="textarea" :rows="2"></el-input>
          </el-form-item> -->

          <template v-if="getParentIndicatorType() == 1">
            <h4>Тип индикации: Виджет на панели</h4>

            <el-form-item label="Заголовок сообщения">
              <el-input v-model="formDataCurrent.message.title"></el-input>
            </el-form-item>

            <el-form-item label="Текст сообщения">
              <el-input v-model="formDataCurrent.message.content" type="textarea" :rows="2"></el-input>
            </el-form-item>
          </template>

          <template v-else-if="getParentIndicatorType() == 2">
            <h4>Тип индикации: E-mail</h4>

            <p>This widget is under construction.</p>
          </template>

          <template v-else-if="getParentIndicatorType() == 3">
            <h4>Тип индикации: SMS</h4>

            <p>This widget is under construction.</p>
          </template>

        </template>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="doCancel()" size="small">{{ cancelText }}</el-button>
      <el-button v-show="!loading" :loading="loadingSubmit" type="primary" @click="doSubmit()" size="small">{{ submitText }}</el-button>
    </span>

  </el-dialog>
</template>

<script>
  import dialogForm from '../../../mixins/dialogForm'
  import designer from '../../mixins/designer'
  import { isEmpty } from 'lodash'

  export default {
    mixins: [
      dialogForm,
      designer
    ],

    // props: {
    //   formData: null
    // },

    data() {
      return {
        initialFormData: {
          state: {
            id: null,
            indicator_id: null,
            name: ''
          },
          message: {
            // beeing_type: '',
            // beeing: '',
            title: '',
            content: '',
            emailTo: '',
            emailFrom: '',
            title: '',
            phoneNumber: ''
          },
          indicators: []
        }
      }
    },

    methods: {
      validate: function () {
        this.clearErrors()

        if (isEmpty(this.formDataCurrent.state.name)) {
          this.errors.push("Поле 'Заголовок' не должно быть пустым.")
        }
      },

      updateCurrentData: function() {
        this.formDataCurrent = this.formData
          ? {
            indicators: this.formData.indicators
              ? this.formData.indicators
              : [],
            state: Object.assign({}, this.formData.state
              ? this.formData.state
              : this.initialFormData.state),
            message: Object.assign({}, this.initialFormData.message,
              Boolean(this.formData.state && this.formData.state.settings)
                ? JSON.parse(this.formData.state.settings)
                : {}
              ),
          }
          : Object.assign({}, this.initialFormData)

        // console.log("StateDialog, updateCurrentData(), formDataCurrent:")
        // console.log(this.formDataCurrent)
      },

      collectResults: function () {
        return {
          id: this.formDataCurrent.state.id ? this.formDataCurrent.state.id : null,
          name: this.formDataCurrent.state.name ? this.formDataCurrent.state.name : '',
          indicator_id: this.formDataCurrent.state.indicator_id ? this.formDataCurrent.state.indicator_id : null,
          // settings: this.formDataCurrent.message
          settings: JSON.stringify({
            title: this.formDataCurrent.message.title ? this.formDataCurrent.message.title : '',
            content: this.formDataCurrent.message.content ? this.formDataCurrent.message.content : ''
          })
        }
      },

      getParentIndicatorType: function () {
        let type = 0

        if (this.formDataCurrent && this.formDataCurrent.state && this.formDataCurrent.state.indicator_id) {
          if (this.formDataCurrent.indicators) {
            let _indicator = this.formDataCurrent.indicators.find(
              element => Boolean(element.id == this.formDataCurrent.state.indicator_id)
            )

            if (_indicator && _indicator.type) type = _indicator.type
          }
        }

        return type
      }
    }
  }
</script>

<style lang="scss">
</style>
