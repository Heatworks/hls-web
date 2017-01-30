import * as React from 'react'

import { Button } from 'semantic-ui-react'

export default class A extends React.Component<{
    actions: {
        load: () => any
    },
    data: any
},{}> {
    render() {
        return (<div><h3>A</h3><p>Sample page...</p><Button onClick={() => {
            this.props.actions.load()
        }}>{this.props.data.loading ? 'Loading' : (this.props.data.loaded ? 'Reload' : 'Load')}</Button><br/>
        {   (this.props.data.data.data) ? 
                <ul>
                    { this.props.data.data.data.map((item, index) => {
                        return <li>{item.title}</li>
                    }) }
                </ul> : <div>Not Loaded Yet {JSON.stringify(this.props.data.data)}</div> 
        }
        </div>)
    }
}
