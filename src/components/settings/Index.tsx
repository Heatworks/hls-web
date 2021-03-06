import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Icon, Button, Input } from 'semantic-ui-react'
import { useCelcius, useFarenheit, UnitLabels } from '../../actions/units'

export default class Index extends React.Component<{
    organizationName: string,
    accessToken: string,
    clientLoading: boolean,
    actions: {
        reloadClient: (accessToken) => void
    }
}, {
    broker: string
}> {
    constructor(props) {
        super(props)

        this.state = {
            broker: window.localStorage.getItem("hls.mqtt_broker")
        }
    }
    render() {
        return (
            <Grid>
                <Grid.Row {...{style:{marginTop: '2em'}}}>
                    <Grid.Column tablet={6} widescreen={7} computer={7} mobile={2}>
                    </Grid.Column>
                    <Grid.Column tablet={4} widescreen={2} computer={2} mobile={12} textAlign="center">
                        <Image src={require('../../resources/icon.png')} fluid avatar size="huge"/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={4} mobile={null}>
                    </Grid.Column>
                    <Grid.Column width={8} mobile={16} textAlign="center">
                        <Header>Settings</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column computer={3} width={4} mobile={16}>
                    </Grid.Column>
                    <Grid.Column computer={6} width={6} mobile={16}>
                        <Header subheader><Icon name="setting" circular /><Header.Content>Password <Header sub>Reset your password</Header></Header.Content></Header>
                    </Grid.Column>
                    <Grid.Column computer={4} width={2} mobile={16} {...{style: {marginTop: 10} }}>
                        <Button content="Change Password" fluid onClick={() => {
                            alert('This feature is not yet implemented.')
                        }} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column computer={3} width={4} mobile={16}>
                    </Grid.Column>
                    <Grid.Column computer={6} width={6} mobile={16}>
                        <Header subheader><Icon name="toggle on" circular /><Header.Content>Temperature Unit <Header sub>What unit would you like to see all temperatures?</Header></Header.Content></Header>
                    </Grid.Column>
                    <Grid.Column computer={2} width={1} mobile={16} {...{style: {marginTop: 10} }}>
                        <Button content={UnitLabels.Celcius} fluid onClick={() => {
                            useCelcius()
                        }} />
                    </Grid.Column>
                    <Grid.Column computer={2} width={1} mobile={16} {...{style: {marginTop: 10} }}>
                        <Button content={UnitLabels.Fahrenheit} fluid onClick={() => {
                            useFarenheit()
                        }} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column computer={3} width={4} mobile={16}>
                    </Grid.Column>
                    <Grid.Column computer={6} width={6} mobile={16}>
                        <Header subheader><Icon name="setting" circular /><Header.Content>MQTT Broker <Header sub>Set the IP/Hostname for the MQTT Broker</Header></Header.Content></Header>
                    </Grid.Column>
                    <Grid.Column computer={4} width={2} mobile={16} {...{style: {marginTop: 10} }}>
                        <Input type="text" fluid loading={this.props.clientLoading} value={this.state.broker} action={{ 
                            icon: 'refresh',
                            onClick: () => {
                                this.props.actions.reloadClient(this.props.accessToken);
                            }
                        }} actionPosition="left" style={{textAlign:'center'}} onChange={(e) => {
                            this.setState({
                                broker: e.currentTarget.value
                            }, () => {
                                window.localStorage.setItem("hls.mqtt_broker", this.state.broker);
                            })
                        }} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                     <Grid.Column computer={6} width={6} mobile={16}>
                    </Grid.Column>
                    <Grid.Column computer={4} width={4} mobile={16}>
                       <Button as={Link} {...{to:'/signOut'}} fluid>Sign Out</Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}
