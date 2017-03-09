import * as React from 'react'
import { Table, Label, Button, Segment, Header, Grid, Icon, Image, Menu,Input, Divider } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import TestsTable from './connected/TestsTable'

export default class Tests extends React.Component<{
    params: {
        organizationName: string
    }
},{
    duplicating?: boolean,
    search?:string
}> {
    constructor(props) {
        super(props)
        this.state = {
            duplicating: false,
            search: ""
        }
        this.dataReceived = this.dataReceived.bind(this)
    }
    tempData = null
    dataReceived(data) {
        console.log(data)
        this.tempData = data
    }
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

                <Menu secondary>
                    <Menu.Menu position='right'>
                        <Menu.Item name="export" content="Export" icon="download" onClick={() => {
                                saveJSON(this.tempData, 'tests-list.json')
                            }} />
                    <Menu.Item>
                        <Input icon='search' placeholder='Search tests...' onChange={(e) => {
                            this.setState({
                                search: e.currentTarget.value.substr(0, e.currentTarget.value.lastIndexOf('/'))
                            })
                        }}/>
                    </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <TestsTable params={this.props.params} prefix={this.state.search} onClick={(row) => {
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
                }} onDataLoad={this.dataReceived}/>
       </Segment>);
    }
}

function saveJSON(data, filename){

    if(!data) {
        console.error('No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')
        a.setAttribute('target', '_blank')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}