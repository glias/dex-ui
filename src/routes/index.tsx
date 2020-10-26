import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

const NotFound = lazy(() => import('../pages/404'))
const Trade = lazy(() => import('../pages/Trade'))
const Header = lazy(() => import('../components/Header'))
const Footer = lazy(() => import('../components/Footer'))
const Pool = lazy(() => import('../pages/Pool'))
const Match = lazy(() => import('../pages/Match'))

const Containers: CustomRouter.Route[] = [
  {
    name: 'Home',
    path: '/',
    exact: true,
    showHeader: true,
    component: Trade,
  },
  {
    name: 'Trade',
    path: '/trade',
    exact: true,
    showHeader: true,
    component: Trade,
  },
  {
    name: 'Pool',
    path: '/pool',
    exact: true,
    showHeader: true,
    component: Pool,
  },
  {
    name: 'Match',
    path: '/match',
    exact: true,
    showHeader: true,
    component: Match,
  },
  {
    name: '404',
    path: '/404',
    showHeader: false,
    exact: true,
    component: NotFound,
  },
]

export default () => {
  return (
    <Router>
      <Suspense fallback={<div />}>
        <Header />
        <Switch>
          {Containers.map(container => {
            return <Route {...container} key={container.name} path={container.path} />
          })}
          <Redirect from="*" to="/404" />
        </Switch>
        <Footer />
      </Suspense>
    </Router>
  )
}
