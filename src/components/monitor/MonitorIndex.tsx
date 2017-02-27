import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'

export default class ViewsIndex extends React.Component<{
    params: {
        organizationName: string,
        monitorPage: string
    }
},{}> {
    render() {
        return (<Segment basic vertical>
                 <Helmet title={`HLS - ${this.props.params.organizationName} - Monitor`} />
                <Header>Monitor</Header>
                    <Grid columns={3} stackable>
                        <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                            <Grid.Column>
                                <Header subheader><Icon name="code" circular style={{ marginRight: 0 }} /><Header.Content>Create a Monitor Script </Header.Content></Header>
                                <p>Monitor scripts when active run locally and trigger alarms, protective actions, or interact with other systems. They can be writen in a variety of languages, initially javascript or python.</p>
                            </Grid.Column>
                            <Grid.Column>
                                <Header subheader><Icon name="alarm outline" circular style={{ marginRight: 0 }} /><Header.Content>Create an Alarm </Header.Content></Header>
                                <p>Alarms are triggered by scripts and handle various notifications. They can send notifications to SMS, Slack, email, or other integrations.</p>
                            </Grid.Column>
                            <Grid.Column>
                                <Header subheader><Icon name="protect" circular style={{ marginRight: 0 }} /><Header.Content>Create a Protection </Header.Content></Header>
                                <p>A protection is triggered by a script and takes action. i.e. turning off the power or water flow.</p>
                            </Grid.Column>
                        </Grid.Row>
                     <Grid.Row>
                     <Grid.Column>
                        <Button fluid>Create a New Monitor Script</Button>
                    </Grid.Column>
                    <Grid.Column>
                        <Button fluid>Create a New Alarm</Button>
                    </Grid.Column>
                     <Grid.Column>
                        <Button fluid>Create a New Protection</Button>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                    <Divider />
                    <Menu secondary>
                    <Menu.Item name='monitors' active={(this.props.params.monitorPage == 'monitors' || this.props.params.monitorPage == undefined)} as={Link} {...{to: `/${this.props.params.organizationName}/monitor/monitors`}} />
                    <Menu.Item name='scripts' active={(this.props.params.monitorPage == 'scripts')} as={Link} {...{to: `/${this.props.params.organizationName}/monitor/scripts`}}/>
                    <Menu.Item name='alarms' active={(this.props.params.monitorPage == 'alarms')} as={Link} {...{to: `/${this.props.params.organizationName}/monitor/alarms`}}/>
                    <Menu.Item name='protections' active={(this.props.params.monitorPage == 'protections')} as={Link} {...{to: `/${this.props.params.organizationName}/monitor/protections`}}/>
                    <Menu.Menu position='right'>
                    <Menu.Item>
                        <Input icon='search' placeholder='Search scripts...' />
                    </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Table>
                    <Table.Row>
                    </Table.Row>
                </Table>
       </Segment>);
    }
}