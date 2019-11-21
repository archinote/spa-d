<template lang="html">
  <div class="property-panel-wrapper">

    <template v-if="!isPropertyPanelEnabled">
      <!-- <loading :flat="true" :message="false" /> -->
      <!-- <div class="card"></div> -->
      <div class='text-input__loading'>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
        <div class='text-input__loading--line'></div>
      </div>
    </template>

    <el-tabs v-else v-model="activeTab">

      <!--
        PROCESS
       -->
      <template v-if="curObjectType === 'root-process'">
        <el-tab-pane label="Процесс" name="first">
          <ProcessPanel :id="curObjectId" />
        </el-tab-pane>

        <el-tab-pane label="Назначения" name="third">
          <ProcessAppointments :id="curObjectId" />
        </el-tab-pane>

        <el-tab-pane label="Индикаторы" name="fourth">
          <ProcessIndication :id="curObjectId" />
        </el-tab-pane>

        <el-tab-pane label="Удалить" name="fifth">
          <span slot="label"><i class="el-icon-delete"></i></span>
          <p class="caption">
            Для удаления процесса используйте кнопку ниже.<br/>Будьте внимательны, это действие необратимо.
          </p>
          <p style="text-align: center; margin-top: 24px;">
            <el-button type="danger" plain size="mini" icon="el-icon-delete" @click.stop="deleteProcess">
              Удалить
            </el-button>
          </p>
        </el-tab-pane>
      </template>

      <!--
        SUB-PROCESS
       -->
      <template v-else-if="curObjectType === 'nestedProcess'">
        <el-tab-pane label="Вложенный процесс" name="first">
          <p class="caption">Выбран вложенный процесс</p>
          <router-link :to="getRouteData({ name: 'bpm.designer.edit-process', params: { processId: curObjectData.submodel_id }})">Редактировать</router-link>
        </el-tab-pane>
        <el-tab-pane label="Удалить" name="second">
          <span slot="label"><i class="el-icon-delete"></i></span>
          <p class="caption">
            Для удаления вложенного процесса используйте кнопку ниже.
          </p>
          <p style="text-align: center; margin-top: 24px;">
            <el-button type="danger" plain size="mini" icon="el-icon-delete" @click.stop="deleteNestedProcess">
              Удалить
            </el-button>
          </p>
        </el-tab-pane>
      </template>

      <!--
        PORT
       -->
      <template v-else-if="curObjectType === 'port'">
        <el-tab-pane :label="'Порт' + (curPortType === 'input'? ' (входной)' : ' (выходной)')" name="first">
          <PortPanel :id="curObjectId" :processId="curProcessId" />
        </el-tab-pane>

        <!-- Для входных портов - возможность управления публикацией -->
        <el-tab-pane v-if="curPortType === 'input'" label="Публикация" name="third">
          <PortPublication :id="curObjectId" :processId="curProcessId" />
        </el-tab-pane>

        <el-tab-pane label="Удалить" name="fourth">
          <span slot="label"><i class="el-icon-delete"></i></span>
          <p class="caption">
            Для удаления порта используйте кнопку ниже.
          </p>
          <p style="text-align: center; margin-top: 24px;">
            <el-button type="danger" plain size="mini" icon="el-icon-delete" @click.stop="deletePort">
              Удалить
            </el-button>
          </p>
        </el-tab-pane>
      </template>

      <!--
        LINK
       -->
      <template v-else-if="curObjectType === 'link'">
        <el-tab-pane label="Соединение" name="first">
          <template v-if="selectedDiagramObject.data && selectedDiagramObject.data.bindingId">
            <p class="caption">
              Выбрано соединение (связь) между параметрами родительской и вложенной моделей
            </p>
          </template>
          <template v-else>
            <LinkPanel :id="curObjectId" :processId="curProcessId" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="Удалить" name="second">
          <span slot="label"><i class="el-icon-delete"></i></span>
          <p class="caption">
            Для удаления соединения используйте кнопку ниже.
          </p>
          <p style="text-align: center; margin-top: 24px;">
            <el-button type="danger" plain size="mini" icon="el-icon-delete" @click.stop="deleteLink">
              Удалить
            </el-button>
          </p>
        </el-tab-pane>
      </template>

      <template v-else>
        <!-- NOTE: Выбрано что-то странное -->
      </template>

    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ProcessPanel from "./panel/Process"
import ProcessAppointments from "./panel/ProcessAppointments"
import ProcessIndication from "./panel/ProcessIndication"

import PortPanel from "./panel/Port"
import PortPublication from "./panel/PortPublication"

