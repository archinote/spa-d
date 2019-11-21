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

      <!--  -->
      <!-- <p class="caption">This widget is under construction.</p> -->
      <div class="custom-tree-node header-title">
        <span class="text-small"><strong>Параметры порта</strong></span>
        <span>
          <!-- <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="() => showSelectUsersDialog()"></el-button> -->
          <el-dropdown style="margin-right: 20px;" @command="handleAddCommand">
            <span class="el-dropdown-link">
              Добавить<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">{{ getParameterLabelByType(1) }}</el-dropdown-item>
              <el-dropdown-item command="2">{{ getParameterLabelByType(2) }}</el-dropdown-item>
              <el-dropdown-item command="3">{{ getParameterLabelByType(3) }}</el-dropdown-item>
              <el-dropdown-item command="4">{{ getParameterLabelByType(4) }}</el-dropdown-item>
              <el-dropdown-item command="5">{{ getParameterLabelByType(5) }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </div>
      <div class="" v-if="formData.portParams && formData.portParams.length">
        <el-tree
          :data="formData.portParams"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          class="flat-tree">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span v-html="getParameterLabelByType(data.type)"></span>
            <span v-html="getParamLabel(data, node)"></span>
            <span>
              <span>
                <el-button type="text" size="mini" icon="el-icon-edit" @click="() => showParamDialog({ param: data })"></el-button>
              </span>
              <span>
                <el-button type="text" size="mini" icon="el-icon-delete" @click="() => removeParam(data)"></el-button>
              </span>
            </span>
          </span>
        </el-tree>
      </div>
      <div v-else>
        <p>Список параметров пуст.</p>
      </div>

    </template>

    <PortParamDialog
      :isVisible="isPortParamDialogVisible"
      :formData="{ type: paramType, param: paramToEdit }"
      :loading="isPortParamDataLoading"
      v-on:submit="savePortParam"
      v-on:cancel="() => { isPortParamDialogVisible = false }"
      title="Параметр порта"
    />

  </div>
</template>

<script>
import PortParamDialog from '../forms/PortParamDialog'
// mixins
import panelForm from '../../mixins/panelForm'
import designer from '../../mixins/designer'

export default {
  components: {
    PortParamDialog
  },

  mixins: [
    designer,
    panelForm
  ],

  props: {
    processId: {
      type: [String, Number],
      default: null
    }
  },

  data() {
    return {
      isPortParamDialogVisible: false,
      isPortParamDataLoading: false,

      paramType: null,
      paramToEdit: {}
    }
  },

  methods: {
    init: function () {
      this.loading = true

      this.$store.dispatch('bpm/designer/port/data/list', {
        portId: this.id,
        processId: this.processId,
      }).then(portParams => {
        // console.log("PortParameters, init(), portParams");
        // console.log(portParams)

        this.loading = false

        if (portParams && Array.isArray(portParams)) {
          this.formData = {
            portParams
          }
        } else {
          this.error = "Произошла ошибка при получении данных...."
        }
      }).catch( error => {
        this.loading = false
        this.error = "Произошла ошибка при получении данных...."
      })
    },

    getParamLabel: function(data, node) {
      let name = data.name 
        ? data.name.substr(0, 20) + (data.name.length > 20 ? '...' : '') 
        : ''
      let symbol = data.symbol 
        ? data.symbol.substr(0, 5) + (data.symbol.length > 5 ? '...' : '') 
        : ''

      return `<strong>${name}</strong> (${symbol})`
    },

    savePortParam: function (data) {
      // Hide dialog.
      this.isPortParamDialogVisible = false

      if (data.id) {
        // Update existing item
        let param = this.formData.portParams.find(
          element => Boolean(element.id == data.id)
        )

        if (param) {
          param.symbol = data.symbol
          param.name = data.name
          param.description = data.description
          // param.type = data.type
          param.required = data.required
          param.single = data.single
        }

        // Update item in the Store.
        this.$store.dispatch('bpm/designer/port/data/update', {
          processId: this.processId,
          portId: this.id,
          id: data.id,
          data: data
        })
      } else {
        // Add new item to list.
        this.formData.portParams.push(data)

        // Create item in the Store.
        this.$store.dispatch('bpm/designer/port/data/create', {
          processId: this.processId,
          portId: this.id,
          data: data
        })
      }
    },

    handleAddCommand: function (command) {

      this.showParamDialog({ type: command })
    },

    showParamDialog: function ({ type, param }) {
      if (type) {
        this.paramType = type
      } else if (param && param.type) {
        this.paramType = param.type
      }

      if (param) {
        this.paramToEdit = param
      } else {
        this.paramToEdit = {}
      }

      this.isPortParamDialogVisible = true
    },

    removeParam: function (data) {
      if (data && data.id) {
        const index = this.formData.portParams.findIndex(
          element => Boolean(element.id == data.id)
        )

        if (index >= 0) {
          this.formData.portParams.splice(index, 1)

          // Delete item in the Store.
          this.$store.dispatch('bpm/designer/port/data/delete', {
            processId: this.processId,
            portId: this.id,
            id: data.id
          })
        }
      }
    }

  }
}
</script>

<style lang="scss">
</style>
