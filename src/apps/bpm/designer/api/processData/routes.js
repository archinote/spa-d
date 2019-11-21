/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + '/models/{model_id}/parameters',

  // PUT
  create: _prefix + '/models/{model_id}/parameters',

  // GET
  show: _prefix + '/models/{model_id}/parameters/{data_id}',

  // PATCH
  update: _prefix + '/models/{model_id}/parameters/{data_id}',

  // DELETE
  delete: _prefix + '/models/{model_id}/parameters/{data_id}',

  // Each process data (model parameters) may have bindings:
  //  - with own process port
  //  - with nested process data

  // Own ports bindings
  portBinding: {
    // GET
    index: _prefix + '/models/{model_id}/parameters-bindings',

    // PUT
    create: _prefix + '/models/{model_id}/parameters-bindings',

    // GET
    show: _prefix + '/models/{model_id}/parameters-bindings/{binding_id}',

    // PATCH
    update: _prefix + '/models/{model_id}/parameters-bindings/{binding_id}',

    // PATCH
    updateAll: _prefix + '/models/{model_id}/parameters-bindings',

    // DELETE
    delete: _prefix + '/models/{model_id}/parameters-bindings/{binding_id}',

    // PATCH
    deleteAll: _prefix + '/models/{model_id}/parameters-bindings'
  },

  // Nested process data bindings
  nestedDataBinding: {
    // GET
    index: _prefix + '/models/{model_id}/parameters-links',

    // PUT
    create: _prefix + '/models/{model_id}/parameters-links',

    // GET
    show: _prefix + '/models/{model_id}/parameters-links/{binding_id}',

    // PATCH
    update: _prefix + '/models/{model_id}/parameters-links/{binding_id}',

    // PATCH
    updateAll: _prefix + '/models/{model_id}/parameters-links',

    // DELETE
    delete: _prefix + '/models/{model_id}/parameters-links/{binding_id}',

    // PATCH
    deleteAll: _prefix + '/models/{model_id}/parameters-links'
  }
}
