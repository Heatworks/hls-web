import * as React from 'react'
import { Table, Label, Button, Segment, Header, Grid, Icon, Image, Input, Form } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import DevicesTable from './connected/DevicesTable'
import {DeviceDocument} from './Device'


const BlankDevice : DeviceDocument = {
    name: '',
    tags: {},
    description: '',
    channels: new Map()
}

export default class DeviceCreate extends React.Component<{
    params: {
        organizationName: string
    },
    accessToken: string,
    actions: {
        save: (device: any, accessToken:string) => any,
        load: (name: string, accessToken: string) => any
    },
    device: {
        saving: boolean,
        saved: boolean,
        loading: boolean,
        loaded: boolean,
        data: any
    },
    location: any
},{
    name?: string,
    prefixSearch?: string,
    description?: string,
    template?: string,
    deviceBase?: any
}> {
    constructor(props) {
        super(props)
        if  (this.props.location.query.template) {
            this.loadBaseDevice(this.props.location.query.template);
        }
        this.state = {
            name: (this.props.location.query.name) ? this.props.location.query.name : "",
            prefixSearch: "",
            description: "",
            template: (this.props.location.query.template) ? this.props.location.query.template : "",
            deviceBase: BlankDevice
        }
    }
    loadBaseDevice(name) {
        this.props.actions.load(name.split('/devices/')[1], this.props.accessToken).then(() => {
            console.log('Loaded...')
            var defaultName = ""
            var templateName = name.split("/devices/")[1]
            defaultName = templateName.substr(0, templateName.lastIndexOf("/") + 1)
            if (defaultName.startsWith("templates/")) {
                defaultName = defaultName.substr("templates/".length)
            }
            this.setState({
                deviceBase: Object.assign({}, BlankDevice, this.props.device.data),
                name: defaultName,
                prefixSearch: defaultName,
                description: this.props.device.data.description
            })
        })
    }
    render() {
        return (<Segment basic vertical>
                <Helmet title={`HLS - ${this.props.params.organizationName} - Devices - Create`} />
                <Header><Link to={`/${this.props.params.organizationName}/dac/devices`}>Devices</Link> / Create a New Device</Header>
                    <Grid columns={3} stackable>
                    <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                    <Grid.Column>
                        <Header subheader><Icon name="flask" circular /><Header.Content>Create a Device <Header sub>Collects or controls data</Header></Header.Content></Header>
                        <p>A device is a physical or virtual object that either collects data or listens for control signals. The device definition is made up of channels which specify a unit and data rate..</p>
                        <p>
                            <b>Choosing a name:</b><br/>
                            It's helpful to organize devices into a hierarchy by adding slashes between important divisions. Don't specify where the device is as that is transient property but may be stored as a tag.<br/> <i>(i.e. DeviceTypeIdentifier/#)</i>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={10}>
                    <Form loading={this.props.device.saving} onSubmit={(e) => {
                        e.preventDefault();
                        var now = new Date();
                        var newDevice = Object.assign({}, BlankDevice, this.state.deviceBase, {
                            name: this.state.name,
                            description: this.state.description,
                            tags: {
                                ...this.state.deviceBase.tags,
                                'CREATED_DATE': now.toISOString()
                            }
                        });
                        this.props.actions.save(newDevice, this.props.accessToken).then(() => {
                            browserHistory.push(`/${this.props.params.organizationName}/dac/devices/${this.state.name}/`);
                        });
                    }}>
                    <Form.Field>
                    <label>Name</label>
                    <Input type="string" fluid value={this.state.name} label={`/organizations/${this.props.params.organizationName}/devices/`} onChange={(e) => {
                           this.setState({
                               name: e.currentTarget.value,
                               prefixSearch: e.currentTarget.value.substr(0, e.currentTarget.value.lastIndexOf('/')+1)
                           })
                       }}/><small>For best practice don't include date, or location information for the test. Metadata for a test can be added as tags.</small></Form.Field><Form.Field><label>Description</label>
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
                <DevicesTable params={this.props.params} showDuration={false} prefix={this.state.prefixSearch.length == 0 ? 'templates/' : this.state.prefixSearch } onClick={(device) => {
                    this.setState({
                        template: device.name
                    })
                    this.loadBaseDevice(device.name);
                }} />
       </Segment>);
    }
}