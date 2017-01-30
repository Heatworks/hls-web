import { connect } from 'react-redux'
import Device from '../Device'
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
    actions: bindActionCreators({ load, save }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(Device)

export default ConnectedTestsTable