<template lang="html">
  <div>

    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <template v-if="error">
      <el-alert
        :title="error"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </template>

    <el-popover
      ref="addPortStateSettingsForm"
      placement="left-start"
      width="400"
      trigger="click"
      v-model="isProcessPortStateSettingsDialogVisible"
      v-on:show="updateData"
      v-on:hide="() => { selectedPortId = null, selectedStateId = null }"
    >
      <div>
        <template v-if="loadingSettings">
          <loading flat :message="false" />
        </template>
        <el-form label-width="120px" label-position="top" size="mini">

          <el-form-item label="Выберите порт для привязки состояния индикатора">
            <el-select v-model="selectedPortId" placeholder="Select Port" clearable>
              <el-option
                v-for="(port, index) in portsList"
                :key="port.id"
                :label="port.name"
                :value="port.id"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Выберите состояние индикатора">
            <el-select v-model="selectedStateId" placeholder="Select State" clearable>
              <el-option-group
                v-for="(indicator, index) in indicatorsList"
                :key="indicator.id"
                :label="indicator.name"
              >
                <el-option
                  v-for="state in indicator.stateList"
                  :key="state.id"
                  :label="state.name"
                  :value="state.id"
                >
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" plain
              @click="addProcessPortStateSettings"
              :disabled="selectedPortId == null || selectedStateId == null">
              Добавить
            </el-button>
            <el-button @click="() => { isProcessPortStateSettingsDialogVisible = false }">
              Отменить
            </el-button>
          </el-form-item>

        </el-form>
      </div>
    </el-popover>

    <div class="custom-tree-node header-title">
      <span class="text-small"><strong>Привязка Индикации к Портам процесса</strong></span>
      <span>
        <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" v-popover:addPortStateSettingsForm></el-button>
      </span>
    </div>

    <template v-if="tableData">
      <el-table
        :data="tableData"
        style="width: 100%"
        height="400"
        highlight-current-row
        size="mini"
      >
        <el-table-column
          type="index"
          width="40"/>
        <el-table-column
          prop="process"
          label="Процесс"
          width="100" sortable />
        <el-table-column
          prop="port"
          label="Порт"
          width="100" sortable />
        <el-table-column
          prop="indicator"
          label="Индикатор"
          width="130" sortable />
        <el-table-column
          prop="state"
          label="Состояние"
          width="130" sortable />
        <el-table-column
          label=""
          width="40">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-delete" 
              @click="deleteProcessStateSettings(scope.$index, scope.row)" 
            />
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-else>
      <p>Настройки ещё не созданы.</p>
    </template>

  </div>
</template>

