import { connect } from 'react-redux'
import DevicesTable from '../DevicesTable'
import { loadDevices as load } from '../../../actions/dac'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    devices: state.dac.devices,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(DevicesTable)

export default ConnectedTestsTable