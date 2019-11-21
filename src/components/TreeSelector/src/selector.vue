<template>
  <v-dialog v-model="dialog" persistent scrollable max-width="800px">
    <v-card class="d-tree-selector">
      <v-card-title>
        <span class="headline">{{title}}</span>
        <v-spacer></v-spacer>
        <v-btn class="ma-0" icon @click.native="dialog=false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="fill-height pa-0">
        <v-container fill-height grid-list-lg px-3 py-2>
          <v-layout fill-height row wrap>
            <v-flex :class="showSelected?'xs6':'xs12'">
              <d-tree ref="tree" :loading="loading" :render-content="renderTreeItem" :nodeCheckChange="nodeCheckChange" :default-checked-keys="checkedKeys" :default-expanded-keys="checkedKeys" :check-strictly="true" @check="check" :showCheckbox="true" node-key="id" :data="tree"></d-tree>
            </v-flex>
            <v-flex v-if="showSelected" xs6>
              <div class="d-tree-selector__items">
                <div class="d-tree-selector__item" v-for="item in selectedItems" :key="item.id">
                  <div class="d-tree-selector__item_content">
                    <template v-if="hasSelectedItemSlot">
                      <slot name="selectedItem" :item="item"></slot>
                    </template>
                    <template v-else>
                      <div class="d-tree-selector__item_default">{{item.id}}</div>
                    </template>
                  </div>
                  <div class="d-tree-selector__item_actions">
                    <v-btn class="ma-0" icon small @click.stop="deleteItem(item)">
                      <v-icon small>close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click.stop="save">Сохранить</v-btn>
        <v-btn color="blue darken-1" flat @click.native="dialog=false">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
require('../style/style.scss')
import { cloneDeep } from 'lodash'
import DTree from '../../ElementTree'
export default {
  name: 'DTreeSelector',
  components: {
    DTree,
    TreeNodeSlot: {
      props: {
        node: {
          required: true
        }
      },
      render(h) {
        const parent = this.$parent
        const tree = parent.tree
        const node = this.node
        const { data, store } = node
        return tree.$scopedSlots.default({ node, data })
      }
    }
  },
  props: {
    //Заголовок окна
    title: {
      type: String,
      default: 'Настройка доступа'
    },
    //Отображать ли окно с выбранными элементами
    showSelected: {
      type: Boolean,
      default: true
    },
    //Функция получение идентифиактора из элемента
    getId: {
      type: Function,
      default: item => {
        return item.id
      }
    },
    //Функция преобразования выбранного элемента дерева к нужному формату
    checkedItemFormatter: {
      type: Function,
      default: item => {
        return {
          id: item.id,
          element_type: item.element_type
        }
      }
    }
  },
  data() {
    return {
      //Данные дерева для отображения
      tree: [],
      //Тригер отображения окна
      dialog: false,
      //Тригер отображения окна
      loading: false,
      //Список выбранных элементов
      selectedItems: []
    }
  },
  methods: {
    //Клик на элемент дерева
    check(node, data) {
      let items = []
      data.checkedNodes.forEach(element => {
        let item = this.checkedItemFormatter(element)
        //Костыль (подмешиваем данные из уже выбранного элемента)
        let selectedItem = this.selectedItems.find(it => {
          return it.id == item.id
        })
        items.push({ ...item, ...selectedItem })
      })
      this.selectedItems = items
    },
    //Удаление элемента из списка
    deleteItem(item) {
      let index = this.selectedItems.findIndex(el => {
        return el == item
      })
      this.$refs.tree.setChecked({ id: item.id }, false)
      if (index !== -1) {
        this.selectedItems.splice(index, 1)
      }
    },
    save() {
      this.$emit('save', this.selectedItems)
    },
    show() {
      this.dialog = true
      return this
    },
    hide() {
      this.dialog = false
      return this
    },
    setLoading(loading) {
      this.loading = !!loading
      return this
    },
    setData(values) {
      this.selectedItems = cloneDeep(values) || []
      return this
    }
  },
  computed: {
    renderTreeItem() {
      let f = this.$scopedSlots.treeItem
      return function(h, params) {
        return f.call(params._self, { node: params.node, data: params.data })
      }
    },
    //Идентификаторы выбранных элементов для дерева
    checkedKeys() {
      return this.selectedItems.map(item => {
        return this.getId(item)
      })
    },
    //Проверка на наличие данных слота
    hasSelectedItemSlot() {
      return !!this.$scopedSlots.selectedItem
    },
    //Функция для чекбокса
    nodeCheckChange() {
      return function(value, ev) {
        this.node.setChecked(value, !this.tree.checkStrictly)
      }
    }
  }
}
</script>