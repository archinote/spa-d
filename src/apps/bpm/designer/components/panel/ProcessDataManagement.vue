<template lang="html">
  <div class="">

    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <div v-if="error" style="margin-bottom: 16px;">
      <el-alert
        :title="error"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
      <el-button round @click="init()" icon="el-icon-refresh">Обновить</el-button>
    </div>

    <div v-if="formData && !loading" class="data-tree-wrapper">
      <!-- <div class="custom-tree-node header-title">
        <span class="text-small"><strong>Параметры модели</strong></span>
        <span>
          <el-dropdown @command="handleAddCommand">
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
      </div> -->

      <el-tree
        :data="formData.data"
        node-key="id"
        ref="tree"
        :highlight-current="true"
        :expand-on-click-node="false"
        @node-drag-start="handleDragStart"
        @node-drag-enter="handleDragEnter"
        @node-drag-leave="handleDragLeave"
        @node-drag-over="handleDragOver"
        @node-drag-end="handleDragEnd"
        @node-drop="handleDrop"
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        class="data-tree"
        :default-expand-all="true"
        :default-expanded-keys="treeExpandedKeys"
        @node-click="handleClick"
        @current-change="handleChange"
        :filter-node-method="filterNode"
      >
        <div slot-scope="{ node, data }" class="data-tree-node" :class="[data.type, getNodeBindingClass(data, node), data.onDrag ? 'on-drag' : '']">
          <div v-if="['process-title', 'process-data-title', 'process-ports-title', 'nested-process-title'].includes(data.type)">
            <span>{{ data.label }}</span>
          </div>
          <div v-else-if="['process-port', 'nested-process-port'].includes(data.type)">
            <span>{{ data.label }}</span>
            <el-tag size="mini" :type="data.data.type === 'input' ? 'danger' : ''">
              {{ data.data.type === 'input' ? 'Входной' : 'Выходной' }}
              <!-- {{ data.label }} -->
            </el-tag>
          </div>
          <div v-else-if="['process-data', 'nested-process-data'].includes(data.type)">
            <el-tag v-if="data.data && data.data.symbol" size="mini" type="info">
              {{ data.data.symbol }}
            </el-tag>
            <span>{{ data.label }}</span>
            <el-tag size="mini" type="success">{{ data.dataType }}</el-tag>
            <el-tag v-if="data.required" size="mini" type="warning">*</el-tag>
            <!-- <el-row>
              <el-col :span="12"></el-col>
              <el-col :span="12"></el-col>
            <el-row> -->
          </div>
          <div v-else-if="['link-data-port'].includes(data.type)" @click="showBinding(data, node)">
            <div style="float: left; font-size: 14px;">
              <span class="mdi mdi-link-variant"></span>
            </div>
            <div style="margin-left: 24px;">
              <span>{{ data.label }}</span>
              <el-tag size="mini" :type="data.portData.type === 'input' ? 'danger' : ''">
                {{ data.portData.type === 'input' ? 'Входной' : 'Выходной' }}
                <!-- {{ data.label }} -->
              </el-tag>
              <el-tag v-if="data.data.required" size="mini" type="warning" title="Обязательное">*</el-tag>
            </div>
          </div>
          <div v-else-if="['link-data-data'].includes(data.type)" @click="showBinding(data, node)">
            <div style="float: left; font-size: 16px; margin-top: 6px;">
              <span class="mdi mdi-link-variant"></span>
            </div>
            <div style="margin-left: 24px;">{{ data.nestedProcessTitle }}</div>
            <!-- <div>{{ data.nestedProcessPortTitle }}</div> -->
            <div style="margin-left: 24px;">
              <el-tag v-if="data.data && data.data.symbol" size="mini" type="info">
                {{ data.data.symbol }}
              </el-tag>
              <span>{{ data.label }}</span>
              <el-tag size="mini" type="success">{{ data.dataType }}</el-tag>
              <el-tag v-if="data.data.required" size="mini" type="warning">*</el-tag>
            </div>
          </div>

          <!-- Action buttons -->
          <div v-if="['process-data', 'process-data-title', 'link-data-port', 'link-data-data'].includes(data.type)">
            <!-- Parameter edit button -->
            <span v-if="['process-data'].includes(data.type) && data.editable">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-edit"
                @click2="() => showParameterDialog(data.data)"
                @click="() => { paramToEdit = data.data; isParameterDialogVisible = true; }"
              />
            </span>
            <!-- Parameter-Port Binding edit button -->
            <span v-if="['link-data-port'].includes(data.type)">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-edit"
                @click2="() => showParameterPortBindingDialog(data.data)"
                @click="() => { bindingToEdit = data.data; isParameterPortBindingDialogVisible = true; }"
              />
            </span>
            <el-dropdown v-if="['process-data-title'].includes(data.type)" @command="handleAddCommand">
              <span class="el-dropdown-link" style="font-size: 12px;">
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
            <span v-if="['process-data', 'link-data-port', 'link-data-data'].includes(data.type) && !data.system">
              <el-button type="text" size="mini" icon="el-icon-delete" @click="() => deleteTreeNode( node, data )"></el-button>
            </span>
          </div>
        </div>
      </el-tree>
    </div>

    <ParameterDialog
      :isVisible="isParameterDialogVisible"
      :formData="paramToEdit"
      :loadingSubmit="isParameterDataSaving"
      v-on:submit="saveParameter"
      v-on:cancel="() => { isParameterDialogVisible = false }"
      title="Параметр модели"
    />

    <ParameterPortBindingDialog
      :isVisible="isParameterPortBindingDialogVisible"
      :formData="bindingToEdit"
      :loadingSubmit="isParameterPortBindingSaving"
      v-on:submit="saveParameterPortBinding"
      v-on:cancel="() => { isParameterPortBindingDialogVisible = false }"
      title="Свойства связи параметра с портом"
    />

  </div>
