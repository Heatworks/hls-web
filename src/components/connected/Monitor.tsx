import { connect } from 'react-redux'
import Monitor from '../Monitor'
import { open, close, stop, newMonitoredValue, reloadClient } from '../../actions/monitor'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    monitor: state.monitor,
    iam: state.iam,
    organizationName: props.params.organizationName,
    client: state.monitor.client,
    accessToken: (state.iam.data) ? state.iam.data.accessToken : null
  }
}
function mapDispatchToProps(dispatch) {
  return {
    monitorActions: bindActionCreators({ open, close, stop, newMonitoredValue, reloadClient }, dispatch)
  }
}

const VisibleMonitor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Monitor)

export default VisibleMonitor