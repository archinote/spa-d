<template>
  <table v-if="table" class="dantsertree-container dantsertree-ext-table" :class="table.className" :style="styles">
    <tbody>
    <tree-item
      v-for="item in source"
      :key="item.id"
      :model="item"
      :parent="{id:'root', name:'root node'}"
      :table="table"
      :level="0"
      @ctx-menu-td="onCtxMenuTd($event)"
      @select-node="selNode($event)"
      @toggle-node="tglNode($event)"
    >
    </tree-item>
    </tbody>
  </table>

  <div v-else class="dantsertree-ul-wrapper">
    <v-text-field
      v-show="showTextField"
      readonly
      class="pl-0"
      :value="textValue"
      :label="label"
      clear-icon="mdi-close-circle"
      :clearable="clearable"
      @click:clear.stop="clearTree"
      @click="beingSelected=true"
    >
      <v-icon slot="append" icon @click.stop="beingSelected = true" style="cursor: pointer; margin-left: 3px">mdi-sitemap</v-icon>
    </v-text-field>

    <div id="tree" :class="{'dantsertree-block':field}" :style="styles" v-show="!showTextField">
      <ul class="ui-dantsertree dantsertree-container dantsertree-plain" tabindex="0" role="tree">
          <tree-item
            v-for="item in source"
            :key="item.id"
            :model="item"
            :parent="{id:'root', name:'root node'}"
            :dnd="dnd"
            :selectMode="selectMode"
            :checkbox="checkbox"
            @click-node="clicked($event)"
            @select-node="selNode($event)"
            @toggle-node="tglNode($event)"
            @double-clicked="dblClicked($event)"
            @drag-drop="dragDroped($event)"
            @drag-start="dragStarted($event)"
            @ctx-menu="onCtxMenu($event)"
          >
          </tree-item>
      </ul>
    </div>
  </div>

</template>

