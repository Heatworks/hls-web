import * as React from 'react'
import { Table, Label, Button, Segment, Header, Grid, Icon, Image, Menu,Input, Divider } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import TestsTable from './connected/TestsTable'

import { Test } from '../../apis/hls_tests'
var moment = require('moment')

export default class Tests extends React.Component<{
    params: {
        organizationName: string,
        splat: string
    }
},{
    duplicating?: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            duplicating: false
        }
    }
    tempData = null
    render() {
        return (<Segment basic vertical>
                 <Helmet title={`HLS - ${this.props.params.organizationName} - Tests`} />
                <Header>Tests</Header>
                    <Grid columns={3} stackable>
                    <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                    <Grid.Column>
                        <Header subheader><Icon name="flask" circular /><Header.Content>Create a Test <Header sub>What happens when...</Header></Header.Content></Header>
                        <p>A test is a collection of related data within a time range. During a test you can monitor current values and after the test you can export the data for further analysis.</p>
                    </Grid.Column>
                    <Grid.Column>
                        <Header subheader><Icon name="copy" circular /><Header.Content>Duplicate a Test <Header sub>Try, try, again...</Header></Header.Content></Header>
                        <p>Often when you get a test setup properly you'll want to rerun it multiple times. Duplicating a test makes setting up a similar test quick and easy.</p>
                    </Grid.Column>
                    <Grid.Column>
                        <Header subheader><Icon name="bookmark" circular /><Header.Content>Create Templates <Header sub>/tests/templates/...</Header></Header.Content></Header>
                        <p>Another strategy for reusing tests is to create template tests with your channels and tags ready to go.</p>
                    </Grid.Column>
                     </Grid.Row>
                     <Grid.Row>
                     <Grid.Column>
                        <Button fluid as={Link} {...{to:`/${this.props.params.organizationName}/tests/create`}}>Create a New Test</Button>
                    </Grid.Column>
                    <Grid.Column>
                        <Button fluid onClick={() => {
                            this.setState({
                                duplicating: !this.state.duplicating
                            })
                        }} active={this.state.duplicating}>Create a Duplicate</Button>
                    </Grid.Column>
                    <Grid.Column>
                        <Button fluid onClick={() => {
                            browserHistory.push({
                                pathname: `/${this.props.params.organizationName}/tests/create`,
                                query: {
                                    'name': 'templates/'
                                }
                            });
                        }}>Create a Template</Button>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                                        <Divider />

                
                <TestsTable params={this.props.params} showDuration={true} prefix={this.props.params.splat ? this.props.params.splat + '/' : null} onClick={(row) => {
                    if (this.state.duplicating) {
                        browserHistory.push({
                            pathname: `/${this.props.params.organizationName}/tests/create`,
                            query: {
                                'template': row.name
                            }
                        });
                    } else {
                        browserHistory.push(`/${this.props.params.organizationName}/tests/${row.name.split('/tests/')[1]}/`)
                    }
                }}/>
       </Segment>);
    }
}
