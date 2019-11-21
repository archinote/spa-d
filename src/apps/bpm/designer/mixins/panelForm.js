/**
 * 
 */
import { debounce } from 'lodash'
import { getErrorCode, getValidationData, t } from '@/helpers/errors'

export default {
  props: {
    // ID of the entity to be edited in the form
    id: {
      type: [String, Number],
      default: null
    }
  },

  data: function () {
    return {
      formData: null,
      loading: false,
      isError: false,
      error: '',
      onLoadError: false,
      onSaveError: false,
      onLoadErrorMsg: 'Произошла ошибка при получении данных...',
      onSaveErrorMsg: '',
      validationErrors: null,
      rules: {}, // NOTE: validation rules must be here
    }
  },

  watch: {
    id: function() {
      this.clearErrors()
      this.init()
    },
    formData: {
      handler(newValue, oldValue) {
        // Save form data
        if (newValue && oldValue
          && newValue.id && oldValue.id
          && newValue.id == oldValue.id) {
          // NOTE: - needs to validate form data before saving HERE?
          // or implement it in saveData function?
          this.debouncedSaveData(newValue)
        } else {
          // NOTE: Another process in the form
        }
      },
      deep: true
    },
    error: function() {
      this.isError = Boolean(this.error)
    },
    onLoadErrorMsg: function() {
      this.onLoadError = Boolean(this.onLoadErrorMsg)
    }
  },

  created() {
    this.debouncedSaveData = debounce(this.saveData, 1500, { 'maxWait': 3000 })
  },

  mounted() {
    this.init()
  },

  methods: {
    // Function prototype
    init: function () {},

    // Function prototype
    saveData: function () {},

    showError: function(error) {
      if (error) {
        // Show error
        // NOTE there are two ways:

        // 1. As alert message in the form.
        // this.error = error
        // // this.isError = true // NOTE: implements via watcher

        // 2. As notification.
        this.$dmsErrorNoty(error)
      } else {
        this.error = ''
      }
    },

    hideError: function() {
      setTimeout( () => {
        this.isError = false
      }, 600)
    },

    /**
     * Set form validation errors
     */
    setError: function (error) {
      if (error) {
        let validationData = getValidationData(error)
        if (validationData && validationData.errors) {
          this.validationErrors = validationData.errors
          // Request form validation
          this.$refs['processForm'].validate(valid => !valid)
        }

        // Check for form error message
        this.showError(t(getErrorCode(error)))
      } else {
        this.clearErrors()
      }
    },

    /**
     * Clear form validation errors
     */
    clearErrors: function () {
      this.validationErrors = null
      this.error = ''
      this.onLoadErrorMsg = ''
      this.onSaveErrorMsg = ''
    },

    checkServerValidation: function (rule, value, callback) {
      const field = rule && rule.field || null

      if (field && this.validationErrors && this.validationErrors[field]) {
        let errorCode = this.validationErrors[field]
        // Get human readable text of error code
        callback(new Error(t(errorCode)))
      } else {
        callback()
      }
    }
  }
}
