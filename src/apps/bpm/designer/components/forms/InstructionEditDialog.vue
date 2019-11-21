<template lang="html">
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="true"
    :before-close="doCancel"
    append-to-body
    width="66%"
    >

    <template v-if="loading || isLoading">
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

    <editor 
      v-model="formDataCurrent.text" 
      :init="editorBaseConfig" 
      :api-key="editorApiKey">
    </editor>

    <span slot="footer" class="dialog-footer">
      <el-button @click="doCancel()" size="small">{{ cancelText }}</el-button>
      <el-button v-show="!loading" :loading="loadingSubmit" type="primary" @click="doSubmit()" size="small">{{ submitText }}</el-button>
    </span>

  </el-dialog>
</template>

<script>
import dialogForm from '../../../mixins/dialogForm'

import Editor from '@tinymce/tinymce-vue'

export default {
  mixins: [
    dialogForm
  ],

  components: {
    Editor
  },

  data() {
    return {
      initialFormData: {
        text: ''
      },

      isLoading: false,

      formDataCurrent: {},

      editorBaseConfig: {
        plugins: 'print preview fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor imagetools contextmenu colorpicker textpattern',
        toolbar: 'formatselect | fontselect | fontsizeselect | bold italic strikethrough forecolor backcolor | image media link | alignleft aligncenter alignright alignjustify  | numlist bullist | outdent indent  | removeformat | hr charmap fullscreen',
        menubar: false, 
        image_advtab: false,
        language_url: '/static/tinymce_langs/ru.js',
        language: 'ru',
      },
      editorApiKey: "t19z3fx7xwcvas9m8ogdwjg110vmc8hbtnig4u88il6yve2r",
    }
  },

  methods: {
    updateCurrentData: function () {
      this.formDataCurrent = Object.assign({}, this.initialFormData, this.formData)
    },

    collectResults: function () {
      let text = this.formDataCurrent && this.formDataCurrent.text
        ? this.formDataCurrent.text
        : ''

      return {
        text
      }
    }
  }
}
</script>

<style lang="scss">
</style>