import LinkPanel from "./panel/Link"

export default {
  components: {
    ProcessPanel,
    ProcessAppointments,
    ProcessIndication,

    PortPanel,
    PortPublication,

    LinkPanel
  },

  props: {
    processId: null,
    diagramProcess: null
  },

  data() {
    return {
      activeTab: 'first',
      selectedDiagramObject: null,
      selectedDiagramObject: null,
      selectedCatalogItem: null,
      curDiagramProcess: null
    }
  },

  computed: {
    ...mapGetters('app/layout', ['getRouteData']),
    curObjectType: function () {
      let objectType = ''

      if (this.selectedDiagramObject) {
        if (this.selectedDiagramObject instanceof go.Node) {
          if (this.selectedDiagramObject.data.nodeType) {
            objectType = this.selectedDiagramObject.data.nodeType
          }
        } else if (this.selectedDiagramObject instanceof go.Link) {
          objectType = 'link'
        }
      } else if (this.processId) {
        objectType = "root-process"
      }

      return objectType
    },
    curProcessId: function () {
      return this.processId
    },
    curObjectData: function () {
      let objectData = this.selectedDiagramObject && this.selectedDiagramObject.data
        ? this.selectedDiagramObject.data
        : { id: null }
      
      return objectData
    },
    curObjectId: function () {
      let objectId = null

      let objectData = this.selectedDiagramObject && this.selectedDiagramObject.data
        ? this.selectedDiagramObject.data
        : { id: null }

      if (this.selectedDiagramObject instanceof go.Node) {
        if (objectData.nodeType == "nestedProcess") {
          // objectId = objectData.submodel_id
          objectId = objectData.id
        } else {
          objectId = objectData.id
        }
      } else if (this.selectedDiagramObject instanceof go.Link) {
        objectId = objectData.id
      } else {
        objectId = this.processId
      }

      return objectId
    },
    curPortType: function () {
      let type = ''

      if (this.selectedDiagramObject instanceof go.Node) {
        type = this.selectedDiagramObject.data.type
          ? this.selectedDiagramObject.data.type
          : ''
      }

      return type
    },
    isPropertyPanelEnabled() {
      return this.$store.getters['bpm/designer/propertyPanel/isEnabled']()
    }
  },

  watch: {
    diagramProcess: function (newVal) {
      this.curDiagramProcess = newVal

      // Set current tab to first.
      this.activeTab = 'first'
    },
    processId: function() {
      // NOTE - current process changed

      // After diagram process changed no object selected.
      this.selectedDiagramObject = null

      // Set current tab to first.
      this.activeTab = 'first'
    }
  },

  created() {
    this.$bus.$on('diagram.node-selected', node => {

      this.selectedDiagramObject = node

      // Set current tab to first.
      this.activeTab = 'first'
    })

    this.$bus.$on('diagram.link-selected', link => {

      this.selectedDiagramObject = link

      // Set current tab to first.
      this.activeTab = 'first'
    })

    this.$bus.$on('diagram.clear-selected', () => {

      this.selectedDiagramObject = null

      // Set current tab to first.
      this.activeTab = 'first'
    })
  },

  methods: {
    clearSelection: function () {
      this.selectedDiagramObject = null
      this.activeTab = 'first'
    },
    deleteProcess: function() {
      this.$bus.$emit('process.delete', this.curProcessId)
    },
    deletePort: function() {
      this.$bus.$emit('port.delete', this.curObjectId, this.curProcessId)
    },
    deleteLink: function() {
      this.$bus.$emit('link.delete', this.curObjectId, this.curProcessId, this.selectedDiagramObject.data)
    },
    deleteNestedProcess: function() {
      this.$bus.$emit('nested-process.delete', this.curObjectId, this.curProcessId)
    }
  }
}
</script>

