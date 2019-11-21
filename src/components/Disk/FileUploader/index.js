import FileUploader from './src/Uploader';

FileUploader.install = function(Vue) {
  Vue.component(FileUploader.name, FileUploader); 
};

export default FileUploader;