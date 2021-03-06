import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'
import DevicesTable from './connected/DevicesTable'

export default class DACIndex extends React.Component<{
    params: {
        organizationName: string,
        dacPage: string
    },
    children: any
},{}> {
    render() {
        return (<Segment basic vertical>
                 <Helmet title={`HLS - ${this.props.params.organizationName} - DAC`} />
                <Header>Data Acquisition and Control (DAC)</Header>
                    <Grid columns={3} stackable>
                    <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                    <Grid.Column>
                        <Header sub><Icon.Group size="large" className="icon" {...{style:{paddingTop: 0}}} ><Icon name="cube" circular style={{ marginRight: 0 }} /><Icon name="wifi" corner {...{ style:{marginBottom: 10, marginRight: 10} }}/></Icon.Group><Header.Content>Add a Device </Header.Content></Header>
                        <p>A device is a collection of data and control channels. Each channel contains timestamped data, a unit, and if it's a control channel data can be pushed to it.</p>
                    </Grid.Column>
                     </Grid.Row>
                     <Grid.Row>
                     <Grid.Column>
                        <Button fluid as={Link} {...{to:`/${this.props.params.organizationName}/dac/devices/create`}}>Create a New Device</Button>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                    <Divider />
                    <DevicesTable params={this.props.params} onClick={(row) => {
                    browserHistory.push(`/${this.props.params.organizationName}/dac/devices/${row.name.split('/devices/')[1]}/`)
                }} />
       </Segment>);
    }
}