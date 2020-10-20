import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

const NotFound = lazy(() => import('../pages/404'))
const Page = lazy(() => import('../components/Page'))
const Home = lazy(() => import('../pages/Home'))
const Trade = lazy(() => import('../pages/Trade'))
const Header = lazy(() => import('../components/Header'))

const Containers: CustomRouter.Route[] = [
	{
		name: 'Home',
		path: '/',
		exact: true,
		showHeader: true,
		component: Home
	},
	{
		name: 'Trade',
		path: '/trade',
		exact: true,
		showHeader: true,
		component: Trade
	},
	{
		name: '404',
		path: '/404',
		showHeader: false,
		exact: true,
		component: NotFound
	}
]

const RouterComp = ({ container, routeProps }: { container: CustomRouter.Route; routeProps: any }) => {
  return <container.component {...routeProps} />
}

export default () => {
	return (
		<Router>
				<Route
					render={(props: any) => (
            <Suspense fallback={<div>Loading...</div>}>
              <Header />
              <Switch location={props.location}>
                {
                  Containers.map(container => {
                    return (
                      <Route 
                        {...container}
                        key={container.name}
                        render={routeProps => <RouterComp container={container} routeProps={routeProps} />}
                      >
                      </Route>
                    )
                  })
                }
                <Redirect from="*" to="/404" />
              </Switch>
            </Suspense>
					)}>
				</Route>
		</Router>
	)
}