/**
 * BPM root routes
 */
import Home from '../pages/Home'
import CreatingNew from '../pages/CreatingNew'
import ProcessEditor from '../pages/ProcessEditor'

const routes = [
  {
    path: '',
    name: 'bpm.designer.home',
    component: Home
  },
  {
    path: 'new',
    name: 'bpm.designer.new',
    component: CreatingNew
  },
  {
    path: 'edit/:processId',
    name: 'bpm.designer.edit-process',
    component: ProcessEditor
  },
  // {
  //   path: '/settings',
  //   name: 'bpm.designer.settings',
  //   component: Settings
  // }
]

export default routes
