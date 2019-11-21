export default {
  /**
   * Встраиваем свойство, как ссылку на диалог
   */
  inject: {
    popupDialog: 'popupDialog'
  },
  methods: {
    /**
     * Закрытие диалогового окна
     */
    dialogClose() {
      this.popupDialog.close()
    },
    /**
     * Полноэкранный режим
     */
    dialogFullscreen(mode) {
      this.popupDialog.fullscreen = !!mode
    },
    /**
     * Смена полноэкранного режима диалога
     */
    dialogToggleFullscreen() {
      this.popupDialog.fullscreen = !this.popupDialog.fullscreen
    }
  }
}
