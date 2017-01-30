import { connect } from 'react-redux'
import HeaderMenu from '../HeaderMenu'
import { signIn } from '../../actions/iam'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    iam: state.iam
  }
}
const ConnectedA = connect(
  mapStateToProps
)(HeaderMenu)

export default ConnectedA