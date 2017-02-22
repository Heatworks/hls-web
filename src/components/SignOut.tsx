import * as React from 'react'
import {Button, Segment} from 'semantic-ui-react'

export default class SignOut extends React.Component<{
    iam: {
        loading: boolean,
        loaded: boolean,
        data: {
            accessToken: string
        }
    },
    actions: {
        signOut: () => any
    }
},{}> {
    constructor(props) {
        super(props)
        this.props.actions.signOut()
    }
    render() {
        return (<div>
            <header>Sign In</header><p>
        {(this.props.iam.data == null) ? <Segment>Signed Out!</Segment> : <Segment>Signing out...</Segment> }</p></div>)
    }
}