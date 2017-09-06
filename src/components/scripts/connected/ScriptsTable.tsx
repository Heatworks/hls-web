import { connect } from 'react-redux'
import ScriptsTable from '../../GenericTable'
import { load } from '../../../actions/scripts'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    elements: state.scripts,
    accessToken: state.iam.data.accessToken,
    servicePrefix: 'scripts'
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load }, dispatch)
  }
}

const ConnectedScriptsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScriptsTable)

export default ConnectedScriptsTable