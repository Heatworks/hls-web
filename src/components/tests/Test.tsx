import * as React from 'react'
import { Table, Label, Search, Button, Segment, List, Header, Rail, Message, Input, Menu, Dropdown, Icon, Image, Loader, Confirm, Modal, Card, Divider, Tab } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import MonitorButton from '../connected/MonitorButton'
import ChannelSelector from '../connected/ChannelSelector'
var DateTime = require('react-datetime')
var moment = require('moment')
import MarkersBar from './MarkersBar'
require("../../resources/react-datetime.css")

import { iconForStatus } from './helpers'

import * as DAC from '../../apis/hls_dac'
import { TestMarkers } from '../../apis/hls_tests'

var api_dac = new DAC.DefaultApi()

export interface NewTestMarker extends TestMarkers {
    added:boolean
}

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
            markers: Array<TestMarkers>,
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
    saving?:boolean,
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
    newMarkers?: Array<NewTestMarker>,
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
    devicesModal?: boolean,
    measuring?: boolean,
    measuringTimestamp?: number,
    measuringSelected?: boolean,
    filtering?: boolean,
    markersFilterRange?: Array<number>
}> {
    constructor(props) {
        super(props)
        console.log('load: '+this.props.params.splat)
        this.state = {
            editing: false,
            saving: false,
            test: this.props.test.data == null ? null : Object.assign({}, this.props.test.data),
            newTag: {
                key: '',
                value: ''
            },
            reset: {
                open: false
            },
            devices: [],
            devicesModal: false,
            newMarkers: [],
            measuring: false,
            measuringSelected: false,
            measuringTimestamp: 0,
            filtering: false,
            markersFilterRange: null
        }
    }
    componentWillMount() {
        this.props.actions.load(this.props.params.splat, this.props.accessToken)
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.test == null || nextProps.test.data.name !== this.state.test.name) {
            this.setState({
                test: Object.assign({}, nextProps.test.data),
                saving: false
            })
        } else {
            this.setState({
                saving: false
            })
            console.log('(this.state.test == null) = false')
            console.log(this.state.test)
        }
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
        return api_dac.devicesGet({exclusiveStartKey: ''},{
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
                    'STATUS': status
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
        if (this.state.test.tags.STATUS == 'passing') {
            tags.STATUS = 'passed'
        }
        if (this.state.test.tags.STATUS == 'failing') {
            tags.STATUS = 'failed'
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
        if (this.state.test.tags.STATUS == false) {
            tags.STATUS = 'passing'
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
        if (this.state.saving) {
            setTimeout(() => {
                this.saveTest()
            }, 10)
        } else {
            this.setState({
                saving: true
            }, () => {
                return this.props.actions.save(this.state.test, this.props.accessToken);
            })
        }
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
        var prefix = this.props.params.splat.substr(0, this.props.params.splat.lastIndexOf('/'));
        var suffix = this.props.params.splat.substr(this.props.params.splat.lastIndexOf('/') + 1);
        return (<Segment basic vertical disabled={this.props.test.deleted}>
        <Header><Link to={`/${this.props.params.organizationName}/tests/`}>Tests</Link> / <Link to={`/${this.props.params.organizationName}/tests/${prefix}`}>{prefix}</Link> / {suffix}</Header>
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
        <Dropdown trigger={<Menu.Item>{iconForStatus(this.state.test.tags.STATUS)} {this.state.test.tags.STATUS ? upperCaseFirst(this.state.test.tags.STATUS) : 'Status'}</Menu.Item>} icon={null}>
            <Dropdown.Menu>
                <Dropdown.Item disabled={this.state.test.tags.STATUS == 'failing'} onClick={() => {
                    this.updateStatus('failing', () => {
                        this.saveTest()
                    })
                }}>Failing</Dropdown.Item>
                <Dropdown.Item disabled={this.state.test.tags.STATUS == 'passing'} onClick={() => {
                    this.updateStatus('passing', () => {
                        this.saveTest()
                    })
                }}>Passing</Dropdown.Item>
                <Dropdown.Item disabled={this.state.test.tags.STATUS == 'failed'} onClick={() => {
                    this.updateStatus('failed', () => {
                        if (!this.isComplete()) {
                            this.stopTest()
                        } else {
                            this.saveTest()
                        }
                    })
                }}>Failed</Dropdown.Item>
                <Dropdown.Item disabled={this.state.test.tags.STATUS == 'passed'} onClick={() => {
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
        <Menu.Item position="right" active={this.state.editing} as={Button} {...{ disabled:this.props.test.saving || this.state.saving }} onClick={this.toggleEditing.bind(this)}><Icon name={this.props.test.saving || this.state.saving ? 'spinner' : 'edit' } loading={this.props.test.saving} /><span className='text'>{this.state.editing ? "Editing" : ( this.state.saving ? "Saving..." : "Edit")}</span></Menu.Item>
      </Menu>
        <Segment attached={true} compact>
            <Header sub textAlign="center">Documentation</Header>
            <div style={{lineHeight: 1.7}}>
                <b>Name</b> <a href={`urn:x-hls:/organizations/${this.props.params.organizationName}/tests/${this.state.test.name}`}>{this.state.test.name}</a><br/>
                <b>Description</b> {this.state.editing ? <Input type='text' value={this.state.test.description} defaultValue='Test description...' fluid size="small" onChange={(e) => {
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            description: e.currentTarget.value
                        }
                    })
                }} /> : this.state.test.description}<br/>
                <b>Range</b> {this.state.test.range.map((time, index) => {
                    return (this.state.editing ? <span>{index == 1 ? <Icon name="caret right" size="small" /> : null}<DateTime value={moment(time*1000)}  onChange={(value) => {
                            var range = this.state.test.range.slice()
                            range[index] = moment(value).unix();
                            this.setState({
                                ...this.state,
                                test: {
                                    ...this.state.test,
                                    range
                                }
                            })
                        }} /></span> : <span>{index == 1 ? <Icon name="caret right" size="small" /> : null} {moment(time * 1000).format('MM/DD HH:mm:ss (YYYY)')} </span> )
                })} {this.state.editing ? <a href="#" onClick={() => {
                    this.setState({
                        reset: {
                            open: true
                        }
                    })
                }}>(clear)</a> : null}<br/>
                <b>Duration</b> {moment.duration(this.state.test.range.length > 0 ? (this.state.test.range.length > 1 ? this.state.test.range[1] - this.state.test.range[0] : now.getTime() / 1000 - this.state.test.range[0] ) : 0, 'seconds').humanize()}<br/>
                <b>Tags</b><br/> {this.state.editing ? <Segment basic vertical>
                    <Table singleLine size="small" compact  striped>
            <Table.Header>
                <Table.Row disabled={this.props.test.loading}>
                    <Table.HeaderCell collapsing></Table.HeaderCell>
                    <Table.HeaderCell collapsing textAlign="right">Key</Table.HeaderCell>
                    <Table.HeaderCell>Value</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            { Object.keys(this.state.test.tags).map((key, index) => {
                return (<Table.Row>
                    <Table.Cell collapsing><Button basic icon="delete" size="mini" onClick={() => {
                    var tags = Object.assign({}, this.state.test.tags)
                    delete tags[key]
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            tags
                        }
                    })
                }} /></Table.Cell>
                    <Table.Cell collapsing textAlign="right"><b>{key}</b></Table.Cell>
                    <Table.Cell><Input type='text' value={this.state.test.tags[key]} style={{width: '100%'}} placeholder='Value' size="small" onChange={(e) => {
                    var tags = Object.assign({}, this.state.test.tags)
                    tags[key] = normalizeValue(e.currentTarget.value)
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            tags
                        }
                    })
                }} /></Table.Cell>
                  </Table.Row>)
            })}

            <Table.Row active>
            <Table.Cell collapsing></Table.Cell>
            <Table.Cell collapsing textAlign="right"><Input type='text'  placeholder='Key' value={this.state.newTag.key} size="small" style={{textAlign: 'right'}} textAlign="right" onChange={(e) => {
                    this.setState({
                        newTag: {
                            key: e.currentTarget.value,
                            value: this.state.newTag.value
                        }
                    })
                }} onBlur={() => {
                    if (this.state.newTag.key != "") {
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
                    }
                    
                }} /></Table.Cell>
                <Table.Cell></Table.Cell>
                </Table.Row>
                </Table.Body>
                    </Table>
                
                </Segment> 
                : <List horizontal>{Object.keys(this.props.test.data.tags).map((key) => {
                    return (<List.Item>
                                <Icon name="tag" />
                                <List.Content>
                                    <List.Header>{key}</List.Header>
                                    <span>{this.renderTag(this.props.test.data.tags[key])}</span>
                                </List.Content>
                            </List.Item>)
                })}</List>}
            </div>
            <Button.Group widths='2'  size="large" >
                <Button disabled={this.state.test.range.length > 0 }onClick={() => {
                    this.startTest()
                }}><Icon name="play" /> Start</Button>
                <Button disabled={(this.state.test.range.length !== 1)} onClick={() => {
                    this.stopTest()
                }}><Icon name="stop" />Stop</Button>
                <Confirm
                    header='Reset Test Range'
                    content='Are you sure you want to clear the start and end points for this test? Warning: This action can not be undone.'
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
        <Segment attached={true}>
            <Header sub textAlign="center">Markers <Button floated="right" size="tiny" content="Add" style={{ marginTop: -5, marginRight: -6, marginBottom: -5}} compact onClick={() => {
                var newMarkers = this.state.newMarkers.splice(0)
                newMarkers.push({added: false, name:"", description:"",timestamp:null, tags:{}})
                this.setState({
                    newMarkers
                })
                }} /></Header>
        </Segment>
        {this.state.newMarkers.length > 0 ? (
        <Segment attached={true}>
            <Card.Group>
            {this.state.newMarkers.map((marker, index) => {
                if (marker.added) {
                    return false
                }
                return (<Card key={index}>
                            <Card.Content>
                                <Card.Header><Icon name="pin" /> New Marker
                                </Card.Header>
                                <Divider />
                                <Input type="text" placeholder="Timestamp (leave blank for now)" icon="clock" fluid style={{marginBottom: 4}} value={marker.timestamp ? marker.timestamp : null} onChange={(e) => {
                                    var newMarkers = this.state.newMarkers.splice(0)
                                    newMarkers[index].timestamp = parseFloat(e.currentTarget.value)
                                    this.setState({
                                        newMarkers
                                    })
                                }}/>
                                <Input type="text" placeholder="unique/marker/name" icon="pin" fluid  style={{marginBottom: 4}} value={marker.name} onChange={(e) => {
                                    var newMarkers = this.state.newMarkers.splice(0)
                                    newMarkers[index].name = e.currentTarget.value
                                    this.setState({
                                        newMarkers
                                    })
                                }}/>
                                <Card.Description>
                                <Input type="text" placeholder="Description for Marker" value={marker.description} fluid onChange={(e) => {
                                    var newMarkers = this.state.newMarkers.splice(0)
                                    newMarkers[index].description = e.currentTarget.value
                                    this.setState({
                                        newMarkers
                                    })
                                }}/>
                                </Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                <div className='ui two buttons'>
                                <Button basic color='green' onClick={() => {
                                    var marker = this.state.newMarkers[index]
                                    if (!marker.timestamp) {
                                        var date = new Date()
                                        marker.timestamp = date.getTime() / 1000
                                    }
                                    marker.added = true
                                    var newMarkers = this.state.newMarkers.splice(0)
                                    var markers = this.state.test.markers.splice(0)
                                    var testMarker = Object.assign({}, marker)
                                    delete testMarker['added']
                                    markers.push(testMarker)
                                    this.setState({
                                        newMarkers: newMarkers,
                                        test: {
                                            ...this.state.test,
                                            markers
                                        }
                                    }, () => {
                                        this.saveTest()
                                    })
                                    }}>Save</Button>
                                <Button basic color='red' onClick={() => {
                                    var newMarkers = this.state.newMarkers.splice(0)
                                    newMarkers[index].added = true
                                    this.setState({
                                        newMarkers
                                    })
                                    }}>Cancel</Button>
                                </div>
                            </Card.Content>
                        </Card>)
            })}
            </Card.Group>
        </Segment>) : null }
         <Segment attached={true} vertical style={{paddingTop: 0, paddingBottom: 0}}>
            <MarkersBar markers={this.state.test.markers} range={this.state.test.range.slice(0)} setFiltering={(filtering, range) => {
                    this.setState({
                        filtering,
                        markersFilterRange: range
                    })
                }} setMeasuring={(measuring, timestamp) => {
                    if (this.state.measuring && this.state.measuringSelected && measuring) {
                        return;
                    }
                    this.setState({
                        measuring,
                        measuringTimestamp: timestamp
                    })
                }}/>
        </Segment>
        <Table singleLine selectable attached={true} fixed>
                <Table.Header>
                    <Table.Row disabled={this.props.test.loading}>
                        <Table.HeaderCell>Timestamp</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Tags</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right">Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.test.markers.map((row, index) => {
                        return {
                            ...row,
                            index
                        }
                    }).sort((a, b) => { return b.timestamp - a.timestamp }).filter((row) => {
                        return (this.state.filtering) ? (row.timestamp > this.state.markersFilterRange[0] && row.timestamp < this.state.markersFilterRange[1]) : true
                    }).map((row, index, array) => {
                        var isCurrentlySelected = false
                        var duration; 

                        if (this.state.measuring) {
                            if (row.timestamp > this.state.measuringTimestamp - 0.01 && row.timestamp < this.state.measuringTimestamp + 0.01 ) {
                                isCurrentlySelected = true
                            }
                            duration = moment.duration(Math.abs(row.timestamp - this.state.measuringTimestamp)*1000)
                        }
                        return (<Table.Row key={index} disabled={this.props.test.loading} active={isCurrentlySelected} onMouseOver={() => {
                            if (this.state.measuring && !this.state.measuringSelected) {
                                this.setState({
                                    measuringTimestamp: row.timestamp
                                })
                            }
                            }} onClick={() => {
                                if (this.state.measuring) {
                                    if (this.state.measuringTimestamp == row.timestamp && this.state.measuringSelected) {
                                        this.setState({
                                            measuringSelected: false,
                                            measuringTimestamp: row.timestamp
                                        })
                                    } else {
                                        this.setState({
                                            measuringSelected: true,
                                            measuringTimestamp: row.timestamp
                                        })
                                    }
                                }
                            }}>
                            <Table.Cell>{row.timestamp} {this.state.measuring ? <small>{padWithZero(duration.hours())}:{padWithZero(duration.minutes())}:{padWithZero(duration.seconds())}.{padWithZero(Math.round(duration.milliseconds()),3)}</small>: null} </Table.Cell>
                            <Table.Cell><a href={`urn:x-hls:/organizations/${this.props.params.organizationName}/tests/${this.state.test.name}:${row.name}`}>{row.name}</a></Table.Cell>
                            <Table.Cell>{row.description}</Table.Cell>
                            <Table.Cell>{JSON.stringify(row.tags)}</Table.Cell>
                            <Table.Cell textAlign="right" style={{ margin: 0, padding: 0 }}><Button icon="close" label={null} onClick={() =>{
                                var markers = this.state.test.markers.splice(0)
                                markers.splice(row.index, 1)
                                this.setState({
                                    test: {
                                        ...this.state.test,
                                        markers
                                    }
                                }, () => {
                                    this.saveTest()
                                })
                                }} /></Table.Cell>
                        </Table.Row>)
                    })}
                </Table.Body>
            </Table>
        <Segment attached={true}>
            <Header sub textAlign="center">Channels</Header>
        </Segment>
        <Table singleLine selectable attached="bottom" fixed>
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
                const channelKey = this.state.test.channels[row]
                var [ device, channel ] = getDeviceAndChannel(row)
                return (<Table.Row key={index} disabled={this.props.test.loading}>
                    {this.state.editing ? <Table.Cell><Button icon="remove" size="small" onClick={() => {
                    this.removeChannel(row);
                }}/> <Input type='text' placeholder='Value' value={channelKey} size="small" onChange={(e) => {
                    var channels = Object.assign({}, this.state.test.channels)
                    console.log(`${row} : ${e.currentTarget.value}`)
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
                <Table.Cell textAlign="center" { ...{colSpan:'4'}}>Add Channel</Table.Cell>
                </Table.Row> : null}
            </Table.Body>
        </Table>
        <ChannelSelector close={() =>{
            this.setState({
                devicesModal: false
            })
        }} open={this.state.devicesModal} selectChannel={this.addChannel.bind(this)} selectedChannels={Object.keys(this.state.test.channels)} />
        </Segment>);
    }
    renderTag(tag) {
        if (typeof tag == "string") {
            if (tag.indexOf("http") == 0) {
                return <a href={tag} target="_blank">Link <Icon name="linkify" /></a>
            }
        }
        return JSON.stringify(tag)
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
    if (value + "" != number + "") {
        return value;
    }
    if (value == "") {
        return false;
    }
    return number;
}

function upperCaseFirst(str){
    return str.charAt(0).toUpperCase() + str.substring(1);
}
function padWithZero(input, length = 2) {
    // Cast input to string
    input = "" + input;

    let paddingSize = Math.max(0, length - input.length);
    return new Array(paddingSize > 0 ? paddingSize + 1 : 0).join("0") + input;
}