<script>
  import TreeItem from './TreeItem.vue'
  
  export default {
    name: 'DantserTree',

    components:{
      'tree-item': TreeItem,
    },

    props:{
      height: {
        type: String,
        default: 'auto',
        required: false,
      },
      label:{
        type: String,
        default: '',
        required: false
      },
      checkbox:{
        type: Boolean,
        default: false,
        required: false
      },
      source: {
        type: Array,
        default: () => [],
        required: true
      },
      styles:{
        type: Object,
        default: () => {},
        required: false
      },
      table:{
        type: Object,
        default: () => {indentation:20},
        required: false
      },
      field:{
        type: Boolean,
        default: false,
        required: false
      },
      selectMode:{
        type: Number,
        default: 1,
        required: false
      },
      dnd:{
        type: Boolean,
        default: false,
        required: false
      },
      clearable:{
        type: Boolean,
        default: false,
        required: false
      },
    },

    computed: {
      showTextField(){
        return (!this.beingSelected && this.selectMode===1 && this.field===true)
      }
    },

    data(){
      return {
        beingSelected: false,
        textValue: '',
        selectedNodes: [],
        selectedNode: null,
        movingNode: null,
        options:{
          handle:'.dantsertree-title'
        }
      }
    },

    mounted(){
      this.init()
    },

    methods:{
      clicked(eventData){
        this.setNodeProps('all', 'active', false)
        eventData.active = true
        this.$emit('click-node', eventData)
      },

      selNode(eventData) {
        let temp = eventData.selected
        switch(this.selectMode){
          case 1:
            this.setNodeProps('all', 'selected', false)
            eventData.selected = temp
            if( temp===true ) {
              this.selectedNode = eventData.id
            }
            break
          case 2:
            const index = this.selectedNodes.indexOf(eventData.id)
            if( temp === true ) {
              if(index<0) this.selectedNodes.push(eventData.id)
            } else {
              if(index>=0) this.selectedNodes.splice(index, 1)
            }
            break
          case 3:
            this.setNodeProps('all', 'selected', false)
            let node = this.getNodeById(eventData.id)
            let selectedTemp = this.setNodeProps(node, 'selected', temp)
            if( temp===true ) {
              this.selectedNodes = selectedTemp
            }
            break
        }
        this.$emit('node-select', eventData)
      },

      tglNode(eventData){
        this.$emit('node-toggle', eventData)
      },

      onCtxMenu(eventData){
        this.$emit('ctx-menu', eventData)
      },

      onCtxMenuTd(eventData){
        this.$emit('ctx-menu-td', eventData)
      },

      dblClicked(eventData){
        this.$emit('node-dblclick', eventData)
        if(this.selectMode===1){
          this.textValue = eventData.name
          this.setNodeProps('all', 'selected', false)
          eventData.selected = true
          this.beingSelected = false
          this.selectedNode = eventData.id
        }
      },
  
      clearTree(eventData){
        this.$emit('clear', eventData)
        this.setNodeProps('all', 'selected', false)
        this.selectedNode = null
        this.selectedNodes = []
      },
  
      dragDroped(eventData){
        if ( this.dnd && eventData.data.id!==this.movingNode.id && !this.isDescendant(this.movingNode, eventData.data.id) ){
          let halfHeight = Math.round(eventData.event.target.clientHeight/2)
          let offset = eventData.event.offsetY
          let mode = 'over'
          if(offset<halfHeight-2) {
            mode = 'before'
          } else if(offset>halfHeight+2){
            mode = 'after'
          }
          this.deleteNodeById(this.movingNode.id)
          if(mode==='over'){
            if( typeof eventData.data.children === 'undefined' ){
              eventData.data.children = []
            }
            eventData.data.children.push(this.movingNode)
          } else {
            this.insertNode(eventData.data.id, this.movingNode, mode)
          }
          
          this.$emit('drop-node', {target: eventData.data.id, node: this.movingNode.id, mode: mode })
        }
        //Обнулить временную переменную для перемещаемого узла, в любом случае
        this.movingNode = null
      },

      dragStarted(eventData){
        eventData.event.dataTransfer.effectAllowed='move';
        eventData.event.dataTransfer.setDragImage(eventData.event.target,10,10);
        if (this.dnd) this.movingNode = {...eventData.data}
      },

      getNodeById(id){
        return this.getNodeByProp('id', id)
      },

      setSelected(id, status = true){
        let node = this.getNodeByProp('id', id)
        if (node!=null){
          if(this.selectMode===1 && status===true) {
            this.setNodeProps('all', 'selected', false)
          }
          node.selected = status
          node.active = status
          if (status===true){
            this.selectedNode = node.id
            this.textValue = node.name
          }
        }
      },
      
      setNodesSelected(node_ids = [], status = true){
        this.setNodeProps('all', 'selected', false)
        
        node_ids.map(id => {
          this.selectedNodes = []
          let node = this.getNodeByProp('id', id)
          if (node!=null) {
            node.selected = status
            this.selectedNodes.push(id)
          }
        })
      },

      deleteNodeById(id, tree){
        if(typeof tree === 'undefined') tree = this.source
        for (let index in tree){
          if ( tree[index].id === id){
            return tree.splice(index, 1)
          } else if( tree[index].children && tree[index].children.length ){
            this.deleteNodeById(id, tree[index].children )
          }
        }
      },
  
      insertNode(id, data, mode='before', tree){
        if(typeof tree === 'undefined') tree = this.source
        for (let index in tree){
          if ( tree[index].id === id){
            if(mode==='before'){
              tree.splice(index, 0, data)
            } else {
              index++
              tree.splice(index, 0, data)
            }
            break
          } else if( tree[index].children && tree[index].children.length ){
            this.insertNode(id, data, mode, tree[index].children )
          }
        }
      },

      //Returns single node or null if not found
      getNodeByProp(prop, value){
        let root = [...this.source]
        let stack = []
        let node, result = null

        for(let item of root){
          stack.push(item)
          while (stack.length > 0) {
            node = stack.shift();
            if (node[prop] === value) {
              result = node
              break;
            } else if (node.children && node.children.length) {
              for (let i = 0, len = node.children.length; i < len; i += 1) {
                stack.push(node.children[i]);
              }
            }
          }
        }
        return result
      },

      //Returns array of nodes or empty array if not found
      getNodesByProp(prop, value){
        let root = [...this.source]
        let stack = []
        let node, result = []

        for(let item of root){
          stack.push(item)
          while (stack.length > 0) {
            node = stack.shift();
            if (node[prop] === value) {
              result.push(node)
            }
            if (node.children && node.children.length) {
              for (let i = 0, len = node.children.length; i < len; i += 1) {
                stack.push(node.children[i]);
              }
            }
          }
        }
        return result
      },

      setNodeProps(el, prop, value){
        let node
        let stack = (el==='all') ? [...this.source] : [el]
        let idx = 0
        let result = []
        while (node = stack[idx++]) {
          node[prop] = value
          result.push(node.id)
          let children = node.children || []
          for (let i = 0, len = children.length; i < len; i++) {
            stack.push(children[i]);
          }
        }
        return result
      },

      isDescendant(el, id){
        let node
        let stack = [el]
        let idx = 0
        let result = false

        while (node = stack[idx++]) {
          if (node.id === id) {
            result = true
            break
          } else if (node.children && node.children.length) {
            for (let i = 0, len = node.children.length; i < len; i += 1) {
              stack.push(node.children[i]);
            }
          }
        }
        return result
      },

      init(){
        let node
        let stack = [...this.source]
        let idx = 0
        this.selectedNodes = []
        while (node = stack[idx++]) {
          if (node.selected === true) {
            this.selectedNodes.push(node.id)
            this.selectedNode = node.id
          }
          let children = node.children || []
          for (let i = 0, len = children.length; i < len; i++) {
            stack.push(children[i]);
          }
        }
      },

      clear(){
        this.beingSelected = false
        this.textValue = ''
        this.selectedNodes = []
        this.selectedNode = null
        this.movingNode = null
      },

    }
  }
