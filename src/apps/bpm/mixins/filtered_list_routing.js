import { debounce } from 'lodash'

export default {
  // mixins: [time_limit],

  props: {
    inputFilters: {
      type: Object,
      default: function () {
        return {
          contractor: [],
          process: []
        }
      }
    },
    page: {
      type: [Number, String],
      default: 1
    },
    rowsPerPage: {
      type: [Number, String],
      default: 10
    },
    sortBy: {
      type: String,
      default: 'created'
    },
    descending: {
      type: [Boolean, String],
      default: true
    }
  },

  data() {
    return {
      search: '',
      totalItems: 0,
      items: [],
      loading: false,
      loadingFilters: false,

      rowsPerPageDefault: [10, 20, 50, { text: 'Все', value: -1 }],

      paginationDefault: { page: 1, rowsPerPage: 10, sortBy: 'created', descending: true, totalItems: 0 },
      // pagination: { page: 1, rowsPerPage: 10, sortBy: 'created', descending: true, totalItems: 0 },
      // pagination: { sortBy: 'created', descending: true },
      pagination: this.paginationDefault,

      filters: null,
      activeFiltersData: null,
    }
  },

  watch: {
    pagination: {
      handler (newVal, oldVal) {
        // console.log("filtered_list_routing, 'watcher', pagination (new, old):")
        // console.log(newVal)
        // console.log(oldVal)

        if (newVal && oldVal) {
          if (
            (newVal.page && oldVal.page && newVal.page !== oldVal.page)
            ||
            (newVal.rowsPerPage && oldVal.rowsPerPage && newVal.rowsPerPage !== oldVal.rowsPerPage)
            ||
            (typeof newVal.sortBy !== 'undefined' && typeof oldVal.sortBy !== 'undefined' && newVal.sortBy !== oldVal.sortBy)
            ||
            (typeof newVal.descending !== 'undefined' && typeof oldVal.descending !== 'undefined' && newVal.descending !== oldVal.descending)
          ) {
            this.refreshFace()
          }
        }
      },
      deep: true
    },
    '$route' (to, from) {
      // обработка изменений параметров пути...
      // this.$bpmDebug.log([
      //   "================================",
      //   "router changed, this.inputFilters:",
      //   this.inputFilters
      // ])

      this.applyPagination()
      this.applyInputFilters( this.filters )
      this.getListData()
    },
  },

  mounted () {
    this.applyPagination()

    this.getFiltersData()
    this.getListData()
  },

  methods: {

    getFiltersData: function () {},

    getListData: function () {},

    addPaginationParams: function ( params ) {
      // Add to query different from default pagination properties

      if (this.pagination.page !== this.paginationDefault.page) {
        params['page'] = this.pagination.page
      }

      if (this.pagination.rowsPerPage !== this.paginationDefault.rowsPerPage) {
        params['rowsPerPage'] = this.pagination.rowsPerPage
      }

      if (typeof this.pagination.sortBy !== 'undefined' && this.pagination.sortBy !== null && this.pagination.sortBy !== this.paginationDefault.sortBy) {
        params['sortBy'] = this.pagination.sortBy
      }

      if (typeof this.pagination.descending !== 'undefined' && this.pagination.descending !== null && this.pagination.descending !== this.paginationDefault.descending) {
        params['descending'] = this.pagination.descending
      }

      return params
    },

    addFiltersParams: function ( params ) {
      for (var filter in this.activeFiltersData) {
        if( this.activeFiltersData.hasOwnProperty( filter ) ) {
          if (Array.isArray(this.activeFiltersData[filter]) && this.activeFiltersData[filter].length) {
            params['filter_' + filter] = this.activeFiltersData[filter].join(',')
          }
        }
      }

      // console.log("filtered_list_routing, 'addFiltersParams', params (AFTER apply):")
      // console.log( params )
    },

    // Get pagination params from props (its may passes from query params)
    applyPagination: function () {
      this.pagination.page = parseInt(this.page)
      this.pagination.rowsPerPage = parseInt(this.rowsPerPage)
      this.pagination.sortBy = String(this.sortBy)

      if ( this.descending !== null) {
        this.pagination.descending = Boolean(typeof this.descending === 'boolean') 
          ? this.descending 
          : (this.descending === 'true')
      }

      // console.log("filtered_list_routing, 'applyPagination', this.descending:")
      // console.log( this.descending )

      // console.log("filtered_list_routing, 'applyPagination', this.pagination:")
      // console.log( this.pagination )
    },

    applyInputFilters: function ( filters ) {
      for (const filter in filters) {
        if( filters.hasOwnProperty( filter ) ) {
          let tmpFilters = []
          let filterCode = filters[filter].code

          if (this.inputFilters && this.inputFilters[filterCode] && Array.isArray(this.inputFilters[filterCode])) {
            this.inputFilters[filterCode].forEach( element => {
              // if (['contractor', 'process'].includes(filterCode)) {
              //   element = parseInt(element)
              // }
              tmpFilters.push( element )
            } )
          }

          filters[filter].values = tmpFilters.slice()
        }
      }

      // console.log("filtered_list_routing, 'applyInputFilters', filters (AFTER apply):")
      // console.log( filters )
    },

    onFiltersChange: function ( activeFiltersData ) {
      // console.log("filtered_list_routing, 'onFiltersChange()', activeFiltersData:")
      // console.log( activeFiltersData )

      this.activeFiltersData = activeFiltersData

      this.filtersHandlerDelayed()
    },

    filtersHandlerDelayed: debounce(
      function() {
        // console.log("filtered_list_routing, 'filtersHandlerDelayed()', activeFiltersData:")
        // console.log( this.activeFiltersData )

        // TODO:
        // Go to the first page of the list after filters changed.
        // this.pagination.page = 1

        this.refreshFace()
      }, 1200
    ),

    clearRouteQuery: function (query) {
      let clearQuery = {}

      for (var prop in query) {
        if (!['sortBy', 'descending', 'page', 'rowsPerPage'].includes(prop)
          && (prop.indexOf('filter_') === -1)
        ) {
          clearQuery[prop] = query[prop]
        }
      }

      return clearQuery
    },

    refreshFace: function () {
      // let queryParams = {}
      let queryParams = this.clearRouteQuery(this.$router.currentRoute.query)

      this.addPaginationParams( queryParams )
      this.addFiltersParams( queryParams )

      // console.log("refreshFace(), queryParams:")
      // console.log(queryParams)

      let nextRoute = this.getRouteData({
        name: this.$router.currentRoute.name,
        query: queryParams
      })
      // console.log("refreshFace(), nextRoute")
      // console.log(nextRoute)

      this.$router.push(nextRoute)
    }

  } // methods
}
