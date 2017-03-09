import { connect } from 'react-redux'
import View from '../View'
import { loadView as load, saveView as save, deleteView } from '../../../actions/views'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    view: state.views.view,
    accessToken: state.iam.data.accessToken,
    params: props.params,    
    client: state.monitor.client
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load, save, deleteView }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(View)

export default ConnectedTestsTable