/**
 * Routes list
 * API Execution API
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models/{model_id}/contractors",

  // PUT
  create: _prefix + "/models/{model_id}/contractors",

  // GET
  show: _prefix + "/models/{model_id}/contractors/{contractor_id}",

  // PATCH
  // update: _prefix + "/models/{model_id}/contractors/{contractor_id}",
  update: _prefix + "/models/{model_id}/contractors",

  // DELETE
  delete: _prefix + "/models/{model_id}/contractors/{contractor_id}"
}
