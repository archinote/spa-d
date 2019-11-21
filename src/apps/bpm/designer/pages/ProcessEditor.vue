<template lang="html">
  <div v-if="processId" style="position: relative; z-index: 1; height: 100%;">

    <template v-if="loadingError">
      <v-flex xs12 sm6 offset-sm3>
        <div class="pt-5">
          <v-card>
            <v-toolbar color="error" dark flat dense>
              <v-icon>mdi-alert-circle-outline</v-icon>
              <v-toolbar-title>Сообщение об ошибке</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <p class="py-4">Возникла ошибка при загрузке процесса.</p>
            </v-card-text>
            <v-card-actions>
              <v-btn flat block color="primary" @click="init()">Повторить</v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-flex>
    </template>

    <v-layout v-if="!loadingError" row fill-height>
      <v-flex>
        <Diagram
          ref="diag"
          v-bind:model-data="diagramData"
          v-bind:process-id="processId"
          v-on:model-changed="modelChanged"
          v-on:selection-moved="selectionMoved"
          v-on:changed-selection="changedSelection"
          v-on:link-drawn="linkAdded"
          v-on:link-relinked="linkRelinked"
        />
      </v-flex>
      <v-flex v-if="isPropertyPanelVisible && !deleting" style="max-width: 480px;">
        <PropertyPanel :processId="processId" />
      </v-flex>
    </v-layout>

    <InsertStepDialog
      :isVisible="isInsertStepDialogVisible"
      :formData="{ processesTree: nestedProcessTree }"
      :loading="isInsertStepDataLoading"
      v-on:submit="addNewNestedProcess"
      v-on:cancel="() => { isInsertStepDialogVisible = false }"
      title="Добавление вложенного бизнес-процесса"
      submitText="Добавить"
    />

    <ParameterDialog
      :isVisible="isParameterDialogVisible"
      :formData="paramToEdit"
      :loadingSubmit="isParameterDataSaving"
      v-on:submit="saveParameter"
      v-on:cancel="() => { isParameterDialogVisible = false }"
      title="Редактирование параметра модели"
    />

    <!-- Context menu -->
    <v-menu
      v-model="isParametersContextMenuVisible"
      :position-x="xParametersContextMenu"
      :position-y="yParametersContextMenu"
      absolute
      offset-y
    >
      <v-list>
        <template v-for="(item, i) in contextMenu">
          <!-- item as header -->
          <v-subheader
            v-if="item.header"
            :key="item.header"
          >
            {{ item.header }}
          </v-subheader>

          <!-- item as divider -->
          <v-divider v-else-if="item.divider" 
            :key="i" 
            class="my-2"
            :inset="item.inset"
          ></v-divider>

          <!-- item with submenu -->
          <v-menu v-else-if="item.subItems"
            right
            offset-x
            nudge-right="0"
            min-width="180"
            open-on-hover
            open-delay="100"
          >
            <v-list-tile slot="activator" :key="item.id" @click="">
              <v-list-tile-action v-if="item.icon">
                <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.title }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>mdi-menu-right</v-icon>
              </v-list-tile-action>
            </v-list-tile>

            <!-- menu content -->
            <v-list>
              <v-list-tile 
                v-for="subItem in item.subItems" :key="subItem.id" 
                @click="isParametersContextMenuVisible = false; subItem.handler(ctxMenu.e, ctxMenu.data);"
              >
                <v-list-tile-action v-if="subItem.icon">
                  <v-icon color="grey darken-1">{{ subItem.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>

          <!-- item with no submenu -->
          <v-list-tile v-else
            :key="item.id" 
            @click="item.handler(ctxMenu.e, ctxMenu.data)"
          >
            <v-list-tile-action v-if="item.icon">
              <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.title }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-menu>

  </div>
</template>

<script>
import uuidv4 from 'uuid/v4'

import { mapState, mapGetters } from 'vuex'
import { debounce } from 'lodash'

import designer from '../mixins/designer'

import Diagram from '../components/Diagram.vue'
import PropertyPanel from '../components/PropertyPanel.vue'
import InsertStepDialog from '../components/forms/InsertStepDialog'
import ParameterDialog from '../components/forms/ParameterDialog'

import apiProcessData from '../api/processData/'

const consoleDebug = Boolean(process.env.NODE_ENV !== 'production')
const disableLinkEdit = false
const PARAMETERS_ID_PREFIX = 'PARAMETERS-'
const NEW_CLONE_PARAMETER_ID = 'DUMMY-CLONE-PARAMETER-ID'
const DUMMY_PARAMETER_CLONE = {
  id: NEW_CLONE_PARAMETER_ID,
  name: 'КЛОНИРОВАНИЕ',
  type: false,
  typeStr: '',
  symbol: '',
  isClone: true,
  notClone: false
}

export default {
  mixins: [
    designer
  ],

  components: {
    Diagram,
    PropertyPanel,
    InsertStepDialog,
    ParameterDialog
  },

  data: function() {
    return {
      diagramData: {},

      currentNode: null,
      currentLink: null,

      nestedProcessTree: [],
      isInsertStepDialogVisible: false,
      isInsertStepDataLoading: false,
      updating: false,
      deleting: false,

      loadingError: false,

      paramToEdit: {},
      isParameterDialogVisible: false,
      isParameterDataSaving: false,

      isParametersContextMenuVisible: false,
      xParametersContextMenu: 0,
      yParametersContextMenu: 0,
      ctxMenu: {},
      contextMenu: []
    }
  },

  computed: {
    ...mapState({
      isParametersOn: state => state.bpm.designer.diagramModes.isParametersOn,
      isIndicationOn: state => state.bpm.designer.diagramModes.isIndicationOn
    }),
    ...mapGetters('app/layout', ['getRouteData']),
    processId: function () {
      return this.$route.params.processId
    },
    isPropertyPanelVisible() {
      return this.$store.getters['bpm/designer/propertyPanel/isVisible']()
    },
    processName: function() {
      const defaultTitle = 'Конструктор бизнес-процессов'
      let processName = ''

      if (this.processId) {
        let process = this.$store.getters['bpm/designer/process/item'](this.processId)

        if (process && process.name) processName = process.name
      }

      return processName ? processName : defaultTitle
    }
  },

  watch: {
    processId: function(newVal, oldVal) {
      this.init()
    },
    updating: function () {
      if (this.updating) {
        this.freezePanel()
      }
      else {
        this.unfreezePanel()
      }
      this.$store.commit('app/layout/setAppLoading', this.updating)
    },
    isParametersOn: function() {
      let model = this.model()

      // Port nodes (root model)
      for (let portId in this.diagramData.ports) {
        let nodeData = model.findNodeDataForKey(portId)
        if (nodeData) {
          nodeData.parametersMode = this.isParametersOn
          this.$refs.diag.updatePort( nodeData )
        }
      }
      
      // Nested models
      for (let nestedProcessId in this.diagramData.nestedProcesses) {
        let nodeData = model.findNodeDataForKey(this.diagramData.nestedProcesses[nestedProcessId].key)
        if (nodeData) {
          nodeData.parametersMode = this.isParametersOn
          this.$refs.diag.updateSubModel( nodeData )
        }

        // Nested model parameters container
        model.setDataProperty(
          model.findNodeDataForKey(PARAMETERS_ID_PREFIX + nestedProcessId),
          'parametersMode',
          this.isParametersOn && this.diagramData.nestedProcesses[nestedProcessId].showParametersContainer
        )
      }
      
      // Root model
      model.setDataProperty(
        model.findNodeDataForKey(PARAMETERS_ID_PREFIX + this.processId), 
        'parametersMode',
        this.isParametersOn
      )

      this.$bus.$emit('diagram.fit-zoom')
    },
    /**
     * Clear context menu object only when menu becomes hidden
     */
    isParametersContextMenuVisible: function (newVal) {
      if (!newVal) {
        this.ctxMenu = {}
      }
    }
  },

  created() {
    this.$bus.$on('process.add-new', () => {
      this.addNewProcess()
    })

    this.$bus.$on('port.add-new', type => {
      this.addNewPort( type )
    })

    this.$bus.$on('nested-process.add-new', () => {
      this.showNestedProcessDialog()
    })

    this.$bus.$on('process.delete', processId => {
      // Delete process with id=processId.
      this.deleteProcess(processId)
    })

    this.$bus.$on('port.delete', (portId, processId) => {
      // Delete port with id = portId.
      this.deletePort(portId, processId)
    })

    this.$bus.$on('link.delete', (linkId, processId, data) => {
      // Delete link with id = linkId.
      this.deleteLink( linkId, processId, data )
    })

    this.$bus.$on('nested-process.delete', (nestedProcessId, processId) => {
      // Delete nested process with id = nestedProcessId.
      this.deleteNestedProcess( nestedProcessId, processId )
    })

    // this.$bus.$on('diagram.parameters-mode.switch', status => {
    //   console.log('diagramData: ', this.diagramData)
    //   let model = this.model()

    //   this.diagramData.ports.forEach(port => {
    //     model.setDataProperty(model.findNodeDataForKey(port.templateId), 'parametersMode', status)
    //   })
    //   this.diagramData.nestedProcesses.forEach(nestedProcess => {
    //     model.setDataProperty(model.findNodeDataForKey(nestedProcess.templateId), 'parametersMode', status)
    //   })
    // })

    this.$bus.$on('test.model-param.edit', (paramId, paramIndex) => {
      this.editParameter(paramId)
    })

    this.$bus.$on('test.model-param.delete', (paramId, paramIndex, paramName) => {
      this.deleteParameter(paramId)
    })

    this.$bus.$on('test.port-param.delete', (portId, paramId, paramName, paramIndex) => {
      this.deleteParameterPortBinding(portId, paramId, paramName, paramIndex)      
    })

    this.$bus.$on('test.model-param.context-menu.show', (e, data) => {
      this.showParameterContextMenu(e, data)
    })

    this.$bus.$on('test.model.parameters-container.switch-view', (modelId, subModelId) => {
      let model = this.model()
      let parametersContainerId = PARAMETERS_ID_PREFIX + subModelId
      let nodeData = model.findNodeDataForKey(modelId)
      let parametersNodeData = model.findNodeDataForKey(parametersContainerId)

      let isVisible = Boolean(nodeData && nodeData.showParametersContainer)

      model.setDataProperty(parametersNodeData, 'parametersMode', isVisible)

      this.$refs.diag.updateSubModel( nodeData )
    })

    this.$bus.$on('test.model.parameter-port-binding.update', (portId, binding) => {
      let portBinding = this.diagramData.ports[portId].parameters.find(elem => elem.id === binding.id)

      if (portBinding) {
        apiProcessData.processDataPortBinding.update(this.processId, portBinding).then(response => {
          this.$dmsSuccessNoty('Соединение успешно обновлено')
        }).catch(error => {
          this.$dmsErrorNoty('Возникла ошибка при обновлении соединения')
          console.error(error)
        })
      }
    })
  },

  destroyed() {
    this.$bus.$off('process.add-new')
    this.$bus.$off('port.add-new')
    this.$bus.$off('nested-process.add-new')
    this.$bus.$off('process.delete')
    this.$bus.$off('port.delete')
    this.$bus.$off('link.delete')
    this.$bus.$off('nested-process.delete')
    this.$bus.$off('test.model-param.edit')
    this.$bus.$off('test.model-param.delete')
    this.$bus.$off('test.port-param.delete')
    this.$bus.$off('test.model-param.context-menu.show')
    this.$bus.$off('test.model.parameters-container.switch-view')
    this.$bus.$off('test.model.parameter-port-binding.update')
  },

  mounted() {
    this.init()
  },

  methods: {
    // get access to the GoJS Model of the GoJS Diagram
    model: function() {
      return this.$refs.diag.model()
    },

    // get access to the GoJS Diagram
    diagram: function() {
      return this.$refs.diag.diagram
    },

    init: function() {
      // Clear diagram data.
      if (this.$refs.diag) {
        this.$refs.diag.clearModel()
      }
      this.diagramData = {}

      if ( this.processId ) {
        this.loadProcessData()
      }
    },

    /**
     * Здесь можно получить только имя и описание процесса
     */
    getProcessInfo: function (processId) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('bpm/designer/process/item', { id: processId }).then(_process => {
          if ( _process ) {
            if (_process.id == this.processId) {
              // We  don't need info (name & description of the root process)
              // so do nothing here
            } else {
              let nProcess = this.diagramData.nestedProcesses[processId]
                  ? this.diagramData.nestedProcesses[processId]
                  : null
              if (nProcess) {
                nProcess.name = _process.name ? _process.name : 'Undefined'
                nProcess.description = _process.description ? _process.description : ''
                nProcess = Object.assign({}, nProcess, _process)
              }
            }
          }

          resolve(_process)
        }).catch( error => {
          console.warn(error)
          reject(error)
        }).finally(() => {
          // console.log('--- getProcessInfo() complete') // DEBUG:
        })
      })
    },

    getProcessPorts: function (processId) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('bpm/designer/port/list', { process_model_id: processId }).then(ports => {
          ports.forEach(port => {
            let _port = {
              key: port.id,
              id: port.id,
              name: port.name,
              description: port.description,
              templateId: port.id,
              nodeType: 'port',
              type: port.type,
              loc: port.loc ? port.loc : String(port.x + ' ' + port.y),
              parametersMode: this.isParametersOn
            }

            // Add port to diagram model: root or nested process
            if (processId == this.processId) {
              this.diagramData.ports[_port.id] = _port
            } else {
              let nProcess = this.diagramData.nestedProcesses[processId]
                ? this.diagramData.nestedProcesses[processId]
                : null
              
              if (nProcess) {
                // Add to all (any) port list
                // if (typeof nProcess.ports === 'undefined') nProcess.ports = []
                // nProcess.ports.push(_port)
                if (typeof nProcess.ports === 'undefined') nProcess.ports = {}
                nProcess.ports[_port.id] = _port

                // and to inputs/output port lists
                if (_port.type === 'input') {
                  if (typeof nProcess.inputPorts === 'undefined') nProcess.inputPorts = []
                  nProcess.inputPorts.push(_port)
                } else {
                  if (typeof nProcess.outputPorts === 'undefined') nProcess.outputPorts = []
                  nProcess.outputPorts.push(_port)
                }
              }
            }
          })

          resolve(ports)
        }).catch(error => {
          console.warn(error)
          reject(error)
        }).finally(() => {
          // console.log('--- getProcessPorts() complete') // DEBUG:
        })
      })
    },

    getProcessLinks: function (processId) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('bpm/designer/link/list', { parentId: this.processId }).then(links => {
          links.forEach(link => {
            let _link = {
              id: link.id,
              // from
              from: this.processId == link.from_model_id
                ? link.from_port_id
                : (link.from_submodel_id ? link.from_submodel_id : link.from_model_id),
              frompid: link.from_port_id,
              // to
              to: this.processId == link.to_model_id
                ? link.to_port_id
                : (link.to_submodel_id ? link.to_submodel_id : link.to_model_id),
              topid: link.to_port_id,
            }

            this.diagramData.links[_link.id] = _link
          })

          resolve(links)
        }).catch(error => {
          console.warn(error)
          reject(error)
        }).finally(() => {
          // console.log('--- getProcessLinks() complete') // DEBUG:
        })
      })
    },

    getProcessParameters: function (processId) {
      return new Promise((resolve, reject) => {
        let isRoot = Boolean(processId == this.processId)

        this.$store.dispatch('bpm/designer/processParameter/list', { 
          model_id: processId, hasPortBinding: !isRoot 
        }).then(parameters => {
          // Set parameter type as text field
          parameters.forEach(parameter => {
            parameter.typeStr = this.getParameterLabelByType(parameter.type)
            parameter.isClone = false
            parameter.notClone = true
          })

          // Add as last in list 'new' parameter for clone op.
          if (processId == this.processId) {
            parameters.push(DUMMY_PARAMETER_CLONE)
          }
          
          let _id = PARAMETERS_ID_PREFIX + processId // Diagram parameter container ID
          
          let modelParameter = {
            key: _id,
            id: processId,
            modelId: processId,
            title: 'Данные "' + processId + '"',
            // TODO: get model name
            // title: this.processName,
            templateId: _id,
            nodeType: 'parametersContainer',
            loc: '0 -200',
            isRoot,
            parametersMode: this.isParametersOn,
            parameters
          }

          this.diagramData.parameters[processId] = modelParameter

          resolve(parameters)
        }).catch( error => {
          console.warn(error)
          reject(error)
        }).finally(() => {
          // console.log('--- getProcessInfo() complete') // DEBUG:
        })
      })
    },

    /**
     * 
     */
    getProcessNestedProcesses: function (processId) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('bpm/designer/nestedProcess/list', { model_id: processId }).then(list => {
          list.forEach(nProcess => {
            let _nestedProcess = {
              nodeType: 'nestedProcess',
              key: nProcess.id, // must be unique for all Diagram nodes.
              id: nProcess.id,
              submodel_id: nProcess.submodel_id,
              name: nProcess.name ? nProcess.name : 'Not found!',
              templateId: nProcess.id,
              loc: nProcess.loc
                ? nProcess.loc
                : String(nProcess.x + ' ' + nProcess.y),
              inputPorts: [],
              outputPorts: [],
              parametersMode: this.isParametersOn,
              showParametersContainer: true
            }

            this.diagramData.nestedProcesses[_nestedProcess.submodel_id] = _nestedProcess
          })

          resolve(list)
        }).catch(error => {
          console.warn(error)
          reject(error)
        })
      })
    },

    getParameterPortBindings: function (processId) {
      return new Promise((resolve, reject) => {
        apiProcessData.processDataPortBinding.list(processId).then(response => {
          this.diagramData.parameterPortBindings = response

          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    getParameterParameterBindings: function (processId) {
      return new Promise((resolve, reject) => {
        apiProcessData.processDataDataBinding.list(processId).then(bindings => {
          this.diagramData.parameterParameterBindings = bindings
          
          resolve(bindings)
        }).catch(error => {
          reject(error)
        })
      })
    },


    /**
     * Load from the Store all current process data:
     *  - Ports
     *  - Nested Processes
     *  - Links -- must be added to Diagram AFTER all other nodes (Ports & Nested Processes).
     */
    loadProcessData: function() {
      this.loadingError = false
      this.updating = true

      // Init (clear) diagram data object
      this.diagramData = {
        nestedProcesses: {},
        ports: {},
        links: {},
        parameters: {},
        parameterPortBindings: [],
        parameterParameterBindings: [],
      }
      window.diagramData = this.diagramData // DEBUG:
      
      // Create list of deferred promises to later load all diagram data
      let tasks = []

      // Load root model parameters
      tasks.push( () => this.getProcessParameters(this.processId) )
      // and its bindings
      tasks.push( () => this.getParameterPortBindings(this.processId) )
      tasks.push( () => this.getParameterParameterBindings(this.processId) )
      
      // Nested Processes.
      this.getProcessNestedProcesses(this.processId).then(_nestedProcesses => {

        tasks.push( () => this.getProcessPorts(this.processId) )
        tasks.push( () => this.getProcessLinks(this.processId) )
        tasks.push( () => this.getProcessParameters(this.processId) )

        // For each nested process: 
        //  - load its info & ports & parameters
        _nestedProcesses.forEach(_nProcess => {
          tasks.push( () => this.getProcessInfo(_nProcess.submodel_id) )
          tasks.push( () => this.getProcessPorts(_nProcess.submodel_id) )
          tasks.push( () => this.getProcessParameters(_nProcess.submodel_id) )
        })

        Promise.all(tasks.map(t => t())).then(resolvedValues => {
          // Now we have diagram all data to send it to GOjs.
          this.loadingError = false
          this.createDiagram()
        }).catch(error => {
          console.warn(error)
          this.loadingError = true
        }).finally(() => {
          this.updating = false
        })
      }).catch(error => {
        console.warn(error)
        this.loadingError = true
        this.updating = false
      })
    },

    createDiagram: function () {
      // 
      // Parameter-Port bindings
      // 
      this.diagramData.parameterPortBindings.forEach(binding => {
        // Search parameter by its port binding.
        let portParameter = this.diagramData.parameters[this.processId].parameters.find(_parameter => {
          return _parameter.id == binding.parameter_id
        })

        if (portParameter) {
          portParameter = {
            name: portParameter.name,
            id: binding.id,
            required: binding.required,
            single: binding.single,
          }
          // Search port by binding.port_id
          if (this.diagramData.ports[binding.port_id]) {
            if (!Array.isArray(this.diagramData.ports[binding.port_id].parameters)) {
              this.diagramData.ports[binding.port_id].parameters = []
            }
            this.diagramData.ports[binding.port_id].parameters.push(portParameter)
          }
        }
      })

      //
      // Root Model ports
      //
      for (const id in this.diagramData.ports) {
        this.addPort(this.diagramData.ports[id])
      }

      // 
      // Sub-models
      // 
      for (const id in this.diagramData.nestedProcesses) {
        this.addNestedProcess(this.diagramData.nestedProcesses[id])
      }

      // 
      // Links
      // 
      for (const id in this.diagramData.links) {
        this.addLink(this.diagramData.links[id])
      }

      //
      // Model parameters (root & nested)
      //
      let locX = -200, locY = -200
      let locXdelta = 500, locYdelta = 0
      let count = 1

      for (const processId in this.diagramData.parameters) {
        let modelTitle = this.diagramData.nestedProcesses[processId] 
          ? this.diagramData.nestedProcesses[processId].name
          : this.processName

        this.diagramData.parameters[processId].title = modelTitle

        // Update container location
        if (processId == this.processId) {
          this.diagramData.parameters[processId].loc = locX + ' ' + locY
        } else {
          this.diagramData.parameters[processId].loc = 
            String(locX + locXdelta*count) + ' ' + String(locY + locYdelta*count)
          ++count;
        }
        
        // Add it to diagram
        this.$refs.diag.addParametersContainer(this.diagramData.parameters[processId])
      }

      // 
      // Parameter-Parameter bindins
      // 
      this.diagramData.parameterParameterBindings.forEach(binding => {
        let rootProcessParameter = this.diagramData.parameters[this.processId].parameters.find(_parameter => {
          return _parameter.id == binding.from
        })
        let nestedProcessParameter = null

        // Search for binding parameter owner model
        for (const processId in this.diagramData.parameters) {
          if (processId != this.processId) {
            let parameter = this.diagramData.parameters[processId].parameters.find(_parameter => {
              return _parameter.id == binding.to
            })

            if (parameter) {
              nestedProcessParameter = parameter
              break;
            }
          }
        }

        if (rootProcessParameter && nestedProcessParameter) {
          if (rootProcessParameter.type == nestedProcessParameter.type) {
            let link = {
              bindingId: binding.id,
              // from
              from: PARAMETERS_ID_PREFIX + this.processId,
              frompid: binding.from,
              // to
              to: PARAMETERS_ID_PREFIX + nestedProcessParameter.model_id,
              topid: binding.to,
              // TODO: set link category ID
            }
            binding.link = link
    
            this.addLink(link)
          } else {
            console.warn('Wrong binding found - between different type parameters.')
          }
        }
      })

      this.fitZoom()
    },

    getNewPortName(type) {
      let nameCount = 1
      let existingPorts = this.$store.getters['bpm/designer/port/list'](this.processId)

      if (Array.isArray(existingPorts)) {
        existingPorts.forEach(_port => {
          if (_port.type == type) {
            ++nameCount
          }
        })
      }

      return (type == 'input' ? 'Входной' : 'Выходной') + ' порт #' + nameCount
    },

    addNewPort: function( type ) {
      let port = {
        type,
        name: this.getNewPortName( type ),
        description: '',
        x: 0,
        y: 0,
        tag: '',
        deferred: false,
        hold: false,
        single: false,
        timeLimitSec: 0,
        timeLimitFloor: 3600,
        time_limit_changeable: false,
        process_model_id: this.processId
      }

      this.updating = true

      this.$store.dispatch('bpm/designer/port/create', port).then(response => {
        this.addPort({
          nodeType: 'port',
          key: port.id, // must be unique for all Diagram nodes.
          id: port.id,
          name: port.name,
          description: port.description,
          templateId: port.id,
          type: port.type,
          loc: port.loc ? port.loc : String(port.x + ' ' + port.y),
          parametersMode: this.isParametersOn
        }, true)

        // Show info message
        this.$dmsSuccessNoty('Порт был успешно добавлен')

        this.fitZoom()
      }).catch(error => {
        console.warn(error)

        this.$dmsErrorNoty('Возникла ошибка при добавлении порта')
      }).finally(() => {
        this.updating = false
      })
    },

    showNestedProcessDialog: function() {
      this.nestedProcessTree = []

      // Loading indicator.
      this.isInsertStepDataLoading = true

      // Show dialog window.
      this.isInsertStepDialogVisible = true

      // Get bp list from store.
      this.$store.dispatch('bpm/designer/process/list').then(processes => {
        let list = []

        processes.forEach( process => {
          // Skip current diagram process.
          if (this.processId != process.id) {
            list.push({
              id: process.id,
              name: process.name,
              description: process.description,
            })
          }
        })

        this.nestedProcessTree = [{
          name: 'Собственные бизнесс-процессы',
          id: 0,
          disabled: true,
          isLeaf: true,
          children: list
        }]

        this.isInsertStepDataLoading = false
      })
    },

    addNewNestedProcess: function( process ) {
      // Hide dialog window.
      this.isInsertStepDialogVisible = false

      this.updating = true

      this.$store.dispatch('bpm/designer/nestedProcess/create', {
        model_id: this.processId,
        submodel_id: process.id,
        name: process.name,
        x: String((Object.values(diagramData.nestedProcesses).length + 1) * 500 - 200),
        y: 0
      }).then(nProcess => {
        let _nestedProcess = {
          nodeType: 'nestedProcess',
          key: nProcess.id,
          id: nProcess.id,
          submodel_id: nProcess.submodel_id,
          name: nProcess.name ? nProcess.name : 'Not found!',
          templateId: nProcess.id,
          loc: nProcess.loc
            ? nProcess.loc
            : String(nProcess.x + ' ' + nProcess.y),
          inputPorts: [],
          outputPorts: [],
          parametersMode: this.isParametersOn,
          showParametersContainer: true
        }

        this.diagramData.nestedProcesses[_nestedProcess.submodel_id] = _nestedProcess

        let tasks = []
        tasks.push( () => this.getProcessPorts(nProcess.submodel_id) )
        tasks.push( () => this.getProcessParameters(nProcess.submodel_id) )

        Promise.all(tasks.map(t => t())).then(resolvedValues => {
          // Add new nested process to diagram
          this.addNestedProcess( _nestedProcess, true )

          // Add its parameters container
          this.diagramData.parameters[nProcess.submodel_id].title = this.diagramData.nestedProcesses[nProcess.submodel_id].name
            ? this.diagramData.nestedProcesses[nProcess.submodel_id].name
            : 'Sub-model name is undefined'

          // Set container location
          let locX = String(Object.values(diagramData.nestedProcesses).length * 500 - 200)
          this.diagramData.parameters[nProcess.submodel_id].loc = locX + ' -200'
          
          // Also add its parameters container to diagram
          this.$refs.diag.addParametersContainer(this.diagramData.parameters[nProcess.submodel_id])
        }).catch(error => {
          console.warn(error)
        }).finally(() => {
          this.updating = false
        })
      
        // Show info message
        this.$dmsSuccessNoty('Вложенный процесс был успешно добавлен')
      }).catch(error => {
        console.warn(error)

        this.$dmsErrorNoty('Возникла ошибка при добавлении вложенного процесса')
      }).finally(() => {
        this.updating = false
      })
    },

    // tell the GoJS Diagram to set default scale
    fitZoom: function() {
      this.$refs.diag.fitZoom()
    },

    // this event listener is declared on the <Diagram>
    modelChanged: function(e) {
      // console.log("Diagram Model was changed.")
      // if (e.isTransactionFinished) {
      //   this.saveDiagramModel(e.model)
      // }
    },

    // this event listener is declared on the <Diagram>
    selectionMoved: function(e) {
      this.saveDiagramModel( this.model() )
    },

    saveDiagramModel: debounce( function(model) {
      if (model.nodeDataArray && Array.isArray(model.nodeDataArray)) {
        model.nodeDataArray.forEach(node => {
          // Update Node location on Diagram.
          let loc = node.loc.split(' ')

          // PORT
          if (node.nodeType == 'port') {
            // Update PORT coordinates
            this.$store.dispatch('bpm/designer/port/update', {
              process_model_id: this.processId,
              id: node.id,
              x: loc[0] ? loc[0] : 0,
              y: loc[1] ? loc[1] : 0
            })
          } else 
          // Nested process
          if (node.nodeType == 'nestedProcess') {
            // Update Nested PROCESS coordinates
            this.$store.dispatch('bpm/designer/nestedProcess/update', {
              id: node.id,
              model_id: this.processId,
              x: loc[0] ? loc[0] : 0,
              y: loc[1] ? loc[1] : 0
            })
          } else 
          // LINK
          if (node.nodeType == 'link') {
            // don't need update a link. While...
          }
        })
      }
    }, 2000),

    // this event listener is declared on the <Diagram>
    changedSelection: function(e) {
      let selection = e.diagram.selection.first()

      if (consoleDebug && selection && selection.data) {
        console.log("ProcessEditor component, Diagram changeSelection, selection data:", selection.data)
      }

      if (selection) {
        // There is selected diagram node.

        if (selection instanceof go.Node) {
          this.currentNode = selection
          this.currentLink = null

          this.$bus.$emit('diagram.node-selected', selection)

          // DEBUG:
          // if (selection.data.nodeType === 'nestedProcess') {
          //   window.myDiagram.findNodeForKey('NESTED-PARAMETERS-CONTAINER-ID').visible = true
          // } else {
          //   window.myDiagram.findNodeForKey('NESTED-PARAMETERS-CONTAINER-ID').visible = false
          // }
        } else if (selection instanceof go.Link) {
          this.currentNode = null
          this.currentLink = selection

          this.$bus.$emit('diagram.link-selected', selection)
        }
      } else {
        // No diagram node selected.

        this.currentNode = null
        this.currentLink = null

        this.$bus.$emit('diagram.clear-selected')
      }
    },

    linkAdded: async function (e) {
      if (consoleDebug) console.log("'LinkDrawn' event catched! e.subject.data:", e.subject.data)

      const ownParametersContainerId = PARAMETERS_ID_PREFIX + this.processId
      let model = this.model()
      let linkData = e.subject.data
      let nodeFrom = model.findNodeDataForKey(linkData.from)
      let nodeTo = model.findNodeDataForKey(linkData.to)

      if ((nodeFrom.nodeType == 'port' && nodeTo.nodeType == 'nestedProcess')
        || (nodeFrom.nodeType == 'nestedProcess' && nodeTo.nodeType == 'port')
        || (nodeFrom.nodeType == 'nestedProcess' && nodeTo.nodeType == 'nestedProcess')
        || (nodeFrom.nodeType == 'port' && nodeTo.nodeType == 'port')
      ) {
        //
        // Соединение на уровне "Логики" - между портами и вложенными моделями
        //

        if (disableLinkEdit) return

        this.updating = true

        let addedLink = {
          id: uuidv4(),
          model_id: this.processId,
          from: linkData.frompid,
          to: linkData.topid
        }

        if (consoleDebug) console.log("ProcessEditor, linkAdded, new link data:", addedLink)

        // Update diagram Link object: set ID property got from the API.
        model.setDataProperty(linkData, 'id', addedLink.id)

        this.$store.dispatch('bpm/designer/link/create', {
          parentId: this.processId,
          item: addedLink
        }).then(link => {
          this.$dmsSuccessNoty('Соединение успешно добавлено')
        }).catch(error => {
          console.warn(error)

          // TODO: в случае ошибки на сервере при добавлении соединения
          //  - необходимо ли удалить ссылку с диаграммы?
          this.$bus.$emit('diagram.selection.delete')

          this.$dmsErrorNoty('Возникла ошибка при добавлении соединения')
        }).finally(() => {
          this.updating = false
        })
      } else if (nodeFrom.nodeType == 'parametersContainer' && nodeTo.nodeType == 'parametersContainer') {
        // NOTE: 'Параметр - Параметр'
        
        let ownParameter = this.diagramData.parameters[nodeFrom.modelId].parameters.find(elem => elem.id == linkData.frompid)
        let nestedParameter = this.diagramData.parameters[nodeTo.modelId].parameters.find(elem => elem.id == linkData.topid )

        // NOTE: check for adding link to 'new' own param.
        if (linkData.frompid == NEW_CLONE_PARAMETER_ID) {
          // this.$dmsInfoNoty('Параметр - Параметр - Режим КЛОНИРОВАНИЯ')
          
          // Add new (copy) parameter to own container
          let newOwnParameter = {
            id: uuidv4(),
            model_id: this.processId,
            name: nestedParameter.name,
            description: nestedParameter.description,
            required: false,
            multi: false,
            symbol: nestedParameter.symbol,
            type: nestedParameter.type
          }

          this.updating = true

          this.$store.dispatch('bpm/designer/processParameter/create', newOwnParameter).then(async (response) => {
            // Update parameters list
            this.updateParameters(this.processId)

            // Delete last created by user (selected) link
            this.$bus.$emit('diagram.selection.delete')

            // Create a new PARAM-PARAM binding
            let newBinding = {
              from: newOwnParameter.id,
              to: nestedParameter.id
            }

            try {
              let aBinding = await apiProcessData.processDataDataBinding.create(this.processId, newBinding)

              // Update link data with binding info
              if (aBinding && aBinding.id) {
                model.setDataProperty(linkData, 'bindingId', aBinding.id)

                // Create new link
                let newLink = {
                  id: uuidv4(),
                  from: linkData.from,
                  frompid: newOwnParameter.id,
                  to: linkData.to,
                  topid: linkData.topid,
                }
                this.addLink(newLink)

                this.$dmsSuccessNoty('Параметр модели успешно клонирован')
                
                this.updating = false
              }
            } catch (e) {
              console.error(e)
              this.$dmsErrorNoty('Произошла ошибка при добавлении соединения')
            }
          }).catch(error => {
            console.error(error)
            this.$dmsErrorNoty('Произошла ошибка при клонировании параметра модели')
          }).finally(() => {
            this.updating = false
          })
        } else {
          // Link between own & nested parameters

          // Check for both parameters type is the same
          if (ownParameter.type == nestedParameter.type) {
            // Add parameters binding
            let newBinding = {
              from: ownParameter.id,
              to: nestedParameter.id
            }

            this.updating = true

            try {
              let aBinding = await apiProcessData.processDataDataBinding.create(this.processId, newBinding)

              // Update link data with binding info
              if (aBinding && aBinding.id) {
                model.setDataProperty(linkData, 'bindingId', aBinding.id)
              }

              // update diagramData
              aBinding.link = linkData
              this.diagramData.parameterParameterBindings.push(aBinding)
              
              this.$dmsSuccessNoty('Соединение между параметрами успешно добавлено')
            } catch (e) {
              console.error(e)
              this.$dmsErrorNoty('Произошла ошибка при добавлении соединения')
              
              // Delete error link
              this.$bus.$emit('diagram.selection.delete')
            }
            
            this.updating = false

          } else {
            // Disable link between parameters of different type.
            this.$bus.$emit('diagram.selection.delete')

            this.$dmsErrorNoty('Соединяемые параметры должны быть одного типа')
          }
        }
      } else if (nodeFrom.nodeType == 'parametersContainer' && nodeFrom.modelId == this.processId && nodeTo.nodeType == 'port') {
        // NOTE: 'Параметр (OWN) - ПОРТ (FINISH)'

        // Delete link from diagram
        this.$bus.$emit('diagram.selection.delete')

        // 1. Add parameter-port binding
        // Exclude 'last' parameter in list
        if (linkData.frompid != NEW_CLONE_PARAMETER_ID) {
          let portParameters = nodeTo.parameters ? Array.from(nodeTo.parameters) : []
          let owmParameters = nodeFrom.parameters ? Array.from(nodeFrom.parameters) : []
          let linkedParameter = owmParameters.find(elem => elem.id == linkData.frompid )

          if (linkedParameter) {
            this.updating = true

            try {
              let newParamDataBinding = {
                parameter_id: linkedParameter.id,
                port_id: linkData.topid,
                model_id: this.processId
              }
    
              newParamDataBinding = await apiProcessData.processDataPortBinding.create(this.processId, newParamDataBinding)

              newParamDataBinding = Object.assign({}, newParamDataBinding, {
                name: linkedParameter.name,
                id: newParamDataBinding.id,
                required: false,
                single: false
              })

              this.diagramData.parameterPortBindings.push(newParamDataBinding)

              let newPortParameters = portParameters.slice()
              newPortParameters.push(newParamDataBinding)
              nodeTo.parameters = newPortParameters
              this.$refs.diag.updatePort( nodeTo )

              this.$dmsSuccessNoty('Соединение успешно создано')
            } catch (e) {
              console.error(e)
              this.$dmsErrorNoty('Возникла ошибка при добавлении соединения')
            }

            this.updating = false
          }
        } else {
          this.$dmsErrorNoty('Данный тип соединения не поддерживается')
        }
      } else if (nodeFrom.nodeType == 'port' && nodeTo.nodeType == 'parametersContainer' && nodeTo.modelId == this.processId) {
        // NOTE: 'Параметр (OWN) - ПОРТ (START)'

        // Delete link from diagram
        this.$bus.$emit('diagram.selection.delete')

        // Exclude 'dummy' (used to clone) parameter in list
        if (linkData.topid != NEW_CLONE_PARAMETER_ID) {
          // 1. Add parameter-port binding
          let portParameters = nodeFrom.parameters ? Array.from(nodeFrom.parameters) : []
          let owmParameters = nodeTo.parameters ? Array.from(nodeTo.parameters) : []
          let linkedParameter = owmParameters.find(elem => elem.id == linkData.topid )

          if (linkedParameter) {
            this.updating = true

            try {
              let newParamDataBinding = {
                parameter_id: linkedParameter.id,
                port_id: linkData.frompid,
                model_id: this.processId
              }
    
              newParamDataBinding = await apiProcessData.processDataPortBinding.create(this.processId, newParamDataBinding)

              newParamDataBinding = Object.assign({}, newParamDataBinding, {
                name: linkedParameter.name,
                id: newParamDataBinding.id,
                required: false,
                single: false
              })

              this.diagramData.parameterPortBindings.push(newParamDataBinding)

              let newPortParameters = portParameters.slice()
              newPortParameters.push(newParamDataBinding)

              nodeFrom.parameters = newPortParameters
              this.$refs.diag.updatePort( nodeFrom )

              this.$dmsSuccessNoty('Соединение успешно создано')
            } catch (e) {
              console.error(e)
              this.$dmsErrorNoty('Возникла ошибка при добавлении соединения')
            }

            this.updating = false
          }
        } else {
          this.$dmsErrorNoty('Данный тип соединения не поддерживается')
        }
      } else {
        // NOTE: 'ОШИБКА'
        // All other links are invalid.

        this.$dmsErrorNoty('Данный тип соединения не поддерживается')

        // Delete invalid link from diagram
        this.$bus.$emit('diagram.selection.delete')
      }
    },

    linkRelinked: function (e) {
      if (consoleDebug) console.log("'linkRelinked' event catched! e.subject.data:", e)

      if (disableLinkEdit) return;

      let linkRelinked = e.subject.data

      if (linkRelinked.id) {
        this.$store.dispatch('bpm/designer/link/update', {
          parentId: this.processId,
          id: linkRelinked.id,
          item: {
            model_id: this.processId,
            from: linkRelinked.frompid,
            to: linkRelinked.topid
          }
        }).then(_link => {
          if (consoleDebug) console.log("ProcessEditor, Store response on 'link/update':", _link)
        }).catch(error => {
          console.warn(error)
        })
      }
    },

    // Here we modify the GoJS Diagram's Model using its methods,
    // which can be much more efficient than modifying some memory and asking
    // the GoJS Diagram to find differences and update accordingly.
    // Undo and Redo will work as expected.
    addNode: function() {
      let model = this.model()

      model.startTransaction()

      model.setDataProperty(model.findNodeDataForKey(4), "color", "purple")

      let data = { name: "NEW " + this.counter++, color: "yellow" }
      model.addNodeData(data)
      model.addLinkData({ from: 3, to: model.getKeyForNodeData(data) })

      model.commitTransaction("added Node and Link")

      // also manipulate the Diagram by changing its Diagram.selection collection
      let diagram = this.diagram()
      diagram.select(diagram.findNodeForData(data))
    },

    /**
     * Adds port node to the Diagram.
     */
    addPort: function ( port, doSelect = false ) {
      // Use Diagram component method:
      this.$refs.diag.addPort( port, doSelect )
    },

    addLink: function ( link ) {
      this.$refs.diag.addLink( link )
    },

    // Add new nested process to Diagram model
    addNestedProcess: function ( nestedProcess, doSelect = false ) {
      // Set nested mmodel template special properties (port parameters)
      let subModelParameters = this.diagramData.parameters[nestedProcess.submodel_id]
        ? this.diagramData.parameters[nestedProcess.submodel_id].parameters
        : []

      if (subModelParameters && subModelParameters.length) {
        nestedProcess.portsParameters = []

        for (let portId in nestedProcess.ports) {
          let paramText = ''
          let port = nestedProcess.ports[portId]
          
          subModelParameters.forEach(param => {
            if (Array.isArray(param.ports_ids) && param.ports_ids.includes(portId)) {
              paramText += (paramText ? '\n' : '') + param.name
            }
          })

          if (paramText) {
            nestedProcess.portsParameters.push({
              port: port.name,
              parameters: paramText
            })
          }
        }
      }
      this.$refs.diag.addNestedProcess( nestedProcess, doSelect )
    },

    // Delete Diagram Process
    deleteProcess: function(processId) {
      if (processId) {
        this.$store.dispatch('confirmer/ask', {
          type: 'ask',
          body: 'Подтвердите удаление бизнес-процесса. <br/>'
            + '<strong>Внимание!</strong> Это действие необратимо.'
        }).then(response => {
          if (response === true) {
            // keep panel frozen
            this.freezePanel()

            this.deleting = true
            this.updating = true

            this.$store.dispatch('bpm/designer/process/delete', {
              id: processId
            }).then(response => {
              this.$dmsSuccessNoty('Процесс успешно удалён.')

              this.$router.push(this.getRouteData({ name: 'bpm.designer.home' }))
            }).catch(error => {
              console.warn(error)

              // Show error message.
              this.$dmsErrorNoty('Возникла ошибка при удалении процесса')
            }).finally(() => {
              this.updating = false
            })
          }
        })
      }
    },

    // Delete Diagram Selected Port
    deletePort: function(portId, processId) {
      if (portId && processId) {
        console.log("Deleting PORT, port ID = " + portId + ", process ID = " + processId)

        this.$store.dispatch('confirmer/ask', {
          type: 'ask',
          body: 'Подтвердите удаление порта.<br/>'
            + '<br/><strong>Внимание!</strong> Это действие необратимо.'
        }).then(response => {
          if (response === true) {
            // Send server request to delete process PORT
            // In success delete PORT from diagram.

            this.updating = true

            this.$store.dispatch('bpm/designer/port/delete', {
              id: portId,
              process_model_id: processId
            }).then(response => {
              this.$dmsSuccessNoty('Порт был успешно удалён')

              // Delete Port node from Diagram.
              this.$bus.$emit('diagram.selection.delete')
            }).catch(error => {
              console.warn(error)

              // Show error message.
              this.$dmsErrorNoty('Возникла ошибка при удалении порта')
            }).finally(() => {
              this.updating = false
            })
          }
        })
      }
    },

    // Delete Diagram currently Selected Link
    deleteLink: async function( linkId, processId, data ) {
      if (consoleDebug) console.log("Deleting LINK, link ID = " + linkId + ", process ID = " + processId, ', link data: ', data)

      if (disableLinkEdit) {
        // In this mode delete link from diagram only.
        this.$bus.$emit('diagram.selection.delete')
        return
      }

      if (data && data.bindingId) {
        // Delete PARAMETER-PARAMETER binding

        this.updating = true

        try {
          await apiProcessData.processDataDataBinding.delete(this.processId, data.bindingId)

          this.$bus.$emit('diagram.selection.delete')

          this.$dmsSuccessNoty('Соединение успешно удалено')
        } catch (e) {
          console.error(e)

          this.$dmsErrorNoty('Возникла ошибка при удалении соединения')
        }
        
        this.updating = false
      } else if (linkId && processId) {
        // Send server request to delete LINK
        // In success delete LINK from diagram.

        this.updating = true

        this.$store.dispatch('bpm/designer/link/delete', {
          parentId: processId,
          id: linkId
        }).then(response => {
          if (consoleDebug) console.log("App, 'link/delete', Store response:", response)

          this.$dmsSuccessNoty('Соединение успешно удалено')

          // Delete LINK from Diagram
          this.$bus.$emit('diagram.selection.delete')
        }).catch(error => {
          console.warn(error)

          // Show error message.
          this.$dmsErrorNoty('Возникла ошибка при удалении соединения')
        }).finally(() => {
          this.updating = false
        })
      }
    },

    // Delete Diagram currently Selected Nested Process
    deleteNestedProcess: function( nestedProcessId, processId ) {
      let model = this.model()
      let diagram = this.diagram()

      this.$dmsConfirm('Удалить вложенный бизнес-процесс?').then(confirmed => {
        if (confirmed) {
          this.updating = true

          let nodeData = model.findNodeDataForKey(nestedProcessId)
          let subModelId = nodeData.submodel_id ? nodeData.submodel_id : ''

          // Send to server delete request
          // In success delete from diagram.
          this.$store.dispatch('bpm/designer/nestedProcess/delete', {
            model_id: processId,
            id: nestedProcessId
          }).then(response => {
            let node = ''

            // Delete sub-model from diagram
            this.$bus.$emit('diagram.selection.delete')

            // Delete sub-model parameters container.
            node = diagram.findNodeForKey(PARAMETERS_ID_PREFIX + subModelId)          
            if (node) diagram.remove(node)

            // Clear diagram data
            delete this.diagramData.nestedProcesses[subModelId]
            delete this.diagramData.parameters[subModelId]

            this.$dmsSuccessNoty('Вложенный процесс был успешно удалён.')
          }).catch(error => {
            console.warn(error)

            // Show error message.
            this.$dmsErrorNoty('Произошла ошибка при удалении вложенного процесса')
          }).finally(() => {
            this.updating = false
          })
        }
      })
    },

    saveParameter: function (data) {
      this.isParameterDataSaving = true
      
      if (data.id) {
        this.$store.dispatch('bpm/designer/processParameter/update', data).then(response => {
          // Hide dialog.
          this.isParameterDialogVisible = false

          // Update parameters list
          this.updateParameters(this.processId)

          // Update this parameter bindings if exists
          let model = this.model()

          this.diagramData.parameterPortBindings.forEach(binding => {
            if (binding.parameter_id == data.id) {
              // Update port parameters list
              let portData = model.findNodeDataForKey(binding.port_id)
              let portParameters = portData && portData.parameters ? portData.parameters.slice() : []

              portParameters.forEach(portParam => {
                if (portParam.id == binding.id) {
                  portParam.name = response.name
                }
              })

              model.setDataProperty(portData, "parameters", portParameters)
            }
          })
          
          this.$dmsSuccessNoty('Параметр модели успешно изменён')
        }).catch(error => {
          console.error(error)
        }).finally(() => {
          this.isParameterDataSaving = false
        })
      } else {
        this.$store.dispatch('bpm/designer/processParameter/create', data).then(response => {
          // Hide dialog.
          this.isParameterDialogVisible = false

          // Update parameters list
          this.updateParameters(this.processId)

          this.$dmsSuccessNoty('Параметр модели успешно создан')
        }).catch(error => {
          console.error(error)
        }).finally(() => {
          this.isParameterDataSaving = false
        })
      }
    },

    addNewParameter: function (type) {
      this.paramToEdit = { type, model_id: this.processId }
      this.isParameterDialogVisible = true
    },

    editParameter: function (paramId) {
      if (paramId) {
        this.$store.dispatch('bpm/designer/processParameter/item', { id: paramId }).then(parameter => {
          this.paramToEdit = parameter
          this.isParameterDialogVisible = true
        }).catch(error => {
          console.warn(error)
        })
      }
    },

    updateParameters: async function(modelId = null) {
      // Get updated parameters list
      return new Promise((resolve, reject) => { 
        this.$store.dispatch('bpm/designer/processParameter/list', { 
          model_id: modelId ? modelId : this.processId
        }).then(parameters => {
          // Set parameter type as text field
          parameters.forEach(parameter => { 
            parameter.typeStr = this.getParameterLabelByType(parameter.type) 
            parameter.isClone = false
            parameter.notClone = true
          })

          // Add dummy parameter as last in list for root model parameters list
          parameters.push(DUMMY_PARAMETER_CLONE)
          
          let model = this.model()
          let parametersContainerId = PARAMETERS_ID_PREFIX + modelId
          let nodeData = model.findNodeDataForKey(parametersContainerId)

          nodeData.parameters = parameters
          this.$refs.diag.updateParametersContainer( nodeData )

          resolve(parameters)
        }).catch(error => {
          reject(error)
        })
      })
    },

    deleteParameter: function (paramId) {
      if (paramId) {
        let model = this.model()
        let diagram = this.diagram()

        this.$store.dispatch('bpm/designer/processParameter/item', { id: paramId }).then(parameter => {
          this.$dmsConfirm('Удалить параметр "' + parameter.name + '"').then(confirmed => {
            if (confirmed) {
              this.updating = true

              // 1. Check & Remove (if exists) parameter-port binding
              this.diagramData.parameterPortBindings.forEach((binding, index, arr) => {
                if (binding.parameter_id == paramId) {
                  // Need to delete this binding
                  
                  // From server database
                  // NOTE: is it necessary? NO - backend resolves it.
                  // apiProcessData.processDataPortBinding.delete(this.processId, binding.id)

                  // From diagram (Port node)
                  let nodeData = model.findNodeDataForKey(binding.port_id)
                  if (nodeData) {
                    nodeData.parameters = nodeData.parameters.filter(param => param.id != binding.id)
                    this.$refs.diag.updatePort( nodeData )
                  }
                }
              })
              // Delete items from diagramData.parameterPortBindings
              this.diagramData.parameterPortBindings = this.diagramData.parameterPortBindings.filter(binding => binding.parameter_id != paramId)


              // 2. Check & Remove (if exists) parameter-parameter binding
              this.diagramData.parameterParameterBindings.forEach((binding, index, arr) => {
                if (binding.from == paramId) {
                  // Found binding to delete

                  // From server database
                  // NOTE: is it necessary? NO - backend resolves it.
                  // apiProcessData.processDataDataBinding.delete(this.processId, binding.id)

                  // From diagram as link
                  let aLink = diagram.findLinkForData(binding.link)
                  if (aLink) diagram.remove(aLink)
                }
              })
              this.diagramData.parameterParameterBindings.filter(binding => binding.from == paramId)

              // 3. Remove parameter
              this.$store.dispatch('bpm/designer/processParameter/delete', { 
                model_id: this.processId, id: paramId 
              }).then((res) => {
                // Update parameters list (on diagram)
                this.updateParameters(this.processId)

                this.$dmsSuccessNoty('Параметр успешно удалён')
              }).catch(error => { 
                console.warn(error) 
                this.$dmsErrorNoty('Произошла ошибка при удалении параметра')
              }).finally(() => {
                this.updating = false
              })
            }
          })
        })
      }
    },

    deleteParameterPortBinding: function (portId, paramBindingId, paramName, paramIndex) {
      let model = this.model()

      if (portId && paramBindingId && paramName) {
        this.$dmsConfirm('Удалить соединение параметра "' + paramName + '" с портом').then(async (confirmed) => {
          if (confirmed) {
            let nodeData = model.findNodeDataForKey(portId)
            let parameters = nodeData.parameters.slice()

            this.updating = true

            try {
              await apiProcessData.processDataPortBinding.delete(this.processId, paramBindingId)

              paramIndex = parameters.findIndex(param => param.id === paramBindingId)
              if (paramIndex >= 0) {
                parameters.splice(paramIndex, 1)
                nodeData.parameters = parameters
                this.$refs.diag.updatePort( nodeData )
              }

              // Remove element from diagramData
              this.diagramData.parameterPortBindings = this.diagramData.parameterPortBindings.filter(binding => binding.id != paramBindingId)

              this.$dmsSuccessNoty('Соединение успешно удалено')
            } catch (e) {
              console.error(e)
              this.$dmsErrorNoty('Произошла ошибка при удалении соединении')
            }
            
            this.updating = false
          }
        })
      }
    },

    // --------------------------------------------------------
    // Helper methods
    // --------------------------------------------------------

    // Freeze property panel.
    freezePanel: function () {
      this.$store.commit('bpm/designer/propertyPanel/disable')
    },

    // Unfreeze property panel.
    unfreezePanel: function () {
      this.$store.commit('bpm/designer/propertyPanel/enable')
    },

    showParameterContextMenu: function(e, data) {
      e.preventDefault()
      
      this.isParametersContextMenuVisible = false
      this.xParametersContextMenu = e.clientX
      this.yParametersContextMenu = e.clientY

      this.ctxMenu = {
        event: e,
        data
      }

      // Update context menu items.
      this.contextMenu = this.getContextMenu()

      this.$nextTick(() => {
        this.isParametersContextMenuVisible = true
      })
    },

    getContextMenu: function() {
      let menuItems = []

      if (this.ctxMenu && this.ctxMenu.data && this.ctxMenu.data.type) {
        menuItems.push({ title: 'Редактировать', icon: 'mdi-pencil', handler: (e, data) => { if (data && data.id) this.editParameter(data.id) } })
        menuItems.push({ title: 'Удалить', icon: 'mdi-delete', handler: (e, data) => { if (data && data.id) this.deleteParameter(data.id) } })
        menuItems.push({ divider: true, inset: false })
      }

      menuItems.push({
        title: 'Добавить', icon: 'mdi-plus-circle-outline',
        subItems: [
          { title: this.getParameterLabelByType(1), icon: 'mdi-text-short', handler: () => { this.addNewParameter(1) } },
          { title: this.getParameterLabelByType(2), icon: 'mdi-text-subject', handler: () => { this.addNewParameter(2) } },
          { title: this.getParameterLabelByType(3), icon: 'mdi-at', handler: () => { this.addNewParameter(3) } },
          { title: this.getParameterLabelByType(4), icon: 'mdi-calendar', handler: () => { this.addNewParameter(4) } },
          { title: this.getParameterLabelByType(5), icon: 'mdi-checkbox-marked', handler: () => { this.addNewParameter(5) } }
        ]
      })

      return menuItems
    }
  } // methods
}
</script>

<style lang="scss">
</style>
