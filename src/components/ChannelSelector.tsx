import { Table, Label, Search, Icon, Modal, Card, Divider, Loader } from 'semantic-ui-react'
import * as React from 'react'
import * as Promise from 'bluebird'

export default class ChannelSelector extends React.Component<{
    open:boolean,
    devices?: Array<{
        name: string,
        description: string,
        channels: Map<string, {
            unit: string,
            rate: number,
            control: boolean
        }>
    }>,
    selectedChannels:[string],
    selectChannel:(channel: string) => void,
    close: () => void,
    accessToken: string,
    actions: {
        load: (prefix: string, accessToken: string, exclusiveStartKey: string) => any
    }
},{
    searchValue: string
}> {
    constructor(props) {
        super(props)
        this.state = {
            searchValue: ''
        }
    }
    componentWillMount() {
        this.props.actions.load('', this.props.accessToken, '')
    }
    render() {
        return (<Modal open={this.props.open} closeIcon="close" onClose={() => {
                this.props.close()
            }}>
            <Modal.Header><Icon name="cubes" /> Channel Selector</Modal.Header>
            <div style={{width: '100%', padding: '1em 2em', fontSize: 18 }}><div className='ui transparent icon input' style={{width: '100%'}}>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                        }} style={{width: '100%'}}>
                            <input className='prompt' style={{border: 'none', outline: 'none', width: '100%'}} type='text' placeholder='Search by device name, unit, or label...' onChange={(e) => {
                                this.setState({
                                    searchValue: e.currentTarget.value
                                })
                            }} />
                        </form>
                        <i className='search link icon' />
                        </div></div>
            <Modal.Content image scrolling={true}>
            <Table celled  compact="very">
                    <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>Selected</Table.HeaderCell>
                        <Table.HeaderCell>Device</Table.HeaderCell>
                        <Table.HeaderCell>Channel</Table.HeaderCell>
                        <Table.HeaderCell>Label</Table.HeaderCell>
                        <Table.HeaderCell>Unit</Table.HeaderCell>
                        <Table.HeaderCell>Rate</Table.HeaderCell>
                        <Table.HeaderCell>Control</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.devices ? 
                        this.props.devices.map((device) => {
                            return Object.keys(device.channels).sort().filter((channelName) => {
                                if (this.state.searchValue == '') {
                                    return true;
                                }
                                var channelInfo = device.channels[channelName];
                                if (channelInfo.label) {
                                    if (channelInfo.label.indexOf(this.state.searchValue) >= 0) {
                                        return true;
                                    }
                                }
                                if (channelInfo.unit.indexOf(this.state.searchValue) >= 0) {
                                    return true;
                                }
                                if (device.name.indexOf(this.state.searchValue) >= 0) {
                                    return true;
                                }
                            }).map((channelName, index, elements) => {
                                var channelInfo = device.channels[channelName];
                                var selected = (this.props.selectedChannels.indexOf(`${device.name}/${channelName}`) >= 0);
                                return (<Table.Row>
                                            <Table.Cell textAlign="center">{selected ? <Icon color='black' name='checkmark' size='small' /> : null}</Table.Cell>
                                            {(index == 0) ? <Table.Cell textAlign="center" rowSpan={elements.length} selectable onClick={() => {
                                                Promise.each(Object.keys(device.channels).sort(), (channel) => {
                                                    return this.props.selectChannel(`${device.name}/${channel}`)
                                                })
                                            }}>{device.name.split('/devices/')[1]}</Table.Cell> : null }
                                            <Table.Cell active={selected} style={{ cursor: 'pointer' }} textAlign="center" selectable onClick={() => {
                                                this.props.selectChannel(`${device.name}/${channelName}`)
                                            }}>{channelName}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.label}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.unit}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.rate}</Table.Cell>
                                            <Table.Cell textAlign="center">{channelInfo.control ? <Icon color='black' name='checkmark' size='large' /> : null}</Table.Cell>
                                        </Table.Row>);
                            })
                        }) : <Loader /> }
                    </Table.Body>
                </Table>
            </Modal.Content>
        </Modal>)
    }
}
