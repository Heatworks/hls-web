import * as React from 'react'
import { Table, Label, Button, Segment, List, Header, Rail, Input, Menu, Dropdown, Icon, Image, Loader, Confirm } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import MonitorButton from '../connected/MonitorButton'
var moment = require('moment')

export class DeviceDocument {
    name: string
    description: string
    channels: Map<String, {
        unit: string,
        rate: number,
        control: boolean
    }>
    tags: any
}

export default class Device extends React.Component<{
    device: {
        loading: boolean,
        loaded: boolean,
        saving: boolean,
        saved: boolean,
        data: DeviceDocument
    },
    accessToken: string,
    actions: {
        load: (name: any, accessToken:string) => any,
        save: (device: DeviceDocument, accessToken: string) => any
    },
    params: {
        organizationName: string,
        splat: string 
    }
},{
    editing?: boolean,
    device?: DeviceDocument,
    newTag? : {
        key: string,
        value: string
    },
    reset?: {
        open: boolean
    }
}> {
    constructor(props) {
        super(props)
        console.log('load: '+this.props.params.splat)
        this.props.actions.load(this.props.params.splat, this.props.accessToken)

        this.state = {
            editing: false,
            device: Object.assign({}, this.props.device.data),
            newTag: {
                key: '',
                value: ''
            },
            reset: {
                open: false
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            device: Object.assign({}, nextProps.device.data),
        })
    }
    toggleEditing() {
         if (this.state.editing) {
            if (JSON.stringify(this.state.device) !== JSON.stringify(this.props.device.data)) {
                this.props.actions.save(this.state.device, this.props.accessToken);
            } else { 
                console.log('Did not need to save.');
                console.log(JSON.stringify(this.state.device)+JSON.stringify(this.props.device.data));
            }
        }
        this.setState({
            editing: !this.state.editing
        })
    }
    render() {
        if (!this.props.device.loaded) {
            return (<Segment basic vertical>
                <Loader active inline='centered' />
            </Segment>)
        }
        var now = new Date()
        return (<Segment basic vertical>
        <Header><Link to={`/${this.props.params.organizationName}/dac/devices/`}>Devices</Link> / {this.props.params.splat}</Header>
        <Menu attached='top'>
        <Dropdown text='Menu' {...{item:true}}>
          <Dropdown.Menu>
            <Dropdown.Item>
              <Icon name='dropdown' />
              <span className='text'>New</span>
              <Dropdown.Menu>
                <Dropdown.Item>Document</Dropdown.Item>
                <Dropdown.Item>Image</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Item>
            <Dropdown.Item>Open</Dropdown.Item>
            <Dropdown.Item>Save...</Dropdown.Item>
            <Dropdown.Item>Edit Permissions</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Export</Dropdown.Header>
            <Dropdown.Item>Share</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item position="right" active={this.state.editing} as={Button} {...{ disabled:this.props.device.saving }} onClick={this.toggleEditing.bind(this)}><Icon name={this.props.device.saving ? 'spinner' : 'edit' } loading={this.props.device.saving} /><span className='text'>Edit</span></Menu.Item>
      </Menu>
        <Segment attached={true} compact>
            <p>
                <b>Name</b> {this.state.device.name}<br/>
                <b>Description</b> {this.state.editing ? <Input type='text' value={this.state.device.description} defaultValue='Test description...' fluid size="small" onChange={(e) => {
                    this.setState({
                        ...this.state,
                        device: {
                            ...this.state.device,
                            description: e.currentTarget.value
                        }
                    })
                }} /> : this.state.device.description}<br/>
                <b>Tags</b><br/> {this.state.editing ? <Segment basic vertical>
                { Object.keys(this.state.device.tags).map((key, index) => {
                    return (<div key={index}><Input type='text' value={key} placeholder='Key' size="small" disabled /> = <Input type='text' value={this.state.device.tags[key]} placeholder='Value' size="small" onChange={(e) => {
                    var tags = Object.assign({}, this.state.device.tags)
                    tags[key] = normalizeValue(e.currentTarget.value)
                    this.setState({
                        ...this.state,
                        device: {
                            ...this.state.device,
                            tags
                        }
                    })
                }} /> <Button basic icon="delete" size="mini" onClick={() => {
                    var tags = Object.assign({}, this.state.device.tags)
                    delete tags[key]
                    this.setState({
                        ...this.state,
                        device: {
                            ...this.state.device,
                            tags
                        }
                    })
                }} /></div>)
                }) }
                <Input type='text' placeholder='Key' value={this.state.newTag.key} size="small" onChange={(e) => {
                    this.setState({
                        newTag: {
                            key: e.currentTarget.value,
                            value: this.state.newTag.value
                        }
                    })
                }} /> = <Input type='text' placeholder='Value' value={this.state.newTag.value} size="small" onChange={(e) => {
                    this.setState({
                        newTag: {
                            key: this.state.newTag.key,
                            value: normalizeValue(e.currentTarget.value)
                        }
                    })
                }}/> <Button icon="plus" basic size="mini" onClick={() => {
                    var tags = Object.assign({}, this.state.device.tags)
                    tags[this.state.newTag.key] = this.state.newTag.value
                    this.setState({
                        device: {
                            ...this.state.device,
                            tags
                        },
                        newTag: {
                            key: '',
                            value: ''
                        }
                    })
                }} />
                </Segment> 
                : <List horizontal>{Object.keys(this.props.device.data.tags).map((key) => {
                    return (<List.Item>
                                <Icon name="tag" />
                                <List.Content>
                                    <List.Header>{key}</List.Header>
                                    <span>{JSON.stringify(this.props.device.data.tags[key])}</span>
                                </List.Content>
                            </List.Item>)
                })}</List>}
            </p>
        </Segment>
       
        <Table singleLine selectable attached='bottom' >
            <Table.Header>
                <Table.Row disabled={this.props.device.loading}>
                    <Table.HeaderCell>Channel</Table.HeaderCell>
                    <Table.HeaderCell>Unit</Table.HeaderCell>
                    <Table.HeaderCell>Rate</Table.HeaderCell>
                    <Table.HeaderCell>Control</Table.HeaderCell>
                    <Table.HeaderCell>Monitor</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {Object.keys(this.props.device.data.channels).map((name, index) => {
                var channelProps = this.props.device.data.channels[name];
                return (<Table.Row key={index} disabled={this.props.device.loading} {...{onClick:() => {
                    browserHistory.push(`/${this.props.params.organizationName}/dac/data/${this.props.params.splat}/${name}/`)
                }}}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{channelProps.unit}</Table.Cell>
                <Table.Cell>{channelProps.rate}</Table.Cell>
                <Table.Cell>{channelProps.control ? 'Yes' : 'No'}</Table.Cell>
                <Table.Cell><MonitorButton organization={this.props.params.organizationName} device={this.props.params.splat} channel={name} />{this.state.editing ? <Button icon="remove" size="small"/> : null }</Table.Cell>
                </Table.Row>)
            })}
            {this.state.editing ? <Table.Row disabled={this.props.device.loading} {...{onClick:() => {
                    console.log('Add Channel');
                }}}>
                <Table.Cell textAlign="center" { ...{colSpan:'5'}}>Add Channel</Table.Cell>
                </Table.Row> : null}
            </Table.Body>
        </Table></Segment>);
    }
}

function getDeviceAndChannel(name) {
    var parts = name.split('/devices/')[1].split('/');
    var channel = parts.pop()
    return [ parts.join('/'), channel ];
}

function getChannel(name) {
    return name.split('/devices/')[1].split('/').pop();
}

function getDevice(name) {
    
}

function normalizeValue(value) {
    var number = parseFloat(value)
    if (Number.isNaN(number)) {
        if (value == "true" || value == "yes") {
            return true;
        } else if (value == "false" || value == "no") {
            return false;
        } else {
            return value;
        }
    }
    return number;
}