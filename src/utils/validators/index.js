function requireValidator(value) {
  return !(value == undefined || value == null || value == '')
}
/**
 * Create validator for Vuetify
 *
 * @param {Function} validator
 * @param {String} message
 */
function getVuetifyValidator(validator, message) {
  return v => {
    if (!validator(v)) {
      return message
    }
    return true
  }
}

export { requireValidator, getVuetifyValidator }