<script>
  // mixins
  import designer from '../../mixins/designer'

  export default {
    mixins: [
      designer
    ],

    props: {
      // Process ID
      id: {
        type: [String, Number],
        default: null
      }
    },

    watch: {
      id: function () {
        this.init()
      },

      statesList: function() {
        this.updateSettingsTable()
      }
    },

    data() {
      return {
        loading: false,
        loadingSettings: false,
        isProcessPortStateSettingsDialogVisible: false,
        error: '',

        // formData: {},
        processObject: null,
        processStatesData: [],
        tableData: null,

        portsList: null,
        indicatorsList: null,
        statesList: null,

        selectedPortId: null,
        selectedStateId: null
      }
    },

    created() {
      this.$bus.$on('bpm.constructor.indication.update', () => {
        this.init()
      })
    },

    destroyed() {
      this.$bus.$off('bpm.constructor.indication.update')
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
        // this.formData = {}
        this.processObject = null
        // this.processStatesData = []
        this.tableData = []

        this.portsList = []
        this.statesList = []
        this.indicatorsList = []

        this.selectedPortId = null
        this.selectedStateId = null

        if (this.id) {
          this.getData()
          // console.log("All data loaded!");
        }
      },

      getData: async function() {
        // 1. Get (load) process indicators & states.
        // 2. Get (load) process & all its sub-processes ports.
        // 3. Get (load) port & indication current settings.

        // this.loading = true
        this.loadingSettings = true

        this.rootProcess = await this.getRootProcess()

        const [indicatorsAndStates, ports, settings] = await Promise.all([
          this.getIndicatorsAndStates(),
          this.getPorts(),
          this.getSettings()
        ])

        this.indicatorsList = indicatorsAndStates.indicators
        // this.statesList = states
        this.portsList = ports
        this.processStatesData = settings

        // this.updateSettingsTable()

        // this.loading = false
        this.loadingSettings = false
      },

      updateData: async function () {
        this.loadingSettings = true

        const [indicatorsAndStates, ports] = await Promise.all([
          this.getIndicatorsAndStates(),
          this.getPorts(),
        ])

        this.indicatorsList = indicatorsAndStates.indicators
        this.portsList = ports

        this.loadingSettings = false
      },

      getRootProcess: function () {
        return new Promise((resolve, reject) => {
          // 1. Подробная информация о корневом процессе (модели)
          this.$store.dispatch('bpm/designer/process/item', { id: this.id }).then(_process => {
            resolve(_process)
          }).catch( error => {
            console.warn(error)
            resolve({
              name: 'Error occurres',
              description: 'Error occurres'
            })
          })
        })
      },

      getIndicatorsAndStates: function () {
        return new Promise((resolve, reject) => {

          this.$store.dispatch('bpm/designer/indicator/list', { parentId: this.id }).then(list => {
            let indicators = []
            let states = []
            this.statesList = []

            if ( list ) {
              // Load indicator's states.
              for (let index = 0; index < list.length; ++index) {
                let indicator = list[index]

                indicator.leafType = 'indicator'
                // indicator.children = []
                indicator.stateList = []

                indicators.push(indicator)

                // Load states for each indicator in list.

                this.$store.dispatch('bpm/designer/indicator/iState/list', { processId: this.id, parentId: indicator.id }).then(_list => {
                  if ( _list && _list.length ) {
                    // Find index of parent indicator.
                    let _index = indicators.findIndex( _indicator => {
                      return _indicator.id == _list[0].indicator_id
                    })

                    if (_index >= 0) {
                      let _indicator = indicators[_index]

                      _list.forEach(state => {
                        state.leafType = 'state'
                        state.indicatorName = _indicator.name
                      })

                      _indicator.stateList = _list.slice()
                      indicators.splice(_index, 1, _indicator)

                      states = states.concat(_list)
                      this.statesList = this.statesList.concat(_list)
                      // console.log(states);

                      // TODO: - check if it needed.
                      // indicators[_index] = Object.assign({}, indicators[_index], {
                      //   children: _list.slice()
                      // })

                      // console.log("indicators:")
                      // console.log(indicators)
                    }
                  }
                }).catch(error => {
                  console.warn(error)
                })
              } // for

              // console.log("All indicators states loaded.");
              resolve({ indicators, states })
              // resolve(states)
            }
          }).catch( error => {
            resolve([])
          })
        })
      },

      getPorts: function () {
        return new Promise((resolve, reject) => {
          let ports = []

          // At the first load ports of current (root) process.
          this.$store.dispatch('bpm/designer/port/list', { process_model_id: this.id }).then(_ports => {
            if (_ports && Array.isArray(_ports)) {
              _ports.forEach(port => {
                let _port = {
                  id: port.id,
                  name: port.name,
                  description: port.description,
                  type: port.type,
                  processName: this.rootProcess.name,
                  processId: this.id,
                }

                ports.push(_port)
              })
            }

            // Load sub-processes ports.
            this.$store.dispatch('bpm/designer/nestedProcess/list', { model_id: this.id }).then(list => {
              if (list && Array.isArray(list) && list.length) {

                list.forEach(nestedProcess => {
                  // Для каждого вложенного процесса необходимо получить:
                  //  1 - подробную информацию о его модели,
                  //  2 - список всех его портов

                  // 1. Подробная информация о вложенном процессе (модели)
                  this.$store.dispatch('bpm/designer/process/item', { id: nestedProcess.submodel_id }).then(_process => {
                    nestedProcess.name = _process.name ? _process.name : ''
                    nestedProcess.description = _process.description ? _process.description : ''
                  }).catch( error => {
                    console.warn(error)
                  })

                  // 2. Порты вложенного процесса.
                  this.$store.dispatch('bpm/designer/port/list', { process_model_id: nestedProcess.submodel_id }).then(_ports => {
                    if (_ports && Array.isArray(_ports)) {
                      _ports.forEach(port => {
                        let _port = {
                          id: port.id,
                          name: port.name,
                          description: port.description,
                          type: port.type,
                          processName: nestedProcess.name,
                          processId: nestedProcess.id,
                          processModelId: nestedProcess.id,
                          processSubmodelId: nestedProcess.submodel_id,
                        }

                        ports.push(_port)
                      })
                    }

                    resolve(ports)

                  }).catch(error => {
                    resolve(ports)

                    console.warn(error)
                  })
                }) // forEach

                this.loadingNestedProcesses = false

              } // if
            }).catch(error => {
              console.warn(error)

              resolve(ports)
            }).finally(() => {
              resolve(ports)
            })

          }).catch(error => {
            console.warn(error)

            resolve(ports)
          })
        })
      },

      getSettings: function () {
        return new Promise((resolve, reject) => {
          this.$store.dispatch('bpm/designer/portStateBinding/list', { parentId: this.id }).then(settings => {
            resolve(settings)
          }).catch( error => {
            console.warn(error)
            resolve([])
          })
        })
      },

      updateSettingsTable: function() {
        this.tableData = []

        this.processStatesData.forEach(element => {
          if (element.port_id && element.indicator_state_id) {
            let port = this.portsList.find(_port => {
              return Boolean(_port.id == element.port_id)
            })

            // let state = null
            let state = this.statesList.find(_state => {
              return Boolean(_state.id == element.indicator_state_id)
            })

            if (port && state) {
              this.tableData.push({
                process: port.processName,
                port: port.name,
                indicator: state.indicatorName,
                state: state.name,
                port_id: element.port_id,
                indicator_state_id: element.indicator_state_id,
                id: element.id
              })
            }
          }
        })
      },

      addProcessPortStateSettings: function () {
        this.isProcessPortStateSettingsDialogVisible = false

        // Add new settings to the settings array & save it in the Store.
        this.processStatesData.push({
          port_id: this.selectedPortId,
          indicator_state_id: this.selectedStateId
        })

        // Update data in the Store.
        this.saveChanges()
      },

      deleteProcessStateSettings: function (index, row) {
        this.tableData.splice(index, 1)

        let settingsIndex = this.processStatesData.findIndex(element => {
          return element.id == row.id
        })

        if (settingsIndex >= 0) this.processStatesData.splice(settingsIndex, 1)

        // Update data in the Store.
        this.saveChanges()
      },

      saveChanges: function () {
        // this.loading = true

        this.$store.dispatch('bpm/designer/portStateBinding/update', {
          parentId: this.id,
          data: {
            indicators_states: this.processStatesData
          }
        }).then((data) => {
          // this.updateSettingsTable()
        }).catch( error => {
          // this.updateSettingsTable()
        }).finally(() => {
          this.updateSettingsTable()
          // this.loading = false
        })
      }

    }
  }
</script>

<style lang="css">
</style>
