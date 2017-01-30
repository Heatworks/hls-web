import * as React from 'react'
import {Menu, Segment, Header, Dropdown, Image} from 'semantic-ui-react'
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
},{}> {
    constructor(props) {
        super(props)

    }
    inService(service) {
        var organizationNameOrNull = this.props.iam.organization ? this.props.iam.organization.organizationName : null
        return (this.props.location.pathname.startsWith(`/${organizationNameOrNull}/${service}/`))
    }
    render() {
        var organizationNameOrNull = this.props.iam.organization ? this.props.iam.organization.organizationName : null
        return (
            <Menu fixed="top">
                <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/`}}><Image src={require("../images/icon.png")} fluid avatar /></Menu.Item>
                {
                    this.props.iam.organization ? 
                    <div style={{display:'flex'}} className="computer tablet only">
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/iam/`}} active={this.inService('iam')}>IAM</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/dac/`}} active={this.inService('dac')}>DAC</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/tests/`}} active={this.inService('tests')}>Tests</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/views/`}} active={this.inService('views')}>Views</Menu.Item>
                        <Menu.Item link as={Link} {...{to: `/${organizationNameOrNull}/monitoring`}}>Monitoring</Menu.Item>
                    </div> : null
                }
                <Menu.Menu position='right'>
                    <div className='ui right aligned category search item'>
                        <div className='ui transparent icon input'>
                        <input className='prompt' type='text' placeholder='Jump to resource...' />
                        <i className='search link icon' />
                        </div>
                        <div className='results'></div>
                    </div>
                    {
                        (this.props.iam.organization) ? 
                        <Menu.Item as={Dropdown} {...{text:this.props.iam.organization.organizationName || 'Account'}} position="right">
                        {
                            (this.props.iam.loaded && this.props.iam.organization !== undefined) ? (
                                <Dropdown.Menu>
                                    <Dropdown.Item>Settings</Dropdown.Item>
                                    <Dropdown.Item as={Link} {...{to: '/signOut'}}>Sign Out</Dropdown.Item>
                                </Dropdown.Menu>
                            ) : ( <Dropdown.Item as={Link} {...{to: '/signOut'}}>Sign Out</Dropdown.Item>)
                        }                                
                        </Menu.Item >
                        : <Menu.Item link as={Link} {...{to: '/signIn'}}>Sign In</Menu.Item> 
                    }
                </Menu.Menu>
                
                
            </Menu>)
    }
}