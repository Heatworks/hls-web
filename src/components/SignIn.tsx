import * as React from 'react'
import {Button, Segment, Header} from 'semantic-ui-react'

export default class SignIn extends React.Component<{
    iam: {
        loading: boolean,
        loaded: boolean,
        data: {
            accessToken: string
        }
    },
    actions: {
        signIn: () => any
    }
},{}> {
    constructor(props) {
        super(props)

    }
    render() {
        return (<Segment basic vertical><Header>Sign In</Header><p>
        {this.props.iam.data == null ? <Segment><Button onClick={() => {
            this.props.actions.signIn()
        }} content="Sign In" loading={this.props.iam.loading} /> Sign in using the oAuth link.</Segment> : <Segment>You're signed in!</Segment> }</p></Segment>)
    }
}