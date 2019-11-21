<template lang="html">
  <div class="process-executors">

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
    <template v-if="isLoading">
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

      <!-- Executors -->
      <div class="custom-tree-node header-title">
        <span class="text-small"><strong>{{ subTitle }}</strong></span>
        <span>
          <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="() => showSelectUsersDialog()"></el-button>
        </span>
      </div>
      <el-tree
        v-if="formData.contractors && formData.contractors.length"
        :data="formData.contractors"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        class="flat-tree">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-html="getUserName(data, node)"></span>
          <span>
            <el-button type="text" size="mini" icon="el-icon-delete" @click="() => removeUser(data)"></el-button>
          </span>
        </span>
      </el-tree>
      <p v-else>Отсутствуют</p>

      <el-form v-if="role == 1" size="mini" label-position="top" style="margin-top: 16px;">
        <!-- Execution properties -->
        <el-form-item label="Тип исполнения">
          <el-radio-group v-model="formData.execution_type">
            <el-radio :label="2">Возможность выбирать конкретного исполнителя</el-radio><br/>
            <el-radio :label="3">Назначать исполнителя автоматически системой</el-radio><br/>
            <el-radio :label="1">Добавлять в пул</el-radio><br/>
          </el-radio-group>
        </el-form-item>

        <!-- Instruction -->
        <el-form-item label="Инструкция">
          <div 
            v-html="instructionContent"
            class="instruction-preview" 
            @click="() => showInstructionEditDialog()"
            title="Редактировать текст инструкции"
          ></div>
          <el-button 
            type="text" 
            size="mini" 
            icon="el-icon-edit" 
            @click="() => showInstructionEditDialog()"
          >Редактировать</el-button>
        </el-form-item>

        <!-- TODO: uncomment later -->
        <!-- <el-form-item label="Дополнительные параметры">
          <el-checkbox v-model="formData.extended_finish" disabled>Расширенное завершение</el-checkbox>
        </el-form-item> -->
      </el-form>

    </template>

    <SelectUsersDialog
      :isVisible="isUsersDialogVisible"
      :formData="{ treeData: usersTree }"
      :loading="isUsersDataLoading"
      v-on:submit="addUser"
      v-on:cancel="() => { isUsersDialogVisible = false }"
      title="Добавление исполнителей"
    />
  </div>
</template>

<script>
import SelectUsersDialog from '../forms/SelectUsersDialog'
import InstructionEditor from '../forms/InstructionEditor'

import panelForm from '../../mixins/panelForm'
import { debounce } from 'lodash'

