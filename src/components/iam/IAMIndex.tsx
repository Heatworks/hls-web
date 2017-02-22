import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import UsersTable from './connected/UsersTable'
import AccessTokensTable from './connected/AccessTokensTable'

export default class IAMIndex extends React.Component<{
    params: {
        organizationName: string,
        iamPage: string
    },
    children: any
},{}> {
    render() {
        return (<Segment basic vertical>
                 <Helmet title={`HLS - ${this.props.params.organizationName} - IAM`} />
                <Header>Identity Access Management (IAM)</Header>
                    <Grid columns={3} stackable>
                    <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                    <Grid.Column>
                        <Header subheader><Icon name="user" circular /><Header.Content>Add a User </Header.Content></Header>
                        <p>A user can take actions within the system based on their policy. When a user signs in an Access Token is created.</p>
                    </Grid.Column>
                     </Grid.Row>
                     <Grid.Row>
                     <Grid.Column>
                        <Button fluid>Create a New User</Button>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                    <Divider />
                <Menu secondary>
                    <Menu.Item name='users' active={(this.props.params.iamPage == 'users' || this.props.params.iamPage == undefined)} as={Link} {...{to: `/${this.props.params.organizationName}/iam/users`}} />
                    <Menu.Item name='accessTokens' active={(this.props.params.iamPage == 'accessTokens')} as={Link} {...{to: `/${this.props.params.organizationName}/iam/accessTokens`}}/>
                    <Menu.Menu position='right'>
                    <Menu.Item>
                        <Input icon='search' placeholder='Search users...' />
                    </Menu.Item>
                    </Menu.Menu>
                </Menu>
                {this.props.params.iamPage == "users" || this.props.params.iamPage == undefined ? <UsersTable params={this.props.params} /> : null}
                {this.props.params.iamPage == "accessTokens" ? <AccessTokensTable params={this.props.params} /> : null}
       </Segment>);
    }
}