import * as go from "gojs"
let $ = go.GraphObject.make

export default {
  methods: {

    /**
     * Helper functions
     */
    getBaseWidth: function () { return 180 },

    getPortWidth: function () { return 120 },
    getPortHeight: function () { return 60 },

    getElementWidth: function () {
      return this.getBaseWidth() + (this.getPortWidth() * 2);
    },

    getLinkTemplate: function () {
      return $(go.Link,
        {
          routing: go.Link.AvoidsNodes, // Orthogonal
          curve: go.Link.JumpOver,
          // curviness: 40,

          corner: 8,
          
          fromEndSegmentLength: 40,
          toEndSegmentLength: 40,
          
          // Disable relinking
          relinkableFrom: false,
          relinkableTo: false,

          resegmentable: true
        },
        $(go.Shape, { stroke: "#a10", strokeWidth: 2 }),
        $(go.Shape, { stroke: "#a10", fill: "#a10", toArrow: "Standard" })
      )
    },

    getDefaultNodeTemplate: function () {
      return $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          {
            fill: "white", strokeWidth: 0,
            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
          },
          new go.Binding("fill", "color")),
        $(go.TextBlock,
          { margin: 8, editable: true },
          new go.Binding("text", "name").makeTwoWay())
      )
    },

    getInputPortTemplate: function () {
      return $(go.Node, "Spot",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Auto",
          $(go.Shape, "RoundedRectangle",
            {
              stroke: '#444',
              strokeWidth: 1,
              fill: '#FFE082',
            },
            // new go.Binding("fill", "color")
          ),
          $(go.Panel, "Table",
            { defaultAlignment: go.Spot.Left },
            $(go.TextBlock, { row: 0, column: 0, columnSpan: 2, font: "bold 16pt sans-serif" },
              new go.Binding("text", "name")),
            $(go.TextBlock, { row: 1, column: 0 }, "Description:"),
            $(go.TextBlock, { row: 1, column: 1 }, new go.Binding("text", "description")),
            $(go.TextBlock, { row: 2, column: 0 }, "Color:"),
            $(go.TextBlock, { row: 2, column: 1 }, new go.Binding("text", "color"))
          )
        )
      )
    },

    getOuputPortTemplate: function () {
      return $(go.Node, "Spot",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

        $(go.Panel, "Auto",
          $(go.Shape, "RoundedRectangle",
            {
              stroke: '#444',
              strokeWidth: 1,
              fill: 'pink',
            },
            // new go.Binding("fill", "color")
          ),
          $(go.Panel, "Table",
            { defaultAlignment: go.Spot.Left },
            $(go.TextBlock, { row: 0, column: 0, columnSpan: 2, font: "bold 16pt sans-serif" },
              new go.Binding("text", "name")),
            $(go.TextBlock, { row: 1, column: 0 }, "Description:"),
            $(go.TextBlock, { row: 1, column: 1 }, new go.Binding("text", "description")),
            $(go.TextBlock, { row: 2, column: 0 }, "Color:"),
            $(go.TextBlock, { row: 2, column: 1 }, new go.Binding("text", "color"))
          )
        )
      )
    },

    getPortTemplate: function (port) {
      let type = port && port.type == 'input'
        ? 'right'
        : 'left'

      let tpl = $(go.Node, "Vertical",
        {
          selectionAdorned: true,
          selectionObjectName: "portBody",
          isLayoutPositioned: false,
          alignment: go.Spot.Left
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

        $(go.Panel, "Auto",
          {
            // alignment: type == 'right' ? go.Spot.Right : go.Spot.Left
            alignment: go.Spot.Left,
          },

          this.getPortFigure(port, type),
        ),

        // Подпись
        // getLabelFigure( port.name ),
      )

      tpl.add($(go.Panel, "Auto",
        {
          margin: new go.Margin(10, 0, 0, 0)
        },
        new go.Binding("visible", "parametersMode"),
        $(go.Shape, "Rectangle", {
          fill: '#fff',
          stroke: '#444',
          strokeWidth: 2
        }),
        $(go.Panel, 'Vertical',
          $(go.TextBlock, "Данные", {
            margin: 12,
            stroke: "#444",
            font: "bold 14px sans-serif",
          }),
          this.getPortParametersFigure(port)
        )
      ))

      return tpl
    },

    getPortFigure: function (port, type = 'right', addHeight = 0) {
      let panelAlignment = null
      let panelAlignmentFocus = null

      if (type == 'right') {
        panelAlignment = go.Spot.Right
        panelAlignmentFocus = new go.Spot(1, 0.5, -12, 0)
      } else {
        panelAlignment = go.Spot.Left
        panelAlignmentFocus = new go.Spot(0, 0.5, 12, 0)
      }

      let innerPanel = $(go.Panel, "Vertical", // "Auto", "Vertical"
        $(go.TextBlock, "Default Port Name", port.name, {
          margin: 2,
          stroke: "#888",
          font: "normal 14px sans-serif",
          width: this.getPortWidth() - 20
        })
      )

      let portFigure = $(go.Panel, "Spot",
        {
          name: "portBody", // used to select port node on diagram by clicking on it.
          defaultAlignment: go.Spot.Center
        },
        $(go.Shape, "Rectangle", {
          width: this.getPortWidth(),
          height: this.getPortHeight() + (typeof addHeight !== 'undefined' ? parseInt(addHeight) : 0),
          fill: '#fff',
          stroke: '#444',
          strokeWidth: 2,
          alignment: panelAlignment,
          alignmentFocus: panelAlignmentFocus
        }),
        innerPanel,
        this.getPortPinListFigure(port, type, addHeight)
      )

      return portFigure
    },

    getPortParametersFigure: function (port) {
      let self = this
      let portId = port.id
      let tpl

      if (port.parameters && port.parameters.length) {
        tpl = $(go.Panel, "Table",
          {
            name: "PORT-PARAMETERS",
            margin: 12
          },
          new go.Binding("visible", "parametersMode"),

          new go.Binding("itemArray", "parameters"), {
            defaultAlignment: go.Spot.Left,
            itemTemplate: $(go.Panel, "TableRow",
              { name: "PORT-PARAMETER" },
              new go.Binding("background", "row",
                function (i) {
                  return i % 2 === 0 ? "transparent" : "#eeeeee"
                }).ofObject(),
              $(go.TextBlock, new go.Binding("text", "name"),
                { column: 0, margin: new go.Margin(4, 12, 4, 4), font: "normal 10pt sans-serif" }),
              $("CheckBox", "required", // set data binding
                {
                  column: 1,
                  margin: new go.Margin(0, 4, 0, 4),
                  "_doClick": function (e, obj) {
                    var itempanel = obj.panel
                    self.$bus.$emit('test.model.parameter-port-binding.update', portId, itempanel.data)
                  },
                  toolTip: $(go.Adornment, "Auto",
                    $(go.Shape, "RoundedRectangle", { fill: "rgba(255, 188, 0, 0.75)", stroke: 'transparent' }),
                    $(go.Panel, "Auto",
                      $(go.TextBlock, {
                        margin: 8,
                        stroke: '#444',
                        alignment: go.Spot.Left,
                        font: "normal 10pt sans-serif"
                      }, 'обязательное'),
                    )
                  )
                },
                // $(go.TextBlock, 'обязательное', {
                //   stroke: "#444",
                //   font: "normal 9pt sans-serif"
                // })
              ),
              $("CheckBox", "single", // set data binding
                {
                  column: 2,
                  margin: new go.Margin(0, 4, 0, 4),
                  "_doClick": function (e, obj) {
                    var itempanel = obj.panel
                    self.$bus.$emit('test.model.parameter-port-binding.update', portId, itempanel.data)
                  },
                  toolTip: $(go.Adornment, "Auto",
                    $(go.Shape, "RoundedRectangle", { fill: "rgba(255, 188, 0, 0.75)", stroke: 'transparent' }),
                    $(go.Panel, "Auto",
                      $(go.TextBlock, {
                        margin: 8,
                        stroke: '#444',
                        alignment: go.Spot.Left,
                        font: "normal 10pt sans-serif"
                      }, 'монопольное'),
                    )
                  )
                },
                // $(go.TextBlock, 'монопольное', {
                //   stroke: "#444",
                //   font: "normal 9pt sans-serif"
                // })
              ),
              $("Button", {
                column: 4,
                margin: new go.Margin(0, 4, 0, 24),
                click: function (e, obj) {
                  // OBJ is this Button Panel;
                  // find the TableRow Panel containing it
                  var itempanel = obj.panel
                  
                  // DEBUG:
                  // console.log('itempanel: ', itempanel)
                  // console.log("Clicked on row " + itempanel.row + " for name = '" + itempanel.data.name + "', id = '" + itempanel.data.id + "'")

                  self.$bus.$emit('test.port-param.delete', portId, itempanel.data.id, itempanel.data.name, itempanel.row)
                }
              },
                $(go.Shape, "ThinX", {
                  desiredSize: new go.Size(8, 8)
                })
              )
            )  // end of itemTemplate
          },

          // define the header as a literal row in the table,
          // not bound to any item, but bound to Node data
          $(go.Panel, "TableRow",
            { isPanelMain: true },
            $(go.TextBlock, 'Название', { column: 0, margin: 4, font: "bold 10pt sans-serif" }),
            $(go.TextBlock, 'Обяз.', { column: 1, margin: 4, font: "bold 10pt sans-serif" }),
            $(go.TextBlock, 'Моноп.', { column: 2, margin: 4, font: "bold 10pt sans-serif" }),
          ),

          $(go.RowColumnDefinition, { column: 0, alignment: go.Spot.Left }),
          $(go.RowColumnDefinition, { column: 1, alignment: go.Spot.Center }),
          $(go.RowColumnDefinition, { column: 2, alignment: go.Spot.Center }),
          $(go.RowColumnDefinition, { column: 3, alignment: go.Spot.Right }),
          $(go.RowColumnDefinition, { row: 1, separatorStroke: "#444" })
        )
      } else {
        tpl = $(go.TextBlock, "Не найдены данные, привязанные к порту", {
          margin: 12,
          stroke: "#888",
          font: "normal 14px sans-serif",
        })
      }

      return tpl
    },

    getPortListFigure: function (portList, type, addHeight) {
      let portFigureList = []
      let panelAlignment
      let panelAlignmentFocus

      portList.forEach(port => {
        portFigureList.push(this.getPortFigure(port, type, addHeight))
      })

      if (type == 'left') {
        panelAlignment = go.Spot.Left;
        panelAlignmentFocus = new go.Spot(0, 0.5, 0, 0);
      }
      else {
        panelAlignment = go.Spot.Right;
        panelAlignmentFocus = new go.Spot(1, 0.5, 0, 0);
      }

      return $(go.Panel, "Vertical",
        {
          alignment: panelAlignment,
          alignmentFocus: panelAlignmentFocus
        },
        portFigureList
      )
    },

    getPortPinListFigure: function (port, type, addHeight) {
      let panel

      if (type == 'right') {
        panel = $(go.Panel, "Horizontal",
          {
            alignment: go.Spot.Right,
            alignmentFocus: new go.Spot(0, 0.5, -10, 0)
          }
        )
      }
      else {
        panel = $(go.Panel, "Horizontal",
          {
            alignment: go.Spot.Left,
            alignmentFocus: new go.Spot(1, 0.5, 10, 0)
          }
        )
      }

      let pin = $(go.Shape, "Rectangle",
        {
          fill: type == 'right' ? '#bb4944' : '#57b',
          stroke: null,
          desiredSize: new go.Size(8, this.getPortHeight() - 2 + (typeof addHeight !== 'undefined' ? parseInt(addHeight) : 0)),
          // toMaxLinks: 5,
          cursor: "pointer",
          portId: String(port.id)
        },
      )

      if (type == 'right') {
        pin.fromSpot = go.Spot.Right
        pin.fromLinkable = true
        panel.add(pin)
      }
      else {
        pin.toSpot = go.Spot.Left
        pin.toLinkable = true
        panel.add(pin)
      }

      return panel
    },

    getLabelFigure: function (label) {
      return $(go.TextBlock,
        {
          // margin : 10,
          editable: false,
          stroke: "#a10",
          font: "bold 12pt sans-serif",
          alignment: new go.Spot(0.5, 1, 0, 20)
        },
        label
      )
    },

    getBaseFigure: function (subProcess) {
      let self = this

      let panel = $(go.Panel, "Vertical",
        {
          width: this.getBaseWidth(),
          // height: 300
        },
        $(go.TextBlock, subProcess.name, {
          // margin: 2,
          margin: new go.Margin(2, 2, 8, 8),
          // textAlign: 'center',
          alignment: go.Spot.Left,
          maxSize: new go.Size(this.getBaseWidth(), NaN),
          stroke: "#444",
          font: "bold 11pt sans-serif"
        })
      )

      panel.add($("CheckBox", "showParametersContainer", // data bound
        {
          alignment: go.Spot.Left,
          margin: new go.Margin(2, 2, 2, 8),
          "_doClick": function (e, obj) {
            self.$bus.$emit('test.model.parameters-container.switch-view', subProcess.id, subProcess.submodel_id)
          }
        },
        new go.Binding("visible", "parametersMode"),
        $(go.TextBlock, 'отображать данные', {
          stroke: "#444",
          font: "normal 9pt sans-serif"
        })
      ))

      return panel
    },

    getSubProcessTemplate: function (subProcess) {
      let inputHeight = subProcess.inputPorts.length * (this.getPortHeight() + 2)
      let outputHeight = subProcess.outputPorts.length * (this.getPortHeight() + 2)
      let leftAddHeight = 0
      let rightAddHeight = 0

      if (inputHeight > outputHeight) {
        rightAddHeight = (inputHeight - outputHeight) / subProcess.outputPorts.length
      } else {
        leftAddHeight = (outputHeight - inputHeight) / subProcess.inputPorts.length
      }

      let node = $(go.Node, "Vertical",
        {
          portId: String(subProcess.id),
          selectionAdorned: true,
          selectionObjectName: "processBody",
          locationSpot: go.Spot.TopLeft,
          isLayoutPositioned: false,
          zOrder: 100,
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

        $(go.Panel, "Auto",
          $(go.Panel, "Auto", {
              name: "processBody",
              width: this.getElementWidth(),
              height: inputHeight > outputHeight ? inputHeight : outputHeight,
            },
            $(go.Shape, "Rectangle", {
              fill: '#fff',
              stroke: '#444',
              strokeWidth: 2,
              spot1: go.Spot.TopLeft,
              spot2: go.Spot.BottomRight
            })
          ),

          //
          this.getPortListFigure(subProcess.inputPorts, 'left', leftAddHeight),

          //
          this.getBaseFigure(subProcess),

          //
          this.getPortListFigure(subProcess.outputPorts, 'right', rightAddHeight),

          // Подпись
          // getLabelFigure( new go.Binding( "text", "index" ).makeTwoWay() )
        )
      )

      if (subProcess.parametersMode && subProcess.showParametersContainer) {
        node.add($(go.Panel, "Auto",
          {
            margin: new go.Margin(10, 0, 0, 0),
            alignment: go.Spot.Left
          },
          $(go.Shape, "Rectangle", {
            fill: '#fff',
            stroke: '#444',
            strokeWidth: 2
          }),
          $(go.Panel, 'Vertical',
            $(go.TextBlock, "Данные", {
              margin: 12,
              stroke: "#444",
              font: "bold 14px sans-serif",
            }),
            this.getSubModelParametersFigure(subProcess)
          )
        ))
      }

      return node
    },

    getSubModelParametersFigure: function (subModel) {
      let tpl

      if (subModel && subModel.portsParameters && subModel.portsParameters.length) {
        tpl = $(go.Panel, "Table",
          {
            margin: 12,
            defaultRowSeparatorStroke: "gray"
          },
          new go.Binding("visible", "parametersMode"),

          new go.Binding("itemArray", "portsParameters"), {
            defaultAlignment: go.Spot.Left,
            itemTemplate: $(go.Panel, "TableRow",
              {},
              $(go.TextBlock, new go.Binding("text", "port"),
                { column: 0, margin: new go.Margin(4, 6, 2, 6), font: "normal 10pt sans-serif", width: 160 }),
              $(go.TextBlock, new go.Binding("text", "parameters"),
                { column: 1, margin: new go.Margin(4, 6, 2, 6), font: "normal 10pt sans-serif", width: 210 }),
            )  // end of itemTemplate
          },

          $(go.RowColumnDefinition, { column: 0, alignment: go.Spot.Left }),
          $(go.RowColumnDefinition, { column: 1, alignment: go.Spot.Left, separatorStrokeWidth: 1, separatorStroke: "gray" }),
        )
      } else {
        tpl = $(go.TextBlock, "БП не имеет доступных параметров", {
          margin: 12,
          stroke: "#888",
          font: "normal 14px sans-serif"
        })
      }

      return tpl
    },

    getParametersContainerTemplate: function (containerData) {
      let self = this

      return $(go.Node, "Auto", 
        {
          selectionAdorned: false,
          contextClick: containerData.isRoot && (typeof containerData.parameters === 'undefined' || containerData.parameters.length < 1)
            ? (e, obj) => {
                self.$bus.$emit('test.model-param.context-menu.show', e.event, null)
              } 
            : null
        },
        new go.Binding("visible", "parametersMode"),
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

        $(go.Shape, "Rectangle", {
          // width: 300,
          // height: 200,
          // desiredSize: new go.Size(300, 200),
          // fill: '#fff',
          // fill: containerData.isRoot ? '#fff' : 'rgba(255, 192, 203, 0.5)', // '#f8f8f8',
          fill: containerData.isRoot ? '#fff' : '#fddde2', // '#f8f8f8',
          stroke: '#444',
          strokeWidth: 2
        }),

        $(go.Panel, 'Vertical',

          $(go.Panel, 'Horizontal', { margin: new go.Margin(12, 2, 12, 2) },

            // Header title
            $(go.TextBlock, 'BP title',
              {
                // margin: new go.Margin(12, 2, 12, 2),
                // width: '100%',
                // background: "lightgrey",
                // stretch: go.GraphObject.Fill,
                // alignment: go.Spot.Center,
                font: "normal 14px sans-serif"
              },
              new go.Binding("text", "title"),
            ),
          ),

          // Parameters list area
          $(go.Panel, "Table",
            {
              margin: new go.Margin(2, 1, 12, 1)
            },
            $(go.RowColumnDefinition,
              { column: 0, alignment: go.Spot.Left }),
            $(go.RowColumnDefinition,
              { column: 1, minimum: 150, maximum: 200 }),
            $(go.RowColumnDefinition,
              { column: 6, alignment: go.Spot.Right }),

            new go.Binding("itemArray", "parameters"), {
              defaultAlignment: go.Spot.Left,
              itemTemplate: $(go.Panel, "TableRow",
                {
                  // cursor: 'pointer',
                  // click: function (e, obj) {},
                  contextClick: containerData.isRoot 
                    ? (e, obj) => {
                        self.$bus.$emit('test.model-param.context-menu.show', e.event, obj.data)
                      } 
                    : null
                },
                new go.Binding("background", "row",
                  function (i) {
                    return i % 2 === 0 ? "#f0f0f0" : "transparent"
                  }).ofObject(),
                $(go.Panel, "Horizontal",
                  { column: 0, margin: new go.Margin(2, 8, 2, 0), cursor: 'pointer' },
                  $(go.Shape,  // the "In" port
                    new go.Binding("portId", "id"),
                    // { width: 6, height: 6, portId: "", toSpot: go.Spot.Left, toLinkable: true }),
                    { width: 6, height: 6, toSpot: go.Spot.Left, toLinkable: true },
                    new go.Binding("visible", "notClone")
                  )
                ),
                $(go.TextBlock, new go.Binding("text", "name"),
                  { column: 1, margin: 4, font: "bold 10pt sans-serif" }, new go.Binding("visible", "notClone")),
                // data clone icon
                // containerData.isRoot ? $(go.Shape, "LogicXor", 
                //   { column: 1, margin: 4, desiredSize: new go.Size(12, 12) }, new go.Binding("visible", "isClone")) : {},
                $(go.TextBlock, new go.Binding("text", "symbol"),
                  { column: 2, margin: 4 }),
                $(go.TextBlock, new go.Binding("text", "typeStr"),
                  { column: 3, margin: 4 }),
                // containerData.isRoot ? $("Button",
                //   {
                //     column: 4,
                //     margin: new go.Margin(0, 1, 0, 0),
                //     click: function (e, obj) {
                //       // OBJ is this Button Panel;
                //       // find the TableRow Panel containing it
                //       let itempanel = obj.panel
                //       self.$bus.$emit('test.model-param.edit', itempanel.data.id, itempanel.row, itempanel.data.name)
                //     },
                //   },
                //   new go.Binding("visible", "type"), // hide button for 'dummy' parameter
                //   $(go.Shape, "LogicIsDefinedAs", {
                //     desiredSize: new go.Size(8, 8)
                //   })
                // ) : {},
                // containerData.isRoot ? $("Button", 
                //   {
                //     column: 5,
                //     margin: new go.Margin(0, 1, 0, 0),
                //     click: function (e, obj) {
                //       // OBJ is this Button Panel;
                //       // find the TableRow Panel containing it
                //       let itempanel = obj.panel
                //       self.$bus.$emit('test.model-param.delete', itempanel.data.id, itempanel.row)
                //     }
                //   },
                //   new go.Binding("visible", "type"), // hide button for 'dummy' parameter
                //   $(go.Shape, "ThinX", {
                //     desiredSize: new go.Size(8, 8)
                //   })
                // ) : {},
                containerData.isRoot ? $(go.Panel, "Horizontal",
                  { column: 6, margin: new go.Margin(2, 0, 2, 8), cursor: 'pointer' },
                  $(go.Shape,  // the "Out" port
                    new go.Binding("portId", "id"),
                    { width: 6, height: 6, fromSpot: go.Spot.Right, fromLinkable: true })
                )
                : {},
              )  // end of itemTemplate
            }
          )
        )
      )
    },

    getParameterFigure: function () {
      let fig = []

      return fig
    }

  } // methods: {...}
}
