/**
 * Get validation error data
 * @param {Error} error
 */
export function getValidationData(error) {
  let result = null
  if (error.response && error.response.status == 422) {
    result = error.response.data
  }
  return result
}

/**
 * Get possible server connection error message
 * @param {Error} error
 */
export function getErrorCode(error) {
  const defaultErrorMessage = 'Возникла ошибка при обращении к серверу'
  let message = ''

  if (error.response) {
    if (error.response.data) {
      message = error.response.data.code || defaultErrorMessage
    } else {
      message = defaultErrorMessage
    }
  }
  
  return message
}

/**
 * Translate error code to human readable text
 */
import validationErrors from './list.js'
export function t(code) {
  // TODO: use errors translation table
  let message = validationErrors[code] && validationErrors[code]['ru'] ? validationErrors[code]['ru'] : code + ': не найден текст ошибки'
  return message
}
