import { combineReducers, Action, applyMiddleware } from 'redux'
import createMiddleware from './clientMiddleware';
import { routerReducer } from 'react-router-redux';
import data from './data'
import tests from './tests'
import views from './views'
import scripts from './scripts'
import iam from './iam'
import dac from './dac'
import monitor from './monitor'
import standalone from './standalone'

const app = combineReducers({
    routing: routerReducer,
    data,
    tests,
    iam,
    dac,
    monitor,
    views,
    scripts,
    standalone
})

export default app