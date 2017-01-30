import { connect } from 'react-redux'
import UsersTable from '../UsersTable'
import { loadUsers as load } from '../../../actions/iam'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    users: state.iam.users,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersTable)

export default ConnectedTestsTable