</script>

<style>
  div.dantsertree-block{
    height: 150px;
    overflow: scroll;
    position: relative;
    border: #ccc 1px solid;
  }
  .ui-helper-hidden {
    display: none;
  }
  ul.dantsertree-container {
    font-family: tahoma, arial, helvetica;
    font-size: 10pt;
    white-space: nowrap;
    padding: 3px;
    margin: 0;
    background-color: white;
    min-height: 0%;
    position: relative;
  }
  ul.dantsertree-container:focus{
    outline:0;
  }
  ul.dantsertree-container ul {
    padding: 0 0 0 16px;
    margin: 0;
  }
  ul.dantsertree-container ul > li:before {
    content: none;
  }
  ul.dantsertree-container li {
    list-style-image: none;
    list-style-position: outside;
    list-style-type: none;
    -moz-background-clip: border;
    -moz-background-inline-policy: continuous;
    -moz-background-origin: padding;
    background-attachment: scroll;
    background-color: transparent;
    background-position: 0px 0px;
    background-repeat: repeat-y;
    background-image: none;
    margin: 0;
  }
  ul.dantsertree-container li.dantsertree-lastsib {
    background-image: none;
  }
  .ui-dantsertree-disabled ul.dantsertree-container {
    opacity: 0.5;
    background-color: silver;
  }
  ul.dantsertree-connectors.dantsertree-container li {
    background-image: url("vline.gif");
    background-position: 0 0;
  }
  ul.dantsertree-container li.dantsertree-lastsib,
  ul.dantsertree-no-connector > li {
    background-image: none;
  }
  li.dantsertree-animating {
    position: relative;
  }
  /*------------------------------------------------------------------------------
   * Common icon definitions
   *----------------------------------------------------------------------------*/
  span.dantsertree-empty,
  span.dantsertree-vline,
  span.dantsertree-expander,
  span.dantsertree-icon,
  span.dantsertree-checkbox,
  span.dantsertree-drag-helper-img,
  #dantsertree-drop-marker {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: top;
    background-repeat: no-repeat;
    background-position: left;
    background-image: url("icons.gif");
    background-position: 0px 0px;
  }
  span.dantsertree-icon,
  span.dantsertree-checkbox,
  span.dantsertree-expander,
  span.dantsertree-custom-icon {
    margin-top: 2px;
  }
  /* Used by icon option: */
  span.dantsertree-icon.dantsertree-custom-icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-left: 3px;
    font-size: 14px;
    background: none;
  }
  span.dantsertree-icon.dantsertree-custom-icon.mdi {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-left: 3px;
    margin-top: -1px;
    font-size: 16px;
    background: none;
  }

  /* Used by 'icon' node option: */
  img.dantsertree-icon {
    width: 16px;
    height: 16px;
    margin-left: 3px;
    margin-top: 2px;
    vertical-align: top;
    border-style: none;
  }
  /*------------------------------------------------------------------------------
   * Expander icon
   *
   * Note: IE6 doesn't correctly evaluate multiples class names,
   *		 so we create combined class names that can be used in the CSS.
   *
   * Prefix: dantsertree-exp-
   * 1st character: 'e': expanded, 'c': collapsed, 'n': no children
   * 2nd character (optional): 'd': lazy (Delayed)
   * 3rd character (optional): 'l': Last sibling
   *----------------------------------------------------------------------------*/
  span.dantsertree-expander {
    cursor: pointer;
  }
  .dantsertree-exp-n span.dantsertree-expander,
  .dantsertree-exp-nl span.dantsertree-expander {
    background-image: none;
    cursor: default;
  }
  .dantsertree-connectors .dantsertree-exp-n span.dantsertree-expander,
  .dantsertree-connectors .dantsertree-exp-nl span.dantsertree-expander {
    background-image: url("icons.gif");
    margin-top: 0;
  }
  .dantsertree-connectors .dantsertree-exp-n span.dantsertree-expander,
  .dantsertree-connectors .dantsertree-exp-n span.dantsertree-expander:hover {
    background-position: 0px -64px;
  }
  .dantsertree-connectors .dantsertree-exp-nl span.dantsertree-expander,
  .dantsertree-connectors .dantsertree-exp-nl span.dantsertree-expander:hover {
    background-position: -16px -64px;
  }
  .dantsertree-exp-c span.dantsertree-expander {
    background-position: 0px -80px;
  }
  .dantsertree-exp-c span.dantsertree-expander:hover {
    background-position: -16px -80px;
  }
  .dantsertree-exp-cl span.dantsertree-expander {
    background-position: 0px -96px;
  }
  .dantsertree-exp-cl span.dantsertree-expander:hover {
    background-position: -16px -96px;
  }
  .dantsertree-exp-cd span.dantsertree-expander {
    background-position: -64px -80px;
  }
  .dantsertree-exp-cd span.dantsertree-expander:hover {
    background-position: -80px -80px;
  }
  .dantsertree-exp-cdl span.dantsertree-expander {
    background-position: -64px -96px;
  }
  .dantsertree-exp-cdl span.dantsertree-expander:hover {
    background-position: -80px -96px;
  }
  .dantsertree-exp-e span.dantsertree-expander,
  .dantsertree-exp-ed span.dantsertree-expander {
    background-position: -32px -80px;
  }
  .dantsertree-exp-e span.dantsertree-expander:hover,
  .dantsertree-exp-ed span.dantsertree-expander:hover {
    background-position: -48px -80px;
  }
  .dantsertree-exp-el span.dantsertree-expander,
  .dantsertree-exp-edl span.dantsertree-expander {
    background-position: -32px -96px;
  }
  .dantsertree-exp-el span.dantsertree-expander:hover,
  .dantsertree-exp-edl span.dantsertree-expander:hover {
    background-position: -48px -96px;
  }
  /* Fade out expanders, when container is not hovered or active */
  .dantsertree-fade-expander span.dantsertree-expander {
    transition: opacity 1.5s;
    opacity: 0;
  }
  .dantsertree-fade-expander:hover span.dantsertree-expander,
  .dantsertree-fade-expander.dantsertree-treefocus span.dantsertree-expander,
  .dantsertree-fade-expander .dantsertree-treefocus span.dantsertree-expander,
  .dantsertree-fade-expander [class*='dantsertree-statusnode-'] span.dantsertree-expander {
    transition: opacity 0.6s;
    opacity: 1;
  }
  /*------------------------------------------------------------------------------
   * Checkbox icon
   *----------------------------------------------------------------------------*/
  span.dantsertree-checkbox {
    margin-left: 3px;
    background-position: 0px -32px;
  }
  span.dantsertree-checkbox:hover {
    background-position: -16px -32px;
  }
  span.dantsertree-checkbox.dantsertree-radio {
    background-position: 0px -48px;
  }
  span.dantsertree-checkbox.dantsertree-radio:hover {
    background-position: -16px -48px;
  }
  .dantsertree-partsel span.dantsertree-checkbox {
    background-position: -64px -32px;
  }
  .dantsertree-partsel span.dantsertree-checkbox:hover {
    background-position: -80px -32px;
  }
  .dantsertree-partsel span.dantsertree-checkbox.dantsertree-radio {
    background-position: -64px -48px;
  }
  .dantsertree-partsel span.dantsertree-checkbox.dantsertree-radio:hover {
    background-position: -80px -48px;
  }
  .dantsertree-selected span.dantsertree-checkbox {
    background-position: -32px -32px;
  }
  .dantsertree-selected span.dantsertree-checkbox:hover {
    background-position: -48px -32px;
  }
  .dantsertree-selected span.dantsertree-checkbox.dantsertree-radio {
    background-position: -32px -48px;
  }
  .dantsertree-selected span.dantsertree-checkbox.dantsertree-radio:hover {
    background-position: -48px -48px;
  }
  .dantsertree-unselectable span.dantsertree-checkbox {
    opacity: 0.4;
    filter: alpha(opacity=40);
  }
  .dantsertree-unselectable span.dantsertree-checkbox:hover {
    background-position: 0px -32px;
  }
  .dantsertree-unselectable.dantsertree-partsel span.dantsertree-checkbox:hover {
    background-position: -64px -32px;
  }
  .dantsertree-unselectable.dantsertree-selected span.dantsertree-checkbox:hover {
    background-position: -32px -32px;
  }
  /*------------------------------------------------------------------------------
   * Node type icon
   * Note: IE6 doesn't correctly evaluate multiples class names,
   *		 so we create combined class names that can be used in the CSS.
   *
   * Prefix: dantsertree-ico-
   * 1st character: 'e': expanded, 'c': collapsed
   * 2nd character (optional): 'f': folder
   *----------------------------------------------------------------------------*/
  span.dantsertree-icon {
    margin-left: 3px;
    background-position: 0px 0px;
  }
  /* Documents */
  .dantsertree-ico-c span.dantsertree-icon:hover {
    background-position: -16px 0px;
  }
  .dantsertree-has-children.dantsertree-ico-c span.dantsertree-icon {
    background-position: -32px 0px;
  }
  .dantsertree-has-children.dantsertree-ico-c span.dantsertree-icon:hover {
    background-position: -48px 0px;
  }
  .dantsertree-ico-e span.dantsertree-icon {
    background-position: -64px 0px;
  }
  .dantsertree-ico-e span.dantsertree-icon:hover {
    background-position: -80px 0px;
  }
  /* Folders */
  .dantsertree-ico-cf span.dantsertree-icon {
    background-position: 0px -16px;
  }
  .dantsertree-ico-cf span.dantsertree-icon:hover {
    background-position: -16px -16px;
  }
  .dantsertree-has-children.dantsertree-ico-cf span.dantsertree-icon {
    background-position: -32px -16px;
  }
  .dantsertree-has-children.dantsertree-ico-cf span.dantsertree-icon:hover {
    background-position: -48px -16px;
  }
  .dantsertree-ico-ef span.dantsertree-icon {
    background-position: -64px -16px;
  }
  .dantsertree-ico-ef span.dantsertree-icon:hover {
    background-position: -80px -16px;
  }
  .dantsertree-loading span.dantsertree-expander,
  .dantsertree-loading span.dantsertree-expander:hover,
  .dantsertree-statusnode-loading span.dantsertree-icon,
  .dantsertree-statusnode-loading span.dantsertree-icon:hover {
    background-image: url("loading.gif");
    background-position: 0px 0px;
  }
  /* Status node icons */
  .dantsertree-statusnode-error span.dantsertree-icon,
  .dantsertree-statusnode-error span.dantsertree-icon:hover {
    background-position: 0px -112px;
  }
  /*------------------------------------------------------------------------------
   * Node titles and highlighting
   *----------------------------------------------------------------------------*/
  span.dantsertree-node {
    /* See #117 */
    display: inherit;
    width: 100%;
    margin-top: 0px;
    min-height: 20px;
  }
  span.dantsertree-title {
    color: black;
    cursor: pointer;
    display: inline-block;
    vertical-align: top;
    min-height: 20px;
    padding: 0 3px 0 3px;
    margin: 0px 0 0 3px;
    border: 1px solid transparent;
    -webkit-border-radius: 0px;
    -moz-border-radius: 0px;
    -ms-border-radius: 0px;
    -o-border-radius: 0px;
    border-radius: 0px;
  }
  span.dantsertree-node.dantsertree-error span.dantsertree-title {
    color: red;
  }
  /*------------------------------------------------------------------------------
   * Drag'n'drop support
   *----------------------------------------------------------------------------*/
  div.dantsertree-drag-helper span.dantsertree-childcounter,
  div.dantsertree-drag-helper span.dantsertree-dnd-modifier {
    display: inline-block;
    color: #fff;
    background: #337ab7;
    border: 1px solid gray;
    min-width: 10px;
    height: 10px;
    line-height: 1;
    vertical-align: baseline;
    border-radius: 10px;
    padding: 2px;
    text-align: center;
    font-size: 9px;
  }
  div.dantsertree-drag-helper span.dantsertree-childcounter {
    position: absolute;
    top: -6px;
    right: -6px;
  }
  div.dantsertree-drag-helper span.dantsertree-dnd-modifier {
    background: #5cb85c;
    border: none;
    font-weight: bolder;
  }
  div.dantsertree-drag-helper.dantsertree-drop-accept span.dantsertree-drag-helper-img {
    background-position: -32px -112px;
  }
  div.dantsertree-drag-helper.dantsertree-drop-reject span.dantsertree-drag-helper-img {
    background-position: -16px -112px;
  }
  /*** Drop marker icon *********************************************************/
  #dantsertree-drop-marker {
    width: 32px;
    position: absolute;
    background-position: 0px -128px;
    margin: 0;
  }
  #dantsertree-drop-marker.dantsertree-drop-after,
  #dantsertree-drop-marker.dantsertree-drop-before {
    width: 64px;
    background-position: 0px -144px;
  }
  #dantsertree-drop-marker.dantsertree-drop-copy {
    background-position: -64px -128px;
  }
  #dantsertree-drop-marker.dantsertree-drop-move {
    background-position: -32px -128px;
  }
  /*** Source node while dragging ***********************************************/
  span.dantsertree-drag-source.dantsertree-drag-remove {
    opacity: 0.15;
  }
  /*** Target node while dragging cursor is over it *****************************/
  /*------------------------------------------------------------------------------
   * 'rtl' option
   *----------------------------------------------------------------------------*/
  .dantsertree-container.dantsertree-rtl .dantsertree-title {
    /*unicode-bidi: bidi-override;*/
    /* optional: reverse title letters */
  }
  .dantsertree-container.dantsertree-rtl span.dantsertree-connector,
  .dantsertree-container.dantsertree-rtl span.dantsertree-expander,
  .dantsertree-container.dantsertree-rtl span.dantsertree-icon,
  .dantsertree-container.dantsertree-rtl span.dantsertree-drag-helper-img,
  .dantsertree-container.dantsertree-rtl #dantsertree-drop-marker {
    background-image: url("icons-rtl.gif");
  }
  .dantsertree-container.dantsertree-rtl .dantsertree-exp-n span.dantsertree-expander,
  .dantsertree-container.dantsertree-rtl .dantsertree-exp-nl span.dantsertree-expander {
    background-image: none;
  }
  .dantsertree-container.dantsertree-rtl.dantsertree-connectors .dantsertree-exp-n span.dantsertree-expander,
  .dantsertree-container.dantsertree-rtl.dantsertree-connectors .dantsertree-exp-nl span.dantsertree-expander {
    background-image: url("icons-rtl.gif");
  }
  ul.dantsertree-container.dantsertree-rtl ul {
    padding: 0 16px 0 0;
  }
  ul.dantsertree-container.dantsertree-rtl.dantsertree-connectors li {
    background-position: right 0;
    background-image: url("vline-rtl.gif");
  }
  ul.dantsertree-container.dantsertree-rtl li.dantsertree-lastsib,
  ul.dantsertree-container.dantsertree-rtl.dantsertree-no-connector > li {
    background-image: none;
  }
  /*------------------------------------------------------------------------------
   * 'table' extension
   *----------------------------------------------------------------------------*/
  table.dantsertree-ext-table {
    border-collapse: collapse;
  }
  table.dantsertree-ext-table span.dantsertree-node {
    display: inline-block;
    box-sizing: border-box;
  }
  /*------------------------------------------------------------------------------
   * 'columnview' extension
   *----------------------------------------------------------------------------*/
  table.dantsertree-ext-columnview tbody tr td {
    position: relative;
    border: 1px solid gray;
    vertical-align: top;
    overflow: auto;
  }
  table.dantsertree-ext-columnview tbody tr td > ul {
    padding: 0;
  }
  table.dantsertree-ext-columnview tbody tr td > ul li {
    list-style-image: none;
    list-style-position: outside;
    list-style-type: none;
    -moz-background-clip: border;
    -moz-background-inline-policy: continuous;
    -moz-background-origin: padding;
    background-attachment: scroll;
    background-color: transparent;
    background-position: 0px 0px;
    background-repeat: repeat-y;
    background-image: none;
    /* no v-lines */
    margin: 0;
  }
  table.dantsertree-ext-columnview span.dantsertree-node {
    position: relative;
    /* allow positioning of embedded spans */
    display: inline-block;
  }
  table.dantsertree-ext-columnview span.dantsertree-node.dantsertree-expanded {
    background-color: #CBE8F6;
  }
  table.dantsertree-ext-columnview .dantsertree-has-children span.dantsertree-cv-right {
    position: absolute;
    right: 3px;
    background-position: 0px -80px;
  }
  table.dantsertree-ext-columnview .dantsertree-has-children span.dantsertree-cv-right:hover {
    background-position: -16px -80px;
  }
  /*------------------------------------------------------------------------------
   * 'filter' extension
   *----------------------------------------------------------------------------*/
  .dantsertree-ext-filter-dimm span.dantsertree-node span.dantsertree-title {
    color: silver;
    font-weight: lighter;
  }
  .dantsertree-ext-filter-dimm tr.dantsertree-submatch span.dantsertree-title,
  .dantsertree-ext-filter-dimm span.dantsertree-node.dantsertree-submatch span.dantsertree-title {
    color: black;
    font-weight: normal;
  }
  .dantsertree-ext-filter-dimm tr.dantsertree-match span.dantsertree-title,
  .dantsertree-ext-filter-dimm span.dantsertree-node.dantsertree-match span.dantsertree-title {
    color: black;
    font-weight: bold;
  }
  .dantsertree-ext-filter-hide tr.dantsertree-hide,
  .dantsertree-ext-filter-hide span.dantsertree-node.dantsertree-hide {
    display: none;
  }
  .dantsertree-ext-filter-hide tr.dantsertree-submatch span.dantsertree-title,
  .dantsertree-ext-filter-hide span.dantsertree-node.dantsertree-submatch span.dantsertree-title {
    color: silver;
    font-weight: lighter;
  }
  .dantsertree-ext-filter-hide tr.dantsertree-match span.dantsertree-title,
  .dantsertree-ext-filter-hide span.dantsertree-node.dantsertree-match span.dantsertree-title {
    color: black;
    font-weight: normal;
  }
  /* Hide expanders if all child nodes are hidden by filter */
  .dantsertree-ext-filter-hide-expanders tr.dantsertree-match span.dantsertree-expander,
  .dantsertree-ext-filter-hide-expanders span.dantsertree-node.dantsertree-match span.dantsertree-expander {
    visibility: hidden;
  }
  .dantsertree-ext-filter-hide-expanders tr.dantsertree-submatch span.dantsertree-expander,
  .dantsertree-ext-filter-hide-expanders span.dantsertree-node.dantsertree-submatch span.dantsertree-expander {
    visibility: visible;
  }
  .dantsertree-ext-childcounter span.dantsertree-icon,
  .dantsertree-ext-filter span.dantsertree-icon {
    position: relative;
  }
  .dantsertree-ext-childcounter span.dantsertree-childcounter,
  .dantsertree-ext-filter span.dantsertree-childcounter {
    color: #fff;
    background: #777;
    border: 1px solid gray;
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 10px;
    height: 10px;
    line-height: 1;
    vertical-align: baseline;
    border-radius: 10px;
    padding: 2px;
    text-align: center;
    font-size: 9px;
  }
  /*------------------------------------------------------------------------------
   * 'wide' extension
   *----------------------------------------------------------------------------*/
  ul.dantsertree-ext-wide {
    position: relative;
    min-width: 100%;
    z-index: 2;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  ul.dantsertree-ext-wide span.dantsertree-node > span {
    position: relative;
    z-index: 2;
  }
  ul.dantsertree-ext-wide span.dantsertree-node span.dantsertree-title {
    position: absolute;
    z-index: 1;
    left: 0px;
    min-width: 100%;
    margin-left: 0;
    margin-right: 0;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  /*------------------------------------------------------------------------------
   * 'fixed' extension
   *----------------------------------------------------------------------------*/
  .dantsertree-ext-fixed-wrapper .dantsertree-ext-fixed-hidden {
    display: none;
  }
  .dantsertree-ext-fixed-wrapper div.dantsertree-ext-fixed-scroll-border-bottom {
    border-bottom: 3px solid rgba(0, 0, 0, 0.75);
  }
  .dantsertree-ext-fixed-wrapper div.dantsertree-ext-fixed-scroll-border-right {
    border-right: 3px solid rgba(0, 0, 0, 0.75);
  }
  .dantsertree-ext-fixed-wrapper div.dantsertree-ext-fixed-wrapper-tl {
    position: absolute;
    overflow: hidden;
    z-index: 3;
    top: 0px;
    left: 0px;
  }
  .dantsertree-ext-fixed-wrapper div.dantsertree-ext-fixed-wrapper-tr {
    position: absolute;
    overflow: hidden;
    z-index: 2;
    top: 0px;
  }
  .dantsertree-ext-fixed-wrapper div.dantsertree-ext-fixed-wrapper-bl {
    position: absolute;
    overflow: hidden;
    z-index: 2;
    left: 0px;
  }
  .dantsertree-ext-fixed-wrapper div.dantsertree-ext-fixed-wrapper-br {
    position: absolute;
    overflow: scroll;
    z-index: 1;
  }
  /*******************************************************************************
   * Styles specific to this skin.
   *
   * This section is automatically generated from the `ui-dantsertree.less` template.
   ******************************************************************************/
  /*******************************************************************************
   * Node titles
   */
  .dantsertree-plain span.dantsertree-title {
    border: 1px solid transparent;
  }
  .dantsertree-plain.dantsertree-container.dantsertree-treefocus span.dantsertree-focused span.dantsertree-title {
    border-color: #3399ff;
  }
  .dantsertree-plain span.dantsertree-active span.dantsertree-title,
  .dantsertree-plain span.dantsertree-selected span.dantsertree-title {
    background-color: #f7f7f7;
    border-color: #dedede;
  }
  .dantsertree-plain span.dantsertree-node span.dantsertree-selected span.dantsertree-title {
    font-style: italic;
  }
  .dantsertree-plain span.dantsertree-node:hover span.dantsertree-title {
    background-color: #eff9fe;
    border-color: #70c0e7;
  }
  .dantsertree-plain.dantsertree-container.dantsertree-treefocus span.dantsertree-active span.dantsertree-title,
  .dantsertree-plain.dantsertree-container.dantsertree-treefocus span.dantsertree-selected span.dantsertree-title {
    background-color: #cbe8f6;
    border-color: #26a0da;
  }
  /*******************************************************************************
   * 'table' extension
   */
  table.dantsertree-ext-table tbody tr td {
    border: 1px solid #EDEDED;
    padding: 3px;
  }
  table.dantsertree-ext-table tbody tr td:first-child {
    min-width: 300px;
  }
  table.dantsertree-ext-table tbody span.dantsertree-node,
  table.dantsertree-ext-table tbody span.dantsertree-node:hover {
    border: none;
    background: none;
  }
  table.dantsertree-ext-table tbody tr:hover {
    background-color: #E5F3FB;
    outline: 1px solid #70C0E7;
  }
  table.dantsertree-ext-table tbody tr.dantsertree-focused span.dantsertree-title {
    outline: 1px dotted black;
  }
  table.dantsertree-ext-table tbody tr.dantsertree-active:hover,
  table.dantsertree-ext-table tbody tr.dantsertree-selected:hover {
    background-color: #CBE8F6;
    outline: 1px solid #26A0DA;
  }
  table.dantsertree-ext-table tbody tr.dantsertree-active {
    background-color: #F7F7F7;
    outline: 1px solid #DEDEDE;
  }
  table.dantsertree-ext-table tbody tr.dantsertree-selected {
    background-color: #F7F7F7;
  }
  table.dantsertree-ext-table.dantsertree-treefocus tbody tr.dantsertree-active {
    background-color: #CBE8F6;
    outline: 1px solid #26A0DA;
  }
  table.dantsertree-ext-table.dantsertree-treefocus tbody tr.dantsertree-selected {
    background-color: #CBE8F6;
  }
  .dantsertree-ul-wrapper .input-group__input{
    padding: 0 !important;
  }
  .dantsertree-ul-wrapper label{
    left:0 !important;
  }
  .dantsertree-ul-wrapper .appended-icon.fa.fa-sitemap{
    font-size: 20px;
  }
</style>