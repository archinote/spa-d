/**
 * BPM root routes
 */
import routesDesigner from '../designer/router/routes'
import routesCatalog from '../catalog/router/routes'
import routesMonitor from '../monitor/router/routes'
import routesSuperMonitor from '../superMonitor/router/routes'

const routes = [
  {
    path: '',
    redirect: 'catalog'
  },
  {
    path: 'designer',
    name: 'bpm.designer',
    redirect: 'designer/',
    component: () => import('../designer'),
    children: routesDesigner
  },
  {
    path: 'catalog',
    name: 'bpm.catalog',
    redirect: 'catalog/',
    component: () => import('../catalog'),
    children: routesCatalog
  },
  {
    path: 'monitor',
    name: 'bpm.monitor',
    redirect: 'monitor/',
    component: () => import('../monitor'),
    children: routesMonitor
  },
  {
    path: 'super-monitor',
    name: 'bpm.super-monitor',
    redirect: 'super-monitor',
    component: () => import('../superMonitor'),
    children: routesSuperMonitor
  }
]

export default routes
