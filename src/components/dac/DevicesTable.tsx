import * as React from 'react'
import { Table, Label, Button, Segment, Header } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'

export default class DevicesTable extends React.Component<{
    devices: {
        data: Array<{
            name:string,
            description:string,
            channels:Map<string, {
                unit: string,
                rate: number,
                control: boolean
            }>,
            tags: any
        }>
        loading: boolean
        loaded: boolean
    },
    accessToken: string,
    actions: {
        load: (accessToken: string) => any
    },
    params: {
        organizationName: string
    }
},{}> {
    constructor(props) {
        super(props)
        this.props.actions.load(this.props.accessToken)
    }
    render() {
        return (
        <Table singleLine selectable >
            <Table.Header>
                <Table.Row disabled={this.props.devices.loading}>
                <Table.HeaderCell sorted={"descending"}>Name</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Channels</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {
                this.props.devices.data.map((row, index) => {
                    return (<Table.Row key={index} disabled={this.props.devices.loading} {...{onClick:() => {
                            browserHistory.push(`/${this.props.params.organizationName}/dac/devices/${row.name.split('/devices/')[1]}/`)
                        }}}>
                    <Table.Cell>{row.name.substr(`/organizations/${this.props.params.organizationName}/devices/`.length)}</Table.Cell>
                    <Table.Cell>{row.description}</Table.Cell>
                    <Table.Cell>{Object.keys(row.channels).length}</Table.Cell>
                    </Table.Row>)
                })
            }
            </Table.Body>
        </Table>);
    }
}