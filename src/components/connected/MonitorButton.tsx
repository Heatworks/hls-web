import { connect } from 'react-redux'
import MonitorButton from '../MonitorButton'
import { start, close, stop } from '../../actions/monitor'
import { bindActionCreators } from 'redux'
import { getUnitForDeviceAndChannel } from '../../actions/units'
import { loadDevices } from '../../actions/dac'

const mapStateToProps = (state, props) => {
	const {organization, device, channel, ...others } = props
	var unit = props.unit
	if (unit == null) {
		unit = getUnitForDeviceAndChannel(`/organizations/${organization}/devices/${device}`, channel)
	}
	return {
		monitor: state.monitor,
		organization,
		device,
		channel,
		unit,
		accessToken: state.iam.data.accessToken,
		...others
	}
}
function mapDispatchToProps(dispatch) {
	return {
		monitorActions: bindActionCreators({ start, stop, loadUnits: loadDevices }, dispatch)
	}
}

const VisibleMonitorButton = connect(
	mapStateToProps,
	mapDispatchToProps
)(MonitorButton)

export default VisibleMonitorButton