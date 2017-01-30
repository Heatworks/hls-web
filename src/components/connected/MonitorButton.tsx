import { connect } from 'react-redux'
import MonitorButton from '../MonitorButton'
import { start, close, stop } from '../../actions/monitor'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
    const {organization, device, channel, ...others } = props
  return {
    monitor: state.monitor,
    organization,
    device,
    channel,
    ...others
  }
}
function mapDispatchToProps(dispatch) {
  return {
    monitorActions: bindActionCreators({ start, stop }, dispatch)
  }
}

const VisibleMonitorButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(MonitorButton)

export default VisibleMonitorButton