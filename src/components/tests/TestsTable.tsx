import * as React from 'react'
import { Table, Label, Button, Segment, Header, Icon, Input } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
var moment = require('moment')

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
    onDataLoad?: (data: any) => any,
    prefix: string
},{
    currentPrefix?: string,
    sortTag?:string,
    direction?: number,
    tagsInTable?: Array<string>
}> {
    constructor(props) {
        super(props)
        this.state = {
            currentPrefix: this.props.prefix,
            sortTag: "CREATED_DATE",
            direction: 1,
            tagsInTable: []
        }
        this.props.actions.load(this.state.currentPrefix, this.props.accessToken)

        if (this.props.onDataLoad) {
            this.props.onDataLoad(this.props.tests.data)
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.onDataLoad) {
            this.props.onDataLoad(this.props.tests.data)
        }
        
        if (nextProps.prefix !== this.state.currentPrefix) {
            this.state.currentPrefix = nextProps.prefix;
            this.props.actions.load(this.state.currentPrefix, this.props.accessToken)
        }
    }
    render() {
        const direction = (this.state.direction == 1 ? "ascending" : "descending")
        return (
        <Table selectable fixed sortable singleLine>
            <Table.Header>
                <Table.Row disabled={this.props.tests.loading}>
                <Table.HeaderCell sorted={(this.state.sortTag == "status") ? direction : null } onClick={() => {
                    this.setState({
                        sortTag: 'status',
                        direction: (this.state.sortTag == "status" ? (this.state.direction*-1) : this.state.direction)
                    })
                    }}>Name</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell sorted={(this.state.sortTag == "CREATED_DATE") ? direction : null } onClick={() => {
                            this.setState({
                                sortTag: "CREATED_DATE",
                                direction: (this.state.sortTag == "CREATED_DATE" ? (this.state.direction*-1) : this.state.direction)
                            })
                            }}>Created Date</Table.HeaderCell>
                            {this.state.tagsInTable.map((tag) => {
                    return (
                        <Table.HeaderCell sorted={(this.state.sortTag == tag) ? direction : null } onClick={() => {
                            this.setState({
                                sortTag: tag,
                                direction: (this.state.sortTag == tag ? (this.state.direction*-1) : this.state.direction)
                            })
                            }}>{tag}</Table.HeaderCell>
                    )
                })}
                {}
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {
                this.props.tests.data.sort((a, b) => {
                    if (this.state.sortTag == "name") {
                        return a.name > b.name ? -this.state.direction : this.state.direction
                    }
                    if (this.state.sortTag == "status") {
                        const statusOrder = ["failed", "passed","passing","failing"]
                        return (statusOrder.indexOf(a.tags['status']) > statusOrder.indexOf(b.tags['status'])) ?  -this.state.direction : this.state.direction
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
                        <Table.Cell singleLine={true} width={4}>{iconForStatus(row.tags.status)} {row.name.substr(`/organizations/${this.props.params.organizationName}/tests/`.length)}<br/>
                        <small>{row.range.map((time) => { return (<span>{ moment(time * 1000).format('MM/DD/YYYY HH:MM:SS') } &nbsp;&nbsp;</span>) })}</small></Table.Cell>
                        <Table.Cell singleLine={false} width={10}>{row.description}</Table.Cell>
                        <Table.Cell>{moment(row.tags['CREATED_DATE']).format("M/D HH:mm - YYYY")}</Table.Cell>
                         {this.state.tagsInTable.map((tag) => {
                            return (<Table.Cell>{row.tags[tag]}</Table.Cell>)
                         })}
                    </Table.Row>)
                })
            }
            </Table.Body>
        </Table>);
    }
}