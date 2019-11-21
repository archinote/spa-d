<template lang="html">
  <div>

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

    <template v-else>
      <div class="custom-tree-node header-title">
        <span class="text-small"><strong>Индикаторы и состояния</strong></span>
        <span>
          <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="() => showIndicatorDialog()"></el-button>
        </span>
      </div>

      <template v-if="indicators">
        <el-tree
          :data="indicators"
          node-key="id"
          label="name"
          :default-expand-all="false"
          :expand-on-click-node="false"
          class="compact-tree"
          :default-expanded-keys="expandedKeys"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>
              <i v-if="data.leafType == 'indicator'" :class="data.iconClass"></i>
              {{ data.name }}
            </span>
            <span v-if="data.leafType == 'indicator'">
              <span>
                <el-button type="text" size="mini" icon="el-icon-circle-plus-outline" @click="() => showStateDialog({ indicator: data })"></el-button>
              </span>
              <span>
                <el-button type="text" size="mini" icon="el-icon-edit" @click="() => showIndicatorDialog(data)"></el-button>
              </span>
              <span>
                <el-button type="text" size="mini" icon="el-icon-delete" @click="() => deleteIndicator(data)"></el-button>
              </span>
            </span>
            <span v-else>
              <span>
                <el-button type="text" size="mini" icon="el-icon-edit" @click="() => showStateDialog({ state: data })"></el-button>
              </span>
              <span>
                <el-button type="text" size="mini" icon="el-icon-delete" @click="() => deleteState(data)"></el-button>
              </span>
            </span>
          </span>
        </el-tree>
      </template>
      <template v-else>
        <p>Индикаторы и состояния ещё не созданы.</p>
      </template>
    </template>

    <IndicatorDialog
      :isVisible="isIndicatorDialogVisible"
      :formData="indicator"
      :loading="false"
      :loadingSubmit="loadingIndicator"
      v-on:submit="saveIndicator"
      v-on:cancel="() => { isIndicatorDialogVisible = false }"
      :title="indicator && indicator.id ? 'Редактирование индикатора' : 'Добавление нового индикатора'"
    />

    <StateDialog
      :isVisible="isStateDialogVisible"
      :formData="{ state, indicators }"
      :loading="false"
      :loadingSubmit="loadingState"
      v-on:submit="saveState"
      v-on:cancel="() => { isStateDialogVisible = false }"
      :title="state && state.id ? 'Редактирование состояния' : 'Добавление нового состояния'"
    />

  </div>
</template>

<script>
// components
import IndicatorDialog from '../forms/IndicatorDialog'
import StateDialog from '../forms/StateDialog'
// mixins
import designer from '../../mixins/designer'
import panelForm from '../../mixins/panelForm'

