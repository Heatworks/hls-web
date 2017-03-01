import * as React from 'react'
import { Table, Label, Sidebar, Menu, Icon, IconGroup, Segment, Button, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router'
import * as d3 from 'd3'
import { Client, connect, Granted } from "mqtt"
import MonitorChart from "./MonitorChart"

import 'whatwg-fetch'

const defaultStyles = [
    {
        curve: d3.curveLinear,
        color: "#0074D9"
    },
    {
        curve: d3.curveLinear,
        color: "#FF4136"
    },
    {
        curve: d3.curveLinear,
        color: "#3D9970"
    },
    {
        curve: d3.curveLinear,
        color: "#111111"
    },
    {
        curve: d3.curveLinear,
        color: "#DDDDDD"
    },
    {
        curve: d3.curveLinear,
        color: "#FFDC00"
    },
    {
        curve: d3.curveLinear,
        color: "#001f3f"
    },
    {
        curve: d3.curveLinear,
        color: "#85144b"
    },
    {
        curve: d3.curveLinear,
        color: "#B10DC9"
    },
    {
        curve: d3.curveLinear,
        color: "#AAAAAA"
    },
    {
        curve: d3.curveLinear,
        color: "#01FF70"
    },
    {
        curve: d3.curveLinear,
        color: "#F012BE"
    },
    {
        curve: d3.curveLinear,
        color: "#7FDBFF"
    },
    {
        curve: d3.curveLinear,
        color: "#c0625e"
    },
    {
        curve: d3.curveLinear,
        color: "#FF851B"
    },
    {
        curve: d3.curveLinear,
        color: "#39CCCC"
    }
    
]

export default class Monitor extends React.Component<{
    monitor: {
        open: boolean,
        channels: [{organization:string, device:string, channel:string}],
        organization: string,
        device: string,
        channel: string,
        clientError: string | null
    },
   monitorActions: {
       close: () => any,
       open: (organization?, device?, channel?) => any,
       stop: (organization, device, channel) => any,
       newMonitoredValue: (topic, value) => any
   }
   client: Client,
   organizationName: String
},{}> {
    changeRange() {
        
    }
    render() {
        return (
            <div>
                <Sidebar as={Segment} animation='push' direction='bottom' visible={this.props.monitor.open}>
                    <Menu secondary>
                        <Menu.Item as={Dropdown} {...{text: 'Channels'}}>
                            <Dropdown.Menu>
                                {this.props.monitor.channels.map( (channel, index) => {
                                    return (<Dropdown.Item key={index} as={Link} {...{to: `/${channel.organization}/dac/devices/${channel.device}/${channel.channel}`}}>{`${channel.device}/${channel.channel}`}</Dropdown.Item>)
                                })}
                            </Dropdown.Menu>
                        </Menu.Item>
                        <Menu.Item as={Button} {...{ onClick: () => {}}}>Generate Test</Menu.Item>                        <Menu.Item as={Button} {...{ onClick: this.props.monitorActions.close }} position="right">
                            <Icon name='close' />Close</Menu.Item>
                    </Menu>
                    {this.props.monitor.channels.map( (channel, index) => {
                                    return (<Button size="small" compact basic key={index} onClick={() => {
                                        this.props.monitorActions.stop(channel.organization, channel.device, channel.channel)
                                    }}><Dot color={defaultStyles[index].color} />{`${channel.device}/${channel.channel}`}</Button>)
                                })}
                    {(this.props.monitor.channels.length > 0) ? <MonitorChart client={this.props.client} channels={this.props.monitor.channels} basic={true} styles={defaultStyles} receivedMessage={(topic, value) => {
                        this.props.monitorActions.newMonitoredValue(topic, value);
                    }}></MonitorChart> : <div>Select a channel to monitor.</div>}
                </Sidebar> 
                {
                    this.props.monitor.open ? null : (
                    <Menu fixed="bottom">
                        <Menu.Item><Icon.Group>
                            <Icon name="wifi" />
                            <Icon corner name={this.props.monitor.clientError ? 'warning sign' : 'check'} />
                        </Icon.Group> &nbsp;{this.props.monitor.clientError ? this.props.monitor.clientError : 'Connected' }</Menu.Item>
                        <Menu.Menu position="right">
                            <Menu.Item as={Button} { ...{onClick: () => {
                                launchIntoFullscreen(document.documentElement); 
                            }}}><Icon name='expand' /> Fullscreen</Menu.Item>
                            <Menu.Item as={Button} {...{ onClick: this.props.monitorActions.open }}>
                            <Icon name='unhide' /> Open</Menu.Item>
                        </Menu.Menu>
                    </Menu>)
                }
            </div>     
            );
    }
}

class Dot extends React.Component<{ color: string }, {}> {
    render () {
        return (<span style={{
            width: 8,
            height: 8,
            backgroundColor: this.props.color,
            display: 'inline-block',
            borderRadius: '2em',
            marginRight: 5,
            top: -2,
        }}></span>)
    }
}

// Find the right method, call on correct element
function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

