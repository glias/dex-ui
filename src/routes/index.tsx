import React, { Suspense } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import NotFound from '../pages/404'
import Trade from '../pages/Trade'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Pool from '../pages/Pool'

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
