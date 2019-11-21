import { loadContact } from '@/apps/crm/contacts/api'
export default {
  name: 'DContact',
  props: {
    contact_id: {
      required: true
    }
  },
  data() {
    return {
      currentContact: null,
      error: false
    }
  },
  watch: {
    contact_id: {
      handler: 'loadContant',
      immediate: true
    }
  },
  methods: {
    loadContant() {
      this.error = false
      if (!this.contact_id) {
        this.currentContact = null
        return
      }
      if (this.currentContact && this.currentContact.id == this.contact_id) {
        return
      }
      loadContact(this.contact_id).then(
        contact => {
          this.currentContact = contact
        },
        error => {
          this.error = true
        }
      )
    }
  },
  computed: {
    contact() {
      return this.currentContact
    },
    loaded() {
      return (
        !this.contact_id ||
        (this.currentContact && this.currentContact.id === this.contact_id)
      )
    }
  },
  render(h) {
    const { contact_id, contact, loaded, loadContact, error } = this
    return this.$scopedSlots.default
      ? this.$scopedSlots.default({
          contact_id,
          contact,
          loaded,
          loadContact,
          error
        })
      : null
  }
}
