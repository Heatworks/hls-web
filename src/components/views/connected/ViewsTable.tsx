import { connect } from 'react-redux'
import ViewsTable from '../ViewsTable'
import { load } from '../../../actions/views'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    views: state.views,
    accessToken: state.iam.data.accessToken
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