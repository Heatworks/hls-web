import { connect } from 'react-redux'
import DeviceCreate from '../DeviceCreate'
import { loadDevice as load, saveDevice as save } from '../../../actions/dac'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    device: state.dac.device,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ save, load }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeviceCreate)

export default ConnectedTestsTable