import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image, Radio, Loader, Message } from 'semantic-ui-react'
import { SemanticWIDTHS, SemanticSIZES } from 'semantic-ui-react/dist/commonjs'
import { Link , browserHistory} from 'react-router'
import { Client, connect } from "mqtt"
import Helmet from 'react-helmet'
var zipObject = require('zip-object');
import { valueWithUnit, getUnitForTopic, getTemperatureUnit, UnitLabels } from '../../actions/units'
import { View as ViewModel, ViewRow } from '../../apis/hls_views'
import { normalizeName } from '../../utils/normalizeNames'
var moment = require('moment')

import * as DAC from '../../apis/hls_dac';
var api_dac = new DAC.DefaultApi()

import * as ScriptsLocal from '../../apis/hls_scripts_local';
var api_scripts_local  = new ScriptsLocal.DefaultApi();

export class ColumnComponent {
    width?: number
    widths?: {
        tablet: SemanticWIDTHS
        desktop: SemanticWIDTHS
        mobile: SemanticWIDTHS
        widescreen: SemanticWIDTHS
    }
    component?: string
    props?: any
    channels?: any
    rows?: Array<RowObject>
}

export class RowObject {
    // If fluid, widths are not set by individual component widths.
    fluid?: boolean
    columns: Array<ColumnComponent>
}

export class ViewObject {
    name: string
    description: string
    tags: any
    grid: {
        rows: Array<RowObject>
    }
}

export interface ClientFixed extends Client {
    connected: boolean
}

