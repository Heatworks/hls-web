import { connect } from 'react-redux'
import Script from '../Script'
import { loadScript as load, saveScript as save } from '../../../actions/scripts'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    script: state.scripts.script,
    accessToken: state.iam.data.accessToken,
    params: props.params
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ load, save }, dispatch)
  }
}

const ConnectedTestsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(Script)

export default ConnectedTestsTable