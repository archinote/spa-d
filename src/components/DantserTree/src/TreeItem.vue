<template>
    <div v-if="table">
      <tr role="row" :class="nodeClass">
        <td role="gridcell" @contextmenu.prevent="onCtxMenuTd({cell: 0, event: $event, data: model})">
          <span class="dantsertree-node" :style="{paddingLeft:(table.indentation)*(level)+'px'}">
            <span role="button" class="dantsertree-expander" @click.stop.prevent="toggleChildren"></span>
            <span v-if="!model.unselectable && checkbox" role="checkbox" class="dantsertree-checkbox" @click.stop.prevent="toggleSelected"></span>
            <span role="presentation" :class="iconClass" :style="{color:(model.iconcolor)?model.iconcolor:''}"></span>
            <span class="dantsertree-title" :title="model.tooltip">{{model.name}}</span>
          </span>
        </td>

        <td v-for="(column, index) in table.columns" v-if="column.type=='component'" :key="index" @contextmenu.prevent="onCtxMenuTd({cell: index+1, event: $event, data: model})">
          <component :is="column.component" :data="model"></component>
        </td>
        <td v-else-if="column.type=='html'" v-html="column.html" @contextmenu.prevent="onCtxMenuTd({cell: index+1, event: $event, data: model})"></td>
      </tr>

      <tree-item
        v-if="model.children"
        v-show="model.expanded"
        :table="table"
        @select-node="selNode($event)"
        @toggle-node="tglNode($event)"
        @ctx-menu-td="onCtxMenuTd($event)"
        v-for="child in model.children"
        :model="child"
        :parent="model"
        :key="child.id"
        :level="level+1"
      >
      </tree-item>
    </div>


  <li v-else role="treeitem" aria-selected="false" :data-id="model.id" @dragover.prevent="onDrag" @dragleave="onDragLeave" @drop.stop="dragDroped({event: $event, data: model})">
    <span
      :class="nodeClass" :draggable="dnd" @dblclick="dblClicked" @dragstart="dragStarted({event: $event, data: model})"
      @contextmenu.prevent="onCtxMenu({event: $event, data: model})">
      <span class="dantsertree-expander" @click.stop.prevent="toggleChildren"></span>
      <span v-if="!model.unselectable && checkbox" role="checkbox" class="dantsertree-checkbox" @click.stop.prevent="toggleSelected"></span>
      <span v-if="model.icon" role="presentation" :class="iconClass" :style="{color:(model.iconcolor)?model.iconcolor:''}"></span>
      <span class="dantsertree-title" :title="model.tooltip" @click="clicked(model)">{{model.name}}</span>
    </span>
    <ul v-if="model.children" role="group" v-show="model.expanded">
      <tree-item
        @select-node="selNode($event)"
        @click-node="clicked($event)"
        @toggle-node="tglNode($event)"
        @double-clicked="onDblClick($event)"
        @drag-drop="dragDroped($event)"
        @drag-start="dragStarted($event)"
        @ctx-menu="onCtxMenu($event)"
        v-for="child in model.children"
        :model="child"
        :parent="model"
        :key="child.id"
        :dnd="dnd"
        :selectMode="selectMode"
        :checkbox="checkbox"
      >
      </tree-item>
    </ul>
  </li>
</template>

<script>
  export default {
    name: 'TreeItem',

    props: {
      model: Object,
      parent: Object,
      level: Number,
      table:{
        type: Object,
        required: false
      },
      dnd:{
        type: Boolean,
        required: false
      },
      checkbox:{
        type: Boolean,
        required: false
      },
      selectMode:{
        type: Number,
        default: 1,
        required: false
      },
    },

    computed:{
      showCheckbox(){
        return (!this.model.unselectable && this.selectMode!==1 && this.checkbox===true)
      },
      nodeClass(){
        let exp = 'dantsertree-exp-'
        let ico = 'dantsertree-ico-'
        let classes = [
          'dantsertree-node',
        ]

        if( this.model.children && this.model.children.length ){
          classes.push(exp +
            (this.model.expanded ? "e" : "c") +
            (this.model.lazy && this.model.children == null ? "d" : "") +
            (this.isLastSib ? "l" : "")
          )
        }else{
          classes.push(exp + "n" + (this.isLastSib ? "l" : "") )
        }

        classes.push(ico +
          (this.model.expanded ? "e" : "c") +
          (this.model.folder ? "f" : "")
        );

        if(this.model.selected && !this.model.unselectable){
          classes.push('dantsertree-selected')
        }
        if(this.model.expanded){
          classes.push('dantsertree-expanded')
        }
        if(this.model.active){
          classes.push('dantsertree-active')
        }
        return classes.join(' ')
      },
      iconClass(){
        let classes = [
          'dantsertree-icon'
        ]
        if(this.model.icon){
          classes.push('dantsertree-custom-icon', this.model.icon)
        }
        return classes.join(' ')
      },
      isLastSib(){
        //TODO Check last sibling (if needed)
        return false
      },
    },

    mounted(){
      if (typeof this.model.selected === 'undefined') this.$set( this.model, 'selected', false )
      if (typeof this.model.expanded === 'undefined') this.$set( this.model, 'expanded', false )
      if (typeof this.model.active === 'undefined') this.$set( this.model, 'active', false )
    },

    updated(){
      if (typeof this.model.selected === 'undefined') this.$set( this.model, 'selected', false )
      if (typeof this.model.expanded === 'undefined') this.$set( this.model, 'expanded', false )
      if (typeof this.model.active === 'undefined') this.$set( this.model, 'active', false )
    },

    methods:{
      clicked(eventData){
        this.$emit('click-node', eventData)
      },

      selNode(eventData) {
        this.$emit('select-node', eventData)
      },

      tglNode(eventData){
        this.$emit('toggle-node', eventData)
      },

      onDblClick(eventData){
        this.$emit('double-clicked', eventData)
      },

      onCtxMenu(eventData){
        this.$emit('ctx-menu', eventData)
      },
  
      onCtxMenuTd(eventData){
        this.$emit('ctx-menu-td', eventData)
      },

      dragStarted(eventData){
        if(this.dnd) this.$emit('drag-start', eventData)
      },
  
      onDrag(eventData){
        let halfHeight = Math.round(eventData.target.clientHeight/2)
        let offset = eventData.offsetY
        
        if(offset<halfHeight-2) {
          eventData.target.style.border = "none"
          eventData.target.style.borderTop = "2px solid #999"
        } else if(offset>halfHeight-2 && offset<halfHeight+2){
          eventData.target.style.border = "1px solid #999"
        } else if(offset>halfHeight+2){
          eventData.target.style.border = "none"
          eventData.target.style.borderBottom = "2px solid #999"
        }
      },
      
      onDragLeave(eventData){
        eventData.target.style.border = "none"
      },

      dragDroped(eventData){
        eventData.event.target.style.border = "none"
        if(this.dnd) this.$emit('drag-drop', eventData)
      },

      dblClicked(){
        if(!this.model.unselectable){
          this.$emit('double-clicked', this.model)
        }
      },

      toggleSelected(){
        if(!this.model.unselectable){
          this.model.selected=!this.model.selected
          this.$emit('select-node', this.model)
        }
      },

      toggleChildren(){
        this.model.expanded = !this.model.expanded
        this.$emit('toggle-node', this.model)
      },
    }

  }
</script>

<style>

</style>