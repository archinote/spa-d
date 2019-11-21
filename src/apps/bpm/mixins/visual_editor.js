/** 
 * 
 */
import Editor from '@tinymce/tinymce-vue'

export default {
  components: {
    Editor
  },

  data() {
    return {
      editorConfig: {
        theme: 'modern',
        plugins: 'autoresize',
        toolbar: 'bold italic strikethrough | alignleft aligncenter alignright alignjustify | numlist bullist | outdent indent  | removeformat',
        menubar: false,
        image_advtab: false,
        language_url: '/static/tinymce_langs/ru.js',
        language: 'ru',
        autoresize_bottom_margin: 0,
        autoresize_min_height: 40,
        autoresize_max_height: 400,
        height: 40,
        setup: this.edSetup,
      },
      editorApiKey: "t19z3fx7xwcvas9m8ogdwjg110vmc8hbtnig4u88il6yve2r",
    }
  },

  methods: {
    edSetup: function (editor) {
      let self = this

      editor.on('init', e => {
        setTimeout(() => {
          self.loading = false
          self.edReady = true
        }, 300)
      })
    }
  }
}