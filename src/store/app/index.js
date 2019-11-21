/**
 * Store module.
 * App store module
 *
 * Namespace: 'app/'
 */
import layout from './layout'
import faker from './faker'
import helpers from './helpers'

// Import apps common modules
import account from '@/apps/account/store/common'
import org from '@/apps/org/store/common'
import contacts from '@/apps/crm/contacts/store/common'
import notifications from '@/apps/notifications/store'

export default {
  namespaced: true,
  modules: {
    helpers,
    faker,
    account,
    layout,
    org,
    contacts,
    notifications
  }
}
