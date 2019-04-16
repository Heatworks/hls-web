import { connect } from 'react-redux'
import TestCreate from '../TestCreate'
import { loadTest as load, saveTest as save, checkTestExists as checkExists } from '../../../actions/tests'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    test: state.tests.test,
    exists: state.tests.exists,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ save, load, checkExists }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestCreate)

export default ConnectedTestsTable