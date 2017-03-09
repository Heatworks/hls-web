import * as React from 'react'
import { Table, Label, Button, Segment, Header, Icon, Input } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
var moment = require('moment')

export default class TestsTable extends React.Component<{
    views: {
        data: Array<{
            name:string,
            description:string,
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
        <Table selectable fixed sortable singleLine>
            <Table.Header>
                <Table.Row disabled={this.props.views.loading}>
                <Table.HeaderCell sorted={(this.state.sortTag == "STATUS") ? direction : null } onClick={() => {
                    this.setState({
                        sortTag: 'STATUS',
                        direction: (this.state.sortTag == "STATUS" ? (this.state.direction*-1) : this.state.direction)
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
                this.props.views.data.sort((a, b) => {
                    if (this.state.sortTag == "name") {
                        return a.name > b.name ? -this.state.direction : this.state.direction
                    }
                    var tagSort = (a.tags[this.state.sortTag] > b.tags[this.state.sortTag]) ? -this.state.direction : this.state.direction
                    return tagSort
                    //return (a.range.length == b.range.length) ? dateSort : ((a.range.length > b.range.length) ? 1 : 0)
                }).map((row, index) => {
                    return (<Table.Row key={index} disabled={this.props.views.loading} {...{onClick:() => {
                        if (this.props.onClick) {
                            this.props.onClick(row);
                        } else {
                            browserHistory.push(`/${this.props.params.organizationName}/tests/${row.name.split('/tests/')[1]}/`)
                        }
                        }}}>
                        <Table.Cell singleLine={true} width={4}>{row.name.substr(`/organizations/${this.props.params.organizationName}/tests/`.length)}</Table.Cell>
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