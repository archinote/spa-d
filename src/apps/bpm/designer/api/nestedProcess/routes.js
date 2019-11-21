/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models/{model_id}/submodels",

  // PUT
  create: _prefix + "/models/{model_id}/submodels",

  // GET
  show: _prefix + "/models/{model_id}/submodels/{submodel_id}",

  // PATCH
  update: _prefix + "/models/{model_id}/submodels/{submodel_id}",

  // DELETE
  delete: _prefix + "/models/{model_id}/submodels/{submodel_id}"
}
