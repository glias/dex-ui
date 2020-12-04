import { useNotifyTransaction } from 'hooks/useNotifyTransaction'
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import NotFound from '../pages/404'
import Match from '../pages/Match'
import Pool from '../pages/Pool'
import Trade from '../pages/Trade'

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
  useNotifyTransaction()

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
