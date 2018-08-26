import React from "react";
import lightbase from "../lightbase.png"
class Light extends React.Component {
    constructor(props){
        super(props)
        this.state = props
    }      

    render() {
        
        return (<div>
            <canvas ref="canvas" width={450} height={800} />
        </div>)
    }


    componentDidMount(){
        this.updateCanvas()
    }

    componentDidUpdate(){
        this.updateCanvas()
    }
    draw = (img) => {
        console.log(img)
        return (() => {this.ctx.drawImage(img, 30, 40   , 380, 720)})
    }

    updateCanvas = () => {
        if (!this.ctx) {
            console.log("This context does not exist")
            this.ctx = this.refs.canvas.getContext('2d');
        }
        var drawing = new Image();
        console.log("update", this.props.status, this.props.count)
        switch (this.props.status){
            case "stop":
                drawing.src = "/numbers/stop"+".jpg"
                break;
            case "hand":
                drawing.src = "/numbers/" + this.props.count +".jpg"
                break;
            case "no-hand":
                drawing.src = "/numbers/empty/" + this.props.count +".jpg"
                break;
            case "senior":
                drawing.src = "/numbers/senior" + ".jpg"
                break;

            case "cross":
                drawing.src = "/numbers/cross.jpg"
                break;
            default:
                drawing.src = "/numbers/stop"+".jpg"
                break;
        }
        console.log("drawing", drawing.src)
        // drawing.src = "/numbers/" + this.props.status + ".jpg"; // can also be a remote URL e.g. http://
        drawing.onload = this.draw(drawing)
        // console.log(drawing)

    }

    componentWillReceiveProps(nextProps) {
        this.setState({status: nextProps.status, count: nextProps.count})

    }
}


export default Light