import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import ScriptsTable from './connected/ScriptsTable'

export default class ScriptsIndex extends React.Component<{
    params: {
        organizationName: string,
        monitorPage: string
    }
},{
    search: string,
    duplicating: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            search: "",
            duplicating: false
        }
    }
    render() {
        return (<Segment basic vertical>
                 <Helmet title={`HLS - ${this.props.params.organizationName} - Scripts`} />
                <Header>Scripts</Header>
                    <Grid columns={3} stackable>
                        <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                            <Grid.Column>
                                <Header sub><Icon name="code" circular style={{ marginRight: 0 }} /><Header.Content>Create a Monitor Script </Header.Content></Header>
                                <p>Monitor scripts when active run locally and trigger alarms, protective actions, or interact with other systems. They can be writen in a variety of languages, initially javascript or python.</p>
                            </Grid.Column>
                            <Grid.Column>
                                <Header sub><Icon name="alarm outline" circular style={{ marginRight: 0 }} /><Header.Content>Create an Alarm </Header.Content></Header>
                                <p>Alarms are triggered by scripts and handle various notifications. They can send notifications to SMS, Slack, email, or other integrations.</p>
                            </Grid.Column>
                            <Grid.Column>
                                <Header sub><Icon name="protect" circular style={{ marginRight: 0 }} /><Header.Content>Create a Protection </Header.Content></Header>
                                <p>A protection is triggered by a script and takes action. i.e. turning off the power or water flow.</p>
                            </Grid.Column>
                        </Grid.Row>
                     <Grid.Row>
                     <Grid.Column>
                        <Button fluid>Create a New Script</Button>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                    <Divider />
                <ScriptsTable params={this.props.params} prefix={this.state.search} defaultSortTag="name" defaultSortDirection={-1} onClick={(row) => {
                    if (this.state.duplicating) {
                        browserHistory.push({
                            pathname: `/${this.props.params.organizationName}/scripts/create`,
                            query: {
                                'template': row.name
                            }
                        });
                    } else {
                        browserHistory.push(`/${this.props.params.organizationName}/scripts/${row.name.split('/scripts/')[1]}/`)
                    }
                }}/>
       </Segment>);
    }
}