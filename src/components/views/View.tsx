import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image, Radio, Loader } from 'semantic-ui-react'
import { SemanticWIDTHS } from 'semantic-ui-react/dist/commonjs'
import { Link , browserHistory} from 'react-router'
import { Client, connect, Granted } from "mqtt"
import Helmet from 'react-helmet'
var zipObject = require('zip-object');

export class ColumnComponent {
    width?: number
    widths?: {
        tablet: SemanticWIDTHS
        desktop: SemanticWIDTHS
        mobile: SemanticWIDTHS
        widescreen: SemanticWIDTHS
    }
    component: string
    props: any
    channels: any
}

export class RowObject {
    // If fluid, widths are not set by individual component widths.
    fluid?: boolean
    columns: Array<ColumnComponent>
}

export class ViewObject {
    name: string
    description: string
    tags: any
    grid: Array<RowObject>
}

export default class View extends React.Component<{
    params: {
        organizationName: string,
        splat: string
    },
    client: Client
},{
    view?: ViewObject,
    connected?: boolean,
    channels?: any,
    error?: string,
    editing?: boolean
}> {
    constructor(props) {
        super(props);
        this.setupView()
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.connected) {
            this.setupView()
        }
    }

    setupView() {
        // Launch fullscreen for browsers that support it!
        // the whole page
        //launchIntoFullscreen(document.getElementById("videoElement")); // any individual element
        this.state = {
            view : {
                name: "sample/view",
                description: "Example view just with a forced state.",
                tags: {

                },
                grid: [ 
                    {
                        columns: [
                            {
                                width: 4,
                                component: "/organizations/hls/views/components/power/switch",
                                props: {
                                    title: "Power",
                                    icon: "lightning"
                                },
                                channels: {
                                    control: "/organizations/heatworks/devices/test-station-a/power/control",
                                    value: "/organizations/heatworks/devices/test-station-a/power/value",
                                    amps: "/organizations/heatworks/devices/test-station-a/power/amps"
                                }
                            },
                            {
                                width: 8,
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "Second Component"
                                },
                                channels: {

                                }
                            },
                            {
                                width: 4,
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "Third Component"
                                },
                                channels: {

                                }
                            }
                        ]
                    },
                    {
                        fluid: true,
                        columns: [
                            {
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "First Component",
                                    icon: "cube"
                                },
                                channels: {

                                }
                            },
                            {
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "First Component"
                                },
                                channels: {

                                }
                            },
                            {
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "First Component"
                                },
                                channels: {

                                }
                            },
                            {
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "First Component"
                                },
                                channels: {

                                }
                            },
                            {
                                component: "/organizations/hls/views/components/test",
                                props: {
                                    title: "First Component"
                                },
                                channels: {

                                }
                            }
                        ]
                    }
                ]
            },
            channels: {
                
            },
            connected: false,
            editing: false
        }

        this.checkProps().then(() => {
            return this.processChannelsInView();
        }).then(() => {
            return this.processConnectClient()
        }).then(() => {
            console.log('Done!')
        }).catch((error) => {
            this.setState({
                error
            })
        })
    }

    checkProps() {
        return new Promise((resolve, reject) => {
            if (this.props.client) {
                resolve()
            } else {
                reject('MQTT Client has not been created yet.')
            }
        })
    }

    processChannelsInView() {
        var channelPromises = []
        this.state.view.grid.map((row) => {
            row.columns.map((column) => {
                Object.keys(column.channels).map((key) => {
                    channelPromises.push(this.addChannel(column.channels[key]))
                })
            })
        })
        return Promise.all(channelPromises).then((channels) => {
            console.log(channels);
            this.setState({
                channels: zipObject(channels.map((channelMap) => {
                    return channelMap.name
                }),channels)
            })
        })
    }

    addChannel(channel) {
        return new Promise((resolve, reject) => {
            resolve({
                name: channel,
                unit: 'Boolean'
            })
        })
    }

    processConnectClient() {
        return new Promise((resolve, reject) => {
            console.log("connecting...");
            var connected = (packet) => {
                console.log('connect')
                console.log(packet);
                this.setState({
                    connected: true
                })
                Object.keys(this.state.channels).forEach((channel) => {
                    this.props.client.subscribe(channel)
                })
                resolve()
            };
            if (this.props.client.connected) {
                connected(null)
            }
            this.props.client.on('connect', connected )

            this.props.client.on('offline', function() {
                console.log("offline");
            });

            this.props.client.on('reconnect', function() {
                console.log("reconnect");
            });

            this.props.client.on("error", (error) => {
                console.error(error);
            })

            this.props.client.on('message', this.receiveMessage.bind(this))
            
        })
    }

    receiveMessage(topic, message, packet) {
        console.log(topic+": "+message)
        var unit = this.state.channels[topic].unit;
        var value = parseValueForUnit(unit, message.toString().split(",")[1]);
        var channels = {
            ...this.state.channels
        }
        channels[topic] = {
            unit,
            value
        }
        this.setState({
            channels
        })
    }

    render() {
        if (!this.state.connected || !this.props.client) {
            return (<Segment basic vertical>
                <Loader active inline='centered' />
                <Button onClick={() => {
                    this.setupView()
                }}>Retry</Button>
            </Segment>)
        }
        return (<Segment basic vertical>
                <Helmet title={`HLS - ${this.props.params.organizationName} - Views`} />
                <Grid stackable>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Header>
                                <Link to={`/${this.props.params.organizationName}/views/`}>Views</Link> / {this.state.view.name}<br/><Header sub>{this.state.view.description}</Header>
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Menu floated="right"><Menu.Item as={Button} {...{onClick: () => {
                                this.setState({
                                    editing: !this.state.editing
                                })
                            }}} active={this.state.editing}><Icon name="edit" />Edit</Menu.Item></Menu>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid stackable>
                    {this.state.view.grid.map((row, rowIndex) => {
                        return (
                            <Grid.Row key={rowIndex} columns={(row.fluid) ? 'equal' : 16 } {...{ style: { paddingBottom: 0 } }}>
                                {row.columns.map((column, columnIndex) => {
                                    return (
                                        <Column key={columnIndex} column={column} editing={this.state.editing} onChange={(_column) => {
                                            console.log('Updated column...')
                                            console.log(_column);
                                            row.columns[columnIndex] = _column
                                            this.setState({
                                                view: this.state.view
                                            })
                                        }}>
                                            { this.renderColumnComponent(column) }
                                        </Column>
                                        )
                                    })
                                }
                            </Grid.Row>
                        )
                    })}
                </Grid>
            </Segment>);
    }

    publish(channel: string, value: string) {
        console.log(`Publish ${channel}: ${value}`)
        var now = new Date();
        var timestamp = now.getTime() / 1000;
        this.props.client.publish(channel, `${timestamp},${value}`)
    }

    renderColumnComponent(column: ColumnComponent) {
        if (column.component == "/organizations/hls/views/components/power/switch") {
            return (
                <PowerSwitch title={column.props} channels={column.channels} values={{
                    control: this.state.channels[column.channels.control].value,
                    value: this.state.channels[column.channels.value].value,
                    amps: 20
                }} publish={this.publish.bind(this)} />
            )
        } else {
            return (<Image src='http://semantic-ui.com/images/wireframe/paragraph.png' />)
        }
    }
}

