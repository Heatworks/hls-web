import { connect } from 'react-redux'
import DevicesTable from '../DevicesTable'
import { loadDevices as load } from '../../../actions/dac'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    devices: state.dac.devices,
    accessToken: state.iam.data.accessToken
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