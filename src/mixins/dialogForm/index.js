// 'use strict';

module.exports = {
  
  props: {
    title: {
      type: String,
      default: null
    },
    cancelText: {
      type: String,
      default: 'Отменить'
    },
    submitText: {
      type: String,
      default: 'Ok'
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingSubmit: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: function () {
        return {}
      }
    },
    formDataCurrent: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },

  watch: {
    isVisible: function (newVal, oldVal) {
      this.dialogVisible = this.isVisible
      
      if (newVal && !oldVal) {
        // console.log("Show dialog!")

        // On showing dialog clear last errors & updates form data.
        this.clearErrors()
        this.updateCurrentData()
      }
    },
    formData: {
      handler () {
        if (this.dialogVisible && !this.loading && !this.loadingSubmit) {
          this.updateCurrentData()
        }
      },
      deep: false
    }
  },

  data() {
    return {
      dialogVisible: false,
      errors: []
    }
  },

  mounted() {
    this.dialogVisible = this.isVisible
  },

  methods: {
    hideError: function(index) {
      // Make delay for hiding alert animation time.
      setTimeout( () => {
        this.clearErrors()
      }, 600)
    },

    clearErrors: function() {
      this.errors = []
    },

    getErrors: function() {
      let errors = ''

      if (this.errors && this.errors.length) {
        this.errors.forEach(_error => {
          if (errors) errors += '\n'
          errors += _error
        })
      }

      // console.log(errors);

      return errors
    },

    updateCurrentData: function () {
    },

    collectResults: function () {
      return {}
    },

    validate: function () {
    },

    doCancel: function () {
      this.$emit('cancel')
    },

    doSubmit: function () {
      this.clearErrors()

      this.validate()

      if (this.errors.length < 1) {
        this.$emit('submit', this.collectResults())
      }
    },
  } // methods
}
