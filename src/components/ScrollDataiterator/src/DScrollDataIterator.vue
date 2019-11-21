

<script>
import iterator from 'vuetify/es5/components/VDataIterator/VDataIterator.js'
export default {
  name: 'DScrollDataIterator',
  mixins: [iterator],
  props: {
    contentClass: {
      type: String,
      default: 'd-scroll-data-iterator__content'
    },
    headerClass: {
      type: String,
      default: ''
    },
    footerClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    dmsClasses() {
      return ['d-scroll-data-iterator', ...this.classes]
    }
  },
  methods: {
    genFooter() {
      var children = []
      if (this.$slots.footer) {
        children.push(this.$slots.footer)
      }
      if (!this.hideActions) {
        children.push(this.genActions())
      }
      if (!children.length) return null
      let data = {
        class: ['d-scroll-data-iterator__footer', this.footerClass]
      }
      return this.$createElement('div', data, children)
    },
    genContent: function genContent() {
      var children = this.genItems()
      var data = {
        class: this.contentClass,
        attrs: this.$attrs,
        on: this.$listeners,
        props: this.contentProps
      }
      if (this.$slots.contentBottom) {
        children.push(this.$slots.contentBottom)
      }
      return this.$createElement(this.contentTag, data, children)
    },
    genHeader: function genHeader() {
      var children = []
      if (this.$slots.header) {
        children.push(this.$slots.header)
      }
      if (!children.length) return null
      let data = {
        class: ['d-scroll-data-iterator__header', this.headerClass]
      }
      return this.$createElement('div', data, children)
    },
    genScroller() {
      let content = [this.genContent()]
      let data = {
        class: 'd-scroll-data-iterator__wrapper'
      }
      let scroller = this.$createElement(
        'div',
        { class: 'd-scroll-data-iterator__scroller', ref: 'scroller' },
        content
      )
      return this.$createElement('div', data, [scroller])
    },
    scrollerTo(options) {
      if (this.$refs.scroller && this.$refs.scroller.scroll) {
        this.$refs.scroller.scroll(options)
      }
    }
  },
  render(h) {
    return h(
      'div',
      {
        class: this.dmsClasses
      },
      [this.genHeader(), this.genScroller(), this.genFooter()]
    )
  }
}
</script>

<style lang="scss">
.d-scroll-data-iterator {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  &__wrapper {
    flex: 1 1 auto;
    position: relative;
  }
  &__scroller {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;
  }
}
</style>