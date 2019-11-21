import Vue from 'vue'
import Noty from 'noty'
import './style/style.scss'

const notyType = {
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'success'
}

const defaults = {
  layout: 'topRight',
  theme: 'dms',
  timeout: 3000,
  progressBar: true,
  closeWith: ['click']
}

/**
 * Display noty
 * @todo Реализовать всплывающее сообщение
 * @param {*} type
 * @param {*} options
 */
function dmsNoty(type, options) {
  type = notyType[type] || notyType.info
  if (typeof options == 'string') {
    options = { text: options }
  }

  options.buttons = (options.buttons || []).map(button => {
    if (button.dom) {
      // @todo check instanceof NotyButton
      return button
    }
    button = Object.assign(
      {
        label: '',
        classes: null,
        cb: null,
        attributes: {}
      },
      button
    )
    return Noty.button(
      button.label,
      button.classes,
      button.cb,
      button.attributes
    )
  })

  const params = Object.assign({}, defaults, options, {
    type
  })
  return new Noty(params).show()
}
/**
 * Уведомление об ошибке
 * @param {*} options
 */
function dmsErrorNoty(options) {
  return dmsNoty(notyType.error, options)
}
/**
 * Предупреждение
 * @param {*} options
 */
function dmsWarningNoty(options) {
  return dmsNoty(notyType.warning, options)
}
/**
 * Информация
 * @param {*} options
 */
function dmsInfoNoty(options) {
  return dmsNoty(notyType.info, options)
}
/**
 * Положительный результат
 * @param {*} options
 */
function dmsSuccessNoty(options) {
  return dmsNoty(notyType.success, options)
}

export {
  notyType,
  dmsNoty,
  dmsErrorNoty,
  dmsWarningNoty,
  dmsInfoNoty,
  dmsSuccessNoty
}