export default {
  components: {
    SelectUsersDialog,
    InstructionEditor
  },

  mixins: [
    panelForm
  ],

  props: {
    id: {
      type: [String, Number],
      default: null
    },
    role: {
      type: [String, Number],
      default: 1
    },
    subTitle: {
      type: String,
      default: 'Назначения'
    }
  },

  data() {
    return {
      loadingFormData: false,
      loadingContractors: false,

      isUsersDialogVisible: false,
      isUsersDataLoading: false,
      usersTree: [],

      scopeTypes: [
        {
          key: 10,
          labelText: "Доступно только выбранным",
          scopeText: "Личное исполнение"
        },
        {
          key: 20,
          labelText: "Доступно только тем, кто под выбранным",
          scopeText: "Только подчинённые"
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

  computed: {
    isLoading: function () {
      return this.loadingFormData || this.loadingContractors
    },
    instructionContent () {
      let instruction = this.$store.getters['bpm/designer/process/instruction/item'](this.id)
      return instruction.content
    },
    instructionContentHtml () {
      let instruction = this.$store.getters['bpm/designer/process/instruction/item'](this.id)
      return instruction.contentHTML
    }
  },

  methods: {
    init: function () {
      this.formData = null
      this.onLoadError = false
      this.loadingFormData = true

      this.$store.dispatch('bpm/designer/process/execution/list', { parentId: this.id, role: this.role }).then(data => {
        let formData  = {
          id: this.id,
          execution_type: data.execution_type ? data.execution_type : 0,
          extended_finish: data.extended_finish ? Boolean(data.extended_finish) : false,
          instructionHTML: data.instruction ? data.instruction : '',
          contractors: data.contractors && Array.isArray(data.contractors) ? data.contractors : []
        }

        // Save process execution instruction in the Store.
        this.$store.commit('bpm/designer/process/instruction/setItem', {
          id: this.id,
          contentHTML: formData.instructionHTML
        })

        // Contractors - now we have contractor ID's only.
        // Load contractors other/full info - name, avatar, etc.
        if (formData.contractors.length) {
          
          let posts = []
          let containers = []

          // NOTE: available 'contractor_type': "container" || "post"
          // Separate contractors by its type.
          formData.contractors.forEach(contractor => {
            if (contractor.contractor_type == 'post') {
              posts.push(contractor.post_id)                  
            } else {
              containers.push(contractor.post_id)                  
            }
          })

          // Load posts & containers info by its IDs
          this.loadingContractors = true
          this.$store.dispatch('app/org/entitiesInfo', { posts, containers }).then(response => {
            const containersData = response.containers_data
              ? response.containers_data
              : []
            const postsData = response.posts_data
              ? response.posts_data
              : []

            formData.contractors.forEach((contractor, index) => {
              let user = postsData.find(
                _user => Boolean(_user.id == contractor.post_id)
              )
              if (typeof user === 'undefined') {
                user = containersData.find(
                  _user => Boolean(_user.id == contractor.post_id)
                )
              }

              if (user) {
                let userData = {
                  name: user.name,
                  fullname: user.fullname
                }

                let _contractor = Object.assign({}, contractor, userData)

                formData.contractors.splice(index, 1, _contractor)
              }
            })

            this.formData = Object.assign({}, formData)
          }).catch( error => {
            console.warn(error)
            this.error = "No executors data..."
          }).finally(() => {
            this.loadingContractors = false
          })
        } else {
          this.formData = Object.assign({}, formData)
        }
      }).catch( error => {
        console.warn(error)
        // TODO: set correct error message
        // this.error = "Произошла ошибка при получении данных..."
        this.onLoadError = true
      }).finally(() => {
        this.loadingFormData = false
      })
    },

    getScopeText: function (scopeValue) {
      let scopeText = ''

      this.scopeTypes.every(scope => {
        if (scope.key == scopeValue) {
          scopeText = scope.scopeText
          return false
        }
        return true
      })

      return scopeText ? scopeText : "invalid"
    },

    showInstructionEditDialog: function () {
      this.$store.dispatch('confirmer/ask', {
        width: '80%',
        title: 'Инструкция по выполнению БП',
        component: InstructionEditor,
        props: {
          id: this.id,
          text: this.formData && this.formData.instructionHTML ? this.formData.instructionHTML : ''
        },
        confirmText: 'Сохранить',
        cancelText: 'Отменить',
      }).then(confirm => {
        if (confirm) {
          // Update instruction content.
          Object.assign(this.formData, {
            instructionHTML: this.instructionContentHtml,
            instruction: this.instructionContent
          })
        }
      })
    },

    showSelectUsersDialog: function () {
      // Send to dialog loading indicator
      this.isUsersDataLoading = true
      // Show the dialog
      this.isUsersDialogVisible = true

      // Load dialog data - get orgStructure tree
      this.$store.dispatch('app/org/tree', 'bpm').then(usersTree => {
        this.usersTree = usersTree ? usersTree : null
      }).catch( error => {
        this.error = "No users tree data..."
      }).finally(() => {
        this.isUsersDataLoading = false
      })
    },

    getUserName: function(data, node) {
      let name = data && data.name
        ? data.name
        : ''
      let scopeText = data && data.scope_type
        ? this.getScopeText(data.scope_type)
        : 'invalid'

      return `<strong>${name}</strong> (${scopeText})`
    },

    addUser: function ({ selectedUsers }) {
      // Hide dialog.
      this.isUsersDialogVisible = false

      // Add contractors to list.
      if (Array.isArray(selectedUsers)) {
        selectedUsers.forEach(element => {
          this.formData.contractors.push(element)
        })
      }
    },

    removeUser: function (data) {
      if (data && data.id) {
        let index = this.formData.contractors.findIndex( element => Boolean(element.id == data.id))

        if (index >= 0) this.formData.contractors.splice(index, 1)
      }
    },

    saveData: function () {
      // Do save using Store action.
      this.$store.dispatch('bpm/designer/process/execution/update', {
        parentId: this.formData.id,
        item: {
          role: this.role,
          execution_type : this.formData.execution_type,
          extended_finish: this.role == 1 ? this.formData.extended_finish : null,
          instruction: this.role == 1 ? this.formData.instructionHTML : null,
          contractors : this.formData.contractors
        }
      })
    }
  }
}
</script>

<style lang="scss">
.instruction-preview {
  width: 100%; 
  max-height: 200px; 
  border: 1px solid grey; 
  border-radius: 2px;
  background: lightgrey; 
  overflow: auto;
  color: grey;
  padding: 12px;
  cursor: pointer;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  line-height: 1.4;
}
</style>
