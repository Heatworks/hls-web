import { combineReducers, Action, applyMiddleware } from 'redux'
import createMiddleware from './clientMiddleware';
import { routerReducer } from 'react-router-redux';
import data from './data'
import tests from './tests'
import iam from './iam'
import dac from './dac'
import monitor from './monitor'

const app = combineReducers({
    routing: routerReducer,
    data,
    tests,
    iam,
    dac,
    monitor
})

export default app