import { connect } from 'react-redux'
import SignOut from '../SignOut'
import { signOut } from '../../actions/iam'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    iam: state.iam
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ signOut }, dispatch)
  }
}

const ConnectedA = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignOut)

export default ConnectedA