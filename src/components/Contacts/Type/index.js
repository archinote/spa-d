import ContactType from './src/type.js';

ContactType.install = function(Vue) {
  Vue.component(ContactType.name, ContactType); 
};

export default ContactType;