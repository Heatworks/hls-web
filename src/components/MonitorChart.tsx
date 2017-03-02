import * as React from 'react'
import { Client, connect, Granted } from "mqtt"
import HWChart, { DataSource, DataSeries, BarChart, TimeSeriesData, TimeSeriesStyle } from "@heatworks/heatworks-chart-library-web"
import * as d3 from 'd3'
var moment = require('moment');
import TimeIntervalSelector from "./TimeIntervalSelector"
declare var Dimmer;
import { Segment, Loader, Button, Input, Table, Grid, Header,Popup , Select} from 'semantic-ui-react'

import { valueWithUnit } from '../actions/units'

export default class MonitorChart extends React.Component<{
    client: Client,
    channels?: Array<{
        organization: string,
        device:string,
        channel:string,
        topic?:string,
        unit?:string
        }>
    styles?: Array<TimeSeriesStyle>,
    basic?:boolean,
    receivedMessage: (topic:string, value:any) => any,
    accessToken: string
},{
    connected?:boolean,
    messages?: Array<any>,
    data?: Array<Array<TimeSeriesData>>,
    range?: [Date, Date],
    live?: boolean,
    previousRanges?: Array<[Date, Date]>,
    lastUpdate?: Date,
    yRange?: [number, number],
    table?:boolean,
    yRangeSelector?: boolean,
    interval?: number
}> {
    messageQueue:Array<{topic:string, payload: string}> = []
    constructor(props) {
        super(props)
        console.log('Constructed!')

        
        console.log("connecting...");
        var connected = (packet) => {
            console.log('connect')
            console.log(packet);
            this.setState({
                connected: true
            })
            /*

            */
            this.props.channels.forEach((element) => {
                // Don't subscribe to error channel.
                //this.props.client.subscribe(`/organizations/${element.organization}/devices/${element.device}/error`)
                element.topic = `/organizations/${element.organization}/devices/${element.device}/${element.channel}`;
                this.props.client.subscribe(element.topic)
            })
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
        /*this.props.client.on("connect", (error) => {
            console.log(error);
            console.log('Connected!');
            

            
            this.props.client.publish('/organizations/heatworks/devices/listeners', 'Hello mqtt')

        })*/
        this.props.client.on("error", (error) => {
            console.log('Error: '+error);
        })

        this.props.client.on("message", (topic, message, packet) => {
            console.log(`${topic} received ${message.toString()}`)
            this.messageQueue.push({payload: message.toString(), topic})
            var messageParts = message.toString().split(',');
            if (messageParts.length == 2) {
                this.props.receivedMessage(topic, messageParts[1]);
            }
        })
        
        var currentDate = new Date()
        var previousTime = (currentDate.getTime() / 1000) - (60 * 60 * 1) // previous 24 hours
        var interval = 15 * 60;
        var previousDate = moment().subtract(interval, 'seconds').toDate()

        this.state = {
            connected: false,
            messages: [],
            data: this.props.channels.map(() => { return [] }),
            range: [previousDate, currentDate],
            live: true,
            previousRanges: [],
            lastUpdate: new Date(),
            yRange: [10, 50],
            table: false,
            yRangeSelector: false,
            interval
        }
        this.runProcessMessages()
        
    }
    componentWillUnmount() {
        clearTimeout(this.timeout)
    }
    componentWillReceiveProps(nextProps) {
        nextProps.channels.forEach((element) => {
            // Don't subscribe to error channel. It could be exploding with reports.
            //this.props.client.subscribe(`/organizations/${element.organization}/devices/${element.device}/error`)
            element.topic = `/organizations/${element.organization}/devices/${element.device}/${element.channel}`;
            this.props.client.subscribe(element.topic, (response, error) => {
                console.log('Subscribe: '+error+' : '+element.topic);
            })
        })
        var data = nextProps.channels.map((newChannel) => {
            var index = this.props.channels.findIndex((oldChannel) => {
                return (newChannel.organization == oldChannel.organization && newChannel.device == oldChannel.device && newChannel.channel == oldChannel.channel);
            })
            if (index >= 0) {
                return this.state.data[index]
            } else {
                return []
            }
        })
        this.state.data = data
    }
    timeout:any
    runProcessMessages() {
        this.timeout = setTimeout(() => {
            var messages = [];
            for (var i = 0; i < this.messageQueue.length; i++) {
                messages.push(this.messageQueue.pop());
            }
            this.processMessages(messages)
            this.runProcessMessages()
        }, 1000)
    }
    processMessages(newMessages) {
        newMessages.forEach((message) => {
            var channelIndex = -1;
            this.props.channels.forEach((element, index) => {
                if (element.topic == message.topic) {
                    channelIndex = index;
                }
            })
            if (channelIndex < 0) {
                console.log(`Error: ${message.topic}: ${message.payload}`)
                return;
            }

            var datum = new TimeSeriesData()
            var elements = message.payload.toString().split(',');
            datum.datetime = new Date(0)
            var [seconds, milliseconds ] = elements[0].split(".");
            datum.datetime.setUTCSeconds(seconds, milliseconds)
            datum.value = elements[1]

            this.state.messages.push({topic: message.topic, message: message.payload});
            this.state.data[channelIndex].push(datum)
            this.state.data[channelIndex].sort((a,b) => {
                return a.datetime.getTime() - b.datetime.getTime();
            })
        })
    
        var interval = (this.state.range[1].getTime() - this.state.range[0].getTime()) / 1000
        
        var newOld = new Date(0)
        var now = new Date();
        newOld.setUTCSeconds((now.getTime() / 1000) - interval)
        var state = {
        };
        if (this.state.live) {
            state['range'] = [newOld, now];
        }
        this.setState(state)
    }
    
    connect() {

    }
    toggleLive() {
        this.setState({
            live: !this.state.live
        })
    }
    toggleYRange() {
        this.setState({
            yRangeSelector: !this.state.yRangeSelector
        })
    }
    changeRange(startDate, endDate, live = false, back = false) {
        if (!back) {
            var previousRanges = this.state.previousRanges
            previousRanges.push(this.state.range)
            var interval = (endDate.getTime() - startDate.getTime()) / 1000;
            this.setState({
                previousRanges,
                interval
            })
        }
        this.setState({
            live,
            range: [startDate, endDate]
        })
    }
    previousRange() {
        if (this.state.previousRanges.length > 0) {
            var range = this.state.previousRanges.pop()
            this.changeRange(range[0], range[1], this.state.live, true)
        }
    }

    setInterval(interval) {
        this.setState({
            interval,
            range: [moment(this.state.range[1]).subtract(interval, 'second').toDate(), this.state.range[1]]
        })
    }

    setYRange(start, end) {
        this.setState({
            yRange: [start, end]
        })
    }
    
    toggleUnit() {
        
    }

    

    labelForInterval(interval, intervals:Array<{value: number, text: string}>) {
        for (var option of intervals) {
            if (option.value == interval) {
                return option.text;
            }
        }
        if (interval > 60) {
            var minutes = interval / 60;
            if (minutes > 60) {
                var hours = minutes / 60;
                return hours + " hours";
            }
            return minutes + " minutes";
        }
        return interval + " seconds";
    }

    render() {
        var series:DataSeries[] = [{
            dataSource: new DataSource(),
            channel: "TEMPERATURE_CONTROL",
            parseFunction: parseInt,
            style: {
                curve: d3.curveNatural,
                color: "#c0625e"
            }
        }]
        var intervals = [
                        { value: 60*1 , text: "1 Minutes" }, 
                        { value: 60*5 , text: "5 Minutes" }, 
                        { value: 60*15 , text: "15 Minutes" }, 
                        { value: 60*60 , text: "1 Hour" }
                        ];
        
        return (
            <Segment.Group>
                {!this.state.connected ? ( <Loader  />) : null}
                <Segment>
                    <Grid stackable columns={2} padded={false}>
                        <Grid.Column>
                            <Button.Group size="mini" labeled>
                                <Button size="mini" onClick={this.toggleLive.bind(this)} toggle active={this.state.live} icon={this.state.live ? 'pause' : 'play'} content='Live' />
                                <Popup
                                    size="small"
                                    style={{padding: 0, 'min-width': 200}}
                                    flowing={true}
                                    trigger={<Button size="mini" labelPosition='left' icon='options' toggle active={this.state.yRangeSelector} content="Range" />}
                                    content={<Segment basic><Input fluid size="mini"
                                                label={{ basic: true, content: "C°" }}
                                                labelPosition='right'
                                                placeholder='Start'
                                                width={100}
                                                value={this.state.yRange[0]}
                                                onChange={(e) => { 
                                                    this.setState({ yRange: [
                                                        parseInt(e.currentTarget.value), this.state.yRange[1]
                                                    ] })}}
                                                />
                                                <Input fluid size="mini"
                                                label={{ basic: true, content: "C°" }}
                                                labelPosition='right'
                                                placeholder='End'
                                                value={this.state.yRange[1]}
                                                onChange={(e) => { 
                                                    this.setState({ 
                                                        yRange: [this.state.yRange[0], parseInt(e.currentTarget.value)
                                                    ] 
                                                })}}
                                            />
                                        </Segment>}
                                    on='click'
                                    positioning='bottom center'
                                />
                                <Button size="mini" onClick={this.toggleUnit.bind(this)} toggle content="C&deg;" />
                            </Button.Group>
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Segment>
                    <BarChart data={this.state.data} chartType="Line" height={300} mouseFunction={"Move"} domain={{y: this.state.yRange, x: this.state.range }} changeYDomain={this.setYRange.bind(this)} formatXValue={(x) => { return moment(x).format("l LTS") }} formatYValue={(y) => { return valueWithUnit(y, "Celcius");}} changeXDomain={this.changeRange.bind(this)} interval={1} styles={this.props.styles}/>
                </Segment>
                <Segment>
                    <Button.Group size="mini" labeled>
                        <Button size="mini" onClick={() => { this.previousRange() }} labelPosition='left' icon='left chevron' content='Back' />
                        <Popup
                                    size="small"
                                    style={{padding: 0}}
                                    flowing={true}
                                    trigger={<Button size="mini" labelPosition='left' icon='options' toggle content={this.labelForInterval(this.state.interval, intervals)} />}
                                    content={<Select 
                                            selection={true}
                                            onChange={(e, data) => { this.setInterval(data.value); }} 
                                            value={this.state.interval} 
                                            options={intervals}
                                            defaultOpen={true} />}
                                    on='click'
                                    positioning='bottom center'
                                />
                    </Button.Group>
                </Segment>
                <Segment>
                {this.state.table ? (
                    <div>
                    <Button onClick={() => {this.setState({ table: !this.state.table })}}>Hide Table</Button>
                    <Table>
                        <Table.Body>
                            {this.state.messages.slice().reverse().slice(0, 100).map((message, index) => {
                                return (<Table.Row key={this.state.messages.length - index}>
                                    <Table.Cell collapsing>
                                        {message.topic}
                                    </Table.Cell>
                                    <Table.Cell collapsing>
                                        {message.message}
                                    </Table.Cell>
                                </Table.Row>)
                            })}
                        </Table.Body>
                    </Table></div>)
                : (
                    <Button content='Table'
                            icon='table'
                            label={{ as: 'a', basic: true, content: this.state.messages.length }}
                            labelPosition='right' 
                            onClick={() => {this.setState({ table: !this.state.table })}} />)}
                        
                </Segment>
            </Segment.Group>
        )
    }
}