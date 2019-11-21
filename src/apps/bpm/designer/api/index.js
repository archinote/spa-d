/**
 * API module
 * Includes full App API
 */
import { ApiModule } from '@/api/api-module'

import apiProcess from "./process"

// import { ApiIndicator } from "./indicator/ApiIndicator"
// import { ApiIndicatorState } from "./indicator/ApiIndicatorState"

// import { ApiPortStateBinding } from "./ApiPortStateBinding"

// import { ApiExecution } from "./ApiExecution"

import apiPort from "./port"
// import { ApiPortPublication } from "./publication"
// import { ApiPortPublicationAccess } from "./ApiPortPublicationAccess"

// import { ApiLink } from "./ApiLink"
// import { ApiLinkData } from "./ApiLinkData"

// import { ApiNestedProcess } from "./ApiNestedProcess"

import apiOrg from '@/apps/org/api/orgstructure'

// Array of all nested API modules.
let modules = [
  apiProcess,

  // apiIndicator,
  // apiIndicatorState,

  // apiExecution,
  // apiPortStateBinding,

  // ApiExecution,

  apiPort,
  // ApiLink,
  // ApiNestedProcess,
  
  apiOrg
]

// Create root Application API class
let api = new ApiModule('api')
api.addModules(modules)

// Export module class instance.
export default api
