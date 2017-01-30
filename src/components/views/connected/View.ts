import { connect } from 'react-redux'
import View from '../View'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
    params: props.params,
    client: state.monitor.client
  }
}

const VisibleView = connect(
  mapStateToProps
)(View)

export default VisibleView