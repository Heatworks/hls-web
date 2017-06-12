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
                this.state.currentPrefix = this.state.search;
                this.props.actions.load(this.state.search, this.props.accessToken)
            }
        })
    }
    render() {
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
                    <Input icon='search' placeholder='Search tests...' value={this.state.searchInput} onChange={(e) => {
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
            </Table>
        </div>);
    }
}