import { ShowDialog } from '@/components/DialogManager'

/**
 * Display confirm dialog
 *
 * @param {Object|String} options
 * @param {VmNode} parent
 * @returns {Promise}
 */
function dmsConfirm(options, parent) {
  const defaultParams = {
    message: 'Сообщение о предупреждении',
    title: 'Внимание',
    icon: 'mdi-alert-circle-outline'
  }
  // @todo сделать настройки диалога
  if (typeof options == 'string') {
    options = {
      message: options
    }
  }
  let props = Object.assign({}, defaultParams, options)
  // @todo Реализовать красивое отображение диалога
  return new Promise((resolve, reject) => {
    let dialog = ShowDialog({
      //Компонент диалога
      component: () => import('@/components/Confirm/Confirm'),
      //Обработчики событий компонента
      listeners: {
        confirm: function(result) {
          resolve(true)
          dialog.visible = false
        }
      },
      //Обработчики событий диалога
      dialogListeners: {
        //Подтверждение по нажатию  Enter
        //@todo Уточнить соответсвие
        keydown: function($event) {
          if (
            dialog &&
            dialog.componentVm &&
            ($event.keyCode == 13 || $event.code == 'Enter')
          ) {
            //Действие с компоненте
            dialog.componentVm.agree()
          }
        }
      },
      //Настройки диалога
      dialogProps: {
        maxWidth: '480px'
      },
      //Параметры компонента
      props: props,
      //Родительский элемент
      parent
    }).$on('close', _ => {
      resolve(false)
    })
  })
}
/**
 * Display confirm dialog and resolve if agree
 *
 * @param {Object|String} options
 * @param {VmNode} parent
 * @returns {Promise}
 */
function dmsAgree(options, parent) {
  return new Promise((resolve, reject) => {
    dmsConfirm(options, parent).then(result => {
      if (result) {
        resolve()
      }
    })
  })
}

export { dmsConfirm, dmsAgree }
