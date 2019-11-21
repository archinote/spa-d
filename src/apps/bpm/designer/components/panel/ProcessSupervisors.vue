<template lang="html">
  <div class="process-supervisors">

    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <template v-if="isError">
      <el-alert
        :title="error"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </template>

    <template v-if="formData">

      <!-- Supervisors -->
      <div class="custom-tree-node header-title">
        <span class="text-small"><strong>Назначенные супервайзеры</strong></span>
        <span>
          <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="() => showSelectUsersDialog()"></el-button>
        </span>
      </div>
      <div v-if="formData.contractors && formData.contractors.length">
        <el-tree
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
      </div>
      <div v-else>
        <p>Список супервайзеров пуст.</p>
      </div>

    </template>

    <SelectUsersDialog
      :isVisible="isUsersDialogVisible"
      :formData="{ treeData: usersTree }"
      :loading="isUsersDataLoading"
      v-on:submit="addUser"
      v-on:cancel="() => { isUsersDialogVisible = false }"
      title="Добавление супервайзеров"
    />

  </div>
</template>

<script>
  import SelectUsersDialog from '../forms/SelectUsersDialog'
  var _ = require('lodash')

  export default {
    components: {
      SelectUsersDialog
    },

    props: {
      id: {
        type: [String, Number],
        default: null
      }
    },

    watch: {
      id: function () {
        this.init()
      },
      formData: {
        handler (newValue, oldValue) {
          // console.log("processSupervisors Form watcher, formData changed:")
          // console.log("newValue: ")
          // console.log(newValue)
          // console.log("oldValue: ")
          // console.log(oldValue)

          // Save form data
          if (newValue && oldValue
            && newValue.id && oldValue.id
            && newValue.id == oldValue.id)
          {
            this.debouncedSaveData( newValue )
          } else {
            // console.log("Another process in the form!");
          }
        },
        deep: true
      }
    },

    data() {
      return {
        formData: null,
        loading: false,
        error: '',

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

    created: function () {
      this.debouncedSaveData = _.debounce(this.saveData, 1500, { 'maxWait': 3000 })
    },

    mounted() {
      this.init()
    },

    methods: {
      hideError: function() {
        setTimeout( () => {
          this.error = ''
        }, 600)
      },

      init: function () {
        if (this.id) {
          this.loading = true

          this.$store.dispatch('designer/getProcessSupervising', { id: this.id }).then(data => {
            this.loading = false

            if ( data ) {
              // console.log("Process supervising:")
              // console.log(data)

              this.formData = {
                id: this.id,
                contractors: data.contractors,
              }
            } else {
              this.error = "Произошла ошибка при получении данных...."
            }
          }).catch( error => {
            this.loading = false
            this.error = "Произошла ошибка при получении данных...."
          })
        }
      },

      getScopeText: function (scopeValue) {
        let scopeText = ''

        this.scopeTypes.every(function (element) {
          if (element.key == scopeValue) {
            scopeText = element.scopeText
            return false
          }
          return true
        })

        return scopeText
      },

      getUserName: function(data, node) {
        let name = data.name ? data.name : (data.being.name ? data.being.name : '')
        let scopeText = this.getScopeText(data.scope_type)

        return `<strong>${name}</strong> (${scopeText})`
      },

      showSelectUsersDialog: function () {
        this.isUsersDataLoading = true
        this.isUsersDialogVisible = true

        this.$store.dispatch('designer/getUsersTree', { id: this.id }).then((_usersTree) => {
          this.isUsersDataLoading = false
          if ( _usersTree ) {
            this.usersTree = _usersTree
          } else {
            this.error = "No users tree data..."
          }
        }).catch( error => {
          this.isUsersDataLoading = false
          this.error = "No users tree data..."
        })
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

      saveData: function ( data = null ) {
        // Do save using Store action.
        console.log("Saving ProcessSupervising form data:")
        console.log(data)

        if (data) {
          this.$store.dispatch('designer/updateProcessSupervising', {
            id: data.id,
            supervising: {
              contractors : data.contractors
            }
          })
        } // if
      }

    } // methods
  }
</script>

<style lang="scss">
</style>
