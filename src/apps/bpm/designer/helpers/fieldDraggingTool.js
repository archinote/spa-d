/**
 * GoJS diagram field dragging tools.
 */
import * as go from "gojs"
let $ = go.GraphObject.make

const consoleDebug = Boolean(process.env.NODE_ENV !== 'production')

// Custom DraggingTool for dragging fields instead of whole Parts.
// FieldDraggingTool.fieldTemplate needs to be set to a template of the field that you want shown while dragging.
function FieldDraggingTool() {
  go.DraggingTool.call(this);
  this.fieldTemplate = null;  // THIS NEEDS TO BE SET before a drag starts
  this.temporaryPart = null;
}
go.Diagram.inherit(FieldDraggingTool, go.DraggingTool);
// if (consoleDebug) console.log('FieldDraggingTool: ', FieldDraggingTool)

// override this method
FieldDraggingTool.prototype.findDraggablePart = function () {
  if (consoleDebug) console.log('FieldDraggingTool.prototype.findDraggablePart()')

  let diagram = this.diagram;
  let obj = diagram.findObjectAt(diagram.lastInput.documentPoint);
  while (obj !== null && obj.type !== go.Panel.TableRow) obj = obj.panel;
  // if (consoleDebug) console.log('findDraggablePart(), obj.type: ', obj.type, ', obj.name: ', obj.name, ', obj: ', obj)

  if (obj !== null && obj.type === go.Panel.TableRow && obj.name === "PORT-PARAMETER"
    && this.fieldTemplate !== null && this.temporaryPart === null
  ) {
    let tempPart = go.GraphObject.make(go.Node, "Table",
      { layerName: "Tool", locationSpot: go.Spot.Center },
      this.fieldTemplate.copy()
    )  // copy the template!
    
    this.temporaryPart = tempPart;
    // assume OBJ is now a Panel representing a field, bound to field data
    // update the temporary Part via data binding
    tempPart.location = diagram.lastInput.documentPoint;  // need to set location explicitly
    diagram.add(tempPart);  // add to Diagram before setting data
    tempPart.data = obj.data;  // bind to the same field data as being dragged
    // if (consoleDebug) console.log('findDraggablePart(), tempPart: ', tempPart)
    return tempPart;
  }
  return go.DraggingTool.prototype.findDraggablePart.call(this);
};

FieldDraggingTool.prototype.doActivate = function () {
  // if (consoleDebug) console.log('FieldDraggingTool.prototype.doActivate()')
  if (this.temporaryPart === null) return go.DraggingTool.prototype.doActivate.call(this);
  let diagram = this.diagram;
  this.standardMouseSelect();
  this.isActive = true;
  // instead of the usual result of computeEffectiveCollection, just use the temporaryPart alone
  let map = new go.Map(/*go.Part, go.DraggingInfo*/);
  map.set(this.temporaryPart, new go.DraggingInfo(diagram.lastInput.documentPoint.copy()));
  this.draggedParts = map;
  this.startTransaction("Drag Field");
  diagram.isMouseCaptured = true;
};

FieldDraggingTool.prototype.doDeactivate = function () {
  // if (consoleDebug) console.log('FieldDraggingTool.prototype.doDeactivate()')
  if (this.temporaryPart === null) return go.DraggingTool.prototype.doDeactivate.call(this);
  let diagram = this.diagram;
  // make sure the temporary Part is no longer in the Diagram
  diagram.remove(this.temporaryPart);
  this.temporaryPart = null;
  // now do all the standard deactivation cleanup,
  // including setting isActive = false, clearing out draggedParts, calling stopTransaction(),
  // and setting diagram.isMouseCaptured = false
  go.DraggingTool.prototype.doDeactivate.call(this);
};

