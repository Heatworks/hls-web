import { connect } from 'react-redux'
import SignIn from '../SignIn'
import { signIn } from '../../actions/iam'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    iam: state.iam
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ signIn }, dispatch)
  }
}

const ConnectedA = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignIn)

export default ConnectedA