<template lang="html">
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="true"
    :before-close="doCancel"
    top="5vh"
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

    <el-row :gutter="20" v-if="formDataCurrent && formDataCurrent.processesTree">
      <el-col :span="12">
        <!-- <p>Выберите бизнес-процесс</p> -->
        <el-tree
          :data="formDataCurrent.processesTree"
          :show-checkbox="false"
          default-expand-all
          node-key="id"
          ref="tree"
          :highlight-current="false"
          check-strictly
          :props="{ children: 'children', label: 'name' }"
          v-on:current-change="setSelectedProcess"
          style="max-height: 70vh; overflow: auto;">
        </el-tree>
      </el-col>
      <el-col :span="12">
        <template v-if="selectedProcess">
          <!-- <p v-if="$bpmDebug.forms">
            <strong>ID</strong>: {{ selectedProcess.id }}
          </p> -->
          <p v-if="selectedProcess.name">
            <strong>Наименование</strong>: {{ selectedProcess.name }}
          </p>
          <p v-if="selectedProcess.description">
            <strong>Описание</strong>: {{ selectedProcess.description }}
          </p>
        </template>
        <template v-else>
          <p>Выберите бизнес-процесс для добавления.</p>
        </template>
      </el-col>
    </el-row>

    <span slot="footer" class="dialog-footer">
      <el-button @click="doCancel()" size="small">{{ cancelText }}</el-button>
      <el-button v-show="!loading" :loading="loadingSubmit" type="primary" @click="doSubmit()" size="small" :disabled="Boolean(selectedProcess === null)">{{ submitText }}</el-button>
    </span>

  </el-dialog>
</template>

<script>
  import dialogForm from '../../../mixins/dialogForm'

  export default {
    mixins: [
      dialogForm
    ],

    data() {
      return {
        selectedProcess: null
      }
    },

    watch: {
      formData: {
        handler (newVal, oldVal) {
          if (this.formData && this.formData.processesTree) {
            this.formDataCurrent = {
              processesTree: this.formData.processesTree
            }
          } else {
            this.formDataCurrent = null
          }
        },
        deep: true
      },
      isVisible: function (newVal, oldVal) {
        // Clear current selection on open this dialog window.
        if (newVal) {
          this.selectedProcess = null
        }
      }
    },

    methods: {
      setSelectedProcess: function (nodeTree, node) {
        if (node && node.data && node.data.id) {
          this.selectedProcess = node.data
        } else {
          this.selectedProcess = null
        }
      },

      validate: function () {
        this.clearErrors()

        // let selected = this.$refs.tree.getCheckedNodes()
        if (this.selectedProcess === null) {
          this.errors.push("Select a process to add in the tree.")
        }
      },

      collectResults: function () {
        return this.selectedProcess
      }
    }
  }
</script>

<style lang="scss">
</style>
