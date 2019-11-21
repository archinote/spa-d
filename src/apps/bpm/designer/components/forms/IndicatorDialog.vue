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

    <div class="">
      <el-form label-position="right" label-width="160px" size="mini" :model="formDataCurrent">

        <el-form-item label="Тип индикатора" prop="type">
          <el-select v-model="formDataCurrent.type" placeholder="Выберите тип индикатора">
            <el-option
              v-for="item in indicatorTypes" :key="item.value"
              :label="item.label"
              :disabled="item.disabled"
              :value="item.value">
              <span v-if="item.iconClass"><i :class="item.iconClass"></i></span>
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <template v-if="formDataCurrent.type">

          <el-form-item label="Заголовок">
            <el-input v-model="formDataCurrent.name"></el-input>
          </el-form-item>

          <el-form-item label="Описание">
            <el-input v-model="formDataCurrent.description" type="textarea" :rows="2"></el-input>
          </el-form-item>

          <!-- Бытийность ("стартер" - "исполнитель" - "выбор из дерева") -->
          <el-form-item label="Тип получателя" prop="recipient">
            <el-select v-model="formDataCurrent.recipient" placeholder="Выберите тип получателя">
              <el-option
                v-for="item in recipientTypes" :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <!-- <div class="form-group">
            <d-input v-if="formDataCurrent.recipient.type == 3"
              v-model="formDataCurrent.recipient.beeing_id"
              placeholder="Введите #id бытийности получателя"
              type="text"
              :label="true"
              labelName="#ID бытийности получателя">
            </d-input>
          </div> -->

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

    methods: {
      validate: function () {
        this.clearErrors()

        if (this.formDataCurrent.type == null) {
          this.errors.push("Поле 'Тип индикатора' не должно быть пустым.")
        } else {
          if (isEmpty(this.formDataCurrent.name)) {
            this.errors.push("Поле 'Заголовок' не должно быть пустым.")
          }
          if (this.formDataCurrent.recipient == null) {
            this.errors.push("Поле 'Тип получателя' не должно быть пустым.")
          }
        }
      },

      updateCurrentData: function () {
        this.formDataCurrent = {
          id: this.formData && this.formData.id 
            ? this.formData.id 
            : null,
          name: this.formData && this.formData.name 
            ? this.formData.name 
            : '',
          description: this.formData && this.formData.description 
            ? this.formData.description 
            : '',
          type: this.formData && this.formData.type 
            ? this.formData.type 
            : null,
          recipient: this.formData && this.formData.recipient 
            ? this.formData.recipient 
            : null
        }
      },

      collectResults: function () {
        return {
          id: this.formDataCurrent.id 
            ? this.formDataCurrent.id 
            : null,
          name: this.formDataCurrent.name 
            ? this.formDataCurrent.name 
            : '',
          description: this.formDataCurrent.description 
            ? this.formDataCurrent.description 
            : '',
          type: this.formDataCurrent.type 
            ? this.formDataCurrent.type 
            : null,
          recipient: this.formDataCurrent.recipient 
            ? this.formDataCurrent.recipient 
            : null
        }
      }
    }
  }
</script>

<style lang="scss">
</style>
