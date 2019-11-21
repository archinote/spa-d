/**
 * API module
 * Includes full App API
 */
import { ApiModule } from './api-module'
import apiAccount from '@/apps/account/api'
import apiOrg from '@/apps/org/api/orgstructure'
// import { apiBpm } from './bpm'

// Array of available (public) API modules.
let modules = [
  apiAccount,
  apiOrg,
  // apiBpm
]

// Create root API class
let api = new ApiModule('api')
api.addModules(modules)

// Export module class instance.
export default api
