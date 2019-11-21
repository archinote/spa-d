/**
 * Routes list
 * API Port publication API
 */
const _prefix = String(process.env.API_PREFIX_BPM_MANAGER || '/bpm/v1/manager')

export default {
  // GET, 'port_id' parameter as list filter
  index: _prefix + "/publications",

  // PUT
  create: _prefix + "/ports/{port_id}/publications",

  // POST
  // update: "/" + version + "/businessprocessdesigner/public-port-update",

  // POST
  delete: _prefix + "/publications/{publication_id}",
}
