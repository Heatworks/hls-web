import * as React from 'react'
import { Table, Label, Button, Segment, List, Header, Rail, Message, Input, Menu, Dropdown, Icon, Image, Loader, Confirm, Modal } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import MonitorButton from '../connected/MonitorButton'
var moment = require('moment')
import * as Promsie from 'bluebird'

import { iconForStatus } from './helpers'

import * as DAC from '../../apis/hls_dac'

var api_dac = new DAC.DefaultApi()

export default class Test extends React.Component<{
    test: {
        loading: boolean,
        loaded: boolean,
        saving: boolean,
        saved: boolean,
        deleting: boolean,
        deleted: boolean,
        error?: any,
        data: {
            name: string,
            description: string,
            channels: any,
            tags: any,
            markers: Array<any>,
            range: Array<number>
        }
    },
    accessToken: string,
    actions: {
        load: (name: any, accessToken:string) => any,
        save: (test: any, accessToken: string) => any,
        deleteTest: (name: string, accessToken: string) => any
    },
    params: {
        organizationName: string,
        splat: string 
    }
},{
    editing?: boolean,
    test?: {
        name: string,
        description: string,
        channels: any,
        tags: any,
        markers: Array<any>,
        range: Array<number>,
    },
    newTag? : {
        key: string,
        value: string
    },
    reset?: {
        open: boolean
    },
    devices?: Array<{
        name: string,
        description: string,
        channels: Map<string, {
            unit: string,
            rate: number,
            control: boolean
        }>
    }>,
    devicesModal?: boolean
}> {
    constructor(props) {
        super(props)
        console.log('load: '+this.props.params.splat)
        this.props.actions.load(this.props.params.splat, this.props.accessToken)

        this.state = {
            editing: false,
            test: Object.assign({}, this.props.test.data),
            newTag: {
                key: '',
                value: ''
            },
            reset: {
                open: false
            },
            devices: [],
            devicesModal: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            test: Object.assign({}, nextProps.test.data),
        })
    }
    toggleEditing() {
         if (this.state.editing) {
            if (JSON.stringify(this.state.test) !== JSON.stringify(this.props.test.data)) {
                this.props.actions.save(this.state.test, this.props.accessToken);
            } else { 
                console.log('Did not need to save.');
                console.log(JSON.stringify(this.state.test)+JSON.stringify(this.props.test.data));
            }
        }
        this.setState({
            editing: !this.state.editing
        })
    }
    loadDevices() {
        return api_dac.devicesGet({
            headers: {
                'Authorization': this.props.accessToken
            }
        }).then((devices: any) => {
            return this.setState({
                devices
            })
        })
    }
    addChannel(channel) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.state.test.channels).indexOf(channel) >= 0) {
                resolve();
            }
            var channels = Object.assign({},this.state.test.channels)
            channels[channel] = ""
            this.setState({
                test: {
                    ...this.state.test,
                    channels
                }
            }, () => {
                resolve()
            })
        });        
    }
    removeChannel(channel) {
        return new Promise((resolve, reject) => {
            var index = Object.keys(this.state.test.channels).indexOf(channel)
            if (index < 0) {
                resolve();
            }
            var channels = Object.assign({},this.state.test.channels)
            delete channels[channel]
            this.setState({
                test: {
                    ...this.state.test,
                    channels
                }
            }, () => {
                resolve()
            })
        });   
    }
    updateStatus(status, callback) {
        this.setState({
            test: {
                ...this.state.test,
                tags: {
                    ...this.state.test.tags,
                    status
                }
            }
        }, callback);
    }
    stopTest() {
        if (this.state.test.range.length !== 1) {
            return;
        }
        var now = new Date();
        var timestamp = now.getTime() / 1000;
        var tags = Object.assign({}, this.state.test.tags)
        if (this.state.test.tags.status == 'passing') {
            tags.status = 'passed'
        }
        if (this.state.test.tags.status == 'failing') {
            tags.status = 'failed'
        }
        this.setState({
            test: {
                ...this.state.test,
                range: [this.state.test.range[0],timestamp],
                tags
            }
        }, () => {
            this.saveTest()
        })
    }
    startTest() {
        if (this.state.test.range.length !== 0) {
            return;
        }
        var now = new Date();
        var timestamp = now.getTime() / 1000;
        var tags = Object.assign({}, this.state.test.tags)
        if (this.state.test.tags.status == undefined) {
            tags.status = 'passing'
        }
        this.setState({
            test: {
                ...this.state.test,
                range: [timestamp],
                tags
            }
        }, () => {
            this.saveTest()
        })
    }
    saveTest() {
        return this.props.actions.save(this.state.test, this.props.accessToken);
    }
    isComplete() {
        return (this.state.test.range.length == 2)
    }
    render() {
        if (this.props.test.deleted) {
            return (<Segment basic vertical>
             <Message icon>
                <Icon name='check' />
                <Message.Content>
                <Message.Header>Archived</Message.Header>
                Test (<b>{this.props.params.splat}</b>) archived successfully! Go back to <Link to={`/${this.props.params.organizationName}/tests/`}>Tests</Link>.
                </Message.Content>
            </Message>
            </Segment>)
        }
        if (this.props.test.loading || this.props.test.deleting) {
            return (<Segment basic vertical>
                <Loader active inline='centered' />
            </Segment>)
        }
        if (!this.props.test.loaded || this.props.test.deleting) {
            return (<Segment basic vertical>
            <Message icon>
                <Icon name='warning sign' />
                <Message.Content>
                <Message.Header>Could not Load</Message.Header>
                Could not load test: <b>{this.props.params.splat}</b> Go back to <Link to={`/${this.props.params.organizationName}/tests/`}>Tests</Link> and try again.
                </Message.Content>
            </Message>
            </Segment>)
        }
        var now = new Date()
        return (<Segment basic vertical disabled={this.props.test.deleted}>
        <Header><Link to={`/${this.props.params.organizationName}/tests/`}>Tests</Link> / {this.props.params.splat}</Header>
        <Menu attached='top'>
        <Dropdown text='Menu' {...{item:true}} icon={null}>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => {
                browserHistory.push(`/${this.props.params.organizationName}/tests/create`)
            }}>New</Dropdown.Item>
            <Dropdown.Item onClick={() => {
                browserHistory.push({
                    pathname: `/${this.props.params.organizationName}/tests/create`,
                    query: {
                        'template': `/organizations/${this.props.params.organizationName}/tests/${this.props.test.data.name}`
                    }
                });
            }}>Duplicate</Dropdown.Item>
            <Dropdown.Item onClick={() => {
                this.props.actions.deleteTest(this.props.params.splat, this.props.accessToken);
            }}>Archive</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Export</Dropdown.Header>
            <Dropdown.Item>Share</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown trigger={<Menu.Item>{iconForStatus(this.state.test.tags.status)} {this.state.test.tags.status ? upperCaseFirst(this.state.test.tags.status) : 'Status'}</Menu.Item>} icon={null}>
            <Dropdown.Menu>
                <Dropdown.Item disabled={this.state.test.tags.status == 'failing'} onClick={() => {
                    this.updateStatus('failing', () => {
                        this.saveTest()
                    })
                }}>Failing</Dropdown.Item>
                <Dropdown.Item disabled={this.state.test.tags.status == 'passing'} onClick={() => {
                    this.updateStatus('passing', () => {
                        this.saveTest()
                    })
                }}>Passing</Dropdown.Item>
                <Dropdown.Item disabled={this.state.test.tags.status == 'failed'} onClick={() => {
                    this.updateStatus('failed', () => {
                        if (!this.isComplete()) {
                            this.stopTest()
                        } else {
                            this.saveTest()
                        }
                    })
                }}>Failed</Dropdown.Item>
                <Dropdown.Item disabled={this.state.test.tags.status == 'passed'} onClick={() => {
                    this.updateStatus('passed', () => {
                        if (!this.isComplete()) {
                            this.stopTest()
                        } else {
                            this.saveTest()
                        }
                    })
                }}>Passed</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        <Menu.Item position="right" active={this.state.editing} as={Button} {...{ disabled:this.props.test.saving }} onClick={this.toggleEditing.bind(this)}><Icon name={this.props.test.saving ? 'spinner' : 'edit' } loading={this.props.test.saving} /><span className='text'>Edit</span></Menu.Item>
      </Menu>
        <Segment attached={true} compact>
            <p>
                <b>Name</b> {this.state.test.name}<br/>
                <b>Description</b> {this.state.editing ? <Input type='text' value={this.state.test.description} defaultValue='Test description...' fluid size="small" onChange={(e) => {
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            description: e.currentTarget.value
                        }
                    })
                }} /> : this.state.test.description}<br/>
                <b>Range</b> {this.state.test.range.map((time) => {
                    return (<span><br/>{moment(time * 1000).format('MM/DD HH:mm:ss (YYYY)')} &nbsp;&nbsp;</span>)
                })}<br/>
                <b>Duration</b> {moment.duration(this.state.test.range.length > 0 ? (this.state.test.range.length > 1 ? this.state.test.range[1] - this.state.test.range[0] : now.getTime() / 1000 - this.state.test.range[0] ) : 0, 'seconds').humanize()}<br/>
                <b>Tags</b><br/> {this.state.editing ? <Segment basic vertical>
                { Object.keys(this.state.test.tags).map((key, index) => {
                    return (<div key={index}><Input type='text' value={key} placeholder='Key' size="small" disabled /> = <Input type='text' value={this.state.test.tags[key]} placeholder='Value' size="small" onChange={(e) => {
                    var tags = Object.assign({}, this.state.test.tags)
                    tags[key] = normalizeValue(e.currentTarget.value)
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            tags
                        }
                    })
                }} /> <Button basic icon="delete" size="mini" onClick={() => {
                    var tags = Object.assign({}, this.state.test.tags)
                    delete tags[key]
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
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
                    var tags = Object.assign({}, this.state.test.tags)
                    tags[this.state.newTag.key] = this.state.newTag.value
                    this.setState({
                        test: {
                            ...this.state.test,
                            tags
                        },
                        newTag: {
                            key: '',
                            value: ''
                        }
                    })
                }} />
                </Segment> 
                : <List horizontal>{Object.keys(this.props.test.data.tags).map((key) => {
                    return (<List.Item>
                                <Icon name="tag" />
                                <List.Content>
                                    <List.Header>{key}</List.Header>
                                    <span>{JSON.stringify(this.props.test.data.tags[key])}</span>
                                </List.Content>
                            </List.Item>)
                })}</List>}
            </p>
            <Button.Group widths='3' basic>
                <Button disabled={this.state.test.range.length > 0 } onClick={() => {
                    this.startTest()
                }}>Start</Button>
                <Button disabled={(this.state.test.range.length !== 1)} onClick={() => {
                    this.stopTest()
                }}>Stop</Button>
                <Button disabled={this.state.test.range.length == 0 } onClick={() => {
                    this.setState({
                        reset: {
                            open: true
                        }
                    })
                }}>Reset</Button>
                <Confirm
                    open={this.state.reset.open}
                    onCancel={() => {
                        this.setState({
                            reset: {
                                open: false
                            }
                        })
                    }}
                    onConfirm={() => {
                        this.setState({
                            test: {
                                ...this.state.test,
                                range: []
                            },
                            reset: {
                                open: false
                            }
                        }, () => {
                            this.props.actions.save(this.state.test, this.props.accessToken);
                        })
                    }}
                />
            </Button.Group>
        </Segment>
       
        <Table singleLine selectable attached='bottom' fixed>
            <Table.Header>
                <Table.Row disabled={this.props.test.loading}>
                    <Table.HeaderCell>Key</Table.HeaderCell>
                    <Table.HeaderCell>Device</Table.HeaderCell>
                    <Table.HeaderCell>Channel</Table.HeaderCell>
                    <Table.HeaderCell textAlign="right">Monitor</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {Object.keys(this.state.test.channels).map((row, index) => {
                const channelKey = this.state.test.channels[channel]
                var [ device, channel ] = getDeviceAndChannel(row)
                return (<Table.Row key={index} disabled={this.props.test.loading}>
                    {this.state.editing ? <Table.Cell>{this.state.editing ? <Button icon="remove" size="small" onClick={() => {
                    this.removeChannel(row);
                }}/> : null }<Input type='text' placeholder='Value' value={channelKey} size="small" onChange={(e) => {
                    var channels = Object.assign({}, this.state.test.channels)
                    channels[row] = e.currentTarget.value
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            channels
                        }
                    })
                }}/></Table.Cell> : <Table.Cell>{channelKey}</Table.Cell> }
                <Table.Cell  {...{onClick:() => {
                    browserHistory.push(`/${this.props.params.organizationName}/dac/devices/${device}/`)
                }}}>{device}</Table.Cell>
                <Table.Cell {...{onClick:() => {
                    browserHistory.push(`/${this.props.params.organizationName}/dac/devices/${device}/${channel}`)
                }}}>{channel}</Table.Cell>
                <Table.Cell textAlign="right" style={{ margin: 0, padding: 0 }}><MonitorButton organization={this.props.params.organizationName} device={device} channel={channel} /></Table.Cell>
                </Table.Row>)
            })}
            {this.state.editing ? <Table.Row disabled={this.props.test.loading} {...{onClick:() => {
                    console.log('Add Test Channel');
                    if (this.state.devicesModal) {
                        this.setState({
                            devicesModal: false
                        })
                    } else {
                        this.setState({
                                devicesModal: true
                        }, () => {
                            this.loadDevices();
                        })
                    }
                    
                }}}>
                <Table.Cell textAlign="center" { ...{colSpan:'3'}}>Add Channel</Table.Cell>
                </Table.Row> : null}
            </Table.Body>
        </Table>
        
        <Modal open={this.state.devicesModal} closeIcon="close" onClose={() => {
            this.setState({
                devicesModal: false
            })
        }}>
            <Modal.Header><Icon name="cubes" /> Channel Selector</Modal.Header>
            <Modal.Content image>
            <Table celled  compact="very">
                    <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>Selected</Table.HeaderCell>
                        <Table.HeaderCell>Device</Table.HeaderCell>
                        <Table.HeaderCell>Channel</Table.HeaderCell>
                        <Table.HeaderCell>Unit</Table.HeaderCell>
                        <Table.HeaderCell>Rate</Table.HeaderCell>
                        <Table.HeaderCell>Control</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.devices.map((device) => {
                            return Object.keys(device.channels).sort().map((channelName, index) => {
                                var channelInfo = device.channels[channelName];
                                return (<Table.Row>
                                            <Table.Cell textAlign="center">{(this.state.test.channels.indexOf(`${device.name}/${channelName}`) >= 0) ? <Icon color='black' name='checkmark' size='small' /> : null}</Table.Cell>
                                            {(index == 0) ? <Table.Cell textAlign="center" rowSpan={Object.keys(device.channels).length} selectable onClick={() => {
                                                Promsie.each(Object.keys(device.channels).sort(), (channel) => {
                                                    return this.addChannel(`${device.name}/${channel}`)
                                                })
                                            }}>{device.name.split('/devices/')[1]}</Table.Cell> : null }
                                            <Table.Cell textAlign="center" selectable onClick={() => {
                                                this.addChannel(`${device.name}/${channelName}`)
                                            }}>{channelName}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.unit}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.rate}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.control ? <Icon color='black' name='checkmark' size='large' /> : null}</Table.Cell>
                                        </Table.Row>);
                            })
                        })}
                    </Table.Body>
                </Table>
            </Modal.Content>
        </Modal>
        </Segment>);
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

function upperCaseFirst(str){
    return str.charAt(0).toUpperCase() + str.substring(1);
}