</template>

<script>
// Mixins
import panelForm from '../../mixins/panelForm'
import designer from '../../mixins/designer'
// API
import apiPort from '../../api/port/'
import apiProcessData from '../../api/processData/'
// forms
import ParameterDialog from '../forms/ParameterDialog'
import ParameterPortBindingDialog from '../forms/ParameterPortBindingDialog'

export default {
  mixins: [
    designer,
    panelForm
  ],

  components: {
    ParameterDialog,
    ParameterPortBindingDialog
  },

  data: function () {
    return {
      processParameters: [],
      parameterPortBindings: [],
      parameterParameterBindings: [],
      nestedProcesses: [],

      draggingNode: null,
      dropNode: null,
      dropType: null,

      paramType: null,
      paramToEdit: {},
      bindingToEdit: {},

      isParameterDialogVisible: false,
      isParameterDataSaving: false,

      isParameterPortBindingDialogVisible: false,
      isParameterPortBindingSaving: false,

      treeExpandedKeys: [],
      currentNode: null
    }
  },

  computed: {
    modelPorts: function() {
      return this.$store.getters['bpm/designer/port/filteredList']({ process_model_id: this.id })
    },
    modelName: function() {
      return this.getModelName(this.id)
    },
    treeData: function() {
      let data = []

      // Own Ports
      let _ownPortsList = []
      this.modelPorts.forEach(item => {
        let _ownPortItem = {
          id: item.id,
          label: item.name,
          data: item,
          type: 'process-port'
        }
        _ownPortsList.push(_ownPortItem)
      })

      let _ownPorts = {
        id: 'ports-title-id',
        label: 'Порты',
        type: 'process-ports-title',
        children: _ownPortsList
      }

      // Own Parameters
      let _ownDataList = []
      this.processParameters = this.getProcessParameters(this.id)
      this.processParameters.forEach(item => {
        let _ownDataItem = {
          id: item.id,
          label: item.name,
          data: item,
          type: 'process-data',
          dataType: this.getParameterLabelByType(item.type),
          required: false, // TODO: take from 'item'
          system: false, // TODO: take from 'item'
          editable: true, // TODO: take from 'item'
          children: []
        }

        // find port binding
        this.parameterPortBindings.forEach(_binding => {
          if (_binding.parameter_id == item.id) {
            // add port binding
            let _port = this.modelPorts.find(el => el.id === _binding.port_id)

            if (_port) {
              _ownDataItem.children.push({
                id: _binding.id,
                label: _port.name,
                type: 'link-data-port',
                data: _binding,
                portData: _port
              })
            }
          }
        })

        //
        this.parameterParameterBindings.forEach(_binding => {
          if (_binding.to == item.id) {
            // add nested model parameter binding
            let nParameter = null
            let nProcess = this.nestedProcesses.find(_nProcess => {
              return nParameter = _nProcess.parameters.find(_nParameter => {
                return _nParameter.id == _binding.from
              })
            })

            _ownDataItem.children.push({
              id: _binding.id,
              label: nParameter.name,
              type: 'link-data-data',
              nestedProcessTitle: nProcess.name,
              dataType: this.getParameterLabelByType(nParameter.type),
              data: nParameter
            })
          }
        })

        _ownDataList.push(_ownDataItem)
      })

      let _ownData = {
        id: 'parameters-title-id',
        label: 'Данные',
        type: 'process-data-title',
        children: _ownDataList
      }

      let _ownProcess = {
        label: this.modelName,
        type: 'process-title',
        id: this.id,
        children: [
          // Model own ports
          _ownPorts,
          // Model own data
          _ownData,
        ]
      }

      data = [_ownProcess]

      // Nested processes parameters.
      this.nestedProcesses.forEach(_nProcess => {
        let _nestedProcess = {
          id: _nProcess.submodel_id,
          label: _nProcess.name,
          type: 'nested-process-title',
          data: _nProcess,
          children: []
        }

        let _nProcessParameters = this.getProcessParameters(_nestedProcess.id)

        _nProcessParameters.forEach(_parameter => {
          let _nParameter = {
            id: _parameter.id,
            label: _parameter.name,
            type: 'nested-process-data',
            dataType: this.getParameterLabelByType(_parameter.type),
            data: _parameter,
            children: []
          }
          _nestedProcess.children.push(_nParameter)
        })

        data.push(_nestedProcess)
      })

      return data
    }
  },

  methods: {
    // NOTE: these methods commented for further development
    // getProcessPorts: function(id) {
    //   return this.$store.getters['bpm/designer/port/filteredList']({ process_model_id: id })
    // },
    // getNestedProcesses: function(id) {
    //   return this.$store.getters['bpm/designer/nestedProcess/filteredList']({ model_id: id })
    // },
    // getProcessParameters: function(id) {
    //   return this.$store.getters['bpm/designer/processParameter/filteredList']({ model_id: id })
    // },

    getModelName: function(id) {
      let model = this.$store.getters['bpm/designer/process/item'](id)
      return model.name ? model.name : 'Undefined model name'
    },

    init: async function() {
      this.error = ''
      this.loading = true

      try {
        // Порты модели
        //  - this.modelPorts

        // Параметры модели
        this.processParameters = await this.$store.dispatch('bpm/designer/processParameter/list', { model_id: this.id })

        // Связи Параметр-Порт
        this.parameterPortBindings = await apiProcessData.processDataPortBinding.list(this.id)

        // Связи Параметр-Параметр
        this.parameterParameterBindings = await apiProcessData.processDataDataBinding.list(this.id)

        // Вложенные модели
        this.nestedProcesses = await this.$store.dispatch('bpm/designer/nestedProcess/list', { model_id: this.id })
        //
        // Параметры вложенных моделей (каждой)
        for (let nProcess of this.nestedProcesses) {
          nProcess.parameters = await this.$store.dispatch('bpm/designer/processParameter/list', {
            model_id: nProcess.submodel_id,
            hasPortBinding: true
          })
          nProcess.name = this.getModelName(nProcess.submodel_id)
        }

        this.createWidgetData()
      } catch (e) {
        console.error(e)
        // this.error = e.response.data.message
        this.error = e.response && e.response.data && e.response.data.message 
          ? e.response.data.message 
          : 'Произошла ошибка при загрузке данных виджета'
      }

      this.loading = false
    },

    createWidgetData: function () {
      // Own Ports
      let _ownPortsList = []
      this.modelPorts.forEach(item => {
        let _ownPortItem = {
          id: item.id,
          label: item.name,
          data: item,
          type: 'process-port'
        }
        _ownPortsList.push(_ownPortItem)
      })

      let _ownPorts = {
        id: 'ports-title-id',
        label: 'Порты',
        type: 'process-ports-title',
        children: _ownPortsList
      }

      // Own Parameters
      let _ownDataList = []
      this.processParameters.forEach(item => {
        let _ownDataItem = {
          id: item.id,
          label: item.name,
          data: item,
          type: 'process-data',
          dataType: this.getParameterLabelByType(item.type),
          required: false, // TODO: take from 'item'
          system: false, // TODO: take from 'item'
          editable: true, // TODO: take from 'item'
          children: []
        }

        // find port binding
        this.parameterPortBindings.forEach(_binding => {
          if (_binding.parameter_id == item.id) {
            // add port binding
            let _port = this.modelPorts.find(el => el.id === _binding.port_id)

            if (_port) {
              _ownDataItem.children.push({
                id: _binding.id,
                label: _port.name,
                type: 'link-data-port',
                data: _binding,
                portData: _port
              })
            }
          }
        })

        //
        this.parameterParameterBindings.forEach(_binding => {
          // console.log('_binding: ', _binding)
          if (_binding.from == item.id) {
            // add nested model parameter binding
            let nParameter = null
            let nProcess = this.nestedProcesses.find(_nProcess => {
              // console.log('_nProcess: ', _nProcess)
              return nParameter = _nProcess.parameters.find(_nParameter => {
                return _nParameter.id == _binding.to
              })
            })

            // console.log('nProcess: ', nProcess)
            // console.log('nParameter: ', nParameter)
            if (nParameter && nProcess) {
              _ownDataItem.children.push({
                id: _binding.id,
                label: nParameter.name,
                type: 'link-data-data',
                nestedProcessTitle: nProcess.name,
                dataType: this.getParameterLabelByType(nParameter.type),
                data: nParameter
              })
            } else {
              console.warn('Not found binding: ', _binding)
            }
          }
        })

        _ownDataList.push(_ownDataItem)
      })

      let _ownData = {
        id: 'parameters-title-id',
        label: 'Данные',
        type: 'process-data-title',
        children: _ownDataList
      }

      let _ownProcess = {
        label: this.modelName,
        type: 'process-title',
        id: this.id,
        children: [
          // Model own ports
          _ownPorts,
          // Model own data
          _ownData,
        ]
      }

      this.formData = { data: [_ownProcess] }

      // Nested processes parameters.
      this.nestedProcesses.forEach(_nProcess => {
        let _nestedProcess = {
          id: _nProcess.submodel_id,
          label: _nProcess.name,
          type: 'nested-process-title',
          data: _nProcess,
          children: []
        }

        _nProcess.parameters.forEach(_parameter => {
          let _nParameter = {
            id: _parameter.id,
            label: _parameter.name,
            type: 'nested-process-data',
            dataType: this.getParameterLabelByType(_parameter.type),
            data: _parameter,
            children: []
          }

          _nestedProcess.children.push(_nParameter)
        })

        this.formData.data.push(_nestedProcess)

        // console.log('this.formData: ', this.formData)
      })
    },

    //
    // Event hadlers
    //
    handleDragStart(node, ev) {
      // console.log('drag start', node)

      this.dropNode = null
      this.dropType = null
    },
    handleDragEnter(draggingNode, dropNode, ev) {
      // console.log('tree drag enter: ', dropNode.label)
      // dropNode.data.onDrag = true
      // dropNode.data = Object.assign({}, dropNode.data, { onDrag: true })
      // dropNode.data.label = dropNode.data.label + ' *'
    },
    handleDragLeave(draggingNode, dropNode, ev) {
      // console.log('tree drag leave: ', dropNode.label)
      // dropNode.data = Object.assign({}, dropNode.data, { onDrag: false })
    },
    handleDragOver(draggingNode, dropNode, ev) {
      // console.log('tree drag over: ', dropNode.label)
      // console.log(draggingNode, dropNode)
    },
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      if (this.dropNode && this.dropType) {
        // console.log(this.dropNode, draggingNode)

        // NOTE: Method info:
        // tree.append( data, parentNode )
        // 1. child node's data to be appended
        // 2. parent node's data, key or node

        if (draggingNode.data.type === 'process-data'
            && this.dropNode.data.type === 'process-port'
        ) {
          // Dropping process port
          // Create LINK: DATA-PORT

          this.createLinkDataPort(draggingNode, this.dropNode)

        } else if (draggingNode.data.type === 'nested-process-data'
            && ['process-data-title', 'process-data'].includes(this.dropNode.data.type)
        ) {
          // Dropping nested process data
          // Create LINK: DATA-DATA

          this.createLinkDataData(draggingNode)

        }
      } else {
        // console.warn('No data to drop.')
      }
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      // console.log('tree drop(): dropNode.label, dropType, ev', dropNode.label, dropType, ev)
      // draggingNode = null
      // dropNode = null
      return false
    },
    allowDrop(draggingNode, dropNode, type) {
      // return true
      // Allow drop on 'process data' item
      // and 'process data title'
      if (dropNode.data.type === 'process-data'
        || (dropNode.data.type === 'process-data-title' && draggingNode.data.type === 'nested-process-data')
        || (dropNode.data.type === 'process-port' && draggingNode.data.type === 'process-data')
      ) {
        // if (type === 'inner')
          // console.log('allowDrop(), draggingNode, dropNode, type ', draggingNode, dropNode, type)
        this.dropNode = dropNode
        this.dropType = type
        // return type === 'inner'
      } else {
        this.dropNode = null
        this.dropType = null
      }

      return false
    },
    allowDrag(draggingNode) {
      // return ['process-port', 'nested-process-data'].includes(draggingNode.data.type)
      return ['process-data', 'nested-process-data'].includes(draggingNode.data.type)
    },

    handleClick: function (nodeData, treeNode) {
      // console.log('node on click()', nodeData, treeNode)

      // this.showBinding(nodeData, treeNode)
    },

    showBinding: function (nodeData, treeNode) {
      if (['link-data-port', 'link-data-data'].includes(nodeData.type)) {
        if (this.currentNode) {
          // deselect current
          if (this.currentNode.data
            && this.currentNode.data.data
            && this.currentNode.data.data.id
            && nodeData.data
            && nodeData.data.id
            && this.currentNode.data.data.id === nodeData.data.id
          ) {
            this.currentNode = null
          } else {
            this.currentNode = treeNode
          }
        } else {
          this.currentNode = treeNode
        }
      } else {
        this.currentNode = null
      }

      this.$refs.tree.filter(this.currentNode ? nodeData : null)
    },

    getNodeBindingClass: function(nodeData, treeNode) {
      let classVal = ''

      if (this.currentNode) {

        if (this.currentNode.id === treeNode.id) {
          classVal = 'on-bind'
        } else if (nodeData.type === 'process-port'
          && this.currentNode.data
          && this.currentNode.data.type === 'link-data-port'
          && this.currentNode.data.portData
          && this.currentNode.data.portData.id === nodeData.id
        ) {
          classVal = 'on-bind'
        } else if (nodeData.type === 'nested-process-data'
          && this.currentNode.data
          && this.currentNode.data.type === 'link-data-data'
          && this.currentNode.data.data
          && this.currentNode.data.data.id === nodeData.id
        ) {
          classVal = 'on-bind'
        }

      }

      return classVal
    },

    filterNode(value, data, treeNode) {
      let res = true

      if (value) {
        if (this.currentNode.data.type === 'link-data-data') {
          res = Boolean(
            (data.type === 'link-data-data' && data.id === value.id && data.data.id === value.data.id)
            || (data.type === 'nested-process-data' && data.data.id === value.data.id)
            || (this.currentNode.parent.data.id === treeNode.parent.data.id)
            // keep show all own ports
            || (treeNode.parent.data.type === 'process-ports-title')
            // show all own parameters & its links
            || (data.type === 'process-data')
            || (data.type === 'link-data-data')
            || (data.type === 'link-data-port')
            // show all nested model parameters, not selected only
            || (this.currentNode.data.data.model_id === treeNode.parent.data.id)
          )
        } else if (this.currentNode.data.type === 'link-data-port') {
          // console.log('data: ', data)
          res = Boolean(
            //
            (data.type === 'link-data-port' && data.id === value.id && data.data.id === value.data.id)
            || (data.type === 'process-port' && data.data.id === value.portData.id)
            // show all own ports
            || (treeNode.parent.data.type === 'process-ports-title')
            // show all own parameters & its links
            || (data.type === 'process-data')
            || (data.type === 'link-data-data')
            || (data.type === 'link-data-port')
          )
        }
      }

      return res
    },

    handleChange: function (nodeData, treeNode) {
      // console.log('node on current change()', nodeData, treeNode)
    },

    //
    //
    //

    createLinkDataPort: async function (parameterNode, portNode) {
      try {
        let newParamDataBinding = {
          parameter_id: parameterNode.data.id,
          port_id: portNode.data.id
        }

        newParamDataBinding = await apiProcessData.processDataPortBinding.create(this.id, newParamDataBinding)

        let newNodeData = Object.assign({}, portNode.data, {
          id: newParamDataBinding.id,
          data: newParamDataBinding,
          portData: portNode.data.data,
          type: 'link-data-port'
        })
        // console.log('newNodeData', newNodeData)

        this.$refs.tree.append(newNodeData, parameterNode.data.id)
      } catch (e) {
        console.error(e)
        this.error = e.response.data.message
      }
    },

    deleteLinkDataPort: async function ( node, data ) {
      try {
        await apiProcessData.processDataPortBinding.delete(this.id, data.id)

        this.$refs.tree.remove(node)
      } catch (e) {
        console.error(e)
        this.error = e.response.data.message
      }
    },

    createLinkDataData: async function (draggingNode) {
      let treeNodeId = ''

      // If drop on own parameters title:
      if (this.dropNode.data.type === 'process-data-title') {
        // add new own parameter as clone of dragging
        let newParameter = {
          name: draggingNode.data.data.name,
          description: draggingNode.data.data.description,
          multi: draggingNode.data.data.multi,
          symbol: draggingNode.data.data.symbol,
          type: draggingNode.data.data.type,
          model_id: this.id
        }

        try {
          newParameter = await this.$store.dispatch('bpm/designer/processParameter/create', newParameter)

          let newTreeNode = {
            id: newParameter.id,
            label: newParameter.name,
            type: 'process-data',
            data: newParameter,
            dataType: this.getParameterLabelByType(newParameter.type),
            editable: true,
            children: []
          }

          this.$refs.tree.append(newTreeNode, this.dropNode.data.id)

          treeNodeId = newParameter.id
        } catch (e) {
          console.error(e)
          this.error = e.response.data.message
        }
      } else {
        treeNodeId = Boolean(this.dropNode.data.data.type === draggingNode.data.data.type)
          ? this.dropNode.data.id
          : ''
      }

      // Next - add binding with nested model parameter
      if (treeNodeId) {
        let newBinding = {
          // from: draggingNode.data.id,
          // to: treeNodeId
          to: draggingNode.data.id,
          from: treeNodeId
        }

        try {
          newBinding = await apiProcessData.processDataDataBinding.create(this.id, newBinding)

          // Tree
          let newTreeNode = {
            id: newBinding.id,
            type: 'link-data-data',
            // data: newBinding,
            nestedProcessTitle: draggingNode.parent.data.label,
            label: draggingNode.data.label,
            dataType: this.getParameterLabelByType(draggingNode.data.data.type),
            data: draggingNode.data.data
          }

          this.$refs.tree.append(newTreeNode, treeNodeId)
        } catch (e) {
          console.error(e)
          this.error = e.response.data.message
        }
      } else {
        // alert("Ошибка:\n" + "Связываемые параметры должны иметь одинаковые типы.")
        this.error = "Связываемые параметры должны иметь одинаковые типы."
      }
    },

    deleteLinkDataData: async function ( node, data ) {
      try {
        await apiProcessData.processDataDataBinding.delete(this.id, data.id)

        this.$refs.tree.remove(node)
      } catch (e) {
        console.error(e)
        this.error = e.response.data.message
      }
    },

    deleteParameter: async function ( node, data ) {
      try {
        let res = await this.$store.dispatch('bpm/designer/processParameter/delete', { model_id: this.id, id: data.id })

        if (res) {
          this.$refs.tree.remove(node)

          this.$dmsSuccessNoty('Параметр модели успешно удален')
        }
      } catch (e) {
        console.error(e)
        this.error = e.response.data.message
      }
    },

    deleteTreeNode: async function ( node, data ) {
      if (data.type === 'link-data-port') {
        this.deleteLinkDataPort( node, data )
      } else if (data.type === 'link-data-data') {
        this.deleteLinkDataData( node, data )
      } else if (data.type === 'process-data') {
        this.$store.dispatch('confirmer/ask', {
          type: 'ask',
          body: 'Подтвердите удаление параметра. <br/>'
            + '<strong>Внимание!</strong> Это действие необратимо.',
        }).then(confirmation => {
          if (confirmation) {
            // Delete model parameter
            this.deleteParameter( node, data )
          }
        })
      }
    },

    handleAddCommand: function (command) {
      this.showParameterDialog({ type: command, model_id: this.id })
    },

    showParameterDialog: function (parameterData) {
      this.paramToEdit = parameterData
      this.isParameterDialogVisible = true
    },

    saveParameter: function (data) {
      // console.log('saveParameter() data: ', data); return;
      if (data.id) {
        this.isParameterDataSaving = true

        this.$store.dispatch('bpm/designer/processParameter/update', data).then(response => {
          // Hide dialog.
          this.isParameterDialogVisible = false

          // Rebuild tree
          this.init()
        }).catch(error => {
          console.error(error)
        }).finally(() => {
          this.isParameterDataSaving = false
        })
      } else {
        this.isParameterDataSaving = true

        this.$store.dispatch('bpm/designer/processParameter/create', data).then(response => {
          // Hide dialog.
          this.isParameterDialogVisible = false

          this.$dmsSuccessNoty('Параметр модели успешно создан')

          // Rebuild widget tree
          this.init()
        }).catch(error => {
          console.error(error)
        }).finally(() => {
          this.isParameterDataSaving = false
        })
      }
    },

    showParameterPortBindingDialog: function (bindingData) {
      this.bindingToEdit = bindingData
      this.isParameterPortBindingDialogVisible = true
    },

    saveParameterPortBinding: function (data) {
      if (data.id) {
        this.isParameterPortBindingSaving = true
        apiProcessData.processDataPortBinding.update(this.id, data).then(response => {
          // Hide dialog.
          this.isParameterPortBindingDialogVisible = false

          // Update tree node.
          let treeNode = this.$refs.tree.getNode(data.id)

          if (treeNode) {
            treeNode.data.data = Object.assign({}, treeNode.data.data, data)
          }
        }).catch(error => {
          // TODO: show eror message
          console.error(error)
        }).finally(() => {
          this.isParameterPortBindingSaving = false
        })
      }
    }
  }
}
</script>

