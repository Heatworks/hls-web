import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { TestMarkers } from '../../apis/hls_tests'
import { Button } from 'semantic-ui-react'

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/xcode';

var path = require('path')

export default class ScriptFileEditor extends React.Component<{
    value: string,
    onChange: (value: string, event?: any) => void,
    filename: string,
    height: number
}, {}> {
    constructor(props) {
        super(props)
        
    }
    
    render() {
        var mode = "javascript";
        var extension = path.extname(this.props.filename);
        if (extension == ".json") {
            mode = "json"
        } else if (extension == ".py") {
            mode = "python"
        } else if (extension == ".md") {
            mode = "markdown"
        }
        return (<AceEditor
            mode={mode}
            theme="xcode"
            onChange={this.props.onChange}
            value={this.props.value}
            editorProps={{$blockScrolling: true}}
            readOnly={true}
            fontSize={12}
            showPrintMargin={true}
            showGutter={true}
            width={`100%`}
            height={`${this.props.height}px`}
        />)
    }
}