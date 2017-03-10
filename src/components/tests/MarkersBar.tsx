import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { TestMarkers } from '../../apis/hls_tests'
import { Button } from 'semantic-ui-react'

export default class MarkersBar extends React.Component<{
    markers: Array<TestMarkers>,
    range: Array<number>,
    setMeasuring: (isMeasuring: boolean, timestamp: number) => any
    setFiltering: (isFiltering: boolean, range?: Array<number>) => any
},{
    range?: Array<number>,
    mouseTimestamp?: number,
    dragging?: boolean,
    draggingStart?: number,
    draggingEnd?: number,
    filtering?: boolean,
    measuring?: boolean
}> {
    constructor(props) {
        super(props)
        if (this.props.range.length == 1) {
            var date = new Date();
            this.props.range.push(date.getTime() / 1000)
        }
        this.state = {
            range: this.props.range,
            mouseTimestamp: 0,
            dragging: false
        }

        this.mouseScroll = this.mouseScroll.bind(this)
    }
    positionInRange(range, value) {
        return 1 - ((range[1] - value) / (range[1] - range[0]))
    }
    componentDidMount() {
        var el = ReactDOM.findDOMNode(this);
        el.addEventListener("mousewheel", this.mouseScroll);
        el.addEventListener("DOMMouseScroll", this.mouseScroll);
    }
    getTimestampForMouse(e) {
        var el = ReactDOM.findDOMNode(this);
        var rect = el.getBoundingClientRect();
        var mousePosition = {
            left: e.pageX - rect.left,
            top: e.pageY - rect.top
        };
        var startTimestamp = this.state.range[0];
        var endTimestamp = this.state.range[1];
        var difference = endTimestamp - startTimestamp;
        return startTimestamp + difference * (mousePosition.left / rect.width);
    }

    mouseDown(e) {
        var timestamp = this.getTimestampForMouse(e)
         this.setState({
             dragging: true,
            draggingStart: timestamp
        })
    }
    mouseUp(e) {
        var timestamp = this.getTimestampForMouse(e)
        this.setState({
            dragging: false
        })
    }
    mouseOut(e) {
        this.setState({
            dragging: false
        })
    }
    mouseMove(e) {
        var timestamp = this.getTimestampForMouse(e)
        this.setState({
            mouseTimestamp: timestamp
        })
        if (this.state.dragging) {
            this.setState({
                range: [this.state.range[0] - (timestamp - this.state.draggingStart),this.state.range[1] - (timestamp - this.state.draggingStart)]
            }, () => {
                if (this.state.filtering) {
                    this.props.setFiltering(this.state.filtering, this.state.range)
                }
            })
        }
        if (this.state.measuring) {
            this.props.setMeasuring(this.state.measuring, timestamp)
        }
    }
    mouseScroll(e) {
        var e = window.event || e; // old IE support
        var delta = e.wheelDelta || -e.detail;
        console.log(delta);
        var change = (this.state.range[1] - this.state.range[0]) * (delta / 1000);
        var timestamp = this.getTimestampForMouse(e)
        var percentThroughRange = (timestamp - this.state.range[0]) / (this.state.range[1] - this.state.range[0])
        console.log(percentThroughRange)
        this.updateRange([this.state.range[0] - (change * percentThroughRange), this.state.range[1] + (change * (1-percentThroughRange))]);
        e.preventDefault();
        return false;
    }
    updateRange(range) {
        this.setState({
            range
        })
        if (this.state.filtering) {
            this.props.setFiltering(this.state.filtering, range)
        }
    }
    render() {
        if (this.props.range.length == 0) {
            return (<div />)
        }
        if (this.props.range.length == 1) {
            var date = new Date();
            this.props.range.push(date.getTime() / 1000)
        }
        return (<div style={{width: '100%', backgroundColor: '#EEEEEE', height: 50, overflowY: 'hidden', position: 'relative'}} 
        onMouseDown={this.mouseDown.bind(this)}
        onMouseUp={this.mouseUp.bind(this)}
        onMouseOut={this.mouseOut.bind(this)}
        onMouseMove={this.mouseMove.bind(this)}>
            {this.props.markers.map((marker: TestMarkers, index) => {
                var inProximity = Math.abs(marker.timestamp - this.state.mouseTimestamp) < (this.state.range[1] - this.state.range[0]) * 0.05
                return (<div key={index} style={{width: 1,height: 50, borderRightWidth: 1, borderRightColor: 'red', borderRightStyle:'solid', position: 'absolute', opacity: inProximity ? 1.0 : 0.5 , left: this.positionInRange(this.state.range, marker.timestamp)*100+'%' }} />)
            })}<Button icon="filter" style={{ float:'left',margin:8 }} active={this.state.filtering} onClick={() => {
                this.setState({
                    filtering: !this.state.filtering
                }, () => {
                    this.props.setFiltering(this.state.filtering, this.state.range)
                })
            }} /> <Button icon="info" style={{ float:'left',margin:8 }} active={this.state.measuring} onClick={() => {
                this.setState({
                    measuring: !this.state.measuring
                }, () => {
                    this.props.setMeasuring(this.state.measuring, this.state.mouseTimestamp)
                })
            }} /> <Button icon="refresh" style={{ float:'left',margin:8 }} onClick={() => {
                this.updateRange(this.props.range)
            }} /><div style={{ float:'right', margin:8 }}>{this.state.mouseTimestamp}</div></div>)
    }
}