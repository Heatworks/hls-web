import * as React from 'react'

export default class TimeIntervalSelector extends React.Component<{
    options: Array<{value: number, label: string }>,
    changeInterval: (interval: number) => void,
    interval: number
},{}> {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            
            <select onChange={(e) => { 
                this.props.changeInterval(parseInt(e.currentTarget.value)) 
            }}>
                {this.props.options.map((option) => {
                    return (<option selected={(Math.abs(option.value - this.props.interval) < 5)} value={option.value}>{option.label}</option>)
                })}
            </select>
        )
    }
}