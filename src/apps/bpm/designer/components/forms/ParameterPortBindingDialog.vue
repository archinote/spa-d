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
      <el-form label-position="top" label-width="160px" size="mini" :model="formDataCurrent">

        <el-checkbox v-model="formDataCurrent.required">Обязательное</el-checkbox><br/>

        <el-checkbox v-model="formDataCurrent.single">Монопольно</el-checkbox><br/>

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
