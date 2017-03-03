import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Menu, Container, Segment, Header } from 'semantic-ui-react'

import HeaderMenu from './connected/HeaderMenu'
import Monitor from "./connected/Monitor"
import Helmet from "react-helmet"

export default class App extends React.Component<{
    params: any,
    location: string
}, {}> {
    render() {
        return (
            <div>
                <Helmet
                    title="HLS"
                    meta={[
                        { name: 'apple-mobile-web-app-capable', content: 'yes' },
                        { name: 'apple-mobile-web-app-status-bar-style', content: 'default'}
                    ]}
                    link={[
                        { rel: "apple-touch-icon", href: require("../resources/icon.png") },
                    ]}
                 />
                <Segment basic>
                    <HeaderMenu location={this.props.location} />
                    <div style={{ marginTop: 44, paddingBottom: 26 }}>
                        {this.props.children}
                    </div>
                </Segment>
                <Monitor params={this.props.params} />
            </div>   
        )
    }
}
