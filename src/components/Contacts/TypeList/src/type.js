import { mapState, mapActions } from 'vuex'
export default {
  name: 'DContactTypeList',
  mounted() {
    if (this.types.length == 0) {
      this.loadTypes()
    }
  },
  methods: {
    ...mapActions('app/contacts', ['loadTypes'])
  },
  computed: {
    ...mapState('app/contacts', ['types'])
  },
  render(h) {
    return this.$scopedSlots.default
      ? this.$scopedSlots.default(this.types)
      : null
  }
}
