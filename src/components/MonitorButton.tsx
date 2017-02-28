import * as React from 'react'
import { Button } from 'semantic-ui-react'
import { getTemperatureUnit, UnitLabels, valueWithUnit } from '../actions/units'

export default class MonitorButton extends React.Component<{
    monitorActions: {
        start: ( organization: string, device: string, channel: string ) => any,
        stop: ( organization:string, device: string, channel: string ) => any,
        loadUnits: (accessToken: string) => any
    },
    monitor: {
        channels: Array<{ organization: string, device: string, channel: string, value?: any }>
    }
    organization:string,
    device: string,
    channel: string,
    unit?: string,
    rate?: number,
    accessToken: string
}, {}> {
    constructor(props) {
        super(props)
        if (props.unit == null) {
            this.props.monitorActions.loadUnits(this.props.accessToken)
        }
    }
    render () {
        const { organization, device, channel, monitor, monitorActions, unit, accessToken, ...props } = this.props
        const monitoring = monitor.channels.filter((channel) => { 
            return (channel.organization == organization && channel.device == device && channel.channel == this.props.channel); 
        })
        const isMonitoring = (monitoring.length > 0)
        const label = { as: 'span', basic: true, content: (isMonitoring) ? valueWithUnit(monitoring[0].value, this.props.unit) : null }
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