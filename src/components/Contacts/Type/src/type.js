export default {
  name: 'DContactType',
  props: {
    id: {
      required: true
    }
  },
  mounted() {
    if (!this.loaded) {
      this.load()
    }
  },
  methods: {
    load() {
      this.$store.dispatch('app/contacts/loadTypes', this.id)
    }
  },
  computed: {
    type() {
      return this.$store.getters['app/contacts/getTypeById'](this.id)
    },
    loaded() {
      return this.type.loaded !== false
    }
  },
  render(h) {
    return this.$scopedSlots.default
      ? this.$scopedSlots.default(this.type)
      : null
  }
}
