import * as React from 'react'
import { Table, Label, Button, Segment, Divider, Header, Grid, Icon, Input, Menu, Image } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'
import Helmet from 'react-helmet'

export default class ViewsIndex extends React.Component<{
    params: {
        organizationName: string
    }
},{}> {
    render() {
        return (<Segment basic vertical>
                 <Helmet title={`HLS - ${this.props.params.organizationName} - Views`} />
                <Header>Views</Header>
                    <Grid columns={3} stackable>
                    <Grid.Row {...{ style: { paddingBottom: 0 } }}>
                    <Grid.Column>
                        <Header subheader><Icon name="block layout" circular style={{ marginRight: 0 }} /><Header.Content>Create a View </Header.Content></Header>
                        <p>A view is a user interface mapped over a collection of devices or tests. Views give you quick insights and control over a test station, workspace, or entire lab.</p>
                    </Grid.Column>
                    <Grid.Column>
                        <Header subheader><Icon name="block layout" circular style={{ marginRight: 0 }} /><Header.Content>View a Demo </Header.Content></Header>
                        <p>A view is a user interface mapped over a collection of devices or tests. Views give you quick insights and control over a test station, workspace, or entire lab.</p>
                    </Grid.Column>
                     </Grid.Row>
                     <Grid.Row>
                     <Grid.Column>
                        <Button fluid>Create a New View</Button>
                    </Grid.Column>
                    <Grid.Column>
                        <Button fluid onClick={() => {
                            browserHistory.push({
                                pathname: `/${this.props.params.organizationName}/views/view/`
                            });
                        }}>Demo</Button>
                    </Grid.Column>
                     </Grid.Row>
                    </Grid>
                    <Divider />
                <Table>
                </Table>
       </Segment>);
    }
}