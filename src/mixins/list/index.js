import { cloneDeep } from 'lodash'
export default {
  props: {
    //Пагинация
    pagination: {
      type: Object,
      default: () => {
        return {
          page: 1,
          rowsPerPage: 10,
          sortBy: null,
          descending: true
        }
      }
    },
    //Фильтры
    filters: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      items: [],
      currentFilters: {},
      currentPagination: {},
      loading: false,
      total: 0
    }
  },
  watch: {
    filters: {
      handler: 'resetFilters',
      immediate: true,
      deep: true
    },
    pagination: {
      handler: 'resetPagination',
      immediate: true,
      deep: true
    },
    currentFilters: {
      //@todo Проверять изменение фильтров
      handler(newVal, oldVal) {
        this.currentPagination.page = 1
        this.debouncedLoad()
      },
      deep: true
    },
    currentPagination: {
      //@todo Проверять изменение пагинации
      handler(newVal, oldVal) {
        if (
          newVal.descending != oldVal.descending ||
          newVal.page != oldVal.page ||
          newVal.rowsPerPage != oldVal.rowsPerPage ||
          newVal.sortBy != oldVal.sortBy ||
          newVal.refresh === true
        ) {
          this.debouncedLoad()
        }
      },
      deep: true
    }
  },
  computed: {
    rowsPerPageItems() {
      return [5, 10, 25, 50, 100]
    },
    rowsPerPageText() {
      //@todo Добавить локаль
      return 'Элементов на странице'
    },
    hasPrevItems() {
      return this.currentPagination.page > 1
    },
    hasNextItems() {
      let itemsCount =
        this.currentPagination.page * this.currentPagination.rowsPerPage
      return this.total > itemsCount
    }
  },
  methods: {
    changeSort(column) {
      let pagination = { ...this.currentPagination }
      pagination.page = 1
      if (pagination.sortBy === column) {
        pagination.descending = !pagination.descending
      } else {
        pagination.sortBy = column
        pagination.descending = false
      }
      this.currentPagination = cloneDeep(pagination)
    },
    resetPagination() {
      this.currentPagination = this.initPagination(this.pagination)
    },
    resetFilters() {
      this.currentFilters = this.initFilters(this.filters)
    },
    initPagination(value) {
      let tmp = { page: 1, rowsPerPage: 5, sortBy: null, descending: false }
      return cloneDeep({ ...tmp, ...value })
    },
    initFilters(value) {
      return cloneDeep({ ...{}, ...value })
    },
    refresh() {
      this.debouncedLoad()
    },
    debouncedLoad() {
      console.log('Load items')
    }
  }
}
