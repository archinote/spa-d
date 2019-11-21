/**
 * Get pagination params
 * @param {*} params
 */
export function getListPagination(params) {
  let pagination = {
    page: parseInt(params['page']) || 1,
    rowsPerPage: parseInt(params['rowsPerPage']) || 10,
    sortBy: params['sortBy'] || null,
    descending: !!params['descending']
  }
  return pagination
}
