import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image, Radio, Loader, Message } from 'semantic-ui-react'
import { SemanticWIDTHS, SemanticSIZES } from 'semantic-ui-react/dist/commonjs'
import { Link , browserHistory} from 'react-router'
import { Client, connect, Granted } from "mqtt"
import Helmet from 'react-helmet'
var zipObject = require('zip-object');
import { valueWithUnit, getUnitForTopic, getTemperatureUnit, UnitLabels } from '../../actions/units'
import { View as ViewModel, ViewRow } from '../../apis/hls_views'
import { normalizeName } from '../../utils/normalizeNames'

import * as DAC from '../../apis/hls_dac';
var api_dac = new DAC.DefaultApi()

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
    client: Client,
    
},{
    view?: ViewModel,
    connected?: boolean,
    channels?: any,
    error?: string,
    editing?: boolean,
    live?:boolean,
    saving?:boolean,
    currentTimestamp?: number
}> {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            view: null,
            channels: {},
            live: false,
            editing: false,
            saving: false,
            error: null,
            currentTimestamp: 0
        }
        console.log('Client:')
        console.log(this.props.client)
    }
    componentWillMount() {
        console.log('componentWillMount' + this.props.params.splat )
        this.props.actions.load(this.props.params.splat, this.props.accessToken)
    }
    componentWillUnmount() {
        this.unsubscribeFromChannels()
    }
    componentWillReceiveProps(nextProps) {
        console.log('Client:')
        console.log(this.props.client)
        if (this.state.view == null || nextProps.view.data.name !== this.state.view.name) {
            if (nextProps.client && nextProps.client.connected) {
                this.unsubscribeFromChannels()
                this.setState({
                    view: Object.assign({}, nextProps.view.data),
                    saving: false
                }, () => {
                    setTimeout(() => {
                        this.setupLive()
                    }, 2000)
                })
            }
        } else {
            this.setState({
                saving: false
            })
        }
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
                error
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
                value: null
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
            var rawValue = message.toString().split(",")[1]
            this.setTopicValue(topic, rawValue)
        }
    }
    setTopicValue(channel, value) {
        var unit = (this.state.channels[channel]) ? this.state.channels[channel].unit : 'String';
        if (unit == null) {
            unit = 'String'
        }
        var channels = {
            ...this.state.channels
        }
        channels[channel] = {
            unit,
            value
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
                        this.setTopicValue(channelDatum.channel, parseFloat(channelDatum.datum['value_float']))
                    } else {
                        this.setTopicValue(channelDatum.channel, channelDatum.datum['value_string'])
                    }
                }
            })
        }).then(() => {
            this.setState({
                currentTimestamp: timestamp
            })
        })
    }

    render() {
        if (!this.props.view.loaded || this.state.view == null) {
            return (<Segment basic vertical>
                <Loader active inline='centered' />
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
                                <Link to={`/${this.props.params.organizationName}/views/`}>Views</Link> / {normalizeName(this.state.view.name, "local")}<br/><Header sub>{this.state.view.description}</Header>
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Menu floated="right">
                                {!this.state.live ? <Menu.Item style={{paddingTop:0,paddingBottom:0,paddingRight:3, paddingLeft:3}}><Input type="text" value={this.state.currentTimestamp} onChange={(e) => {
                                    this.loadHistoricalTimestamp(parseFloat(e.currentTarget.value))
                                }}/></Menu.Item> : null}
                                {!this.state.live ? <Menu.Item as={Button} onClick={() => {
                                    this.loadHistoricalTimestamp(this.state.currentTimestamp - 1)}} content='-1s' /> : null}
                                {!this.state.live ? <Menu.Item as={Button} {...{onClick: () => {
                                    this.loadHistoricalTimestamp(this.state.currentTimestamp + 1)
                                }}} content='+1s' /> : null}
                                <Menu.Item as={Button} content={'Live'} icon={this.state.live ? 'pause' : 'play'} {...{onClick: () => {
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
                                <Menu.Item as={Button} {...{onClick: () => {
                                this.setState({
                                    editing: !this.state.editing
                                })
                            }}} active={this.state.editing}><Icon name="edit" />Edit</Menu.Item></Menu>
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
            return <Segment loading />
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
        } else if (column.component == "/organizations/hls/views/components/analog") {
            return (<AnalogSensorValue {...column.props} channels={column.channels} values={zipObject(Object.keys(column.channels),Object.keys(column.channels).map((key) => {
                    return this.state.channels[column.channels[key]].value
                }))} />)
        } else if (column.component == "/organizations/hls/views/components/divider") {
            return (<Divider />)
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
                    }} />  : (this.props.column.props.title ? <Header subheader>{this.props.column.props.icon ? <Icon name={this.props.column.props.icon} circular style={{ marginRight: 0 }} /> : null }<Header.Content>{this.props.column.props.title} </Header.Content></Header> : null)
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
        PowerInControl: string,
        PowerInValue: string,
        stabsControl: string,
        stabsValue: string
    }
    values: {
        waterInControl: boolean,
        waterInValue: boolean,
        waterOutControl: boolean,
        waterOutValue: boolean,
        PowerInControl: boolean,
        PowerInValue: boolean,
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
        this.props.publish(this.props.channels.waterInControl, 0)
    }
    
    render() {
        var values = {
            waterInValue: valueWithUnit(this.props.values.waterInValue, "Boolean"),
            waterOutValue: valueWithUnit(this.props.values.waterOutValue, "Boolean"),
            stabsValue: valueWithUnit(this.props.values.stabsValue, "Boolean")
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
        

        return (
            <Segment style={{height: 200, overflow:'hidden'}}>
                <div style={{ width: '50%', height: 200, float:'left', marginTop: -15}}>
                <Image src={image} style={{ height: '100%'}} />
                </div>
                <div style={{ width: '50%', float:'left', textAlign: 'right'}}>
                {values.stabsValue == false ? (
                    <p>
                        <Button content="Engage Stabs" onClick={this.engageStabs.bind(this)} /><Button content="Disengage Stabs" color={"red"} onClick={this.disengageStabs.bind(this)} />
                        </p>) : 
                    (<p><Button.Group basic size={"large"}><Button content="Flow Start" onClick={this.startFlow.bind(this)} /><Button content="Flow Stop" onClick={this.endFlow.bind(this)} /></Button.Group><br/><br/>{values.waterInValue == true ? null : <Button content="Disengage Stabs" compact color={"red"} onClick={this.disengageStabs.bind(this)} />}</p>)}
                </div>
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
        value: number
    },
    units: string,
    sparklinesLength: number,
    min: number,
    max: number,
    color: string
},{
    values: Array<number>
}> {
    constructor(props) {
        super(props)
        this.state = {
            values: []
        }
    }
    lastValue:number
    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value != this.lastValue) {
            var newValues = this.state.values.slice(Math.max(this.state.values.length - this.props.sparklinesLength, 0))
            newValues.push(nextProps.values.value)
            this.setState({
                values: newValues
            })
            this.lastValue = nextProps.values.value;
        }
    }
    render() {
        return (
            <Segment>
                <div style={{width: '70%', float:'right', height: 30}}>
                    <Sparklines data={this.state.values} height={30}  min={this.props.min} max={this.props.max}>
                        <SparklinesLine color={this.props.color} />
                    </Sparklines>
                </div>
                <div style={{width: '30%'}}>{valueWithUnit(this.props.values.value,this.props.units)}</div>
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





















