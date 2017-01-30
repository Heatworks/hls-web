import * as React from 'react';
import { Provider } from 'react-redux';
import DevTools from '../components/DevTools';
import { Router } from 'react-router';
import routes from '../routes';

export default class Root extends React.Component<{ store: any, history: any },{}> {
    render() {
        const { store, history } = this.props;
        return (
            <Provider store={store}>
                <div>
                    <Router history={history} routes={routes} />
                    <DevTools />
                </div>
            </Provider>
        );
    }
}