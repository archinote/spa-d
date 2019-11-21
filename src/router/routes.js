/**
 * 
 */
import Wellcome from '@/components/Wellcome/'
import routesAuth from '../apps/auth/router/routes'
import routesAccount from '../apps/account/router/routes'
import routesOrg from '../apps/org/router/routes'
import routesBpm from '../apps/bpm/router/routes'
import routesCrm from '@/apps/crm/routes'
import routesMail from '@/apps/mail/routes'
import routesHelp from '@/apps/help/router/routes'
import routesHelpAccount from '@/apps/help/router/routes_account'
import routesAnalytics from '@/apps/analytics/router/routes'
import routesDisk from '@/apps/disk/router/routes'

const PageNotFound = { 
  template: '', 
  created: function() {
    // Redirect outside the app using plain old javascript
    window.location.href = "/404.html"
  }
}

const childRouteComponent = { 
  template: '<router-view></router-view>' 
}

export default [
  /*{
    path: '/',
    name: 'wellcome',
    component: Wellcome,
    meta: { public: true, noPostContext: true }
  },*/
  {
    path: '/',
    name: 'auth',
    // redirect: '/auth/',
    // component: childRouteComponent,
    component: () => import('@/apps/auth'),
    meta: { public: true, noPostContext: true },
    children: routesAuth
  },
  {
    path: '/account',
    name: 'account',
    redirect: '/account/',
    // component: childRouteComponent,
    component: () => import('@/apps/account'),
    meta: { noPostContext: true },
    children: routesAccount
  },
  {
    path: '/disc/:token',
    name: 'publicDisk',
    component: () => import('@/apps/disk/public'),
    meta: { noPostContext: true, public: true, },
  },
  {
    path: '/help',
    component: () => import('@/apps/help'),
    meta: { noPostContext: true },
    children: routesHelpAccount
  },
  {
    path: '/:cid',
    component: childRouteComponent,
    // name: 'companyHome',
    // component: () => import('@/components/PostHome'),
    children: [
      /*{
        path: '',
        name: 'companyHome',
        component: () => import('@/components/PostHome'),
      },*/
      {
        path: 'org',
        name: 'org',
        redirect: 'org/',
        component: () => import('@/apps/org'),
        children: routesOrg
      },
      {
        path: 'bpm',
        name: 'bpm',
        redirect: 'bpm/',
        component: () => import('@/apps/bpm'),
        children: routesBpm
      },
      {
        path: 'crm',
        name: 'crm',
        redirect: 'crm/',
        component: () => import('@/apps/crm'),
        children: routesCrm
      },
      {
        path: 'mail',
        name: 'mail',
        redirect: 'mail/',
        component: () => import('@/apps/mail'),
        children: routesMail
      },
      {
        path: 'help',
        name: 'help',
        redirect: 'help/',
        component: () => import('@/apps/help'),
        children: routesHelp
      },
      {
        path: 'analytics',
        name: 'analytics',
        redirect: 'analytics/',
        component: () => import('@/apps/analytics'),
        children: routesAnalytics
      },
      {
        path: 'disk',
        name: 'disk',
        redirect: 'disk/',
        component: () => import('@/apps/disk'),
        children: routesDisk
      },
    ]
  },

  // { path: '*', name: 'notFound', redirect: '/404' },
  { path: "*", name: 'notFound', component: PageNotFound }
]

export const anotherRouterMap = []