<style lang="stylus">
.data-tree-wrapper
  .el-tree-node
    &__content
      height: auto !important

      .data-tree-node
        display: flex
        flex: 1
        align-items: center
        justify-content: space-between
        font-size: 12px
        margin: 1px 8px 1px 0
        padding: 2px 8px
        max-height: 24px
        transition: border-width .25s ease-out
        border-style: solid
        // border-color: rgba(49, 156, 255, 0.8)
        border-color: rgba(#409eff, 0.8)
        border-width: 0px

        &.process-title
          background: rgba(210, 120, 230, 0.25)
        &.process-ports-title
          background: rgba(120, 230, 230, 0.3)
        &.process-data-title
          background: rgba(210, 120, 230, 0.15)
        &.nested-process-title
          background: rgba(120, 120, 230, 0.25)
        &.link-data-port
          background: rgba(120, 230, 230, 0.15)
        &.link-data-data
          background: rgba(120, 120, 230, 0.1)
          max-height: 48px
        &.on-drag
          // background-color: pink
          outline: 2px solid pink
        &.on-bind
          // background-color: pink
          // outline: 3px solid pink
          border-left-width: 8px

      label
        margin-bottom: 0

    &__label
      font-size: 12px

    .el-row
      margin-bottom: 8px
      &:last-child
        margin-bottom: 0
    .el-col
      border-radius: 2px

</style>
