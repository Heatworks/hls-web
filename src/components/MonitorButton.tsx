import * as React from 'react'
import { Button } from 'semantic-ui-react'

export default class MonitorButton extends React.Component<{
    monitorActions: {
        start: ( organization: string, device: string, channel: string ) => any,
        stop: ( organization:string, device: string, channel: string ) => any
    },
    monitor: {
        channels: Array<{ organization: string, device: string, channel: string, value?: any }>
    }
    organization:string,
    device: string,
    channel: string
}, {}> {
    render () {
        const { organization, device, channel, monitor, monitorActions, ...props } = this.props
        const monitoring = monitor.channels.filter((channel) => { 
            return (channel.organization == organization && channel.device == device && channel.channel == this.props.channel); 
        })
        const isMonitoring = (monitoring.length > 0)
        const label = { as: 'span', basic: true, content: (isMonitoring) ? monitoring[0].value : null }
        return (
            <Button onClick={() => { 
                if (isMonitoring) {
                    monitorActions.stop(organization, device, channel)
                } else {
                    monitorActions.start(organization, device, channel)
                }
            }} size="small" icon={isMonitoring ? "unhide" : "hide"} {...props} label={(isMonitoring) ? label : null}></Button>
        )
    }
}