import * as React from 'react'
import {Button, Segment, Header, Grid} from 'semantic-ui-react'

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
        return (<Segment basic vertical>
            <Grid>
                <Grid.Row>
                     <Grid.Column width="5"></Grid.Column>
                    <Grid.Column width="6">
            <Header>Sign In</Header>
            <p>
            {
                this.props.iam.data == null ? <div>
                    <Segment><Button onClick={() => { this.props.actions.signIn()  }} content="oAuth" loading={this.props.iam.loading} icon="key"/> Sign in using the HLS oAuth server</Segment>
                    <Segment disabled><Button content="AccessToken" icon="terminal" disabled /> Sign in using a provided AccessToken</Segment>
                    </div> : <Segment>You're signed in!</Segment> }</p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            </Segment>)
    }
}