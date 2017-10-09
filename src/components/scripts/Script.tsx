import * as React from 'react'
import { Table, Label, Button, Segment, List, Header, Rail, Input, Menu, Dropdown, Icon, Image, Loader, Confirm, Modal, Form, Select, Checkbox, Card, Grid } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import MonitorButton from '../connected/MonitorButton'
var moment = require('moment')
import { Script as ScriptModel } from '../../apis/hls_scripts'
import { DefaultApi as ScriptsAPILocal} from '../../apis/hls_scripts_local'

import ScriptFileEditor from './ScriptFileEditor'

var scripts_api_local = new ScriptsAPILocal();

export default class Script extends React.Component<{
    script: {
        loading: boolean,
        loaded: boolean,
        saving: boolean,
        saved: boolean,
        data: ScriptModel
    },
    file: {
        loading: boolean,
        loaded: boolean,
        saving: boolean,
        saved: boolean,
        data?: {
            contents: string,
            file: string
        }
    },
    accessToken: string,
    actions: {
        load: (name: any, accessToken:string) => any,
        save: (script: ScriptModel, accessToken: string) => any,
        loadFile: (script: string, file: string, accessToken: string) => any
    },
    params: {
        organizationName: string,
        splat: string 
    }
},{
    editing?: boolean,
    script?: ScriptModel,
    file?: any,
    newTag? : {
        key: string,
        value: string
    },
    reset?: {
        open: boolean
    },
    addChannelModel?: {
        open: boolean,
        name: string,
        unit: string,
        rate: string,
        control: boolean
    },
    loadingStatus: boolean,
    environmentStatus?: Map<string, boolean>
}> {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            script: this.props.script.data == null ? null : Object.assign({}, this.props.script.data),
            file: this.props.file.data == null ? null : Object.assign({}, this.props.file.data),
            newTag: {
                key: '',
                value: ''
            },
            reset: {
                open: false
            },
            addChannelModel: {
                open: false,
                name: "",
                unit: "",
                rate: "",
                control: false
            },
            loadingStatus: false,
            environmentStatus: {} as Map<string, boolean>
        }
    }

    componentWillMount() {
        this.props.actions.load(this.props.params.splat, this.props.accessToken)
    }

    componentWillReceiveProps(nextProps) {
        var newScript = false;
        if (nextProps.script != null && this.state.script != null) {
            if (nextProps.script.data.name !== this.state.script.name) {
                newScript = true;
            }
        } else if (this.state.script == null) {
            newScript = true;
        }
        this.setState({
            script: Object.assign({}, nextProps.script.data),
        }, () => {
            if (newScript) {
                this.onNewScript();
            }
        })
    }

    loadScriptStatus() {
        return new Promise((resolve, reject) => {
            this.setState({
                loadingStatus: true
            }, () => {
                resolve()
            });
        }).then(() => {
            return Promise.all(Object.keys(this.state.script.environments).map((environment) => {
                return scripts_api_local.scriptStatus(this.state.script.name, environment).then((status) => {
                    return {
                        environment,
                        status
                    }
                })
            }))
        }).then((results) => {
            console.log(results);            
            var newEnvironmentStatus = {} as Map<string, boolean>;
            results.forEach((result) => {
                newEnvironmentStatus[result.environment] = result.status;
            })
            this.setState({
                loadingStatus: false,
                environmentStatus: newEnvironmentStatus
            })
        })
    }

    onNewScript() {
        console.log('onNewScript!');
        this.loadScriptStatus().then(() => {
            console.log('new script loaded!');
        });
    }

    toggleEditing() {
         if (this.state.editing) {
            if (JSON.stringify(this.state.script) !== JSON.stringify(this.props.script.data)) {
                console.log('Saving...');
                console.log(JSON.stringify(this.state.script))
                this.props.actions.save(this.state.script, this.props.accessToken);
            } else { 
                console.log('Did not need to save.');
                console.log(JSON.stringify(this.state.script)+JSON.stringify(this.props.script.data));
            }
        }
        this.setState({
            editing: !this.state.editing
        })
    }
    render() {
        if (this.props.script.loading) {
            return (<Segment basic vertical>
                <Loader active inline='centered' />
            </Segment>)
        }
        var now = new Date()

        return (<Segment basic vertical>
        <Header><Link to={`/${this.props.params.organizationName}/scripts/`}>Scripts</Link> / {this.props.params.splat}</Header>
        <Menu attached='top'>
        <Dropdown text='Menu' {...{item:true}}>
          <Dropdown.Menu>
            <Dropdown.Item>
              <Icon name='dropdown' />
              <span className='text'>New</span>
              <Dropdown.Menu>
                <Dropdown.Item>Document</Dropdown.Item>
                <Dropdown.Item>Image</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Item>
            <Dropdown.Item>Open</Dropdown.Item>
            <Dropdown.Item>Save...</Dropdown.Item>
            <Dropdown.Item>Edit Permissions</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Export</Dropdown.Header>
            <Dropdown.Item>Share</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item  as={Button} {...{ disabled:this.state.loadingStatus }} onClick={this.loadScriptStatus.bind(this)}><Icon name='refresh' loading={this.state.loadingStatus} /><span className='text'>Refresh</span></Menu.Item>
        <Menu.Item position="right" active={this.state.editing} as={Button} {...{ disabled:this.props.script.saving }} onClick={this.toggleEditing.bind(this)}><Icon name={this.props.script.saving ? 'spinner' : 'edit' } loading={this.props.script.saving} /><span className='text'>Edit</span></Menu.Item>
      </Menu>
        <Segment attached={true} compact>
            <div style={{lineHeight: 1.7}}>
                <b>Name</b> {this.state.script.name}<br/>
                <b>Description</b> {this.state.editing ? <Input type='text' value={this.state.script.description} defaultValue='Test description...' fluid size="small" onChange={(e) => {
                    this.setState({
                        ...this.state,
                        script: {
                            ...this.state.script,
                            description: e.currentTarget.value
                        }
                    })
                }} /> : this.state.script.description}<br/>
                <b>Tags</b><br/> {this.state.editing ? <Segment basic vertical>
                { Object.keys(this.state.script.tags).map((key, index) => {
                    return (<div key={index}><Input type='text' value={key} placeholder='Key' size="small" disabled /> = <Input type='text' value={this.state.script.tags[key]} placeholder='Value' size="small" onChange={(e) => {
                    var tags = Object.assign({}, this.state.script.tags)
                    tags[key] = normalizeValue(e.currentTarget.value)
                    this.setState({
                        ...this.state,
                        script: {
                            ...this.state.script,
                            tags
                        }
                    })
                }} /> <Button basic icon="delete" size="mini" onClick={() => {
                    var tags = Object.assign({}, this.state.script.tags)
                    delete tags[key]
                    this.setState({
                        ...this.state,
                        script: {
                            ...this.state.script,
                            tags
                        }
                    })
                }} /></div>)
                }) }
                <Input type='text' placeholder='Key' value={this.state.newTag.key} size="small" onChange={(e) => {
                    this.setState({
                        newTag: {
                            key: e.currentTarget.value,
                            value: this.state.newTag.value
                        }
                    })
                }} /> = <Input type='text' placeholder='Value' value={this.state.newTag.value} size="small" onChange={(e) => {
                    this.setState({
                        newTag: {
                            key: this.state.newTag.key,
                            value: normalizeValue(e.currentTarget.value)
                        }
                    })
                }}/> <Button icon="plus" basic size="mini" onClick={() => {
                    var tags = Object.assign({}, this.state.script.tags)
                    tags[this.state.newTag.key] = this.state.newTag.value
                    this.setState({
                        script: {
                            ...this.state.script,
                            tags
                        },
                        newTag: {
                            key: '',
                            value: ''
                        }
                    })
                }} />
                </Segment> 
                : <List horizontal>{Object.keys(this.props.script.data.tags).map((key) => {
                    return (<List.Item>
                                <Icon name="tag" />
                                <List.Content>
                                    <List.Header>{key}</List.Header>
                                    <span>{JSON.stringify(this.props.script.data.tags[key])}</span>
                                </List.Content>
                            </List.Item>)
                })}</List>}
                <b>Version</b> {this.state.script.version}<br/>
                <b>Runtime</b> <i>{this.state.script.runtime}</i><br/>
            </div>
        </Segment>
        
        <Header size='small' dividing>Environments</Header>
        <Card.Group itemsPerRow={4} doubling={true} >
            { Object.keys(this.props.script.data.environments).map((environmentName) => {
                return (<Card fluid>
                    <Card.Content header={environmentName} />
                    <Card.Content>
                    {environmentName in this.state.environmentStatus ? (this.state.environmentStatus[environmentName] ? <div>
                            <Icon name='circle' color="green" size='small' />
                        Running</div> : <div>
                            <Icon name='circle' color="grey" size='small' />
                        Not Running</div> ) : <div>
                            <Icon name='circle' loading color="grey" size='small' />
                        Loading</div>}
                    </Card.Content>
                    <Card.Content>
                        
                        <Table basic='very' compact='very'>
                        <Table.Header>
                            <Table.HeaderCell header>Key</Table.HeaderCell>
                            <Table.HeaderCell header>Channel</Table.HeaderCell>
                        </Table.Header>
                        {
                            Object.keys(this.props.script.data.environments[environmentName].channels).map((channel) => {
                                return (
                                    <Table.Row>
                                        <Table.Cell collapsing>{channel}</Table.Cell>
                                        <Table.Cell>{this.props.script.data.environments[environmentName].channels[channel].split('/devices/')[1]}</Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                        <Table.Header>
                            <Table.HeaderCell header>Key</Table.HeaderCell>
                            <Table.HeaderCell header>Value</Table.HeaderCell>
                        </Table.Header>
                        {
                            Object.keys(this.props.script.data.environments[environmentName].env).map((key) => {
                                return (
                                    <Table.Row>
                                        <Table.Cell>{key}</Table.Cell>
                                        <Table.Cell collapsing>{this.props.script.data.environments[environmentName].env[key]}</Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                        </Table>
                    </Card.Content>
                    <Card.Content extra>
                    <div className='ui two buttons'>
                    <Button size='small' fluid {...{ disabled:this.state.loadingStatus || (environmentName in this.state.environmentStatus && this.state.environmentStatus[environmentName] == true) }} onClick={() => {
                        this.setState({
                            loadingStatus: true
                        }, () => {
                            scripts_api_local.scriptStart(this.state.script.name, environmentName, {}).then(() => {
                                return this.loadScriptStatus();
                            })
                        })
                        
                        }}><Icon name='play video' /><span className='text'>Start</span></Button>

                    <Button size='small' fluid {...{ disabled:this.state.loadingStatus || (environmentName in this.state.environmentStatus && this.state.environmentStatus[environmentName] == false) }} onClick={() => {
                    this.setState({
                        loadingStatus: true
                    }, () => {
                        scripts_api_local.scriptStop(this.state.script.name, environmentName).then(() => {
                            return this.loadScriptStatus();
                        })
                    })
                    
                    }}><Icon name='stop circle' /><span className='text'>Stop</span></Button>
                    </div>
                        </Card.Content>
                </Card>)
            }) }
                
            </Card.Group>
            <Grid>
                <Grid.Row>
                    <Grid.Column tablet={4} computer={4} mobile={16}>
            <Table basic='very' selectable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Files</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                this.state.script.files.sort().map((fileName, index) => {
                                    return (<Table.Row key={index}>
                                        <Table.Cell onClick={() => {
                                            this.props.actions.loadFile(this.props.script.data.name, fileName, this.props.accessToken);
                                        }} >{(this.props.file.data == null ? fileName : (this.props.file.data.file == fileName) ? <b>{fileName}</b> : fileName )}</Table.Cell>
                                    </Table.Row>)
                                })
                            }
                            
                        </Table.Body>
                    </Table>
                    </Grid.Column>
                    <Grid.Column tablet={12} computer={12} mobile={16}>
                        <Segment>
                            
                            {this.props.file.data !== null ? <div><Header>{this.props.file.data.file}</Header><ScriptFileEditor value={this.props.file.data.contents} onChange={() => {
                                }} filename={this.props.file.data.file} height={650} /> </div> : <p>Select a file on the left.</p>}
                            </Segment>
                           
                        </Grid.Column>
                    </Grid.Row>
                    </Grid>
        </Segment>);
    }
}

function getDeviceAndChannel(name) {
    var parts = name.split('/devices/')[1].split('/');
    var channel = parts.pop()
    return [ parts.join('/'), channel ];
}

function getChannel(name) {
    return name.split('/devices/')[1].split('/').pop();
}

function getDevice(name) {
    
}

function normalizeValue(value) {
    var number = parseFloat(value)
    if (Number.isNaN(number)) {
        if (value == "true" || value == "yes") {
            return true;
        } else if (value == "false" || value == "no") {
            return false;
        } else {
            return value;
        }
    }
    return number;
}

const unitOptions = [
  { key: 'Celcius', text: 'Celcius', value: 'Celcius' },
  { key: 'Microsiemens', text: 'Microsiemens', value: 'Microsiemens' },
  { key: 'Amps', text: 'Amps', value: 'Amps' },
  { key: 'GPM', text: 'GPM', value: 'GPM' },
]