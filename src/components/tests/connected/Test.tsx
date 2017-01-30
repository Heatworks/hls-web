import { connect } from 'react-redux'
import Test from '../Test'
import { loadTest as load, saveTest as save, deleteTest } from '../../../actions/tests'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    test: state.tests.test,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load, save, deleteTest }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(Test)

export default ConnectedTestsTable