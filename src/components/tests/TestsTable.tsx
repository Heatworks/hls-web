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
            tags: any
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
    currentPrefix: string
}> {
    constructor(props) {
        super(props)
        this.state = {
            currentPrefix: this.props.prefix
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
        return (
        <Table selectable>
            <Table.Header>
                <Table.Row disabled={this.props.tests.loading}>
                <Table.HeaderCell sorted="ascending">Name</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Channels</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {
                this.props.tests.data.map((row, index) => {
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
                    </Table.Row>)
                })
            }
            </Table.Body>
        </Table>);
    }
}