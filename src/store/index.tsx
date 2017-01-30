import * as React from 'react'
import { createStore, combineReducers, compose, applyMiddleware, Store } from 'redux'
import { persistState, createDevTools, IDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'
import DevTools from '../components/DevTools'
import promiseMiddleware from '../reducers/clientMiddleware'
import ReduxThunk from 'redux-thunk' 
import { loadPersistantData } from '../actions/iam'

import rootReducer from '../reducers';

import { routerReducer, routerMiddleware } from 'react-router-redux'

declare const window: any;
const environment: any = typeof window !== 'undefined' ? window : this;

const enhancer = compose(
    applyMiddleware(
      promiseMiddleware
    ),
    applyMiddleware(
      ReduxThunk,
    ),
    DevTools.instrument()
)

export function configureStore(initialState) {

  const store = createStore(
    rootReducer,
    initialState,
    enhancer
  )

  store.dispatch(loadPersistantData())

  return store
}