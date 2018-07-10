import { connect } from 'react-redux'
import ChannelSelector from '../ChannelSelector'
import { start, close, stop } from '../../actions/monitor'
import { bindActionCreators } from 'redux'
import { getUnitForDeviceAndChannel } from '../../actions/units'
import { loadDevices as load } from '../../actions/dac'

const mapStateToProps = (state, props) => {
	return {
        ...props,
        devices: state.dac.devices.data,
        accessToken: state.iam.data.accessToken
    }
  }
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators({ load }, dispatch)
    }
  }
  

const VisibleChannelSelector = connect(
	mapStateToProps,
	mapDispatchToProps
)(ChannelSelector)

export default VisibleChannelSelector