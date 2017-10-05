import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Icon } from 'semantic-ui-react'

export default class Index extends React.Component<{
    params: {
        organizationName: string
    }
}, {}> {
    render() {
        return (
            <Grid>
                <Grid.Row {...{style:{marginTop: '2em'}}}>
                    <Grid.Column tablet={6} widescreen={7} computer={7} mobile={2}>
                    </Grid.Column>
                    <Grid.Column tablet={4} widescreen={2} computer={2} mobile={12} textAlign="center">
                        <Image src={require('../../resources/icon.png')} fluid avatar/>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={4} mobile={null}>
                    </Grid.Column>
                    <Grid.Column width={8} mobile={16} textAlign="center">
                        <Header>Welcome to Heatworks Lab Services</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column computer={2} width={2} mobile={16}>
                    </Grid.Column>
                    <Grid.Column computer={4} width={4} mobile={16}>
                        <Header sub><Icon name="cubes" circular /><Header.Content>Collect Data <Header sub>DAC</Header></Header.Content></Header>
                        <p>A test is a collection of related data within a time range. During a test you can monitor current values and after the test you can export the data for further analysis.</p>
                    </Grid.Column>
                    <Grid.Column computer={4} width={4} mobile={16}>
                        <Header sub><Icon name="flask" circular /><Header.Content>Run Tests <Header sub>Tests</Header></Header.Content></Header>
                        <p>Often when you get a test setup properly you'll want to rerun it multiple times. Duplicating a test makes setting up a similar test quick and easy.</p>
                    </Grid.Column>
                    <Grid.Column computer={4} width={4} mobile={16}>
                        <Header sub><Icon name="bar chart" circular /><Header.Content>View Results <Header sub>Views</Header></Header.Content></Header>
                        <p>Another strategy for reusing tests is to create template tests with your channels and tags ready to go.</p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}
