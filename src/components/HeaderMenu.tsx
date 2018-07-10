import * as React from 'react'
import {Menu, Segment, Header, Dropdown, Image, Icon, Search} from 'semantic-ui-react'
import {Link} from 'react-router'
import { canPerformAction } from '../apis/hls_iam_policy'

export default class SignIn extends React.Component<{
    iam: {
        loading: boolean,
        loaded: boolean,
        data: {
            accessToken: string
        },
        organization?: {
            organizationName: string,
            organizationId: string,
            policy: any
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
            <Menu fixed="top" style={{width: '100%', overflowX: 'auto'}}>
                <Menu.Item link as={Link} {...{to: organizationNameOrNull == null ? '/' : `/${organizationNameOrNull}/`}}><Image src={require("../resources/icon.png")} fluid avatar /></Menu.Item>
                {
                    this.props.iam.organization ? 
                    <div style={{display:'flex'}} className="computer tablet only">
                        {canPerformAction(this.props.iam.organization.policy, 'hls:iam:View') ? <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/iam/`}} active={this.inService('iam')}>IAM</Menu.Item> : null }
                        {canPerformAction(this.props.iam.organization.policy, 'hls:dac:View') ? <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/dac/`}} active={this.inService('dac')}>DAC</Menu.Item> : null }
                        {canPerformAction(this.props.iam.organization.policy, 'hls:tests:View') ? <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/tests/`}} active={this.inService('tests')}>Tests</Menu.Item> : null }
                        {canPerformAction(this.props.iam.organization.policy, 'hls:views:View') ? <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/views/`}} active={this.inService('views')}>Views</Menu.Item> : null }
                        {canPerformAction(this.props.iam.organization.policy, 'hls:scripts:View') ? <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/scripts/`}} active={this.inService('scripts')}>Scripts</Menu.Item> : null }
                    </div> : null
                }
                <Menu.Menu position='right'>
                    <div className='ui right aligned category item'>
                        <div className='ui transparent icon input'>
                        <form onSubmit={(e) => {
                            alert('Jump to resource: '+this.state.resourceURN + " (not implemented)")
                            e.preventDefault()
                        }}>
                            <input className='prompt' style={{border: 'none', outline: 'none'}} type='text' placeholder='Jump to resource...' onChange={(e) => {
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
                                    <Menu.Item onClick={() => {
                                        window.location.href = window.location.href + "?accessToken=" + this.props.iam.data.accessToken
                                    }}><Icon name="tv" /> Standalone Page</Menu.Item>
                                    <Menu.Item as={Link} {...{to: '/settings'}} icon="settings"></Menu.Item>
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