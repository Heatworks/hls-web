import { connect } from 'react-redux'
import TestsTable from '../TestsTable'
import { load, loadPrefixes } from '../../../actions/tests'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    tests: state.tests,
    accessToken: state.iam.data.accessToken
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load, loadPrefixes }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestsTable)

export default ConnectedTestsTable