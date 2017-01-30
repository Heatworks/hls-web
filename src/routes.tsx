import * as React from "react"
import { Provider } from "react-redux"
import { Route, browserHistory, IndexRoute, Router } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import App from './components/App'
import DevTools from './components/DevTools'

import A from './components/connected/A'
import SignInSuccess from './components/SignInSuccess'
import Tests from './components/tests/Tests'
import SignIn from './components/connected/SignIn'
import SignOut from './components/connected/SignOut'
import Test from './components/tests/connected/Test'
import TestCreate from './components/tests/connected/TestCreate'
import IAMIndex from './components/iam/IAMIndex'
import UsersTable from './components/iam/connected/UsersTable'
import DACIndex from './components/dac/DACIndex'
import ViewsIndex from './components/views/ViewsIndex'
import Device from './components/dac/connected/Device'
import View from './components/views/connected/View'
import Index from './components/static/Index'

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="signIn" component={SignIn} />
        <Route path="signIn_redirect" component={SignInSuccess} />
        <Route path="signOut" component={SignOut} />
        <Route path=":organizationName/" onEnter={authentication}>
            <IndexRoute component={Index} />
            <Route component={App} />
            <Route path="tests/">
                <IndexRoute component={Tests} />
                <Route path="create" component={TestCreate} />
                <Route path="**/" component={Test} />
            </Route>
             <Route path="iam/">
                <IndexRoute component={IAMIndex} />
                <Route path=":iamPage(/:iamId)" component={IAMIndex} />
            </Route>
            <Route path="dac/">
                <IndexRoute component={DACIndex} />
                <Route path=":dacPage(/:dacId)" component={DACIndex} />
                <Route path="devices/**/" component={Device} />
            </Route>
            <Route path="views/">
                <IndexRoute component={ViewsIndex} />
                <Route path="**/" component={View} />
            </Route>
        </Route> 
    </Route>
);

function authentication(nextState, replace, callback) {
    console.log('Check Authentication!')
    callback()
}