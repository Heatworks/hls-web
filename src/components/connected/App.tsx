import { connect } from 'react-redux'
import App from '../App'
import { load } from '../../actions/data'
import { bindActionCreators } from 'redux'

const mapStateToProps = (state, props) => {
  return {
      ...props,
     standalone: state.standalone.engaged
  }
}
function mapDispatchToProps(dispatch) {
  return {
  }
}

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default ConnectedApp