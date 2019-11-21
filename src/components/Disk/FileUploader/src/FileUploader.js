let fileId = 0
function getId() {
  return ++fileId
}
import httpClient from '@/api/http-client'
/**
 *
 */
class FileUploader {
  /**
   * Constructor
   * @param {FileData} fileData
   * @param {String} uploadUrl
   */
  constructor(fileData, uploadUrl, additionData = {}) {
    this.id = getId()
    this.uploadUrl = uploadUrl
    this.fileData = fileData
    this.uploadPercentage = 0
    this.loaded = false
    this.loading = false
    this.diskFileData = null
    this.uploadPromise = null
    this.additionData = { ...additionData }
  }
  /**
   * Upload file
   */
  upload() {
    if (this.loaded === true || this.loading === true) {
      return
    }
    let formData = new FormData()
    formData.append('file', this.fileData)
    this.loading = true
    this.uploadPromise = httpClient.http
      .post(this.uploadUrl, formData, {
        timeout: 0,
        onUploadProgress: progressEvent => {
          this.uploadPercentage = parseInt(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          )
        }
      })
      .then(
        request => {
          this.uploadPercentage = 100
          this.diskFileData = request.data
          this.loaded = true
        },
        error => {}
      )
      .finally(_ => {
        this.loading = false
      })
  }
}
export default FileUploader

export function FromDiskData(diskFileData) {
  let file = new FileUploader({})
  file.diskFileData = diskFileData
  file.loaded = true
  file.uploadPercentage = 100
  return file
}
