<script>
import TinymceEditor from './Editor'
import VTextField from 'vuetify/es5/components/VTextField/VTextField'
const conf = { 
  theme: 'modern',
  plugins: 'autoresize',
  autoresize_bottom_margin: 0,
  autoresize_min_height: 20,
  toolbar: 'bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify  | numlist bullist | removeformat',
  language_url: '/static/tinymce_langs/ru.js',
  language: 'ru',
  menubar: false,
  statusbar: false,
  height: 20
  //content_css: ['//fonts.googleapis.com/css?family=Lato:300,300i,400,400i', '//www.tinymce.com/css/codepen.min.css']
}
export default {
  name: 'DEditor',
  components: {
    TinymceEditor
  },
  extends: VTextField,
  props: {
    config: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    apiKey() {
      return 't19z3fx7xwcvas9m8ogdwjg110vmc8hbtnig4u88il6yve2r'
    },
    classes() {
      return Object.assign({}, VTextField.options.computed.classes.call(this), {
        'v-textarea v-dantser-editor': true
      })
    },
    editorConfig() {
      let config = Object.assign({}, conf, this.config)
      return config
    }
  },
  methods: {
    onInput: function onInput(e) {
      this.internalChange = true
      this.internalValue = e
    },
    onFocus: function onFocus(e) {
      if (!this.$refs.input) return
      if (!this.isFocused) {
        this.isFocused = true
        this.$emit('focus', e)
      }
    },
    genInput() {
      const listeners = Object.assign({}, this.$listeners)
      delete listeners['change'] // Change should not be bound externally
      const data = {
        style: {},
        props: {
          value: this.maskText(this.lazyValue),
          init: this.editorConfig,
          apiKey: this.apiKey,
          disabled: this.disabled
        },
        attrs: {
          'aria-label': (!this.$attrs || !this.$attrs.id) && this.label,
          ...this.$attrs,
          autofocus: this.autofocus,
          readonly: this.readonly,
          type: this.type
        },
        on: Object.assign(listeners, {
          onBlur: this.onBlur,
          input: this.onInput,
          onFocus: this.onFocus,
          onKeyDown: this.onKeyDown
        }),
        ref: 'input'
      }

      if (this.placeholder) data.attrs.placeholder = this.placeholder
      if (this.mask) data.attrs.maxlength = this.masked.length
      if (this.browserAutocomplete) data.attrs.autocomplete = this.browserAutocomplete

      return this.$createElement(TinymceEditor, data)
    }
  }
}
</script>
<style lang="scss">
.v-dantser-editor {
  .v-label {
    z-index: 1;
  }
  .mce-tinymce {
    border: none;
    box-shadow: none;
    padding: 7px 0 8px;
  }
  .mce-top-part {
    border: none;
    opacity: 0;
    visibility: hidden;
    transition: 50ms opacity;
  }
  .mce-edit-area {
    border: none;
  }
  &.v-input--is-label-active,
  &.v-input--is-focused {
    .mce-top-part {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
