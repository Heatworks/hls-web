import { connect } from 'react-redux'
import Index from '../Index'
import { reloadClient } from '../../../actions/monitor'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    accessToken: state.iam.data.accessToken,
    organizationName: state.iam.data.organizationName,
    clientLoading: state.monitor.loading
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ reloadClient }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(Index)

export default ConnectedTestsTable