FieldDraggingTool.prototype.doMouseMove = function () {
  // if (consoleDebug) console.log('FieldDraggingTool.prototype.doMouseMove()')
  if (!this.isActive) return;
  if (this.temporaryPart === null) return go.DraggingTool.prototype.doMouseMove.call(this);
  let diagram = this.diagram;
  // just move the temporaryPart (in draggedParts), without regard to moving or copying permissions of the Node
  let offset = diagram.lastInput.documentPoint.copy().subtract(diagram.firstInput.documentPoint);
  this.moveParts(this.draggedParts, offset, false);
};

FieldDraggingTool.prototype.doMouseUp = function () {
  // if (consoleDebug) console.log('FieldDraggingTool.prototype.doMouseUp()')
  if (!this.isActive) return;
  if (this.temporaryPart === null) return go.DraggingTool.prototype.doMouseUp.call(this);

  let diagram = this.diagram;
  let data = this.temporaryPart.data;
  let dest = diagram.findPartAt(diagram.lastInput.documentPoint, false);

  if (dest !== null && dest.data && dest.data.parameters) {
    // Check if dropped item is inside its parent list
    let movedItem = dest.data.parameters.find(_item => _item.id === this.temporaryPart.data.id)
    if (movedItem) {
      if (consoleDebug) console.log('Drag&Drop operation is VALID')

      // Do move/sort
      let panel = dest.findObject("PORT-PARAMETERS")
      let idx = panel.findRowForLocalY(panel.getLocalPoint(diagram.lastInput.documentPoint).y)
      
      // let newIdx = idx + 1
      let newIdx = idx > 0 ? idx - 1 : 0
      // let newIdx = idx > 0 ? idx + 1 : 0
      // if (consoleDebug) console.log('idx: ', idx, ', newIdx: ', newIdx)
      let sidx = dest.data.parameters.indexOf(data)
      if (consoleDebug) console.log('idx: ', idx, ', newIdx: ', newIdx, ', sidx: ', sidx)

      // if (false) {
      if (newIdx != sidx) {
        // Insert new item to a new position
        diagram.model.insertArrayItem(dest.data.parameters, newIdx, {
          id: data.id,
          name: data.name,
          required: data.required,
          single: data.single
        })

        // Delete item from old position
        // let sidx = dest.data.parameters.indexOf(data)
        // if (consoleDebug) console.log('idx: ', idx, ', newIdx: ', newIdx, ', sidx: ', sidx)
        if (sidx > newIdx) ++sidx

        if (sidx >= 0) {
          diagram.model.removeArrayItem(dest.data.parameters, sidx)
        }
      }
      // DEBUG:
      else {
        if (consoleDebug) console.log('Item position is the same. Skip sorting...')
      }
    } else {
      if (consoleDebug) console.log('Drag&Drop operation is INVALID')
    }
  }

  // NOTE: Skip old action code
  if (false) {
    if (dest !== null && dest.data && dest.data.fields) {
      let panel = dest.findObject("TABLE");
      let idx = panel.findRowForLocalY(panel.getLocalPoint(diagram.lastInput.documentPoint).y);
      diagram.model.insertArrayItem(dest.data.fields, idx + 1, { 
        name: data.name,
        info: data.info,
        color: data.color,
        figure: data.figure
      });
    }

    let src = this.currentPart;
    // whether or not there was a destination node, delete the original field
    if (!(diagram.lastInput.control || diagram.lastInput.meta)) {
      let sidx = src.data.fields.indexOf(data);
      if (sidx >= 0) {
        diagram.model.removeArrayItem(src.data.fields, sidx);
      }
    }
  } // if (false) ...

  this.transactionResult = "Inserted Field";
  this.stopTool();
};
// end of FieldDraggingTool

export default FieldDraggingTool

let fieldDraggingTemplate = $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
  {
    background: "transparent",  // so this port's background can be picked by the mouse
  },
  $(go.TextBlock,
    { margin: new go.Margin(0, 2), column: 0, font: "bold 13px sans-serif" },
    new go.Binding("text", "name")),
)

export { fieldDraggingTemplate }
