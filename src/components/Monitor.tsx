import * as React from 'react'
import { Table, Label, Sidebar, Menu, Icon, IconGroup, Segment, Button, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router'
import * as d3 from 'd3'
import { Client, connect } from "mqtt"
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


export interface ClientFixed extends Client {
    connected: boolean
}

export default class Monitor extends React.Component<{
    monitor: {
        open: boolean,
        channels: [{organization:string, device:string, channel:string}],
        organization: string,
        device: string,
        channel: string,
        client: any | null,
        clientError: any | null,
        loading: boolean
    },
   monitorActions: {
       close: () => any,
       open: (organization?, device?, channel?) => any,
       stop: (organization, device, channel) => any,
       newMonitoredValue: (topic, value) => any,
       reloadClient: (accessToken) => any
   }
   client: ClientFixed,
   organizationName: String,
   accessToken: string,
    iam: {
        loading: boolean,
        loaded: boolean,
        data: {
            accessToken: string
        },
        organization?: {
            organizationName: string,
            organizationId: string,
            policy: any
        }
    }
},{}> {
    changeRange() {
        
    }
    iconForClient() {
        if (this.props.client == null) {
            if (this.props.monitor.clientError) {
                return 'warning'
            } else if (this.props.monitor.loading) {
                return 'spinner'
            } else {
                return null;
            }
        } else {
            return 'check';
        }
    }
    render() {
        if (this.props.iam.loaded == false) {
            return null;
        }
        console.log('Render Monitor');
        return (
            <div>
                <Sidebar as={Segment} animation='push' direction='bottom' visible={this.props.monitor.open}>
                    <Menu secondary>
                        <Menu.Item as={Dropdown} {...{text: 'Channels'}}>
                            <Dropdown.Menu>
                                {this.props.monitor.channels.map( (channel, index) => {
                                    return (<Dropdown.Item key={index}><Link to={`/${channel.organization}/dac/devices/${channel.device}/${channel.channel}`}>{`${channel.device}/${channel.channel}`}</Link></Dropdown.Item>)
                                })}
                            </Dropdown.Menu>
                        </Menu.Item>
                        <Menu.Item as={Button} {...{ onClick: () => {}}}>Generate Test</Menu.Item>                        
                        <Menu.Item as={Button} {...{ onClick: this.props.monitorActions.close }} position="right">
                            <Icon name='close' />Close</Menu.Item>
                    </Menu>
                    {this.props.monitor.channels.map( (channel, index) => {
                                    return (<Button size="small" compact basic key={index} onClick={() => {
                                        this.props.monitorActions.stop(channel.organization, channel.device, channel.channel)
                                    }}><Dot color={defaultStyles[index].color} />{`${channel.device}/${channel.channel}`}</Button>)
                                })}
                    {(this.props.monitor.channels.length > 0) ? <MonitorChart client={this.props.client} accessToken={this.props.accessToken} channels={this.props.monitor.channels} basic={true} styles={defaultStyles} receivedMessage={(topic, value) => {
                        this.props.monitorActions.newMonitoredValue(topic, value);
                    }}></MonitorChart> : <div>Select a channel to monitor.</div>}
                </Sidebar> 
                {
                    this.props.monitor.open ? null : (
                    <Menu fixed="bottom">
                        <Menu.Item><Icon.Group>
                            <Icon name="wifi" />
                            <Icon corner  loading={this.props.monitor.loading} name={this.iconForClient()} />
                        </Icon.Group> &nbsp;{this.props.monitor.clientError ? this.props.monitor.clientError : (this.props.monitor.client ? 'Connected' : 'Not Connected') }</Menu.Item>
                        {this.props.monitor.clientError ? <Menu.Item as={Button} {...{onClick: () => {
                            this.props.monitorActions.reloadClient(this.props.accessToken);
                        }}}> <Icon name="refresh" /> Reload </Menu.Item> : null }
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

