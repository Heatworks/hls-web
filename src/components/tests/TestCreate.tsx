import * as React from 'react'
import { Table, Label, Button, Segment, Header, Grid, Icon, Image, Input, Form } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import TestsTable from './connected/TestsTable'

const BlankTest = {
    name: '',
    channels: [],
    tags: {},
    description: '',
    range: [],
    markers: []
}

export default class TestCreate extends React.Component<{
    params: {
        organizationName: string
    },
    accessToken: string,
    actions: {
        save: (test: any, accessToken:string) => any,
        load: (name: string, accessToken: string) => any,
        checkExists: (name: string, accessToken: string) => any
    },
    test: {
        saving: boolean,
        saved: boolean,
        loading: boolean,
        loaded: boolean,
        data: any
    },
    exists: {
        name: string,
        exists: boolean,
        loading: boolean,
        loaded: boolean
    }
    location: any
},{
    name?: string,
    prefixSearch?: string,
    description?: string,
    template?: string,
    testBase?: any
}> {
    constructor(props) {
        super(props)
        if  (this.props.location.query.template) {
            this.loadBaseTest(this.props.location.query.template);
        }
        this.state = {
            name: (this.props.location.query.name) ? this.props.location.query.name : "",
            prefixSearch: "",
            description: "",
            template: (this.props.location.query.template) ? this.props.location.query.template : "",
            testBase: BlankTest
        }
    }
    loadBaseTest(name) {
        this.props.actions.load(name.split('/tests/')[1], this.props.accessToken).then(() => {
            console.log('Loaded...')
            var defaultName = ""
            var templateName = name.split("/tests/")[1]
            defaultName = templateName.substr(0, templateName.lastIndexOf("/") + 1)
            if (defaultName.startsWith("templates/")) {
                defaultName = defaultName.substr("templates/".length)
            }
            this.setState({
                testBase: Object.assign({}, BlankTest, this.props.test.data),
                name: defaultName,
                prefixSearch: defaultName,
                description: this.props.test.data.description
            })
        })
    }
    render() {
        return (<Segment basic vertical>
                <Helmet title={`HLS - ${this.props.params.organizationName} - Tests - Create`} />
                <Header><Link to={`/${this.props.params.organizationName}/tests/`}>Tests</Link> / Create a New Test</Header>
                    <Grid columns={3} stackable>
                    <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                    <Grid.Column>
                        <Header subheader><Icon name="flask" circular /><Header.Content>Create a Test <Header sub>What happens when...</Header></Header.Content></Header>
                        <p>A test is a collection of related data within a time range. During a test you can monitor current values and after the test you can export the data for further analysis.</p>
                        <p>
                            <b>Choosing a name:</b><br/>
                            It's helpful to organize tests into a hierarchy by adding slashes between important divisions.<br/> <i>(i.e. Product/TestType/Run#)</i>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={10}>
                    <Form loading={this.props.test.saving} onSubmit={(e) => {
                        e.preventDefault();

                        if (this.state.name.substr(-1,1) == "/") {
                            if (confirm('Are you sure you want to create this test? It appears you may be missing a number at the end of the name.') == false) {
                                return;
                            }
                        }

                        var now = new Date();
                        var newTest = Object.assign({}, BlankTest, this.state.testBase, {
                            name: this.state.name,
                            description: this.state.description,
                            tags: {
                                ...this.state.testBase.tags,
                                'CREATED_DATE': now.toISOString(),
                                'STATUS': false
                            },
                            range: [],
                            markers: []
                        });
                        this.props.actions.save(newTest, this.props.accessToken).then(() => {
                            browserHistory.push(`/${this.props.params.organizationName}/tests/${this.state.name}/`);
                        });
                    }}>
                    <Form.Field>
                    <label>Name</label>
                    <Input type="string" error={this.props.exists.exists} loading={this.props.exists.loading} icon={(this.props.exists.loaded && !this.props.exists.exists) ? 'check' : null} fluid value={this.state.name} label={`/organizations/${this.props.params.organizationName}/tests/`} onChange={(e) => {
                           this.setState({
                               name: e.currentTarget.value,
                               prefixSearch: e.currentTarget.value.substr(0, e.currentTarget.value.lastIndexOf('/')+1)
                           }, () => {
                               this.props.actions.checkExists(this.state.name, this.props.accessToken)
                           })
                        }}/>{this.props.exists.exists ? <small>Test <b>{this.props.exists.name}</b> already exists. </small> : <small>For best practice don't include date, or location information for the test. Metadata for a test can be added as tags</small>}</Form.Field><Form.Field><label>Description</label>
                        <Input type="string" fluid value={this.state.description} onChange={(e) => {
                           this.setState({
                               ...this.state,
                               description: e.currentTarget.value
                           })
                       }}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Template</label>
                        <input disabled value={this.state.template} />
                    </Form.Field>
                       <Button floated="right">Create</Button>
                    </Form>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                    <Header sub>Templates</Header>
                <TestsTable params={this.props.params} showDuration={false} prefix={this.state.prefixSearch.length == 0 ? 'templates/' : this.state.prefixSearch } onClick={(test) => {
                    this.setState({
                        template: test.name
                    })
                    this.loadBaseTest(test.name);
                }} />
       </Segment>);
    }
}