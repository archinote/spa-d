/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models/{model_id}/ports-links",

  // PUT
  create: _prefix + "/models/{model_id}/ports-links",

  // GET
  show: _prefix + "/models/{model_id}/ports-links/{port_link_id}",

  // PATCH
  update: _prefix + "/models/{model_id}/ports-links/{port_link_id}",

  // DELETE
  delete: _prefix + "/models/{model_id}/ports-links/{port_link_id}",

  //
  // Link Data.
  //
  data: {
    // GET
    show:  _prefix + "/models/{model_id}/freak/{link_id}",

    // PATCH
    sharedPorts:  _prefix + "/models/{model_id}/ports-links/{port_link_id}/port_data_links",

    // PATCH
    linkDataSettings:  _prefix + "/models/{model_id}/ports-links/{port_link_id}/data_links"
  }
}
