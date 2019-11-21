import { cloneDeep, isEqual } from 'lodash'
import { requireValidator } from '@/utils/validators'

export default {
  props: {
    formData: {
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      currentFormData: cloneDeep(this.formData),
      currentErrors: {},
      currentErrorMessage: null
    }
  },
  watch: {
    /**
     * @todo Возможно добавить deep=true
     * @param {Object} newVal
     */
    formData(newVal) {
      this.$nextTick(() => {
        this.resetFormData()
      })
    }
  },
  methods: {
    /**
     * Reset current form data
     */
    resetFormData() {
      this.currentFormData = cloneDeep(this.formData)
    },
    /**
     * Set current form data
     * @param {Object} formData
     */
    setFormData(formData) {
      this.currentFormData = cloneDeep(formData)
    },
    /**
     * Set current form errors
     * @param {*} errors
     */
    setErrors(errors) {
      this.currentErrors = cloneDeep(errors)
      if (this.$refs.form && this.$refs.form.validate) {
        this.$refs.form.validate()
      }
    },
    /**
     * Clear form errors
     */
    clearErrors() {
      this.currentErrors = {}
      this.currentErrorMessage = null
    },
    /**
     * Create form validator
     */
    fieldValidator(field, validator, message) {
      return v => {
        let serverError = this.currentErrors[field]
        if (serverError) {
          this.$set(this.currentErrors, field, null)
          return serverError
        }
        if (!validator(v)) {
          return message
        }
        this.$set(this.currentErrors, field, null)
        return true
      }
    },
    /**
     * Required validator
     * @param {*} field
     * @param {*} message
     */
    fieldRequired(field, message = 'required') {
      return this.fieldValidator(field, requireValidator, message)
    }
  },
  computed: {
    /**
     * True if formData not equal currentFormData
     */
    isEdited() {
      return !isEqual(this.formData, this.currentFormData)
    },
    /**
     * True if form has errors
     */
    hasErrors() {
      return !isEqual(this.errors, {})
    },
    /**
     * Return form errors. Format: {field1:'Error text',field2:'Error text2'}
     */
    formErrors() {
      return this.currentErrors
    }
  }
}
