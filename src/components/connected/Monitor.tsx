import { connect } from 'react-redux'
import Monitor from '../Monitor'
import { open, close, stop, newMonitoredValue } from '../../actions/monitor'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    monitor: state.monitor,
    organizationName: props.params.organizationName,
    client: state.monitor.client
  }
}
function mapDispatchToProps(dispatch) {
  return {
    monitorActions: bindActionCreators({ open, close, stop, newMonitoredValue }, dispatch)
  }
}

const VisibleMonitor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Monitor)

export default VisibleMonitor