class Column extends React.Component<{
    column: ColumnComponent,
    editing: boolean,
    onChange: (column) => any
}, {
    column?: ColumnComponent
    unsavedChanges?: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            column: props.column,
            unsavedChanges: false
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.state.unsavedChanges && nextProps.editing == false) {
            this.props.onChange(this.state.column);
            this.setState({
                unsavedChanges: false
            })
        } else {
            this.setState({
                column: nextProps.column,
                unsavedChanges: false
            })
        }
    }

    render() {
        return (
            <Grid.Column width={this.props.column.width as SemanticWIDTHS} {...this.props.column.widths} >
                    {
                    this.props.editing ? <Input value={this.state.column.props.title} type="text" fluid onChange={(e) => {
                        this.setState({ 
                            column: {
                                ...this.state.column,
                                props: {
                                    ...this.state.column.props,
                                    title: e.currentTarget.value
                                }
                            },
                            unsavedChanges: true 
                        })
                    }} />  : <Header subheader>{this.props.column.props.icon ? <Icon name={this.props.column.props.icon} circular style={{ marginRight: 0 }} /> : null }<Header.Content>{this.props.column.props.title} </Header.Content></Header>
                    }
                {
                    this.props.editing ? <Segment vertical>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell sorted="ascending">Key</Table.HeaderCell>
                                <Table.HeaderCell>Channel</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                        {Object.keys(this.props.column.channels).map((key, index) => {
                            return (<Table.Row key={index}>
                                <Table.Cell>{key}</Table.Cell>
                                <Table.Cell>.../{this.props.column.channels[key].split('/devices/')[1]}</Table.Cell>
                            </Table.Row>)
                        })}
                        </Table.Body>
                    </Table>
                    <Button.Group fluid>
                        <Button labelPosition='left' icon='left chevron' content='' onClick={(e) => {
                            this.props.column.width += 1
                            /*var prevColumn = (columnIndex == 0) ? null : row.columns[columnIndex - 1]
                            if (prevColumn) {
                                prevColumn.width -= 1
                            }*/
                            //this.setState({ view: this.state.view })
                        }} />
                        <Button />
                        <Button labelPosition='right' icon='right chevron' content='' onClick={(e) => {
                            /*column.width = column.width + 1
                            var nextColumn = (columnIndex >= row.columns.length - 1) ? null : row.columns[columnIndex + 1]
                            if (nextColumn) {
                                nextColumn.width -= 1
                            }
                            this.setState({ view: this.state.view })*/
                        }} />
                    </Button.Group></Segment> : this.props.children
                }
            </Grid.Column>
        )
    }
}

class PowerSwitch extends React.Component<{
    title: string
    channels: {
        control: string,
        value: string,
        amps: string
    }
    values: {
        control: boolean,
        value: boolean,
        amps: number
    }
    publish: (topic, value) => any
},{
    publishing: boolean
}> {
    constructor(props) {
        super(props)

        this.state = {
            publishing: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.values.value != nextProps.values.control) {
            this.setState({
                publishing: true
            })
        } else {
            this.setState({
                publishing: false
            })
        }
    }
    
    render() {
        return (
            <Segment color={this.props.values.value ? 'green' : 'red'}>
                <Button basic compact onClick={() => {
                    this.props.publish(this.props.channels.control, this.props.values.value ? 0 : 1)
                    this.setState({
                        publishing: true
                    })
                }} label loading={this.state.publishing}><Icon name={this.props.values.value ? 'toggle on' : 'toggle off'} size="big" /></Button> <span style={{
                    float:'right',
                    fontSize: 20
                }} >{this.props.values.amps}A</span>
                <br/>
                
            </Segment>
        )
    }
}

function parseValueForUnit(unit: string, value: string) {
    switch (unit) {
        case 'Boolean': {
            return (parseInt(value) == 1)
        }
        case 'Float': {
            return parseFloat(value)
        }
    }
}