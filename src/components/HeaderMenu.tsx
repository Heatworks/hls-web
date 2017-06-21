import * as React from 'react'
import {Menu, Segment, Header, Dropdown, Image, Icon} from 'semantic-ui-react'
import {Link} from 'react-router'

export default class SignIn extends React.Component<{
    iam: {
        loading: boolean,
        loaded: boolean,
        data: {
            accessToken: string
        },
        organization?: {
            organizationName: string,
            organizationId: string
        }
    },
    location: {
        pathname: string
    }
},{
    resourceURN?: string,
    settingsMenu?: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            resourceURN: ""
        }
    }
    inService(service) {
        var organizationNameOrNull = this.props.iam.organization ? this.props.iam.organization.organizationName : null
        return (this.props.location.pathname.startsWith(`/${organizationNameOrNull}/${service}/`))
    }

    render() {
        var organizationNameOrNull = this.props.iam.organization ? this.props.iam.organization.organizationName : null
        return (
            <Menu fixed="top" style={{width: '100%', overflowX: 'scroll'}}>
                <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/`}}><Image src={require("../resources/icon.png")} fluid avatar /></Menu.Item>
                {
                    this.props.iam.organization ? 
                    <div style={{display:'flex'}} className="computer tablet only">
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/iam/`}} active={this.inService('iam')}>IAM</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/dac/`}} active={this.inService('dac')}>DAC</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/tests/`}} active={this.inService('tests')}>Tests</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/views/`}} active={this.inService('views')}>Views</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/scripts/`}} active={this.inService('scripts')}>Scripts</Menu.Item>
                    </div> : null
                }
                <Menu.Menu position='right'>
                    <div className='ui right aligned category search item'>
                        <div className='ui transparent icon input'>
                        <form onSubmit={(e) => {
                            alert('Jump to resource: '+this.state.resourceURN + " (not implemented)")
                            e.preventDefault()
                        }}>
                            <input className='prompt' type='text' placeholder='Jump to resource...' onChange={(e) => {
                                this.setState({
                                    resourceURN: e.currentTarget.value
                                })
                            }} />
                        </form>
                        <i className='search link icon' />
                        </div>
                        <div className='results'></div>
                    </div>
                    {
                        (this.props.iam.organization) ? 
                        <div style={{display:'flex', height: 54}} className="computer tablet only">
                        {
                            (this.props.iam.loaded && this.props.iam.organization !== undefined && this.state.settingsMenu) ? (
                                <div style={{display:'flex', height: 54}}>
                                    <Menu.Item icon="angle double right" onClick={() => {
                                        this.setState({
                                            settingsMenu: false
                                        })
                                    }} />
                                    <Menu.Item as={Link} {...{to: '/settings'}} icon="settings"></Menu.Item>
                                    <Menu.Item onClick={() => {
                                        window.location.href = window.location.href + "?accessToken=" + this.props.iam.data.accessToken
                                    }}><Icon name="tv" /> Standalone Page</Menu.Item>
                                    <Menu.Item as={Link} {...{to: '/signOut'}}>Sign Out</Menu.Item>
                                </div>
                            ) : ( <Menu.Item icon="angle double left" position="right" onClick={() => {
                                this.setState({
                                    settingsMenu: true
                                })                            
                            }} />)
                        }                                
                        </div>
                        : <Menu.Item link as={Link} {...{to: '/signIn'}}>Sign In</Menu.Item> 
                    }
                </Menu.Menu>
                
                
            </Menu>)
    }
}