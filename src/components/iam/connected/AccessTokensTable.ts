import { connect } from 'react-redux'
import AccessTokensTable from '../AccessTokensTable'
import { loadAccessTokens as load, deleteAccessToken } from '../../../actions/iam'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    accessTokens: state.iam.accessTokens,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load, deleteAccessToken }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccessTokensTable)

export default ConnectedTestsTable