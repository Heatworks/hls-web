import { connect } from 'react-redux'
import A from '../A'
import { load } from '../../actions/data'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    data: state.data
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load }, dispatch)
  }
}

const ConnectedA = connect(
  mapStateToProps,
  mapDispatchToProps
)(A)

export default ConnectedA