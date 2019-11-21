'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',

  APP_BASE_URL:           JSON.stringify(process.env.APP_BASE_URL || '/'),
  APP_ASSETS_PATH:        JSON.stringify(process.env.APP_ASSETS_PATH || '/'),

  API_BASE_URL:           JSON.stringify(process.env.API_BASE_URL || '/api'),
  API_PREFIX_ACCOUNT:     JSON.stringify(process.env.API_PREFIX_ACCOUNT || '/account/v1'),
  API_PREFIX_ANKETA:      JSON.stringify(process.env.API_PREFIX_ANKETA || '/worksheet/v1'),
  API_PREFIX_INTERFACES:  JSON.stringify(process.env.API_PREFIX_INTERFACES || '/interfaces/v1'),
  API_PREFIX_ORG:         JSON.stringify(process.env.API_PREFIX_ORG || '/orgstructure/v1'),

  API_PREFIX_BPM_DESIGNER:    JSON.stringify(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer'),
  API_PREFIX_BPM_MANAGER:     JSON.stringify(process.env.API_PREFIX_BPM_MANAGER || '/bpm/v1/manager'),
  API_PREFIX_BPM_CATALOG:     JSON.stringify(process.env.API_PREFIX_BPM_CATALOG || '/bpm/v1/catalog'),
  API_PREFIX_BPM_EXECUTOR:    JSON.stringify(process.env.API_PREFIX_BPM_EXECUTOR || '/bpm/v1/executor'),
  API_PREFIX_BPM_SUPERVISOR:  JSON.stringify(process.env.API_PREFIX_BPM_SUPERVISOR || '/bpm/v1/supervisor'),

  APP_AUTH_URL:           JSON.stringify(process.env.APP_AUTH_URL || '/auth'),
  APP_ACCOUNT_URL:        JSON.stringify(process.env.APP_ACCOUNT_URL || '/account'),
  APP_ORG_URL:            JSON.stringify(process.env.APP_ORG_URL || '/org')
})
