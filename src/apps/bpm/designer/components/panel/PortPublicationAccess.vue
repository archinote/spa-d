<template lang="html">
  <div>
    <p class="caption">
      Управление доступом к публикации бизнес-процесса.
    </p>

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
      <div class="custom-tree-node header-title">
        <span class="text-small"><strong>Пользователи</strong></span>
        <span>
          <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="() => showSelectUsersDialog()" />
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
              <el-button type="text" size="mini" icon="el-icon-delete" @click="() => removeUser(data)" />
            </span>
          </span>
        </el-tree>
      </div>
      <div v-else>
        <p>Список пользователей пуст.</p>
      </div>

    </template>

    <SelectUsersDialog
      :isVisible="isUsersDialogVisible"
      :formData="{ treeData: usersTree }"
      :loading="isUsersDataLoading"
      v-on:submit="addUser"
      v-on:cancel="() => { isUsersDialogVisible = false }"
      title="Добавление доступа к публикации процесса через порт"
    />

  </div>
</template>

<script>
import SelectUsersDialog from '../forms/SelectUsersDialog'
// mixins
import designer from '../../mixins/designer'
import panelForm from '../../mixins/panelForm'

export default {
  components: {
    SelectUsersDialog
  },

  mixins: [
    designer,
    panelForm
  ],

  props: {
    id: {
      type: [String, Number],
      default: null
    },
    processId: {
      type: [String, Number],
      default: null
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
          scopeText: "Личный доступ"
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

      role: 9
    }
  },

  computed: {
    isLoading: function () {
      return this.loadingFormData || this.loadingContractors
    }
  },

  methods: {
    init: function () {
      this.loadingFormData = true
      this.onLoadError = false
      this.formData = null

      this.$store.dispatch('bpm/designer/port/publicationAccess/list', {
        processId: this.processId,
        portId: this.id,
        role: this.role
      }).then(list => {
        let formData = {
          id: this.id,
          processId: this.processId,
          contractors: Array.isArray(list) ? list : []
        }

        // Contractors - now we have contractor ID only.
        // Load contractors other info - name, avatar, etc.
        if (formData.contractors.length) {
          this.loadingContractors = true

          let posts = []
          let containers = []

          formData.contractors.forEach(contractor => {
            // NOTE: contractor_type: "container" || "post"
            if (contractor.contractor_type == 'post') {
              posts.push(contractor.post_id)                  
            } else {
              containers.push(contractor.post_id)                  
            }
          })

          // Load posts & containers info by its IDs
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
            this.onLoadError = true
            console.warn(error)
            this.error = "No executors data..."
          }).finally(() => {
            this.loadingContractors = false
          })
        } else {
          this.formData = Object.assign({}, formData)
        }
      }).catch( error => {
        this.onLoadError = true
        console.warn(error)
        this.error = "Произошла ошибка при получении данных...."
      }).finally(() => {
        this.loadingFormData = false
      })
    },

    showSelectUsersDialog: function () {
      this.isUsersDataLoading = true
      this.isUsersDialogVisible = true

      // Correct param of the orgStructure tree
      this.$store.dispatch('app/org/tree', 'bpm').then(usersTree => {
        this.isUsersDataLoading = false
        if ( usersTree ) {
          this.usersTree = usersTree
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

    getUserName: function(data, node) {
      let name = data && data.name
        ? data.name
        : ''
      let scopeText = data && data.scope_type
        ? this.getScopeText(data.scope_type)
        : ''

      return `<strong>${name}</strong> (${scopeText})`
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

    // Do save using Store action.
    saveData: function (data) {
      this.$store.dispatch('bpm/designer/port/publicationAccess/update', {
        processId: data.processId,
        item: {
          role: this.role,
          port_id: data.id,
          contractors : data.contractors
        }
      })
    }
  }
}
</script>

<style lang="scss">
</style>