export default class View extends React.Component<{
    view: {
        loading: boolean,
        loaded: boolean,
        saving: boolean,
        saved: boolean,
        deleting: boolean,
        deleted: boolean,
        error?: any,
        data: ViewModel
    },
    accessToken: string,
    actions: {
        load: (name: any, accessToken:string) => any,
        save: (view: any, accessToken: string) => any,
        deleteView: (view: string, accessToken: string) => any
    },
    params: {
        organizationName: string,
        splat: string 
    },
    client: ClientFixed,
    standalone: boolean
},{
    view?: ViewModel,
    connected?: boolean,
    channels?: any,
    error?: string,
    editing?: boolean,
    live?:boolean,
    remotePlay?: boolean,
    saving?:boolean,
    currentTimestamp?: number
}> {
    constructor(props) {
        super(props);
        var now = new Date();
        this.state = {
            connected: false,
            view: null,
            channels: {},
            live: false,
            remotePlay: false,
            editing: false,
            saving: false,
            error: null,
            currentTimestamp: now.getTime() / 1000
        }
        console.log('Client:')
        console.log(this.props.client)
    }
    remotePlayTimeout = null
    componentWillMount() {
        console.log('componentWillMount' + this.props.params.splat )
        this.props.actions.load(this.props.params.splat, this.props.accessToken)
    }
    componentWillUnmount() {
        this.unsubscribeFromChannels()
        this.stopRemotePlay();
    }
    componentWillReceiveProps(nextProps) {
        console.log('Client:')
        console.log(this.props.client)
        if (this.state.view == null || nextProps.view.data.name !== this.state.view.name) {
            if (nextProps.client) {
                this.unsubscribeFromChannels()
            }
            this.setState({
                view: Object.assign({}, nextProps.view.data),
                saving: false
            }, () => {
                setTimeout(() => {
                    if (nextProps.client && nextProps.client.connected) {
                        this.setupLive()
                    } else {
                        this.processChannelsInView().then(() => {
                            var now = new Date();
                            this.loadHistoricalTimestamp((now.getTime() / 1000) - 10)
                            this.setState({
                                remotePlay: true
                            }, () => {
                                this.startRemotePlay();
                            })
                            
                        }).catch((error) => {
                            console.error(error);
                        })
                    }
                }, 2000)
            })
        } else {
            this.setState({
                saving: false
            })
        }
    }

    startRemotePlay() { 
        clearTimeout(this.remotePlayTimeout);
        this.setState({
            remotePlay: true
        }, () => {
            this.loadNextTime();
        })
    }

    stopRemotePlay() {
        this.setState({
            remotePlay: false
        }, () => {
            clearTimeout(this.remotePlayTimeout);
        })
    }

    loadNextTime() {
        var now = new Date();
        this.loadHistoricalTimestamp((now.getTime() / 1000) - 10)
        this.remotePlayTimeout = setTimeout(() => {
            this.loadNextTime();
        }, 5*1000)
    }

    setupLive() {
        console.log('setupView...' + this.state.view.name)
        this.processChannelsInView().then(() => {
            return this.checkProps();
        }).then(() => {
            return this.processConnectClient()
        }).then(() => {
            this.setState({
                error: null,
                live: true
            })
        }).catch((error) => {
            console.error(error)
            this.setState({
                error,
                live: false
            })
        })
    }

    checkProps() {
        return new Promise((resolve, reject) => {
            if (this.props.client) {
                resolve()
            } else {
                reject('MQTT Client has not been created yet.')
            }
        })
    }

    processChannelsInView() {
        var channelPromises = []
        this.processChannelsInRows(this.state.view.grid.rows, channelPromises)
        return Promise.all(channelPromises).then((channels) => {
            console.log(channels);
            this.setState({
                channels: zipObject(channels.map((channelMap) => {
                    return channelMap.name
                }),channels)
            })
        })
    }

    processChannelsInRows(rows: Array<ViewRow>, channelPromises) {
        rows.map((row) => {
            row.columns.map((column) => {
                if ('rows' in column) {
                    this.processChannelsInRows(column.rows, channelPromises)
                } else {
                    Object.keys(column.channels).map((key) => {
                        channelPromises.push(this.addChannel(column.channels[key]))
                    })
                }
            })
            
        })
    }

    addChannel(channel) {
        return new Promise((resolve, reject) => {
            resolve({
                name: channel,
                unit: getUnitForTopic(channel),
                value: null,
                timestamp: null
            })
        })
    }

    processConnectClient() {
        return new Promise((resolve, reject) => {
            console.log("connecting...");
            var connected = (packet) => {
                console.log('connect and subscribe to '+Object.keys(this.state.channels).length+' channels.')
                this.setState({
                    connected: true
                })
                var subscribed = [];
                var checkIfSubscribed = () => {
                    console.log('checkIfSubscribed')

                    Object.keys(this.state.channels).forEach((channel) => {
                        console.log('Subscribing to: '+channel)
                        if (subscribed.indexOf(channel) == -1) {
                            this.props.client.subscribe(channel, (err) => {
                                console.log(err)
                                console.log('Subscribed to: '+ channel)
                                if (subscribed.indexOf(channel) == -1) {
                                    subscribed.push(channel)
                                }
                            })
                        }
                        
                    })

                    if (subscribed.length < Object.keys(this.state.channels).length) {
                        setTimeout(() => {
                            checkIfSubscribed()
                        }, 1000)
                    } else {
                        resolve()
                    }
                }
                checkIfSubscribed()
            };
            if (this.props.client.connected) {
                connected(null)
            }
            this.props.client.on('connect', connected )

            this.props.client.on('offline', function() {
                console.log("offline");
            });

            this.props.client.on('reconnect', function() {
                console.log("reconnect");
            });

            this.props.client.on("error", (error) => {
                console.error(error);
            })

            this.props.client.on('message', this.receiveMessage.bind(this))
            
        })
    }

    receiveMessage(topic, message, packet) {
        if (this.state.live) {
            console.log("REC: "+topic+": "+message)
            var parts = message.toString().split(",")
            var rawValue = parts[1]
            var timestamp = parts[0]
            this.setTopicValue(topic, rawValue, timestamp)
        }
    }
    setTopicValue(channel, value, timestamp) {
        var unit = (this.state.channels[channel]) ? this.state.channels[channel].unit : 'String';
        if (unit == null) {
            unit = 'String'
        }
        var channels = {
            ...this.state.channels
        }
        channels[channel] = {
            unit,
            value,
            timestamp
        }
        this.setState({
            channels
        })
    }

    unsubscribeFromChannels() {
        Object.keys(this.state.channels).forEach((channel) => {
            this.props.client.unsubscribe(channel)
        })
    }

    loadHistoricalTimestamp(timestamp) {
        var startTime = new Date(0)
        startTime.setTime(timestamp * 1000)
        var endTime = new Date()
        endTime.setTime(startTime.getTime() + 2*1000)
        var getData = Object.keys(this.state.channels).map((channel) => {
            return api_dac.dataGet(
                { 
                    channel: channel,
                    startTime: (startTime.getTime() / 1000) + "",
                    endTime: (endTime.getTime() / 1000) + "",
                    limit: 1
                },{
                headers: {
                    'Authorization': this.props.accessToken
                }
            }).then((data) => {
                if ('errorMessage' in data) {
                    console.error(data);
                    return undefined;
                    //throw Error(data['errorMessage'])
                }
                if (data.length > 0) {
                    return {
                        channel, 
                        datum: data[0]
                    }
                }
            })
        })

        return Promise.all(getData).then((data) => {
            data.forEach((channelDatum, index) => {
                if (channelDatum !== undefined) {
                    if (channelDatum.datum['value_float'] !== null) {
                        this.setTopicValue(channelDatum.channel, parseFloat(channelDatum.datum['value_float']), channelDatum.datum['occurred'])
                    } else {
                        this.setTopicValue(channelDatum.channel, channelDatum.datum['value_string'], channelDatum.datum['occurred'])
                    }
                }
            })
        }).then(() => {
            this.setState({
                currentTimestamp: timestamp
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    render() {
        if (!this.props.view.loaded || this.state.view == null) {
            return (<Segment basic vertical>
                <Loader active inline='centered' />
                <p>{this.props.view.loaded ? 'Loaded view.' : 'Loading view...'}<br/>
                {this.state.view == null ? 'State view loading...' : 'State loaded.'}</p>
                <Button onClick={() => {
                    this.setupLive()
                }}>Retry</Button>
            </Segment>)
        }
        if ((this.state.error !== "" && this.state.error !== null && this.state.error) || (this.state.connected == false && this.state.live)) {
            return (<Segment basic vertical>
            <Message icon>
                <Icon name='warning sign' />
                <Message.Content>
                <Message.Header>{JSON.stringify(this.state.error)}</Message.Header>
                Could not load view: <b>{this.props.params.splat}</b> Go back to <Link to={`/${this.props.params.organizationName}/views/`}>Views</Link> and try again.
                <Button content="Ignore Error" onClick={() => {
                    this.setState({
                        error: null,
                        live: false
                    })
                    }} />
                    <Button content="Retry" onClick={() => {
                        this.setupLive()
                        }} />
                </Message.Content>
            </Message>
            </Segment>)
        }
        return (<Segment basic vertical>
                <Helmet title={`HLS - ${this.props.params.organizationName} - Views`} />
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Header>
                                {this.props.standalone ? 'Views' : <Link to={`/${this.props.params.organizationName}/views/`}>Views</Link>} / {normalizeName(this.state.view.name, "local")}<br/><Header sub>{this.state.view.description}</Header>
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Menu floated="right">
                                {!this.state.live ? <Menu.Item as={Button} content={''} active={this.state.remotePlay} icon={this.state.remotePlay ? 'pause' : 'play'} {...{onClick: () => {
                                    if (this.state.remotePlay) {
                                        this.stopRemotePlay();
                                    } else {
                                        this.startRemotePlay();
                                    }
                                    }}} /> : null}
                                {!this.state.live ? <Menu.Item style={{paddingTop:0,paddingBottom:0,paddingRight:3, paddingLeft:3}}><Input type="text" value={this.state.currentTimestamp} onChange={(e) => {
                                    this.loadHistoricalTimestamp(parseFloat(e.currentTarget.value))
                                }}/></Menu.Item> : null}
                                {!this.state.live ? <Menu.Item as={Button} onClick={() => {
                                    this.loadHistoricalTimestamp(this.state.currentTimestamp - 1)}} content='-1s' /> : null}
                                {!this.state.live ? <Menu.Item as={Button} {...{onClick: () => {
                                    this.loadHistoricalTimestamp(this.state.currentTimestamp + 1)
                                }}} content='+1s' /> : null}
                                
                                <Menu.Item as={Button} content={'Live'} active={this.state.live && this.state.connected} icon={this.state.live ? 'pause' : 'play'} {...{onClick: () => {
                                    if (this.state.live) {
                                        this.setState({
                                            live: false,
                                            currentTimestamp: new Date().getTime() / 1000
                                        })
                                    } else {
                                        this.setupLive()
                                    }
                                    
                                    }}} />
                                    <Menu.Item><Icon.Group>
                            <Icon name="wifi" />
                            <Icon corner name={this.state.connected ? 'check' : 'warning sign'} />
                        </Icon.Group></Menu.Item>
                                {this.props.standalone ? null : <Menu.Item as={Button} {...{onClick: () => {
                                this.setState({
                                    editing: !this.state.editing
                                })
                            }}} active={this.state.editing}><Icon name="edit" />Edit</Menu.Item> }</Menu>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                { this.renderRows(this.state.view.grid.rows) }
            </Segment>);
    }

    publish(channel: string, value: string) {
        console.log(`Publish ${channel}: ${value}`)
        var now = new Date();
        var timestamp = now.getTime() / 1000;
        this.props.client.publish(channel, `${timestamp},${value}`)
    }


    renderRows(rows) {
        return rows.map((row, rowIndex) => {
            return (<Grid stackable> { this.renderRow(row, rowIndex) } </Grid>)
        })
    }
    renderRow(row, rowIndex) {
        return (
                <Grid.Row key={rowIndex} columns={(row.fluid) ? 'equal' : 16 } {...{ style: { paddingBottom: 0 } }}>
                    {row.columns.map((column, columnIndex) => {
                        return (
                            <Column key={columnIndex} column={column} editing={this.state.editing} onChange={(_column) => {
                                console.log('Updated column...')
                                console.log(_column);
                                row.columns[columnIndex] = _column
                                this.setState({
                                    view: this.state.view
                                })
                            }}>
                            {
                                ('rows' in column) ? this.renderRows(column.rows) : this.renderColumnComponent(column)
                            }
                            </Column>
                            )
                        })
                    }
                </Grid.Row>
            )
    }

    renderColumnComponent(column: ColumnComponent) {
        if (Object.keys(this.state.channels).length == 0) {
            return <Segment loading vertical />
        }
        if (column.component == "/organizations/hls/views/components/power/switch") {
            return (
                <PowerSwitch {...column.props} channels={column.channels} values={{
                    control: this.state.channels[column.channels.control].value,
                    value: this.state.channels[column.channels.value].value,
                    amps: 20
                }} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/model-2/pcb/thermocouples") {
            return (
                <OverlayPCB {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/conductivity/recorder") {
            return (
                <ConductivityRecorder {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/highpot/recorder") {
            return (
                <HighpotRecorder {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/temperature/recorder") {
            return (
                <TemperatureRecorder {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/hls/views/components/timestamp") {
            return (
                <TimestampView {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} />
            )
        } else if (column.component == "/organizations/hls/views/components/camera") {
            return (
                <Camera {...column.props} accessToken={this.props.accessToken} currentTimestamp={this.state.currentTimestamp} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} />
            )
        } else if (column.component == "/organizations/hls/views/components/textbox") {
            return (
                <TextBox {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/hls/views/components/passfail") {
            return (
                <PassFail {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/hls/views/components/solenoid") {
            return (
                <Solenoid {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/units/model-1x") {
            return (
                <ProductionTestStandUnit {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/model-2/production/FunctionalTestScriptController") {
            return (
                <FunctionalTestScriptController {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/model-2/production/FunctionalTestNotes") {
            return (
                <FunctionalTestNotes {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} publish={this.publish.bind(this)} />
            )
        } else if (column.component == "/organizations/heatworks/views/components/units/model-3/momepha/strategy") {
            return (<MomephaStrategyVisual {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]]
                }))} />)
        } else if (column.component == "/organizations/hls/views/components/analog") {
            return (<AnalogSensorValue {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]]
                }))} />)
        } else if (column.component == "/organizations/hls/views/components/oscilloscope") {
            return (<Oscilloscope {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]]
                }))} />)
        } else if (column.component == "/organizations/hls/views/components/log") {
            return (<LogTable {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]]
                }))} />);
        } else if (column.component == "/organizations/hls/views/components/divider") {
            return (<Divider />)
        } else if (column.component == "/organizations/hls/views/components/spacer") {
            return (<Segment vertical {...column.props} />)
        } else {
            return (<Image src='http://semantic-ui.com/images/wireframe/paragraph.png' />)
        }
    }
}

class Column extends React.Component<{
    column: ColumnComponent,
    editing: boolean,
    onChange: (column) => any
}, {
    column?: ColumnComponent
    unsavedChanges?: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            column: props.column,
            unsavedChanges: false
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.state.unsavedChanges && nextProps.editing == false) {
            this.props.onChange(this.state.column);
            this.setState({
                unsavedChanges: false
            })
        } else {
            this.setState({
                column: nextProps.column,
                unsavedChanges: false
            })
        }
    }

    render() {
        return (
            <Grid.Column width={this.props.column.width as SemanticWIDTHS} {...this.props.column.widths} >
                    {
                    this.props.editing ? <Input value={this.state.column.props.title} type="text" fluid onChange={(e) => {
                        this.setState({ 
                            column: {
                                ...this.state.column,
                                props: {
                                    ...this.state.column.props,
                                    title: e.currentTarget.value
                                }
                            },
                            unsavedChanges: true 
                        })
                    }} />  : (this.props.column.props.title ? <Header subheader>{this.props.column.props.icon ? <Icon name={this.props.column.props.icon} circular style={{ marginRight: 0, marginTop: 15 }} /> : null }<Header.Content>{this.props.column.props.title} </Header.Content></Header> : null)
                    }
                {
                    this.props.editing ? <Segment vertical>
                        {'channels' in this.props.column ? (<Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell sorted="ascending">Key</Table.HeaderCell>
                                <Table.HeaderCell>Channel</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {Object.keys(this.props.column.channels).map((key, index) => {
                            return (<Table.Row key={index}>
                                <Table.Cell>{key}</Table.Cell>
                                <Table.Cell>.../{this.props.column.channels[key].split('/devices/')[1]}</Table.Cell>
                            </Table.Row>)
                        })}
                            
                        </Table.Body>
                    </Table>) : null }
                    
                    {'rows'in this.props.column ? <Segment>{this.props.children}</Segment> : null}

                    <Button.Group fluid>
                        <Button labelPosition='left' icon='left chevron' content='' onClick={(e) => {
                            var column = Object.assign({}, this.props.column)
                            column.width -= 1
                            this.props.onChange(column)
                        }} />
                        <Button />
                        <Button labelPosition='right' icon='right chevron' content='' onClick={(e) => {
                            var column = Object.assign({}, this.props.column)
                            column.width += 1
                            this.props.onChange(column)
                            /*column.width = column.width + 1
                            var nextColumn = (columnIndex >= row.columns.length - 1) ? null : row.columns[columnIndex + 1]
                            if (nextColumn) {
                                nextColumn.width -= 1
                            }
                            this.setState({ view: this.state.view })*/
                        }} />
                    </Button.Group>
                    
                    </Segment> : this.props.children
                }
            </Grid.Column>
        )
    }
}

class TimestampView extends React.Component<{
    title: string
    channels: {

    }
    values: {

    }
},{
    timestamp: Date
}> {
    constructor(props) {
        super(props)

        this.state = {
            timestamp: new Date()
        }
    }
    render () {
        return (<Segment><Button icon="clipboard" size="big" compact labelPosition="right" label={this.state.timestamp.getTime() / 1000} onClick={() => {
            var date = new Date()
            this.setState({
                timestamp: date
            })
            this.copyToClipboard(`${date.getTime() / 1000}`)
        }} /><input type="text" style={{opacity: 0}} id="_hiddenCopyText_" /></Segment>)
    }
    copyToClipboard(string) {
        // create hidden text element, if it doesn't already exist
        var targetId = "_hiddenCopyText_";
        var origSelectionStart, origSelectionEnd;
        var target = document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement;
        if (!target) {
            target = document.createElement("textarea") as HTMLTextAreaElement;
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.value = string
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        
        // copy the selection
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch(e) {
            succeed = false;
        }
        
        return succeed;
    }

}

class TextBox extends React.Component<{
    title: string
    channels: {
        text: string
    }
    values: {
        text: string
    }
    publish: (topic, value) => any
},{
    text: string
}> {
    constructor (props) {
        super(props)
        this.state = {
            text: "Messages..."
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.values.text != this.state.text) {
            this.setState({
                text: nextProps.values.text
            })
        }
    }
    render() {
        return (
            <Segment>
                <h3>{this.state.text}</h3>
            </Segment>
        )
    }
}

class FunctionalTestNotes extends React.Component<{
    title: string
    channels: {
        notes: string
    }
    values: {
        notes: string
    }
    showTextbox: boolean
    publish: (topic, value) => any
},{
    publishing: boolean,
    previousNotes?: Array<string>,
    value?: string
}> {
    constructor(props) {
        super(props)

        this.state = {
            publishing: false,
            previousNotes: new Array(),
            value: ""
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.values.notes != this.state.value) {
            
        } else {
            this.setState({
                publishing: false
            })
        }
    }

    publishNote(text) {
        this.props.publish(this.props.channels.notes, text)
        this.setState({
            publishing: true
        })
        setTimeout(() => {
            var nextNotes = this.state.previousNotes.slice();
            nextNotes.push(text);
            this.setState({
                publishing: false,
                value: "",
                previousNotes: nextNotes
            })
        }, 1000)
    }
    
    render() {
        var displayNotes = this.state.previousNotes.slice()
        return (
            <Segment>
                {this.props.showTextbox ?  <Input fluid type="text" content={this.state.value} onChange={(e) => {
                    this.setState({
                        value: e.currentTarget.value,
                        publishing: false
                    })
                }} action >
                <input placeholder={'Notes...'} value={this.state.value} />
                <Button onClick={() =>{
                    this.props.publish(this.props.channels.notes, this.state.value)
                    this.setState({
                        publishing: true
                    })
                    setTimeout(() => {
                        var nextNotes = this.state.previousNotes.slice();
                        nextNotes.push(this.state.value);
                        this.setState({
                            publishing: false,
                            value: "",
                            previousNotes: nextNotes
                        })
                    }, 1000)
                }} loading={this.state.publishing}>Save</Button>
                </Input>
                 : <p>
                     <Button content="E9" onClick={() => {
                         this.publishNote('error/e9')
                      }} loading={this.state.publishing} />
                     <Button content="E2" onClick={() => {
                         this.publishNote('error/e2')
                      }} loading={this.state.publishing} />
                     <Button content="E0" onClick={() => {
                         this.publishNote('error/e0')
                      }} loading={this.state.publishing} />
                     <Button content="No Power" onClick={() => {
                         this.publishNote('error/power')
                      }} loading={this.state.publishing} />
                     </p>}
                
                <br/>
                <Grid>
                    {displayNotes.reverse().map((note) => {
                        return (
                            <Grid.Row>
                                <Grid.Column>
                                    {note}
                                </Grid.Column>
                            </Grid.Row>
                        )
                    })}
                </Grid>
                {displayNotes.length > 0 ? <Button onClick={() => {
                    this.setState({
                        publishing: this.state.publishing,
                        previousNotes: []
                    })}} style={{}} content={'Clear Notes'} size="tiny" /> : null}
            </Segment>
        )
    }
}


class PassFail extends React.Component<{
    title: string
    channels: {
        passing: string
    }
    values: {
        passing: boolean
    }
    publish: (topic, value) => any
},{
    publishing: boolean
}> {
    constructor(props) {
        super(props)

        this.state = {
            publishing: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value != nextProps.values.control) {

        } else {
            this.setState({
                publishing: false
            })
        }
    }
    
    render() {
        var values = {
            passing: valueWithUnit(this.props.values.passing, "Boolean")
        }
        return (
            <Segment color={values.passing ? 'green' : 'red'}>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                        <Button size="huge" basic={values.passing} positive onClick={() => {
                            this.props.publish(this.props.channels.passing, 1)
                            this.setState({
                                publishing: true
                            })
                        }}  fluid loading={this.state.publishing}>Pass</Button>
                        </Grid.Column>
                        <Grid.Column width={8}>
                        <Button size="huge" basic={!values.passing} onClick={() => {
                            this.props.publish(this.props.channels.passing, 0)
                            this.setState({
                                publishing: true
                            })
                        }} fluid negative loading={this.state.publishing}>Fail</Button> 
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}

class Solenoid extends React.Component<{
    title: string
    channels: {
        control: string,
        value: string
    }
    values: {
        control: boolean,
        value: boolean
    }
    publish: (topic, value) => any
},{
    publishing: boolean
}> {
    constructor(props) {
        super(props)

        this.state = {
            publishing: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value != nextProps.values.control) {

        } else {
            this.setState({
                publishing: false
            })
        }
    }
    
    render() {
        var values = {
            value: valueWithUnit(this.props.values.value, "Boolean"),
            control: valueWithUnit(this.props.values.control, "Boolean")
        }
        return (
            <Segment color={values.value ? 'green' : 'red'}>
                <Button basic compact onClick={() => {
                    this.props.publish(this.props.channels.control, values.value ? 0 : 1)
                    this.setState({
                        publishing: true
                    })
                }} label loading={this.state.publishing}><Icon name={values.value ? 'toggle on' : 'toggle off'} size="big" /></Button> <span style={{
                    float:'right',
                    fontSize: 20
                }} >{this.state.publishing ? <Button.Group basic size={"small"}><Button content={"On"} onClick={() => {
                        this.props.publish(this.props.channels.control, 1)
                    }} /><Button content={"Off"} onClick={() => {
                        this.props.publish(this.props.channels.control, 0)
                    }} /></Button.Group> : ((values.value) ? 'On' : 'Off')}</span>
                <br/>
                <div style={{ fontSize: 14, marginTop: -22, textAlign: 'center', width: '100%', float: 'left'}}>{this.props.title}</div>
            </Segment>
        )
    }
}




class FunctionalTestScriptController extends React.Component<{
    title: string
    channels: {
    }
    values: {
    }
    script: string
    environment: string
    publish: (topic, value) => any
},{
    starting?: boolean
    running?: boolean
    unit?: string
    operator?: string
}> {
    constructor(props) {
        super(props)

        this.state = {
            starting: false,
            running: false,
            unit: "",
            operator: ""
        }

        this.checkStatus();
    }
    
    checking = null

    startScript() {
        this.setState({
            starting: true,
            running: false
        }, () => {
            console.log("Call start script.");
            api_scripts_local.scriptStart(this.props.script, this.props.environment, {
                unit: this.state.unit,
                operator: this.state.operator
            }).then(() => {
                this.setState({
                    starting: false,
                    running: true
                });
                this.checkStatus();
            }).catch((error) => {
                console.error(error);
            })
        })
    }

    stopScript() {
        api_scripts_local.scriptStop(this.props.script, this.props.environment).then(() => {
            this.setState({
                running: false
            })
            clearTimeout(this.checking);
        }).catch((error) => {
            console.error(error);
        })
    }

    checkStatus() {
        this.checking = setTimeout(() => {
            api_scripts_local.scriptStatus(this.props.script, this.props.environment).then((status) => {
                if (status) {
                    this.setState({
                        running: true
                    })
                    this.checkStatus();
                } else {
                    this.setState({
                        running: false
                    })
                    clearTimeout(this.checking);
                }
            })
        }, 5000)
    }

    render() {
        return (
            <Segment color={this.state.running ? 'green' : 'red'}>
                <Button onClick={() => {
                    if (this.state.running) {
                        this.stopScript();
                    } else {
                        this.startScript();
                    }
                }}  loading={this.state.starting}>{(this.state.running) ? 'Stop' : 'Start'}</Button> <span style={{
                    float:'right',
                    fontSize: 20,
                    margin: 0,
                    padding: 0
                }} ><Input type="text" placeholder="Unit Number" style={{fontSize: 14}} value={this.state.unit} onChange={(e) => {
                    this.setState({
                        unit: e.currentTarget.value
                    })
                }} onKeyPress={(e) => {
                    if (e.keyCode == 74 && e.ctrlKey) {
                        e.preventDefault();
                    }
                }} /></span>
                <span style={{
                    float:'right',
                    fontSize: 20,
                    margin: 0,
                    padding: 0
                }} ><Input type="text" placeholder="Operator ID" style={{fontSize: 14}} value={this.state.operator} onChange={(e) => {
                    this.setState({
                        operator: e.currentTarget.value
                    })
                }} onKeyPress={(e) => {
                    if (e.keyCode == 74 && e.ctrlKey) {
                        e.preventDefault();
                    }
                }} /></span>
                <br/>
            </Segment>
        )
    }
}

const unit_visuals = {
    full_on: require('../../resources/unit_visual/test_unit_visual_full_on@2x.png'),
    full_off: require('../../resources/unit_visual/test_unit_visual_full_off@2x.png'),
    flow_off:require('../../resources/unit_visual/test_unit_visual_flow_off@2x.png'),
    flow_out_off:require('../../resources/unit_visual/test_unit_visual_flow_out_off@2x.png'),
    flow_in_off:require('../../resources/unit_visual/test_unit_visual_flow_in_off@2x.png')
}


class ProductionTestStandUnit extends React.Component<{
    title: string
    channels: {
        waterInControl: string,
        waterInValue: string,
        waterOutControl: string,
        waterOutValue: string,
        powerControl: string,
        powerValue: string,
        stabsControl: string,
        stabsValue: string
    }
    values: {
        waterInControl: boolean,
        waterInValue: boolean,
        waterOutControl: boolean,
        waterOutValue: boolean,
        powerControl: boolean,
        powerValue: boolean,
        stabsControl: boolean,
        stabsValue: boolean
    }
    publish: (topic, value) => any
},{
    publishing: boolean
}> {
    constructor(props) {
        super(props)

        this.state = {
            publishing: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value != nextProps.values.control) {
            this.setState({
                publishing: true
            })
        } else {
            this.setState({
                publishing: false
            })
        }
    }

    engageStabs() {
        this.props.publish(this.props.channels.stabsControl, 1)
    }
    disengageStabs() {
        if (valueWithUnit(this.props.values.waterInValue, "Boolean") == true) {
            alert('Can not disengage stabs when water in is on.');
            return;
        }
        this.props.publish(this.props.channels.stabsControl, 0)
        this.props.publish(this.props.channels.waterOutControl, 0)
        this.props.publish(this.props.channels.waterInControl, 0)
    }
    startFlow() {
        if (valueWithUnit(this.props.values.stabsValue, "Boolean") == false) {
            alert('Can not start flow when tabs are disengaged.');
            return;
        }
        this.props.publish(this.props.channels.waterOutControl, 1)
        this.props.publish(this.props.channels.waterInControl, 1)
    }
    endFlow() {
        this.props.publish(this.props.channels.waterOutControl, 0)
        this.props.publish(this.props.channels.waterInControl, 1)
    }

    releavePressure() {
        this.props.publish(this.props.channels.waterOutControl, 1)
        this.props.publish(this.props.channels.waterInControl, 0)
    }

    powerOn() {
        if (valueWithUnit(this.props.values.stabsValue, "Boolean") == false) {
            alert('Can not turn on power when tabs are disengaged.');
            return;
        }
        if (valueWithUnit(this.props.values.waterInValue, "Boolean") == false) {
            alert('Can not turn on power when water is not on.');
            return;
        }
        this.props.publish(this.props.channels.powerControl, 1)
    }
    powerOff() {
        this.props.publish(this.props.channels.powerControl, 0)
    }
    
    render() {
        var values = {
            waterInValue: valueWithUnit(this.props.values.waterInValue, "Boolean"),
            waterOutValue: valueWithUnit(this.props.values.waterOutValue, "Boolean"),
            stabsValue: valueWithUnit(this.props.values.stabsValue, "Boolean"),
            powerValue: valueWithUnit(this.props.values.powerValue, "Boolean"),
        }
        var image = unit_visuals.full_off;
        if (values.stabsValue == true) {
            image = unit_visuals.flow_off;
            if (values.waterInValue == true && values.waterOutValue == true) {
                image = unit_visuals.full_on;
            } else {
                if (values.waterInValue == false && values.waterOutValue == true) {
                    image = unit_visuals.flow_in_off;
                }
                if (values.waterOutValue == false && values.waterInValue == true) {
                    image = unit_visuals.flow_out_off;
                }
            }
        }
        
        // TODO: Require power off before releaving pressure.
        return (
            <Segment style={{height: 200, overflow:'hidden'}}>
                <div style={{ width: '40%', height: 200, float:'left', marginTop: -15}}>
                <Image src={image} style={{ height: '100%'}} />
                </div>
                <div style={{ width: '60%', float:'left', textAlign: 'right'}}>
                {
                    values.stabsValue == false ? (
                    <p>
                        <Button content="Engage Stabs" onClick={this.engageStabs.bind(this)} /><Button content="Disengage Stabs" color={"red"} onClick={this.disengageStabs.bind(this)} />
                        </p>) : 
                    (<p>
                        <span><b>Flow:</b>&nbsp;&nbsp;</span>
                        <Button.Group basic>
                            <Button content="Start" onClick={this.startFlow.bind(this)} /><Button content="Stop" onClick={this.endFlow.bind(this)} />
                        </Button.Group>
                        <br/>
                        <br/>
                        {values.waterInValue == true ? <Button content="Releave Pressure" compact color={"orange"} onClick={this.releavePressure.bind(this)} /> : <Button content="Disengage Stabs" compact color={"red"} onClick={this.disengageStabs.bind(this)} />}<br/><br/>
                        <Button content="Power Off" compact color={"red"} onClick={this.powerOff.bind(this)} /> {values.powerValue == true ? null : (values.waterInValue == true ? <Button content="Power On" compact color={"red"} onClick={this.powerOn.bind(this)} /> : null)}
                    </p>)}
                </div>
            </Segment>
        )
    }
}

class MomephaStrategyVisual extends React.Component<{
    title: string
    channels: {
        strategy: string
    }
    values: {
        strategy: {
            value: number,
            unit: string,
            timestamp: number
        }
    },
    maxLines: number
},{
    values?: Array<{
            value: number,
            unit: string,
            timestamp: number
        }>,
    strategy?: number
}> {
    constructor(props) {
        super(props)
        this.state = {
            values: [],
            strategy: 0
        }
    }
    lastValueTimestamp:number
    componentWillReceiveProps(nextProps) {
        if (nextProps.values.strategy.timestamp != this.lastValueTimestamp) {
            var newValues = this.state.values.slice(Math.max(this.state.values.length - this.props.maxLines, 0))
            newValues.push(nextProps.values.strategy)
            this.setState({
                values: newValues,
                strategy: nextProps.values.strategy.value
            })
            this.lastValueTimestamp = nextProps.values.strategy.timestamp;
        }
    }
    int2bin(int, length = 29){
        var asString = (int >>> 0).toString(2);
        while (asString.length < length) {
            asString = "0"+asString;
        }
        return asString;
    }
    stateForSwitch(number) {
        console.log(`${number}: ${this.int2bin(this.state.strategy >> (28-number))}`)
        return ((this.state.strategy >> (29-number)) & 0b1);
    }
    render() {
        return (
            <Segment vertical>
                <div><input value={this.int2bin(this.state.strategy)} 
                    style={{width: 400, margin: 'auto', fontFamily: 'Courier', borderRadius: 5,padding: 5, border:0, textAlign: 'center'}} onChange={(e) => {
                    this.setState({
                        strategy: parseInt(e.currentTarget.value,2)
                    })
                }} /></div>
                <svg viewBox="0 0 640 654" width="100%" height="1000pt" preserveAspectRatio="true">
                    {/* Outer circle. */}
                    <path d="M 494.4909 158.49932 C 591.35364 255.36157 591.35364 412.40618 494.4909 509.26843 C 397.62864 606.13118 240.58402 606.13118 143.72177 509.26843 C 46.859025 412.40618 46.859025 255.36157 143.72177 158.49932 C 240.58402 61.636568 397.62864 61.636568 494.4909 158.49932" fill="#ced5ff" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                    {/* Channels. */}
                    {this.renderChannel("0", 235.25727, 514.38908, 85.03937, 29.19685, "#a5a5a5")}
                    {this.renderChannel("1", 234.77424, 466.83882, 85.03937, 37.417322, "#a5a5a5")}
                    {this.renderChannel("2", 234.77424, 442.71742, 85.03937, 13.701459, "#a5a5a5")}
                    {this.renderChannel("3", 98.711244, 427.15286, 221.10236, 5.9527556, "#a5a5a5")}
                    {this.renderChannel("4", 98.711244, 408.39334, 221.10236, 8.638621, "#a5a5a5")}
                    {this.renderChannel("5", 98.711244, 359.03156, 221.10236, 38.131234, "#a5a5a5")}
                    {this.renderChannel("6", 98.711244, 342.86518, 221.10236, 5.9527556, "#a5a5a5")}
                    {this.renderChannel("7", 98.711244, 320.90546, 221.10236, 12.36977, "#a5a5a5")}
                    {this.renderChannel("8", 98.711244, 299.25948, 221.10236, 11.6818995, "#a5a5a5")}
                    {this.renderChannel("9", 98.711244, 284.2858, 221.10236, 5.9527556, "#a5a5a5")}
                    {this.renderChannel("10", 98.711244, 266.66105, 221.10236, 8.207862, "#a5a5a5")}
                    {this.renderChannel("11", 235.57114, 243.55008, 85.03937, 13.589668, "#a5a5a5")}
                    {this.renderChannel("12", 235.57114, 227.83372, 85.03937, 31.74803, "#a5a5a5")}
                    {this.renderChannel("13", 235.57114, 186.25874, 85.03937, 31.74803, "#a5a5a5")}
                    {this.renderChannel("14", 235.57114, 113.18573, 85.03937, 63.212596, "#a5a5a5")}
                    {this.renderChannel("15", 329.03346, 125.7678, 85.03937, 72.0, "#a5a5a5")}
                    {this.renderChannel("16", 329.03346, 207.72465, 85.03937, 27.496062, "#a5a5a5")}
                    {this.renderChannel("17", 330.4338, 246.20625, 85.03937, 5.9527556, "#a5a5a5")}
                    {this.renderChannel("18", 330.70299, 261.83226, 85.03937, 46.54515, "#a5a5a5")}
                    {this.renderChannel("19", 329.82711, 317.85588, 85.03937, 6.519685, "#a5a5a5")}
                    {this.renderChannel("20", 330.70299, 334.80312, 221.10236, 5.9527556, "#a5a5a5")}
                    {this.renderChannel("21", 330.70299, 350.0207, 221.10236, 5.9527556, "#a5a5a5")}
                    {this.renderChannel("22", 330.70299, 366.04486, 221.10236, 6.2362206, "#a5a5a5")}
                    {this.renderChannel("23", 329.82711, 382.5134, 221.10236, 6.519685, "#a5a5a5")}
                    {this.renderChannel("24", 329.82711, 400.28936, 221.10236, 7.086614, "#a5a5a5")}
                    {this.renderChannel("25", 329.82711, 418.71455, 85.03937, 45.498196, "#a5a5a5")}
                    {this.renderChannel("26", 329.82711, 473.00943, 85.03937, 8.503937, "#a5a5a5")}
                    {this.renderChannel("27", 329.82711, 492.41534, 85.03937, 30.200384, "#a5a5a5")}
                    {/* Switches. */}
                    {this.renderSwitch(1, 234.77424, 543.58835, 85.03937, 8.985827, false,  true)}
                    {this.renderSwitch(2, 234.77424, 504.56992, 85.03937, 8.985827, false, false)}
                    {this.renderSwitch(3, 234.77424, 457.12076, 85.03937, 8.985827, false, true)}
                    {this.renderSwitch(4, 98.711244, 433.53212, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(5, 98.711244, 417.27974, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(6, 98.711244, 398.32006, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(7, 98.711244, 349.17406, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(8, 98.711244, 333.52322, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(9, 98.711244, 311.50835, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(10, 98.711244, 290.24926, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(11, 98.711244, 274.86787, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(12, 98.711244, 257.24404, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(13, 236.44936, 233.64696, 85.03937, 8.985827, false, true)}
                    {this.renderSwitch(14, 236.44936, 218.49986, 85.03937, 8.985827, false, false)}
                    {this.renderSwitch(15, 236.44936, 176.61637, 85.03937, 8.985827, false, true)}
                    {this.renderSwitch(16, 236.44936, 104.25976, 85.03937, 8.985827, false, false)}

                    {this.renderSwitch(16, 329.38788, 116.75976, 85.03937, 8.985827, false, false)}
                    {this.renderSwitch(17, 329.38788, 198.38484, 85.03937, 8.985827, false, true)}
                    {this.renderSwitch(18, 330.70299, 235.89022, 85.03937, 8.985827, false, false)}
                    {this.renderSwitch(19, 329.55212, 251.9803, 85.03937, 8.985827, false, true)}
                    {this.renderSwitch(20, 330.70299, 308.37741, 85.03937, 8.985827, false, false)}
                    {this.renderSwitch(21, 330.70299, 325.18706, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(22, 330.70299, 341.07932, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(23, 329.80714, 356.28923, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(24, 329.80714, 372.50665, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(25, 329.80714, 389.77177, 221.10236, 8.985827, false, true)}
                    {this.renderSwitch(26, 329.80714, 408.12294, 221.10236, 8.985827, false, false)}
                    {this.renderSwitch(27, 329.38788, 464.4019, 85.03937, 8.985827, false, true)}
                    {this.renderSwitch(28, 329.38788, 482.35716, 85.03937, 8.985827, false, false)}
                    {this.renderSwitch(29, 329.38788, 523.64638, 85.03937, 8.985827, false, true)}

                </svg>

                <Table size="small" compact>
                    {this.state.values.map((row, index) => {
                        return (<Table.Row key={index} active={row.value == this.state.strategy}>
                            <Table.Cell>{moment(row.timestamp * 1000).format()}</Table.Cell>
                            <Table.Cell>{row.value}</Table.Cell>
                        </Table.Row>)
                    }).reverse()}
                </Table>
            </Segment>
        )
    }

    renderChannel(channel, x,y,width, height, fill) {
        return (
            <svg>
                <rect x={x} y={y} width={width} height={height} fill={fill} />
                <text transform={`translate(${x} ${y})`} fill="white">
                <tspan fontFamily="Courier" fontSize="5" style={{fontVariant: "italic", fontWeight:"bold", textAlign:"center"}} fill="white" x={width/2} y={height/2} textAnchor="middle" alignment-baseline="central">{channel}</tspan>
                </text>
            </svg>
        )
    }
    renderSwitch(number, x, y,width, height, state, polarity) {
        return (
            <svg>
                <rect x={x} y={y} width={width} height={height} fill={this.stateForSwitch(number) ? 'white' : 'gray'} strokeWidth={2} stroke={polarity ? "#129702" : "#b1001c"} />
                <text transform={`translate(${x} ${y})`} fill="white">
                <tspan fontFamily="Courier" fontSize="9" style={{fontVariant: "italic", fontWeight:"bold", textAlign:"center"}} fill="black" x={width/2} y={7} textAnchor="middle" alignment-baseline="central">{number}</tspan>
                </text>
            </svg>
        )
    }
}

class LogTable extends React.Component<{
    title: string
    channels: {
        log: string
    }
    values: {
        log: {
            value: string,
            unit: string,
            timestamp: number
        }
    },
    maxLines: number
},{
    values: Array<{
            value: string,
            unit: string,
            timestamp: number
        }>
}> {
    constructor(props) {
        super(props)
        this.state = {
            values: []
        }
    }
    lastValueTimestamp:number
    componentWillReceiveProps(nextProps) {
        if (nextProps.values.log.timestamp != this.lastValueTimestamp) {
            var newValues = this.state.values.slice(Math.max(this.state.values.length - this.props.maxLines, 0))
            newValues.push(nextProps.values.log)
            this.setState({
                values: newValues
            })
            this.lastValueTimestamp = nextProps.values.log.timestamp;
        }
    }
    render() {
        return (
            <Segment vertical>
                <Table size="small" compact>
                    {this.state.values.sort((rowA, rowB) => {
                        return rowA.timestamp - rowB.timestamp;
                    }).map((row, index) => {
                        return (<Table.Row key={index} active={index == this.state.values.length - 1} error={row.value.indexOf("[error]") == 0} warning={row.value.indexOf("[warning]") == 0}>
                            <Table.Cell style={{padding: '.1em .7em'}}>{moment(row.timestamp * 1000).format()}</Table.Cell>
                            <Table.Cell style={{padding: '.1em .7em'}}>{row.value}</Table.Cell>
                        </Table.Row>)
                    }).reverse()}
                </Table>
            </Segment>
        )
    }
}

// BBEA/wAA/wD/AP8A//8AAP//AP//AP8A////AP8A/wD/AP8AAP//AAD//wD/AAD/AP8A/wAA////AAAAAP//AP8A/wD/AP//Af8A//8A/wD//wAA/wAA/wAA/wAA/wD/AAD/AP//AP8A/wAA/wAA/wD/AP//AP8AAAA=

const Base64Binary = require('../../utils/Base64Binary.ts')
const maxChangeValue = Math.pow(2, 7);

function decodeHA8(base64Encoded: string) {
    console.log(base64Encoded)
    var uintArray = Base64Binary.decode(base64Encoded);
    var significantDigits = uintArray[0];
    var startingValue = uintArray[1] / significantDigits;
    var values = [startingValue];
    for (var i = 2; i < uintArray.length; i++) {
        var value = uintArray[i];
        if (value > maxChangeValue) {
            value -= maxChangeValue * 2;
        }
        values.push(values[i-2] + (value / significantDigits))
    }
    return values
}

class Oscilloscope extends React.Component<{
    title: string
    channels: {
        value: string
    }
    values: {
        value: {
            value: string,
            unit: string,
            timestamp: number
        }
    },
    units: string,
    sparklinesLength: number,
    min: number,
    max: number,
    color: string,
    showMin: boolean,
    showMax: boolean
},{
    values: Array<number>
}> {
    constructor(props) {
        super(props)
        this.state = {
            values: []
        }
    }
    lastValueTimestamp:number
    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value.timestamp != this.lastValueTimestamp) {
            var newValues = this.state.values.slice(Math.max(this.state.values.length - this.props.sparklinesLength, 0))
            newValues.push(...decodeHA8(nextProps.values.value.value))
            this.setState({
                values: newValues
            })
            this.lastValueTimestamp = nextProps.values.value.timestamp;
        }
    }
    render() {
        var maxValue = Math.max(...this.state.values)
        var minValue = Math.min(...this.state.values)
        return (
            <Segment>
                <div style={{width: '70%', float:'right', height: 30}}>
                    <Sparklines data={this.state.values} height={30}  min={this.props.min} max={this.props.max}>
                        <SparklinesLine color={this.props.color} />
                    </Sparklines>
                </div>
                {this.props.showMax ? (<div style={{width: '30%', fontSize:9, position:'absolute',top:3 }}>{valueWithUnit(maxValue,this.props.values.value.unit)}</div>) : null}
                {this.props.showMin ? (<div style={{width: '30%', fontSize:9, position:'absolute',bottom:3 }}>{valueWithUnit(minValue,this.props.values.value.unit)}</div>) : null}
                <div style={{width: '30%', position:'relative', left: -5}}>{valueWithUnit(0,this.props.values.value.unit)}</div>
            </Segment>
        )
    }
}

import { Sparklines, SparklinesLine } from 'react-sparklines';

class AnalogSensorValue extends React.Component<{
    title: string
    channels: {
        value: string
    }
    values: {
        value: {
            value: number,
            unit: string,
            timestamp: number
        }
    },
    units: string,
    sparklinesLength: number,
    min: number,
    max: number,
    color: string,
    showMin: boolean,
    showMax: boolean
},{
    values: Array<number>
}> {
    constructor(props) {
        super(props)
        this.state = {
            values: []
        }
    }
    lastValueTimestamp:number
    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value.timestamp != this.lastValueTimestamp) {
            var newValues = this.state.values.slice(Math.max(this.state.values.length - this.props.sparklinesLength, 0))
            newValues.push(nextProps.values.value.value)
            this.setState({
                values: newValues
            })
            this.lastValueTimestamp = nextProps.values.value.timestamp;
        }
    }
    render() {
        var maxValue = Math.max(...this.state.values)
        var minValue = Math.min(...this.state.values)
        return (
            <Segment>
                <div style={{width: '70%', float:'right', height: 30}}>
                    <Sparklines data={this.state.values} height={30}  min={this.props.min} max={this.props.max}>
                        <SparklinesLine color={this.props.color} />
                    </Sparklines>
                </div>
                {this.props.showMax ? (<div style={{width: '30%', fontSize:9, position:'absolute',top:3 }}>{valueWithUnit(maxValue,this.props.values.value.unit)}</div>) : null}
                {this.props.showMin ? (<div style={{width: '30%', fontSize:9, position:'absolute',bottom:3 }}>{valueWithUnit(minValue,this.props.values.value.unit)}</div>) : null}
                <div style={{width: '30%', position:'relative', left: -5}}>{valueWithUnit(this.props.values.value.value,this.props.values.value.unit)}</div>
            </Segment>
        )
    }
}

class PowerSwitch extends React.Component<{
    title: string
    channels: {
        control: string,
        value: string,
        amps: string
    }
    values: {
        control: boolean,
        value: boolean,
        amps: number
    }
    publish: (topic, value) => any
},{
    publishing: boolean
}> {
    constructor(props) {
        super(props)

        this.state = {
            publishing: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value != nextProps.values.control) {
            this.setState({
                publishing: true
            })
        } else {
            this.setState({
                publishing: false
            })
        }
    }
    
    render() {
        return (
            <Segment color={this.props.values.value ? 'green' : 'red'}>
                <Button basic compact onClick={() => {
                    this.props.publish(this.props.channels.control, this.props.values.value ? 0 : 1)
                    this.setState({
                        publishing: true
                    })
                }} label loading={this.state.publishing}><Icon name={this.props.values.value ? 'toggle on' : 'toggle off'} size="big" /></Button> <span style={{
                    float:'right',
                    fontSize: 20
                }} >{this.props.values.amps}A</span>
                <br/>
            </Segment>
        )
    }
}

class ConductivityRecorder extends React.Component<{
    title: string,
    channels: {
        conductivity: string
    },
    values: {
        conductivity: number
    },
    publish: (topic, value) => any
},{
    value?: string,
    publishing: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            value: "",
            publishing: false
        }
    }

    render() {
        return (
            <Segment>
                <Input fluid type="text" content={this.state.value} onChange={(e) => {
                    this.setState({
                        value: e.currentTarget.value,
                        publishing: false
                    })
                }} action >
                <input placeholder={this.props.values.conductivity ? `${this.props.values.conductivity}` : ''} value={this.state.value} />
                <Button basic onClick={() =>{
                    var value = parseFloat(this.state.value)
                    if (value == NaN) {
                        alert(`Value (${this.state.value}) was not a number, please try again.`)
                    }
                    this.props.publish(this.props.channels.conductivity, value)
                    this.setState({
                        publishing: true
                    })
                    setTimeout(() => {
                        this.setState({
                            publishing: false,
                            value: ""
                        })
                    }, 1000)
                }} loading={this.state.publishing}>Publish</Button>
                </Input>
            </Segment>
        )
    }
}

class HighpotRecorder extends React.Component<{
    title: string,
    channels: {
        "L1-Ground": string,
        "L2-Ground": string
        "L1-L2": string
    },
    values: {
        temperature: number
    },
    publish: (topic, value) => any
},{
    l1ToG?: string,
    l2ToG?: string,
    l1Tol2?: string,
    publishing: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            l1ToG: "",
            l2ToG: "",
            l1Tol2: "",
            publishing: false
        }
    }

    render() {
        return (
            <Segment>
                <p>Measured in mA.</p>
                <Input fluid type="text" label="L1-Ground" content={this.state.l1ToG} onChange={(e) => {
                    this.setState({
                        l1ToG: e.currentTarget.value,
                        publishing: false
                    })
                }} action >
                <span>L1-Ground</span>
                <input placeholder={this.props.values["L1-Ground"] ? `${valueWithUnit(this.props.values["L1-Ground"], "Amps")}` : ''} value={this.state.l1ToG} />
                
                <Button basic onClick={() =>{
                    var value = parseFloat(this.state.l1ToG)
                    if (value == NaN) {
                        alert(`Value (${this.state.l1ToG}) was not a number, please try again.`)
                    }
                    value = value / 1000;
                    this.props.publish(this.props.channels["L1-Ground"], value)
                    this.setState({
                        publishing: true
                    })
                    setTimeout(() => {
                        this.setState({
                            publishing: false,
                            l1ToG: ""
                        })
                    }, 1000)
                }} loading={this.state.publishing}>Publish</Button>
                </Input>

                

                <Input fluid type="text" label="L2-Ground" content={this.state.l2ToG} onChange={(e) => {
                    this.setState({
                        l2ToG: e.currentTarget.value,
                        publishing: false
                    })
                }} action >
                <span>L2-Ground</span>
                <input placeholder={this.props.values["L2-Ground"] ? `${valueWithUnit(this.props.values["L2-Ground"], "Amps")}` : ''} value={this.state.l2ToG} />
                
                <Button basic onClick={() =>{
                    var value = parseFloat(this.state.l2ToG)
                    if (value == NaN) {
                        alert(`Value (${this.state.l2ToG}) was not a number, please try again.`)
                    }
                    value = value / 1000;
                    this.props.publish(this.props.channels["L2-Ground"], value)
                    this.setState({
                        publishing: true
                    })
                    setTimeout(() => {
                        this.setState({
                            publishing: false,
                            l2ToG: ""
                        })
                    }, 1000)
                }} loading={this.state.publishing}>Publish</Button>
                </Input>

                
                <Input fluid type="text" content={this.state.l1Tol2} onChange={(e) => {
                    this.setState({
                        l1Tol2: e.currentTarget.value,
                        publishing: false
                    })
                }} action >
                <span>L1-L2</span>
                <input placeholder={this.props.values["L1-L2"] ? `${valueWithUnit(this.props.values["L1-L2"], "Amps")}` : ''} value={this.state.l1Tol2} />
                
                <Button basic onClick={() =>{
                    var value = parseFloat(this.state.l1Tol2)
                    if (value == NaN) {
                        alert(`Value (${this.state.l1Tol2}) was not a number, please try again.`)
                    }
                    value = value / 1000;
                    this.props.publish(this.props.channels["L1-L2"], value)
                    this.setState({
                        publishing: true
                    })
                    setTimeout(() => {
                        this.setState({
                            publishing: false,
                            l1Tol2: ""
                        })
                    }, 1000)
                }} loading={this.state.publishing}>Publish</Button>
                </Input>
            </Segment>
        )
    }
}


class TemperatureRecorder extends React.Component<{
    title: string,
    channels: {
        temperature: string
    },
    values: {
        temperature: number
    },
    publish: (topic, value) => any
},{
    value?: string,
    publishing: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            value: "",
            publishing: false
        }
    }

    render() {
        return (
            <Segment>
                <Input fluid type="text" content={this.state.value} onChange={(e) => {
                    this.setState({
                        value: e.currentTarget.value,
                        publishing: false
                    })
                }} action >
                <input placeholder={this.props.values.temperature ? `${valueWithUnit(this.props.values.temperature, "Celcius")}` : ''} value={this.state.value} />
                <Button basic onClick={() =>{
                    var value = parseFloat(this.state.value)
                    if (value == NaN) {
                        alert(`Value (${this.state.value}) was not a number, please try again.`)
                    }
                    if (getTemperatureUnit() == "F") {
                        value = (value - 32) * (5/9)
                    }
                    this.props.publish(this.props.channels.temperature, value)
                    this.setState({
                        publishing: true
                    })
                    setTimeout(() => {
                        this.setState({
                            publishing: false,
                            value: ""
                        })
                    }, 1000)
                }} loading={this.state.publishing}>Publish</Button>
                </Input>
                <small>Units recorded in {getTemperatureUnit() == "F" ? UnitLabels.Fahrenheit : UnitLabels.Celcius}.</small>
            </Segment>
        )
    }
}

class Camera extends React.Component<{
    accessToken: string,
    channels: {
        image: string
    },
    values: {
        image: string
    },
    currentTimestamp: number
},{
    latest?: string[],
    iterate?: number
}> {
    constructor(props) {
        super(props)
        this.state = {
            latest: [],
            iterate: 0
        }
    }
    iterateTimer = null
    componentDidMount() {
        this.getLatest()
    }

    next() {
        this.setState({
            iterate: this.state.iterate + 1
        })
    }
    prev() {
        this.setState({
            iterate: Math.max(this.state.iterate - 1, 0)
        })
    }

    getLatest() {
        var startTime = new Date()
        startTime.setTime(this.props.currentTimestamp * 1000)
        startTime.setTime(startTime.getTime() - 120*1000)
        var endTime = new Date()
        endTime.setTime(this.props.currentTimestamp * 1000)
        endTime.setTime(endTime.getTime() + 120*1000)
        return api_dac.dataGet(
            { 
                channel: `/organizations/heatworks/devices/camera/a/image`,
                startTime: (startTime.getTime() / 1000) + "",
                endTime: (endTime.getTime() / 1000) + "",
                limit: 100
            },{
            headers: {
                'Authorization': this.props.accessToken
            }
        }).then((data) => {
            console.log(data)
            if ('errorMessage' in data) {
                console.error(data);
                throw Error(data['errorMessage'])
            }
            var latestValues = []
            data.forEach((_datum) => {
                if ('value_string' in _datum) {
                    latestValues.push(_datum['value_string'])
                }
            })
            this.setState({
                latest: latestValues,
                iterate: 0
            })
        }).catch((error) => {
            console.error(error);
        })
    }
    
    render() {
        return <Grid>
            <Grid.Row>
            <Grid.Column width={6}>
                    <h3>"Live"</h3>
                    <Image fluid src={`https://s3.amazonaws.com/hls-dac-images/${this.props.values.image}`} /> 
                    <p><b>{this.props.values.image}</b></p>
                </Grid.Column>
                <Grid.Column width={6}>
                    <h3>1 Minute Playback</h3>
                {(this.state.latest.length > 0) ? <Image fluid src={`https://s3.amazonaws.com/hls-dac-images/${this.state.latest[this.state.iterate % this.state.latest.length]}`} /> : null}
        
        <Button onClick={() => {
            this.getLatest()
            }} content={`Load around ${this.props.currentTimestamp}`} /><Button content="Next" onClick={() => {this.next()}} /><Button content="Previous" onClick={() => {this.prev()}} />
                {
            this.state.latest.map((row, index) => {
                if (this.state.iterate % this.state.latest.length == index) {
                    return <p key={index}><b>{row}</b></p>
                } else {
                    return <p key={index}>{row}</p>
                }
            })
        }
        <br/>
                </Grid.Column>
                </Grid.Row>
            </Grid>
    }
}

class OverlayPCB extends React.Component<{
    title: string
    channels: {
        q1: string,
        q2: string,
        q3: string,
        q4: string,
        q5: string,
        q6: string,
        q7: string,
        q8: string,
        q10: string,
        q11: string,
        q12: string,
        q13: string,
        q14: string,
        q15: string,
        q16: string,
        q17: string
    }
    values: {
        q1: any,
        q2: any,
        q3: any,
        q4: any,
        q5: any,
        q6: any,
        q7: any,
        q8: any,
        q10: any,
        q11: any,
        q12: any,
        q13: any,
        q14: any,
        q15: any,
        q16: any,
        q17: any
    }
    size: SemanticSIZES
    publish: (topic, value) => any
},{}> {
    colorForValue(value) {
        if (value > 80) {
            return "red"
        } else if (value > 55) {
            return "orange"
        } else { 
            return "green"
        }
    }
    render() {
        return (
            <Segment>
                <Image src={require('../../resources/views_board_layout.png')} fluid />
                <div style={{position: 'absolute', right: '61%', top: '79%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q1, getUnitForTopic(this.props.channels.q1))} floating size={this.props.size} color={this.colorForValue(this.props.values.q1)} detail={"Q1"}/></div>
                <div style={{position: 'absolute', right: '79%', top: '69%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q2, getUnitForTopic(this.props.channels.q2))} floating size={this.props.size} color={this.colorForValue(this.props.values.q2)} detail={"Q2"}/></div>
                <div style={{position: 'absolute', right: '61%', top: '60%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q3, getUnitForTopic(this.props.channels.q3))} floating size={this.props.size} color={this.colorForValue(this.props.values.q3)} detail={"Q3"}/></div>
                <div style={{position: 'absolute', right: '79%', top: '52%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q4, getUnitForTopic(this.props.channels.q4))} floating size={this.props.size} color={this.colorForValue(this.props.values.q4)} detail={"Q4"}/></div>
                <div style={{position: 'absolute', right: '61%', top: '44%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q5, getUnitForTopic(this.props.channels.q5))} floating size={this.props.size} color={this.colorForValue(this.props.values.q5)} detail={"Q5"}/></div>
                <div style={{position: 'absolute', right: '79%', top: '37%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q6, getUnitForTopic(this.props.channels.q6))} floating size={this.props.size} color={this.colorForValue(this.props.values.q6)} detail={"Q6"}/></div>
                <div style={{position: 'absolute', right: '61%', top: '28%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q7, getUnitForTopic(this.props.channels.q7))} floating size={this.props.size} color={this.colorForValue(this.props.values.q7)} detail={"Q7"}/></div>
                <div style={{position: 'absolute', right: '77%', top: '18%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q8, getUnitForTopic(this.props.channels.q8))} floating size={this.props.size} color={this.colorForValue(this.props.values.q8)} detail={"Q8"}/></div>

                <div style={{position: 'absolute', right: '40%', top: '30%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q10, getUnitForTopic(this.props.channels.q10))} floating size={this.props.size} color={this.colorForValue(this.props.values.q10)} detail={"Q10"}/></div>
                <div style={{position: 'absolute', right: '22%', top: '38%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q11, getUnitForTopic(this.props.channels.q11))} floating size={this.props.size} color={this.colorForValue(this.props.values.q11)} detail={"Q11"}/></div>
                <div style={{position: 'absolute', right: '40%', top: '44%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q12, getUnitForTopic(this.props.channels.q12))} floating size={this.props.size} color={this.colorForValue(this.props.values.q12)} detail={"Q12"}/></div>
                <div style={{position: 'absolute', right: '22%', top: '50%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q13, getUnitForTopic(this.props.channels.q13))} floating size={this.props.size} color={this.colorForValue(this.props.values.q13)} detail={"Q13"}/></div>
                <div style={{position: 'absolute', right: '40%', top: '55%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q14, getUnitForTopic(this.props.channels.q14))} floating size={this.props.size} color={this.colorForValue(this.props.values.q14)} detail={"Q14"}/></div>
                <div style={{position: 'absolute', right: '22%', top: '65%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q15, getUnitForTopic(this.props.channels.q15))} floating size={this.props.size} color={this.colorForValue(this.props.values.q15)} detail={"Q15"}/></div>
                <div style={{position: 'absolute', right: '40%', top: '70%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q16, getUnitForTopic(this.props.channels.q16))} floating size={this.props.size} color={this.colorForValue(this.props.values.q16)} detail={"Q16"}/></div>
                <div style={{position: 'absolute', right: '26%', top: '80%', textAlign: 'center' }}><Label content={valueWithUnit(this.props.values.q17, getUnitForTopic(this.props.channels.q17))} floating size={this.props.size} color={this.colorForValue(this.props.values.q17)} detail={"Q17"}/></div>

            </Segment>
        )
    }
}

function parseValueForUnit(unit: string, value: string) {
    switch (unit) {
        case 'Boolean': {
            return (parseInt(value) == 1)
        }
        case 'Float': {
            return parseFloat(value)
        }
        case 'String': {
            return value
        }
    }
}



