export default {
  components: {
    IndicatorDialog,
    StateDialog
  },

  mixins: [
    designer,
    panelForm
  ],

  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },

  data() {
    return {
      loadingIndicators: false,
      loadingStates: false,
      isIndicatorDialogVisible: false,
      isStateDialogVisible: false,

      indicators: [],
      expandedKeys: [],

      // Indicator & State to use in dialog form.
      loadingIndicator: false,
      loadingState: false,
      indicator: null,
      state: null
    }
  },


  computed: {
    isLoading: function () {
      return this.loadingIndicators || this.loadingStates
    }
  },

  methods: {
    init: function () {
      this.getIndicators()
    },

    getIndicators: function (idToExpand = '') {
      this.loadingIndicators = true
      this.onLoadError = false
      this.indicators = []

      this.$store.dispatch('bpm/designer/indicator/list', { parentId: this.id }).then(list => {
        this.loadingIndicators = false

        // Load indicator's states.
        list.forEach((indicator, index) => {
          indicator.leafType = 'indicator'

          // TODO activate it after include icon font.
          // indicator.iconClass: indicator.type == 1
          //     ? 'fa fa-share-alt'
          //     : (indicator.type == 2
          //     ? 'fa fa-envelope-o'
          //     : 'fa fa-mobile'),

          // if (indicator.children) {
          //   indicator.children.forEach(state => {
          //     state.leafType = 'state'
          //   })
          // }

          this.indicators.push(indicator)

          // Load states for each indicator in list.
          this.loadingStates = true
          this.$store.dispatch('bpm/designer/indicator/iState/list', { 
            processId: this.id, parentId: indicator.id 
          }).then(_list => {
            let _index = this.indicators.findIndex( _indicator => {
              return Boolean(_list[0] && (_indicator.id == _list[0].indicator_id))
            })

            if (_index >= 0) {
              let _indicator = this.indicators[_index]

              _indicator.children = []

              _list.forEach(state => {
                state.leafType = 'state'
              })

              _indicator.children = _list.slice()
              this.indicators.splice(_index, 1, _indicator)

              this.indicators[_index] = Object.assign({}, this.indicators[_index], {
                children: _list.slice()
              })

              this.expandedKeys = [idToExpand]
            }
          }).catch(error => {
            console.error(error)
            this.onLoadError = true
          }).finally(() => {
            this.loadingStates = false
          })
        })
      }).catch(error => {
        this.loadingIndicators = false
        this.loadingStates = false
        // this.error = "Произошла ошибка при получении данных...."
        this.onLoadError = true
      })
    },

    showIndicatorDialog: function (indicator = {}) {
      this.indicator = indicator
      this.isIndicatorDialogVisible = true
    },

    saveIndicator: function (indicator) {
      // NOTE: Don't hide the dialog until SUCCESS server response
      // Show error IN dialog overvise
      // UPDATE indicator data (ID! for a new one) after success server response
      this.loadingIndicator = true

      if ( indicator.id ) {
        // Update existing indicator
        this.$store.dispatch('bpm/designer/indicator/update', {
          parentId: this.id,
          id: indicator.id,
          item: indicator
        }).then(_indicator => {
          if ( _indicator ) {
            this.isIndicatorDialogVisible = false

            // Update indicators & states tree.
            this.getIndicators(indicator.id)
          }
        }).catch(error => {
          this.error = "Ошибка обновления данных индикатора"
        }).finally(() => {
          this.loadingIndicator = false
        })
      } else {
        // Create new indicator
        this.$store.dispatch('bpm/designer/indicator/create', {
          parentId: this.id,
          item: indicator
        }).then(_indicator => {
          if ( _indicator ) {
            this.isIndicatorDialogVisible = false

            // Update indicators & states tree.
            this.getIndicators(_indicator.id)
          }
        }).catch(error => {
          this.error = "Ошибка добавления индикатора"
        }).finally(() => {
          this.loadingIndicator = false
        })
      }
    },

    deleteIndicator: function (indicator) {
      if (indicator && indicator.id) {
        this.loading = true

        this.$store.dispatch('bpm/designer/indicator/delete', {
          parentId: this.id,
          id: indicator.id
        }).then(result => {
          this.$dmsSuccessNoty('Индикатор успешно удалён')
          
          // Update indicators & states tree.
          this.getIndicators()
          this.$bus.$emit('bpm.constructor.indication.update')
        }).catch(error => {
          console.error(error)
          this.$dmsErrorNoty('Произошла ошибка при удалении индикатора')
        }).finally(() => {
          this.loading = false
        })
      }
    },

    showStateDialog: function ({ state, indicator }) {
      if (state) {
        // Edit existing state.
        this.state = state
      } else if (indicator) {
        // Add new state to indicator.
        this.state = {
          id: null,
          name: '',
          indicator_id: indicator.id
        }
      }

      this.isStateDialogVisible = true
    },

    saveState: function (state) {
      this.loadingState = true

      if (state.id) {
        this.$store.dispatch('bpm/designer/indicator/iState/update', {
          processId: this.id,
          parentId: state.indicator_id,
          id: state.id,
          item: state
        }).then(_state => {
          if (_state) {
            this.isStateDialogVisible = false

            // Update indicators & states tree.
            this.getIndicators(_state.id)
          }
        }).catch(error => {
          // this.error = "No any data..."
          console.log(error)
        }).finally(() => {
          this.loadingState = false
        })
      } else {
        this.$store.dispatch('bpm/designer/indicator/iState/create', {
          processId: this.id,
          parentId: state.indicator_id,
          item: state
        }).then(_state => {
          if (_state) {
            this.isStateDialogVisible = false

            // Update indicators & states tree.
            this.getIndicators(_state.id)
          }
        }).catch(error => {
          // this.error = "No any data..."
          console.log(error)
        }).finally(() => {
          this.loadingState = false
        })
      }

    },

    deleteState: function (state) {
      if (state && state.id) {
        this.loading = true

        this.$store.dispatch('bpm/designer/indicator/iState/delete', {
          processId: this.id,
          parentId: state.indicator_id,
          id: state.id
        }).then(result => {
          // Update indicators & states tree.
          this.getIndicators()
          this.$bus.$emit('bpm.constructor.indication.update')
          if (result) {
            // State deleted successfully.
            // TODO - show message
          } else {
            // Error while deleting state.
            // TODO - show message
          }
        }).catch(error => {
          // TODO - show message
          // this.error = "No any data..."
          console.log(error);
        }).finally(() => {
          this.loading = false
        })
      }
    },

    updateIndicatorsList: function () {
      if (this.curDiagramProcess && typeof this.curDiagramProcess.getIndicatorList === "function" ) {
        let indicators = this.curDiagramProcess.getIndicatorList()

        // Clear data.
        this.indicatorsAndStates = []

        if (indicators && indicators.length) {
          indicators.forEach( _indicator => {
            let states = _indicator.getStateList()
            let iStates = []

            if (states && states.length) {
              states.forEach( _state => {
                iStates.push({
                  id: _state.getID(),
                  label: _state.getName(),
                })
              })
            }

            this.indicatorsAndStates.push({
              id: _indicator.getID(),
              label: _indicator.getName(),
              children: iStates
            })
          })
        }
      }
    }
  }
}
</script>

<style lang="css">
</style>
