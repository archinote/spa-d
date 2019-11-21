<template lang="html">
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="true"
    :before-close="doCancel"
    append-to-body
  >

    <template v-if="loading">
      <loading flat :message="false" />
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

    <el-row :gutter="20" v-show="!loading">
      <el-col :span="12">
        <p>Пользователи</p>
        <el-tree style="max-height: 60vh; overflow-y: auto;"
          :data="formDataCurrent.treeData"
          show-checkbox
          default-expand-all
          node-key="id"
          ref="tree"
          :highlight-current="false"
          check-strictly
          :props="{ children: 'children', label: 'name' }">
        </el-tree>
      </el-col>
      <el-col :span="12">
        <div class="availability-types-wrapper">
          <p>Тип доступа</p>
          <el-radio-group v-model="scopeType">
            <template v-for="(item, index) in scopeTypes">
              <el-radio :label="item.key">{{ item.labelText }}</el-radio><br/>
            </template>
          </el-radio-group>
        </div>
      </el-col>
    </el-row>

    <span slot="footer" class="dialog-footer">
      <el-button @click="doCancel()" size="small">{{ cancelText }}</el-button>
      <el-button v-show="!loading" :loading="loadingSubmit" type="primary" @click="doSubmit()" size="small">{{ submitText }}</el-button>
    </span>

  </el-dialog>
</template>

<script>
  const uuidv4 = require('uuid/v4')
  import dialogForm from '../../../mixins/dialogForm'

  export default {
    mixins: [
      dialogForm
    ],

    data() {
      return {
        scopeTypes: [
          {
            key: 10,
            labelText: "Доступно только выбранным",
            scopeText: "Личное исполнение"
          },
          {
            key: 20,
            labelText: "Доступно только тем, кто под выбранным",
            scopeText: "Только подчинённым"
          },
          {
            key: 40,
            labelText: "Доступно выбранным и всем, кто под ним",
            scopeText: "Включая подчинённых"
          }
        ],
        scopeType: 0,
      }
    },

    methods: {
      updateCurrentData: function () {
        this.formDataCurrent = {
          treeData: this.formData.treeData 
            ? this.formData.treeData 
            : []
        }
      },

      validate: function () {
        this.clearErrors()

        if (this.scopeType == 0) {
          this.errors.push("Не указан тип доступа.")
        }

        let selected = this.$refs.tree.getCheckedNodes()
        if (selected.length < 1) {
          this.errors.push("Не выбран ни один пользователь.")
        }
      },

      collectResults: function () {
        let selectedUsers = []
        let selected = this.$refs.tree.getCheckedNodes()

        // Prepare result data
        if (selected && Array.isArray(selected) && selected.length) {
          selected.forEach(element => {
            selectedUsers.push({
              id: uuidv4(),
              post_id: element.id,
              name: element.name,
              contractor_type: element.element_type,
              scope_type: this.scopeType
            })
          })
        }

        return { selectedUsers }
      }
    }
  }
</script>

<style scoped lang="scss">
  .el-radio {
    line-height: 1.5;
  }
</style>
