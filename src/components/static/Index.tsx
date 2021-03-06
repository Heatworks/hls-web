import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Icon, Button, Container, Divider} from 'semantic-ui-react'

export default class Index extends React.Component<{
    params: {
        organizationName: string
    }
}, {}> {
    render() {
        return (
            <div>
                <Segment
            inverted
            textAlign='center'
            style={{ paddingTop: '6em', paddingBottom: '6em', marginTop: 55 }}
            vertical
          >
            <Container text>
                <Header
              as='h1'
              inverted
              style={{ fontSize: '3em' }}
            ><Image src={require('../../resources/icon.png')} avatar/></Header>
            <Header
              as='h1'
              inverted
              style={{ fontSize: '3em', fontWeight: 'lighter' }}
            >Heatworks Lab Services</Header>
            <Header
              as='h2'
              content='A cloud platform for lab environments.'
              inverted
              style={{ fontSize: '1.7em', fontWeight: 'normal' }}
            />
          </Container>
          </Segment>
          <Segment style={{ padding: '4em 0em' }} vertical>
          <Grid container stackable>
                
                <Grid.Row>
              <Grid.Column width={8}>
                <Header as='h3' style={{ fontSize: '2em' }}>A Modern DAQ</Header>
                <p style={{ fontSize: '1.33em' }}>
                    HLS handles data collection, visualizations, analysis, and is extensible to do so much more. Starting with open standards like Rest APIs, MQTT, and the web itself, we brought DAQ to the cloud through a collection of microservices.  <br/><br/> It is simple, modern, and powerful.
                </p>
                <Header as='h3' style={{ fontSize: '2em' }}>Dogfooding</Header>
                <p style={{ fontSize: '1.33em' }}>
                  We got tired of DAQ solutions that were overpriced, closed, Windows only, antiques. So we made our own and use it daily.
                </p>
              </Grid.Column>
              <Grid.Column width={8}>
                <Image
                  bordered
                  rounded
                  fluid
                  src={require('../../resources/hls_graph_data/HLS-Graphs@2x.png')}
                />
              </Grid.Column>
            </Grid.Row>
            </Grid>
            <Divider
                    as='h4'
                    className='header'
                    horizontal
                    style={{ margin: '3em 0em', textTransform: 'uppercase' }}
                    >
                    Microservices
                </Divider>    
            <Grid container stackable>           
                <Grid.Row>
                    <Grid.Column computer={8} width={4} mobile={16}>
                        <Header><Icon name="cubes" circular /><Header.Content>Collect Data<Header sub>DAC</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>DAC handles device management, data acquisition, and control. Through the HLS website, the DAC library, or the REST API you can query historical data, get information about existing devices, and setup new devices. Our data collection is always on, so you never miss a success or failure because someone forgot to hit "record".</p>
                    </Grid.Column>
                    <Grid.Column computer={8} width={4} mobile={16}>
                        <Header><Icon name="flask" circular /><Header.Content>Run Tests <Header sub>Tests</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>Tests organize related data into identifiable resources called tests. An individual test contains channels of data and a time range. Tests can have associated meta data such as status, build, test station name, variables, and constants. Tests do not contain the data themselves but hold the information needed to query the data from the DAC.</p>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column computer={8} width={4} mobile={16}>
                        <Header><Icon name="chart bar" circular /><Header.Content>Visualize Results <Header sub>Views</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>Views handle simple live visualizations. Views can be created for specific tests, devices, or stations. A view is made up of various components organized into rows and columns on the page. Components are responsible for displaying data from channels or pushing data to a channel. Example components are spark lines, switches, log table, etc. </p>
                    </Grid.Column>
                    <Grid.Column computer={8} width={4} mobile={16}>
                        <Header><Icon name="file code outline" circular /><Header.Content>Automate <Header sub>Scripts</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>Scripts give you powerful tools for automation. Scripts can run long term reliability tests, monitor safety conditions, and even run functional tests in production manufacturing facilities. Writing scripts is simple for lab techs, EEs, and Software Engineers. We'll provide sample scripts and libraries to help you get started in Javascript or Python.</p>
                    </Grid.Column>
                </Grid.Row>
                </Grid>
                
                <Divider
                    as='h4'
                    className='header'
                    horizontal
                    style={{ margin: '3em 0em', textTransform: 'uppercase' }}
                    >
                    Devices
                </Divider>
                <Container>
                <Header as='h3' style={{ fontSize: '2em'}}>We made our own box.</Header>
                <p style={{ fontSize: '1.33em', marginBottom: '2em' }}>
                    Designed at our lab in Charleston, our data aquisition and control devices are simple and enjoyable to use.
                </p>                
                </Container>

                <Grid container stackable>      
                     
               
                <Grid.Row columns={3}>
                <Grid.Column>
                        <Header><Header.Content>Mosfet8<Header sub>8 Channel 24V Mosfet Driver</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>These 24V mosfets an control solenoids, contactors, actuators, motors, etc. These devices are your main form of control/input for your testing setup.</p>
                        {
                            //<p><b>$500</b> or <b>$50 monthly</b></p>
                        }
                    </Grid.Column>
                    <Grid.Column>
                        <Header><Header.Content>Analog8<Header sub>8 Channel 4-20mA ADC Converter</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>With a 12 bit ADC onboard, this device is compatible with any 4-20mA sensor. In our labs we use them to measure flow, current, and pressure.</p>
                        {
                            //<p><b>$500</b> or <b>$50 monthly</b></p>
                        }
                    </Grid.Column>
                    
                    <Grid.Column>
                        <Header><Header.Content>Thermocouple12 <Header sub>12 Channel Thermocouple Reader</Header></Header.Content></Header>
                        <p style={{ textAlign:'justify' }}>Measure up to 12 different K-type thermocouples at once. K-type is adaptable for a variety of environments, if you need a different thermocouple type just let us know.</p>
                        { 
                            //<p><b>$600</b> or <b>$60 monthly</b></p>
                        }
                    </Grid.Column>
                    
                </Grid.Row>
                
                <Grid.Row>
                    <Grid.Column textAlign='center'>
                    </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid container stackable>
                
                <Grid.Row>
                <Grid.Column width={8}>
                <Image
                  fluid
                  src={require('../../resources/HLS_device_diagram/HLS-Device.png')}
                />
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as='h3' style={{ fontSize: '2em' }}>Standard I/O</Header>
                <p style={{ fontSize: '1.33em' }}>
                    We believe in open standards and don't use any proprietary connectors or headers. Every device comes with a carefully selected set of connections.
                </p>
                <p>
                <ul>
                    <li>Quick-release Terminal Blocks</li>
                    <li>5V Input via Micro-USB</li>
                    <li>USART via Micro-USB</li>
                    <li>5V Wired Input</li>
                    <li>24V Wired Input <i>(Mosfet8/Analog8 only)</i></li>
                    <li>Raspberry Pi Zero</li>
                    <li>Ethernet</li>
                    <li>WiFi <i>(optional with Pi Zero W)</i></li>
                </ul>
                </p>
                <Button size='large' disabled>Pre-orders Coming Soon</Button>
              </Grid.Column>
              
            </Grid.Row>
            <Grid.Row columns={4}>
                
                <Grid.Column>
                    
                    <Image
                    src={require('../../resources/hls_box.jpg')}
                  /> <div style={{margin: '1em 1em', fontSize:11, color: 'gray'}}>Compact design with removable magnetic top. </div>                         
                    </Grid.Column>
                    <Grid.Column>
                    
                    <Image
                    src={require('../../resources/hls_mosfet_8.jpg')}
                  /> <div style={{margin: '1em 1em', fontSize:11, color: 'gray'}}>Modular internals based on type of sensor data. </div>                         
                    </Grid.Column>
                    <Grid.Column>
                    <Image
                    src={require('../../resources/hls_installation_din.jpg')}
                  /><div style={{margin: '1em 1em', fontSize:11, color: 'gray'}}>HLS Devices are all DIN rail mountable.</div>                        
                    </Grid.Column>
                    <Grid.Column>
                    <Image
                    src={require('../../resources/hls_installation.jpg')}
                  /><div style={{margin: '1em 1em', fontSize:11, color: 'gray'}}>Sample installation at Mt. Pleasant.</div>                          
                    </Grid.Column>
                    
                </Grid.Row>
            </Grid>
                
                <Divider
                    style={{ marginTop: '3em', marginBottom: 0 }}
                     />
                <Segment style={{ padding: '0em', marginBottom: '3em' }} vertical>
                    <Grid celled='internally' columns='equal' stackable>
                        <Grid.Row textAlign='center'>
                        <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                            <Header as='h3' style={{ fontSize: '2em' }}>Who should use HLS?</Header>
                            <p style={{ fontSize: '1.33em' }}>Engineers, researchers, makers, you.</p>
                        </Grid.Column>
                        <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                            <Header as='h3' style={{ fontSize: '2em' }}>Become an Early Partner</Header>
                            <p style={{ fontSize: '1.33em' }}>
                            <a href="mailto:hls@heatworks.tech">Contact us</a> today about modernizing your lab.
                            </p>
                        </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                
                <Grid container stackable>
                
                <Grid.Row>
              <Grid.Column width={16}>
              <h2>Corporations</h2>
                <p style={{ fontSize: '1.33em' }}>
                    Become an early partner and you'll get hands on setup, hardware, data storage, and on-going support. You'll get access to our great stable features, early access to cool beta features, and influence as we grow and expand the HLS platform. We're initially offering this to select organizations, if you're interested <a href="mailto:weston@heatworks.tech">contact us</a> today to see if you're a fit. <br/><br/><span style={{color:'gray'}}>Available Now</span>
                </p>
                <h2>Makers &amp; Students</h2>
                <p style={{ fontSize: '1.33em' }}>
                    We're giving Makers <i>one year free</i> for the core HLS features, we're excited to see what the open source community can build on top of HLS. You'll still have to get the hardware, but we bet with some detailed documentation and a Raspberry Pi you could make your own. </p>
                <p style={{ fontSize: '1.33em' }}>
                    Students can get HLS for <i>free while enrolled</i> in school. Plus we'll offer discounts on hardware if you ask nicely and tell us about your project via Twitter, Facebook, SnapChat, or Email.<br/><br/><span style={{color:'gray'}}>Coming 2020</span>
                </p>
                <Button size='large' as="a" {...{href:"http://eepurl.com/c-Eodv"}}>Join our Mailing List</Button>
              </Grid.Column>
            </Grid.Row>
            </Grid>

                <Divider
                    as='h4'
                    className='header'
                    horizontal
                    style={{ margin: '3em 0em', textTransform: 'uppercase' }}
                    >
                    <a href='#'>Case Studies</a>
                </Divider>
                <p style={{textAlign: 'center'}}>Coming Soon</p>
            </Segment>
            </div>
        )
    }
}
