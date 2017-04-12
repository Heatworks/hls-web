import * as React from 'react'
import { Table, Label, Button, Segment, Header, Icon, Input, Menu, Dropdown } from 'semantic-ui-react'
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
    prefix: string,
    showDuration?: boolean
},{
    currentPrefix?: string,
    sortTag?:string,
    direction?: number,
    tagsInTable?: Array<string>,
    search?:string,
    searchInput?:string
}> {
    constructor(props) {
        super(props)
        this.state = {
            currentPrefix: this.props.prefix,
            sortTag: "CREATED_DATE",
            direction: 1,
            tagsInTable: [],
            search: this.props.prefix,
            searchInput: this.props.prefix
        }
        this.previousPrefix = this.props.prefix
    }
    componentWillMount() {
        this.props.actions.load(this.state.currentPrefix, this.props.accessToken)
    }
    previousPrefix = ""
    componentWillReceiveProps(nextProps) {
        if (nextProps.prefix != this.previousPrefix) {
            this.previousPrefix = nextProps.prefix
            this.updateSearch(nextProps.prefix, nextProps.prefix);
        }
    }
    updateSearch(search, searchInput) {
        this.setState({
            search,
            searchInput
        }, () => {
            if (this.state.search !== this.state.currentPrefix) {
                this.state.currentPrefix = this.state.search;
                this.props.actions.load(this.state.search, this.props.accessToken)
            }
        })
    }
    onClickRow(row) {
        if (this.props.onClick) {
            this.props.onClick(row);
        } else {
            browserHistory.push(`/${this.props.params.organizationName}/tests/${row.name.split('/tests/')[1]}/`)
        }
    }
    render() {
        const direction = (this.state.direction == 1 ? "ascending" : "descending")
        var duration_seconds = 0
        var tags = {};
        this.props.tests.data.forEach((test) => {
            if (test.range.length == 2) {
                duration_seconds += test.range[1] - test.range[0];
            }
            Object.keys(test.tags).forEach((key) => {
                tags[key] = (this.state.tagsInTable.indexOf(key) !== -1);
            });
        })
        var duration = moment.duration(duration_seconds * 1000)
        return (
            <div>
                <Menu secondary>
                        {this.props.showDuration ? <Menu.Item>Duration: {duration.humanize()} ({`${Math.floor(duration.asDays())+Math.round(((duration.hours()/24)+(duration.minutes()/24/60)+(duration.seconds()/24/60/60))*1000)/1000}`})</Menu.Item> : null}
                        <Menu.Menu position='right'>
                            <Menu.Item name="export" content="Export" icon="download" onClick={() => {
                                    saveJSON(this.props.tests.data, 'tests-list.json')
                                }} />
                            <Menu.Item as={Dropdown} {...{text: 'Tags', scrolling: true}}>
                                <Dropdown.Menu>
                                    {Object.keys(tags).sort().map( (tag, index) => {
                                        return (<Dropdown.Item key={index} onClick={() => {
                                            var newTagsInTable = this.state.tagsInTable.splice(0);
                                            if (tags[tag]) {
                                                newTagsInTable.splice(newTagsInTable.indexOf(tag), 1);
                                            } else {
                                                newTagsInTable.push(tag);
                                            }
                                            this.setState({
                                                tagsInTable: newTagsInTable
                                            })
                                            }}>{tags[tag] ? <Icon name="check" /> : null}{tag}</Dropdown.Item>)
                                    })}
                                </Dropdown.Menu>
                            </Menu.Item>
                        <Menu.Item>
                            <Input icon='search' placeholder='Search tests...' value={this.state.searchInput} onChange={(e) => {
                                this.updateSearch(e.currentTarget.value.substr(0, e.currentTarget.value.lastIndexOf('/') + 1), e.currentTarget.value);
                            }}/>
                        </Menu.Item>
                        </Menu.Menu>
                    </Menu>
            <Table selectable fixed sortable singleLine>
                <Table.Header>
                    <Table.Row disabled={this.props.tests.loading}>
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
                    this.props.tests.data.sort((a, b) => {
                        if (this.state.sortTag == "name") {
                            return a.name > b.name ? -this.state.direction : this.state.direction
                        }
                        if (this.state.sortTag == "STATUS") {
                            const statusOrder = ["failed", "passed","passing","failing"]
                            return (statusOrder.indexOf(a.tags['STATUS']) > statusOrder.indexOf(b.tags['STATUS'])) ?  -this.state.direction : this.state.direction
                        }
                        var tagSort = (a.tags[this.state.sortTag] > b.tags[this.state.sortTag]) ? -this.state.direction : this.state.direction
                        return tagSort
                        //return (a.range.length == b.range.length) ? dateSort : ((a.range.length > b.range.length) ? 1 : 0)
                    }).map((row, index) => {
                        return (<Table.Row key={index} disabled={this.props.tests.loading} >
                            <Table.Cell onClick={() => {
                                this.onClickRow(row);
                                }} singleLine={true} style={{ cursor: 'pointer' }} width={4}>{iconForStatus(row.tags.STATUS)} {row.name.substr(`/organizations/${this.props.params.organizationName}/tests/`.length)}<br/>
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
            </Table>
        </div>);
    }
}


function saveJSON(data, filename){

    if(!data) {
        console.error('No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')
        a.setAttribute('target', '_blank')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}