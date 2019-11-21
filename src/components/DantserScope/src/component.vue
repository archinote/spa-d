<template>
  <v-layout row wrap class="mb-3">
    <v-flex xs12>
      <v-data-table :headers="headers" :items="scopeList" hide-actions no-data-text="Данные отсутствуют">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-center" v-if="withScopes">{{ (props.item.scope_type===1) ? 'Включая подчиненных' : 'Только выбранным' }}</td>
          <td class="text-xs-center" v-if="withEdit">{{ (props.item.can_edit===1) ? 'Доступно редактирование' : 'Только чтение' }}</td>
          <td class="text-xs-center pa-0 ma-0">
            <v-btn class="red--text" icon flat @click="deleteNode(props.item.element_id)"><v-icon>close</v-icon></v-btn>
          </td>
        </template>
      </v-data-table>
      <span class="dashed pointer pull-right my-2" @click="showTree=!showTree">{{showTree?'Свернуть панель':'Добавить пользователей'}}</span>
    </v-flex>
    <v-flex xs6 v-show="showTree">
      <dantser-tree
        ref="beingTree"
        :checkbox="true"
        :selectMode="2"
        :source="treedata"
        :style="{height:'150px', overflow:'scroll', border:'1px solid #c5c5c5'}"
      ></dantser-tree>
    </v-flex>
    <v-flex xs6 class="pl-2" v-show="showTree">
      <v-checkbox label="Включая подчиненные подразделения" v-model="include_children" hide-details v-if="withScopes"></v-checkbox>
      <v-checkbox label="Разрешить редактирование" v-model="can_edit" hide-details v-if="withEdit"></v-checkbox>
      <v-btn class="mt-4 ml-0" @click="addNode()">Добавить</v-btn>
      <p class="red--text" v-show="existError">Такой пользователь уже существует в списке</p>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name : 'DantserScope',
    
    props:{
      treedata: {
        type: Array,
        required: false,
        default: () => []
      },
      value: {
        type: Array,
        required: false,
        default: () => []
      },
      withEdit: {
        type: Boolean,
        required: false,
        default: false
      },
      withScopes: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    
    mounted(){
      if(this.withScopes){
        this.headers.splice(1,0,{ text: 'Доступ', align: 'center', sortable: false })
      }
      if(this.withEdit){
        this.headers.splice(1,0,{ text: 'Права', align: 'center', sortable: false })
      }
    },
    
    computed:{
      scopeList:{
        get(){
          return this.value
        },
        set(v){ }
      }
    },
    
    data() {
      return {
        existError: false,
        disableCheckbox: true,
        currentNode: null,
        showTree: false,
        include_children: false,
        can_edit: false,
        headers: [
          { text: 'Пост/Подразделение', align: 'left', sortable: false },
          { text: 'Действия', align: 'center', sortable: false, width: 40 },
        ],
      }
    },
    
    methods : {
      selectNode(node){
        this.currentNode = node
        if(node.element_type==='post'){
          this.include_children = false
          this.disableCheckbox = true
        } else {
          this.disableCheckbox = false
        }
      },
      
      addNode(){
        let nodes = this.$refs['beingTree'].getNodesByProp('selected', true)
        if(nodes.length>0){
          nodes.map( node => {
            this.$refs['beingTree'].setSelected(node.id, false)
            if( this.scopeList.findIndex( el => el.element_id === node.id) < 0 ){
              let obj = {
                element_id: node.id,
                element_type: node.element_type,
                name: node.name
              }
              if(this.withScopes){
                obj.scope_type = (this.include_children && node.element_type !== 'post') ? 1 : 0
              }
              if(this.withEdit){
                obj.can_edit = (this.can_edit) ? 1 : 0
              }
              this.scopeList.push(obj)
            }
          })
          this.currentNode = null
          this.include_children = false
          this.can_edit = false
          this.disableCheckbox = true
          
          this.$emit('input', this.scopeList)
        }
      },
      
      deleteNode(id){
        const index = this.scopeList.findIndex( el => el.element_id === id)
        if(index >= 0){
          this.scopeList.splice(index, 1)
        }
        this.$emit('input', this.scopeList)
      }
    }
  }
</script>

<style>

</style>