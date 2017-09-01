import * as React from 'react'
import { Table, Label, Button, Segment, Header, Menu, Dropdown, Icon, Input } from 'semantic-ui-react'
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
        load: (prefix: string, accessToken: string) => any
    },
    params: {
        organizationName: string
    },
    prefix: string,
    onClick: (row) => any
},{
    currentPrefix?: string,
    sortTag?:string,
    direction?: number,
    tagsInTable?: Array<string>,
    search?:string,
    searchInput?:string
}> {
    previousPrefix:string
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
    updateSearch(search, searchInput) {
        this.setState({
            search,
            searchInput
        }, () => {
            if (this.state.search !== this.state.currentPrefix) {
                this.setState({
                    ...this.state,
                    currentPrefix: this.state.search
                }, () => {
                    this.props.actions.load(this.state.search, this.props.accessToken)
                })
            }
        })
    }
    onClickRow(row) {
        if (this.props.onClick) {
            this.props.onClick(row);
        } else {
            browserHistory.push(`/${this.props.params.organizationName}/devices/${row.name.split('/devices/')[1]}/`)
        }
    }
    render() {
        const direction = (this.state.direction == 1 ? "ascending" : "descending")        
        var tags = {};
        this.props.devices.data.forEach((test) => {
            Object.keys(test.tags).forEach((key) => {
                tags[key] = (this.state.tagsInTable.indexOf(key) !== -1);
            });
        })
        return (
        <div>
            <Menu secondary>
                <Menu.Menu position='right'>
                    <Menu.Item name="export" content="Export" icon="download" onClick={() => {
                           // saveJSON(this.props.tests.data, 'tests-list.json')
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
                    <Input icon='search' placeholder='Search devices...' disabled value={this.state.searchInput} onChange={(e) => {
                        this.updateSearch(e.currentTarget.value.substr(0, e.currentTarget.value.lastIndexOf('/') + 1), e.currentTarget.value);
                    }}/>
                </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Table singleLine selectable >
                <Table.Header>
                    <Table.Row disabled={this.props.devices.loading}>
                    <Table.HeaderCell sorted={"descending"}>Name</Table.HeaderCell>
                    <Table.HeaderCell>Description</Table.HeaderCell>
                    <Table.HeaderCell>Channels</Table.HeaderCell>
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
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {
                    this.props.devices.data.sort((a, b) => {
                        if (this.state.sortTag == "name") {
                            return a.name > b.name ? -this.state.direction : this.state.direction
                        }
                        var tagSort = (a.tags[this.state.sortTag] > b.tags[this.state.sortTag]) ? -this.state.direction : this.state.direction
                        return tagSort
                        //return (a.range.length == b.range.length) ? dateSort : ((a.range.length > b.range.length) ? 1 : 0)
                    }).map((row, index) => {
                        return (<Table.Row key={index} disabled={this.props.devices.loading} >
                            <Table.Cell onClick={() => {
                                this.onClickRow(row);
                                }} singleLine={true} style={{ cursor: 'pointer' }} width={4}>{row.name.substr(`/organizations/${this.props.params.organizationName}/devices/`.length)}</Table.Cell>
                            <Table.Cell singleLine={false} width={10}>{row.description}</Table.Cell>
                            <Table.Cell>{Object.keys(row.channels).length}</Table.Cell>
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