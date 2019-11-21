<template lang="html">
  <div>
    <loading v-if="loading" flat :message="false" />

    <div v-show="edReady">
      <editor v-model="content" :init="editorConfig" :api-key="editorApiKey" id="editorInstructionID" :initial-value="text"></editor>
    </div>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'

export default {
  components: {
    Editor
  },

  props: {
    id: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      loading: true,
      edReady: false,

      editorConfig: {
        theme: 'modern',
        // plugins: 'autoresize print preview fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor imagetools contextmenu colorpicker textpattern',
        plugins: 'autoresize',
        toolbar: 'formatselect | fontselect | fontsizeselect | bold italic strikethrough forecolor backcolor | image media link | alignleft aligncenter alignright alignjustify  | numlist bullist | outdent indent  | removeformat | hr charmap fullscreen',
        menubar: false,
        image_advtab: false,
        language_url: '/static/tinymce_langs/ru.js',
        language: 'ru',
        autoresize_bottom_margin: 0,
        autoresize_min_height: 200,
        height: 200,
        setup: this.edSetup,
      },
      editorApiKey: "t19z3fx7xwcvas9m8ogdwjg110vmc8hbtnig4u88il6yve2r",
      
      content: ''
    }
  },

  methods: {
    edSetup: function(editor) {
      let self = this

      editor.on('init', e => {
        setTimeout(() => {
          self.loading = false
          self.edReady = true
        }, 300)
      })
    },

    onSubmit: function() {
      return new Promise((resolve, reject) => {
        // Submit the form.

        this.$store.commit('bpm/designer/process/instruction/setItem', {
          id: this.id,
          contentHTML: this.content
        })

        resolve(true)
      })
    }
  }
}
</script>
