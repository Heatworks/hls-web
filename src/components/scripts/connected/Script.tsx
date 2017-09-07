import { connect } from 'react-redux'
import Script from '../Script'
import { loadScript as load, saveScript as save, loadFile } from '../../../actions/scripts'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    script: state.scripts.script,
    file: state.scripts.file,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load, save, loadFile }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(Script)

export default ConnectedTestsTable