<template lang="html">
  <div :id="htmlId" class="diagram-wrapper"></div>
</template>

<script>
import * as go from "gojs"
// import * as go from "@/gojs/go_debug.js"
let $ = go.GraphObject.make

import FieldDraggingTool from '../helpers/fieldDraggingTool'
import { fieldDraggingTemplate } from '../helpers/fieldDraggingTool'

// mixins
import diagramTemplates from "../mixins/diagramTemplates"

import { mapState, mapGetters } from 'vuex'

const consoleDebug = Boolean(process.env.NODE_ENV !== 'production')

export default {
  mixins: [
    diagramTemplates
  ],

  props: [
    'modelData', // accept model data as a parameter,
    'processId'
  ],

  data: function() {
    return {
      diagram: null, // provide access to the GoJS Diagram
      el: 'goDiagram', // 'id' of html Diagram container,
      // isParametersModeOn: false
    }
  },

  computed: {
    ...mapState('bpm/designer/diagramModes', ['isParametersOn', 'isIndicationOn']),
    htmlId: function() {
      return this.el + '-' + this.processId
      // return 'diagramHtmlId'
    },
    htmlElement: function() {
      return document.getElementById(this.htmlId)
    },
    isPropertyPanelVisible() {
      return this.$store.getters['bpm/designer/propertyPanel/isVisible']()
    }
  },

  watch: {
    isPropertyPanelVisible: function () {
      // При каждом изменении видимости панели свойств меняется размер диаграммы.
      // Поэтому необходимо её перерисовать.
      this.diagram.requestUpdate()
    }
  },

  created: function() {
    //
    // BUS events watchers
    //
    this.$bus.$on('diagram.port.delete', (portId, processId) => {
      this.deletePort(portId, processId)
    })

    this.$bus.$on('diagram.selection.delete', () => {
      this.deleteSelected()
    })

    this.$bus.$on('port.changed', port => {
      this.updatePort( port )
    })

    this.$bus.$on('diagram.fit-zoom', () => {
      this.fitZoom()
    })

    this.$bus.$on('diagram.reinit', () => {
      // this.init()
      this.diagram.requestUpdate()
    })
  },

  destroyed() {
    this.$bus.$off('diagram.port.delete')
    this.$bus.$off('diagram.selection.delete')
    this.$bus.$off('port.changed')
    this.$bus.$off('diagram.fit-zoom')
    this.$bus.$off('diagram.parameters-mode.switch')
    this.$bus.$off('diagram.reinit')
  },

  mounted: function() {
    // Create Diagram object
    this.initDiagram()
  },

  methods: {
    model: function() {
      return this.diagram.model
    },

    init: function() {
      this.initDiagram()
    },

    initDiagram: function() {
      const myDiagram = $(go.Diagram, this.htmlId, {
        initialContentAlignment: go.Spot.Center,
        initialAutoScale: go.Diagram.Uniform,
        allowZoom: true,
        maxScale: 2,
        minScale: 0.1,
        "animationManager.isEnabled": false,  // turn off automatic animations
        // allow Ctrl-G to call the groupSelection command
        "commandHandler.archetypeGroupData": {
          text: "Group",
          isGroup: true,
          color: "blue"
        },

        "undoManager.isEnabled": false,

        validCycle: go.Diagram.CycleNotDirected,  // don't allow loops
        draggingTool: $(FieldDraggingTool),  // use custom DraggingTool

        // Model ChangedEvents get passed up to component users
        "ModelChanged": (e) => { this.$emit("model-changed", e) },
        "SelectionMoved": (e) => { this.$emit("selection-moved", e) },
        "ChangedSelection": (e) => { this.$emit("changed-selection", e) },
        // "SelectionDeleting": (e) => { this.deletingSelection(e) },
        // "SelectionDeleted": (e) => { this.deleteSelection(e) }
        "LinkDrawn": (e) => { this.$emit("link-drawn", e) },
        "LinkRelinked": (e) => { this.$emit("link-relinked", e) }
      })

      myDiagram.grid.visible = true
      myDiagram.grid.gridCellSize = new go.Size( 10, 10 )

      myDiagram.toolManager.draggingTool.isGridSnapEnabled = true
      myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal // AvoidsNodes
      // mouse wheel zooms instead of scrolls
      myDiagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom
      myDiagram.toolManager.draggingTool.fieldTemplate = fieldDraggingTemplate

      myDiagram.model.class = "go.GraphLinksModel"
      myDiagram.model.nodeCategoryProperty = "templateId"
      myDiagram.model.linkFromPortIdProperty = "frompid"
      myDiagram.model.linkToPortIdProperty = "topid"

      // Templates.
      myDiagram.linkTemplate = this.getLinkTemplate()
      this.setNodeTemplates( myDiagram )

      // Disable multiselection
      myDiagram.maxSelectionCount = 1

      // Disable some diagram key command.
      myDiagram.commandHandler.doKeyDown = function() {
        const e = myDiagram.lastInput

        // The meta (Command) key substitutes for "control" for Mac commands
        const control = e.control || e.meta
        const key = e.key

        // Quit on any DELETE key combination:
        if (key === 'Backspace' || key === 'Del') return
        // call base method with no arguments (default functionality)
        go.CommandHandler.prototype.doKeyDown.call(this)
      }

      // Check for current selected node or link could be deleted
      myDiagram.commandHandler.canDeleteSelection = () => false

      // Set Diagram object.
      this.diagram = myDiagram
      
      window.myDiagram = myDiagram // DEBUG
    },

    clearModel: function() {
      if (this.diagram && this.diagram.model) {
        this.diagram.model.nodeDataArray = []
        this.diagram.model.linkDataArray = []
      }
    },

    updateModel: function(val) {
      // No GoJS transaction permitted when replacing Diagram.model.
      if (val instanceof go.Model) {
        this.diagram.model = val
      } else {
        let m = new go.GraphLinksModel()

        if (val) {
          for (const p in val) {
            if (p == 'nodeDataArray') {
              // NOTE: may be replace group add with add by one node.
              m[p] = val[p]
            } else {
              m[p] = val[p]
            }
          }
        }

        this.diagram.model = m
        this.diagram.model.nodeCategoryProperty = "templateId"
        this.diagram.model.linkFromPortIdProperty = "frompid"
        this.diagram.model.linkToPortIdProperty = "topid"
      }

      // this.fitZoom()
    },

    // updateDiagramFromData: function() {
    //   this.diagram.startTransaction()
    //   // This is very general but very inefficient.
    //   // It would be better to modify the diagramData data by calling
    //   // Model.setDataProperty or Model.addNodeData, et al.
    //   this.diagram.updateAllRelationshipsFromData()
    //   this.diagram.updateAllTargetBindings()
    //   this.diagram.commitTransaction("updated")
    // },

    setNodeTemplates: function ( diagram ) {
      let templmap = new go.Map( "string", go.Node )

      // Create default node template.
      templmap.add( "", this.getDefaultNodeTemplate() )

      diagram.nodeTemplateMap = templmap
    },

    fitZoom: function() {
      this.diagram.zoomToFit()
      this.diagram.alignDocument( go.Spot.Center, go.Spot.Center )
    },

    /**
     * Adds port node to the Diagram.
     * Before it creates & adds unique port template.
     */
    addPort: function ( port, doSelect = false ) {
      let templateId = port.templateId
      let templateObject = this.getPortTemplate( port )

      this.diagram.nodeTemplateMap.add( templateId, templateObject )

      this.diagram.model.addNodeData( port )

      // Select new port.
      if (doSelect && port.key)
        this.diagram.select( this.diagram.findNodeForKey( port.key ) );
    },

    updateNode: function (data, templateObj) {
      let templateId = data && data.templateId ? data.templateId : (data && data.id ? data.id : '')

      if (templateId) {
        this.diagram.nodeTemplateMap.set( templateId, templateObj )
        this.diagram.rebuildParts()
      }
    },

    /**
     * Update Port on diagram - replace it template only.
     */
    updatePort: function ( port ) {
      let nodeKey = port.key ? port.key : port.id
      let model = this.model()
      let nodeData = model.findNodeDataForKey(nodeKey)

      // Merge 'port' & 'nodeData' before create node new template
      if (nodeData && typeof port.nodeType === 'undefined') {
        port = {
          key: nodeData.key ? nodeData.key : port.id,
          id: port.id,
          name: port.name,
          description: port.description,
          templateId: nodeData.templateId ? nodeData.templateId : port.id,
          nodeType: 'port',
          type: nodeData.type ? nodeData.type : port.type,
          loc: nodeData.loc ? nodeData.loc : String(port.x + ' ' + port.y),
          parametersMode: nodeData.parametersMode ? nodeData.parametersMode : false,
          parameters: nodeData.parameters ? nodeData.parameters : []
        }
      }

      this.updateNode(port, this.getPortTemplate( port ))
    },

    /**
     * Update subModel on diagram - replace it template only.
     */
    updateSubModel: function ( subModel ) {
      let oldTemplate = this.diagram.nodeTemplateMap.get( subModel.templateId )

      // Update subModel template if it exists only.
      if (oldTemplate) {
        let templateObject = this.getSubProcessTemplate( subModel )

        this.diagram.nodeTemplateMap.set( subModel.templateId, templateObject )

        this.diagram.rebuildParts()
      }
    },

    /**
     * Update Parameters Container on diagram - replace it template only.
     */
    updateParametersContainer: function ( data ) {
      let templateId = data.templateId
      let oldTemplate = this.diagram.nodeTemplateMap.get( templateId )

      // Update template if it exists only.
      if (oldTemplate) {
        let templateObject = this.getParametersContainerTemplate( data )

        this.diagram.nodeTemplateMap.set( templateId, templateObject )

        this.diagram.rebuildParts()
      }
    },

    addLink: function ( link ) {
      this.diagram.model.addLinkData( link )
    },

    addNestedProcess: function ( nestedProcess, doSelect = false ) {
      let templateId = nestedProcess.templateId
      let templateObject = this.getSubProcessTemplate( nestedProcess )

      this.diagram.nodeTemplateMap.add( templateId, templateObject )
      this.diagram.model.addNodeData( nestedProcess )

      // Select new nestedProcess.
      if (doSelect && nestedProcess.key)
        this.diagram.select( this.diagram.findNodeForKey( nestedProcess.key ) )
    },

    deleteSelected: function() {
      this.diagram.commandHandler.deleteSelection();
    },

    // deletingSelection: function(e) {
    //   console.log("About to Deleting diagram object.");
    //   console.log(e);
    // },
    //
    // deleteSelection: function(e) {
    //   console.log("Diagram object has deleted.");
    //   console.log(e);
    // },

    addParametersContainer: function (containerData) {
      let template = this.getParametersContainerTemplate(containerData)

      this.diagram.nodeTemplateMap.add( containerData.templateId, template )
      this.diagram.model.addNodeData( containerData )
    }

  } // methods: {...}
}
</script>

<style lang="scss">
.diagram-wrapper {
  border: solid 2px grey; 
  width: 100%; 
  height: 100%;

  & > canvas {  outline: none; }
}
</style>