<style lang="scss">
  .property-panel-wrapper {
    height: 100%;
    max-height: 100%;
    overflow: auto;
    padding: 16px;
    background-color: white;

    .el-tabs {
      &__content {
        max-height: calc(100vh - 200px);
        overflow-y: auto;
      }

      &__item {
        font-size: 12px !important;
      }
    }

    .el-collapse-item {
      &__header {
        font-size: 14px;
      }
    }

    .el-form {
      .el-form-item--mini {
        label {
          padding-bottom: 0;
          margin-bottom: 5px !important;
          font-weight: normal !important;
          font-size: 13px !important;
        }
      }
    }

    .el-textarea {
      font-size: 12px;
    }

    .el-tree-node {
      &__content {
        height: 24px;
        // height: auto !important;

        label {
          margin-bottom: 0;
        }
      }
      &__label {
        font-size: 12px;
      }
    }
    .compact-tree {
      .el-tree-node__content {
        height: 20px;
      }
    }
    .flat-tree {
      .el-tree-node__content {
        & > .el-tree-node__expand-icon {
          display: none;
        }
      }
    }

    .el-radio__label, .el-checkbox__label {
      font-size: 12px !important;
    }

    .el-table th {
      font-size: 12px;
    }
    .el-table tr {
      font-size: 10px;
    }

    .custom-tree-node {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      padding-right: 8px;
    }
    .header-title {
      border-bottom: 1px solid lightgrey;
      // margin-top: 16px;
      margin-bottom: 8px;
      // padding-bottom: 4px;
    }
  }

  :root {
  --card-padding: 24px;
  --card-height: 340px;
  --card-skeleton: linear-gradient(lightgrey var(--card-height), transparent 0);
  
  --avatar-size: 32px;
  --avatar-position: var(--card-padding) var(--card-padding);
  --avatar-skeleton: radial-gradient(circle 16px at center, white 99%, transparent 0);
  
  --title-height: 32px;
  --title-width: 200px;
  --title-position: var(--card-padding) 180px;
  --title-skeleton: linear-gradient(white var(--title-height), transparent 0);
  
  --desc-line-height: 16px;
  --desc-line-skeleton: linear-gradient(white var(--desc-line-height), transparent 0);
  --desc-line-1-width: 230px;
  --desc-line-1-position: var(--card-padding) 242px;
  --desc-line-2-width: 180px;
  --desc-line-2-position: var(--card-padding) 265px;
  
  --footer-height: 40px;
  --footer-position: 0 calc(var(--card-height) - var(--footer-height));
  --footer-skeleton: linear-gradient(white var(--footer-height), transparent 0);
  
  --blur-width: 200px;
  --blur-size: var(--blur-width) calc(var(--card-height) - var(--footer-height));
}

/*
 * Card Skeleton for Loading
 */

.card {
  width: 280px; //demo
  height: var(--card-height);
  
  &:empty::after {
    content:"";
    display: block;
    width: 100%;
    height: 100%;

    background-image:
      linear-gradient(
        90deg, 
        rgba(lightgrey, 0) 0, 
        rgba(lightgrey, .8) 50%, 
        rgba(lightgrey, 0) 100%
      ),                          //animation blur
      var(--title-skeleton),      //title
      var(--desc-line-skeleton),  //desc1
      var(--desc-line-skeleton),  //desc2
      var(--avatar-skeleton),     //avatar
      var(--footer-skeleton),     //footer bar
      var(--card-skeleton)        //card
    ;

    background-size:
      var(--blur-size),
      var(--title-width) var(--title-height),
      var(--desc-line-1-width) var(--desc-line-height),
      var(--desc-line-2-width) var(--desc-line-height),
      var(--avatar-size) var(--avatar-size),
      100% var(--footer-height),
      100% 100%
    ;
    
    background-position:
      -150% 0,                      //animation
      var(--title-position),        //title
      var(--desc-line-1-position),  //desc1
      var(--desc-line-2-position),  //desc2
      var(--avatar-position),       //avatar
      var(--footer-position),       //footer bar
      0 0                           //card
    ;

    background-repeat: no-repeat;
    animation: loading 1.5s infinite;
  }
}

@keyframes loading {
  to {
    background-position:
      350% 0,        
      var(--title-position),  
      var(--desc-line-1-position),
      var(--desc-line-2-position),
      var(--avatar-position),
      var(--footer-position),
      0 0
    ;
  }
}


//
// 2
//
@mixin nth-children($points...) {
  @each $point in $points {
    &:nth-child(#{$point}) {
      @content;
    }
  }
}

.text-input__loading {
  height: 262px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 24px;

  &--line {
    height: 10px;
    margin: 10px 0;
    animation: pulse 2s infinite ease-in-out;
  }

  div {
    @include nth-children(1, 5, 9) {
      width: 75%;
    }
    @include nth-children(2, 6, 10) {
      width: 100%;
    }
    @include nth-children(3, 7) {
      width: 10%;
    }
    @include nth-children(4, 8) {
      width: 50%;
    }
  }
}

@keyframes pulse {
  0% {
    background-color: rgba(165, 165, 165, 0.1)
  }
  50% {
    background-color: rgba(165, 165, 165, 0.3)
  }
  100% {
    background-color: rgba(165, 165, 165, 0.1)
  }
}
</style>
