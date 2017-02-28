import * as React from 'react'
import { Table, Label, Button, Segment, Header } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'

import { iconForStatus } from './helpers'

export default class TestsTable extends React.Component<{
    tests: {
        data: Array<{
            name:string,
            description:string,
            channels:Array<String>,
            organizationName: string,
            tags: any,
            range: Array<number>
        }>
        loading: boolean
        loaded: boolean
    },
    accessToken: string,
    actions: {
        load: (prefix:string, accessToken: string) => any
    },
    params: {
        organizationName: string
    },
    onClick?: (test: any) => any,
    prefix: string
},{
    currentPrefix?: string,
    sortTag?:string,
    direction?: number
}> {
    constructor(props) {
        super(props)
        this.state = {
            currentPrefix: this.props.prefix,
            sortTag: "CREATED_DATE",
            direction: 1
        }
        this.props.actions.load(this.state.currentPrefix, this.props.accessToken)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.prefix !== this.state.currentPrefix) {
            this.state.currentPrefix = nextProps.prefix;
            this.props.actions.load(this.state.currentPrefix, this.props.accessToken)
        }
    }
    render() {
        const direction = (this.state.direction == 1 ? "ascending" : "descending")
        return (
        <Table selectable fixed sortable>
            <Table.Header>
                <Table.Row disabled={this.props.tests.loading}>
                <Table.HeaderCell sorted={(this.state.sortTag == "name") ? direction : null } onClick={() => {
                    this.setState({
                        sortTag: 'name',
                        direction: (this.state.sortTag == "name" ? (this.state.direction*-1) : this.state.direction)
                    })
                    }}>Name</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Channels</Table.HeaderCell>
                <Table.HeaderCell sorted={(this.state.sortTag == "CREATED_DATE") ? direction : null } onClick={() => {
                    this.setState({
                        sortTag: 'CREATED_DATE',
                        direction: (this.state.sortTag == "CREATED_DATE" ? (this.state.direction*-1) : this.state.direction)
                    })
                    }}>Created Date</Table.HeaderCell>
                <Table.HeaderCell sorted={(this.state.sortTag == "status") ? direction : null } onClick={() => {
                    this.setState({
                        sortTag: 'status',
                        direction: (this.state.sortTag == "status" ? (this.state.direction*-1) : this.state.direction)
                    })
                    }}>Status</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {
                this.props.tests.data.sort((a, b) => {
                    if (this.state.sortTag == "name") {
                        return a.name > b.name ? -this.state.direction : this.state.direction
                    }
                    var tagSort = (a.tags[this.state.sortTag] > b.tags[this.state.sortTag]) ? -this.state.direction : this.state.direction
                    return tagSort
                    //return (a.range.length == b.range.length) ? dateSort : ((a.range.length > b.range.length) ? 1 : 0)
                }).map((row, index) => {
                    return (<Table.Row key={index} disabled={this.props.tests.loading} {...{onClick:() => {
                        if (this.props.onClick) {
                            this.props.onClick(row);
                        } else {
                            browserHistory.push(`/${this.props.params.organizationName}/tests/${row.name.split('/tests/')[1]}/`)
                        }
                        }}}>
                        <Table.Cell singleLine={true} width={4}>{row.name.substr(`/organizations/${this.props.params.organizationName}/tests/`.length)} {iconForStatus(row.tags.status)}</Table.Cell>
                        <Table.Cell singleLine={false} width={10}>{row.description}</Table.Cell>
                        <Table.Cell width={2}>{row.channels.length}</Table.Cell>
                        <Table.Cell>{row.tags['CREATED_DATE']}</Table.Cell>
                        <Table.Cell>{row.tags['status']}</Table.Cell>
                    </Table.Row>)
                })
            }
            </Table.Body>
        </Table>);
    }
}