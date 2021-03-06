import { connect } from 'react-redux'
import ViewsTable from '../../GenericTable'
import { load } from '../../../actions/views'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    elements: state.views,
    accessToken: state.iam.data.accessToken,
    servicePrefix: 'views'
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load }, dispatch)
  }
}

const ConnectedViewsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewsTable)

export default ConnectedViewsTable