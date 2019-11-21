export default {
  name: "DBeing",
  props: {
    id: {
      required: true
    },
    type: {
      type: String,
      required: true
    },
    data: {}
  },
  mounted() {
    if (!this.loaded) {
      this.load()
    }
  },
  methods: {
    load() {
      let data = {}
      data[this.type] = this.id
      this.$store.dispatch("app/org/loadEntity", data)
    }
  },
  computed: {
    being() {
      let getter = this.type === "container"
        ? "app/org/getContainerById"
        : "app/org/getPostById"
      return this.$store.getters[getter](this.id)
    },
    loaded() {
      return this.being.loaded !== false
    }
  },
  render(h) {
    const {id,type,data,being} = this
    return this.$scopedSlots.default ? this.$scopedSlots.default({id,type,data,being}) : null
  }
}
