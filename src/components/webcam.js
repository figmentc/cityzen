import React from "react";
import Webcam from "react-webcam";
import firebase from "firebase";
import "../firebase"
import { type } from "os";
import request from 'request'
import {Rectangle} from 'react-shapes';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Light from "./light"
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    // flexGrow: 1,
    paddingLeft: 100,
    paddingRight: 100
  },
  paper: {
    padding: theme.spacing.unit * 1,
    // textAlign: 'center',
    color: theme.palette.text.secondary,
    elevation: 20,
    marginLeft: 20,
    marginRight: 0,
    square: true,
    borderRadius: 0
  },
});



class Cam extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            status: "cross",
            count: 10,
            senior_detected: false
        }
        this.boop = new Audio('/boop.mp3');
        this.senior_alert = new Audio("/seniorAlert.mp3")

    }
    setRef = webcam => {
      this.webcam = webcam;
      
    };

    countNum = () => {
        console.log(this.state.senior_detected, this.state.status, this.state.count)
        if (this.state.status == "cross"){
            if (this.state.count == -1) {
                this.setState({status: "no-hand", count: 10})
            }
            else{
                this.setState({count: this.state.count - 1})
            }
        }
        if (this.state.status == "hand"){
            this.setState({status: "no-hand"})
            this.boop.play()
        }
        else if (this.state.status == "no-hand"){
            if (this.state.count == 1){
                if (this.state.senior_detected) {
                    this.senior_alert.play()
                    this.setState({status: "senior"})
                }
                else{
                    this.setState({status: "stop"})
                }
            }
            else {this.setState({status: "hand", count: this.state.count - 1})}
        }
        else if (this.state.status == "senior"){
           if (!this.state.senior_detected){
               console.log("STOPED")
               this.setState({status: "stop"})
           } 
        }
    }
  
    capture = () => {
    let imageSrc = this.webcam.getScreenshot();
    let base = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    this.storageRef.child("image.jpg").putString(base, 'base64').then(this.snapshotHandler)
    };

    snapshotHandler = (snapshot) => {
        snapshot.ref.getDownloadURL().then(this.facerequest)
    }

    facerequest = (url) => {
        const subscriptionKey = "4fd4cb997bfc4011b5204bbb8820635d";
    
        // You must use the same location in your REST call as you used to get your
        // subscription keys. For example, if you got your subscription keys from
        // westus, replace "westcentralus" in the URL below with "westus".
        const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';
    
        // Request parameters.
        const params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
                'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
        };
    
        const options = {
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + url + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key' : subscriptionKey
            }
        };
        request.post(options, (error, response, body) => {
            if (error) {
              console.log('Error: ', error);
              return;
            }
            
            let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
            // console.log('JSON Response\n');
            // console.log(jsonResponse);
            // console.log(jsonResponse)
            this.draw(jsonResponse)
          });
          
    }
    draw(response){
        // console.log(response)
        // let canvas = this.webcam.getCanvas()
        // console.log(canvas)
      
        // var canvas = document.createElement('canvas');
        // canvas.id = "CursorLayer";
        // canvas.width = 1224;
        // canvas.height = 768;
        // canvas.style.zIndex = 10000000;
        // canvas.style.position = "absolute";
        // canvas.style.border = "1px solid";
        // canvas.style.color = "black"
        // var ctx=canvas.getContext("2d");
        // ctx.beginPath();
        // ctx.lineWidth="6";
        // ctx.strokeStyle="red";
        // ctx.rect(5,5,290,140); 
        // ctx.stroke()
        if (!this.ctx) {
            console.log("This context does not exist")
            this.ctx = this.refs.canvas.getContext('2d');
        }
        // const ctx = this.refs.canvas.getContext('2d');
        let info = JSON.parse(response)
        
        this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        this.ctx.beginPath()
        this.ctx.lineWidth="14";
        this.ctx.strokeStyle="grey";
        this.ctx.moveTo(60,80);
        this.ctx.lineTo(60,80+120);
        this.ctx.moveTo(53,80);
        this.ctx.lineTo(60+130,80);

        this.ctx.moveTo(this.refs.canvas.width-60,this.refs.canvas.height - 10);
        this.ctx.lineTo(this.refs.canvas.width-60,this.refs.canvas.height - (10+120));
        this.ctx.moveTo(this.refs.canvas.width-53,this.refs.canvas.height - 10);
        this.ctx.lineTo(this.refs.canvas.width-(60+130),this.refs.canvas.height - (10));


        this.ctx.moveTo(this.refs.canvas.width-60,80);
        this.ctx.lineTo(this.refs.canvas.width-60,80+120);
        this.ctx.moveTo(this.refs.canvas.width-53,80);
        this.ctx.lineTo(this.refs.canvas.width-(60+130),80);


        this.ctx.moveTo(60,this.refs.canvas.height - 10);
        this.ctx.lineTo(60,this.refs.canvas.height - (10+120));
        this.ctx.moveTo(53,this.refs.canvas.height - 10);
        this.ctx.lineTo(60+130,this.refs.canvas.height - (10));


        this.ctx.stroke()


        if (info != null && Array.isArray(info)){
            var seniors = false
            info.forEach((face) => {
                
                if (face.faceAttributes.age > 50) {
                    this.ctx.beginPath();
                    this.ctx.lineWidth="6";
                    this.ctx.strokeStyle="orange";
                    
                    this.ctx.rect(face.faceRectangle.left, face.faceRectangle.top, 
                        face.faceRectangle.width, face.faceRectangle.height);
                    this.ctx.stroke()
    
                    this.ctx.font = "30px Arial";
                    this.ctx.fillStyle = "orange"
                    this.ctx.fillRect(face.faceRectangle.left-3, face.faceRectangle.top-40, 150, 40)
                    this.ctx.fillStyle = "white"
                    this.ctx.fillText("Age: " + face.faceAttributes.age,face.faceRectangle.left+4, face.faceRectangle.top-5);
                    
                    seniors = true
                }
                else{
                    this.ctx.beginPath();
                    this.ctx.lineWidth="6";
                    this.ctx.strokeStyle="#058CF7";
                    
                    this.ctx.rect(face.faceRectangle.left, face.faceRectangle.top, 
                        face.faceRectangle.width, face.faceRectangle.height);
                    this.ctx.stroke()
    
                    this.ctx.font = "30px Arial";
                    this.ctx.fillStyle = "#058CF7"
                    this.ctx.fillRect(face.faceRectangle.left-3, face.faceRectangle.top-40, 150, 40)
                    this.ctx.fillStyle = "white"
                    this.ctx.fillText("Age: " + face.faceAttributes.age,face.faceRectangle.left+4, face.faceRectangle.top-5);
                    
                }
            })
            this.setState({senior_detected: seniors})
        }
        
    }
    render() {
      const videoConstraints = {
        width: 900,
        height: 800,
        facingMode: "user",
      };

     const divStyle= {
        width: 900,
        height: 800,
        textAlign: "center",
        paddingLeft: 20

      }

    const webcamStyle = {
        borderRadius: 10,
        position: "relative"

    }

    const canvasStyle = {
        borderRadius: 10,
        top: "-800px",
        position: "relative"

    }

  
        const { classes } = this.props;

      return (
        <div className={classes.root}>
        <Grid container spacing={24}>
            {/* <Grid item xs={12}>
          <Paper className={classes.paper}>
          <Typography variant="display2" gutterBottom>
                Demo
            </Typography>

          </Paper>
        </Grid> */}


        <Grid item xs={12}>
          {/* <Paper className={classes.paper}> */}
          <div style={{textAlign: "center"}}>
            <img src="/logo.jpg" width={300}/>
            </div>
          {/* </Paper> */}
        </Grid>


        <Grid item xs={8} style={{paddingBottom: 0, paddingTop: 0}}><Paper className={classes.paper}> <Typography variant="display2">
            Cityzen Backend View

            <img src="/young.jpg" width={150} style={{position: "absolute", top: 160, left: 750}}/>
            <img src="/senior.jpg" width={150} style={{position: "absolute", top: 160, left: 920}}/>
            </Typography></Paper> 
        </Grid>


        <Grid item xs={4} style={{paddingBottom: 0 , paddingTop: 0}}> <Paper className={classes.paper}> <Typography variant="display2">
            Pedestrian View
            </Typography></Paper> 

        </Grid>
          <Grid item xs={8} style={{paddingTop: 0}}>
            <Paper className={classes.paper}>
                    <div>
                    {/* <Typography variant="headline" component="h3">
                    Cityzen Backend View.
                    </Typography> */}
                    {/* <Typography component="p">
                    Paper can be used to build surface or other elements for your application.
                    </Typography> */}

                <div style={divStyle}>
                    <Webcam
                    audio={false}
                    height={800}
                    ref={this.setRef}
                    style={webcamStyle}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.4}
                    width={900}
                    videoConstraints={videoConstraints}
                />

                <canvas ref="canvas" width={900} height={700} style={canvasStyle}/>


                </div>
                
                {/* <button onClick={this.capture}>Capture photo</button> */}
                </div>

            </Paper>
          </Grid>
          <Grid item xs={4}  style={{paddingTop: 0}}>
            <Paper className={classes.paper}>
            {/* <Typography variant="display1" gutterBottom>
            Pedestrian Light
      </Typography> */}
                <Light status={this.state.status} count={this.state.count}/>
            </Paper>
          </Grid>
        </Grid>
      </div>
  
      )
    }
    componentDidMount(){
        this.interval = setInterval(() => this.capture(), 3000);
        this.count = setInterval(() => this.countNum(), 750)
        this.storage = firebase.storage()
        this.storageRef = this.storage.ref()
        this.draw = this.draw.bind(this)
        this.capture = this.capture.bind(this)
        this.facerequest = this.facerequest.bind(this)
        this.countNum = this.countNum.bind(this)

        this.ctx = this.refs.canvas.getContext('2d');
        this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        this.ctx.beginPath()
        this.ctx.lineWidth="14";
        this.ctx.strokeStyle="grey";
        this.ctx.moveTo(60,80);
        this.ctx.lineTo(60,80+120);
        this.ctx.moveTo(53,80);
        this.ctx.lineTo(60+130,80);

        this.ctx.moveTo(this.refs.canvas.width-60,this.refs.canvas.height - 10);
        this.ctx.lineTo(this.refs.canvas.width-60,this.refs.canvas.height - (10+120));
        this.ctx.moveTo(this.refs.canvas.width-53,this.refs.canvas.height - 10);
        this.ctx.lineTo(this.refs.canvas.width-(60+130),this.refs.canvas.height - (10));


        this.ctx.moveTo(this.refs.canvas.width-60,80);
        this.ctx.lineTo(this.refs.canvas.width-60,80+120);
        this.ctx.moveTo(this.refs.canvas.width-53,80);
        this.ctx.lineTo(this.refs.canvas.width-(60+130),80);


        this.ctx.moveTo(60,this.refs.canvas.height - 10);
        this.ctx.lineTo(60,this.refs.canvas.height - (10+120));
        this.ctx.moveTo(53,this.refs.canvas.height - 10);
        this.ctx.lineTo(60+130,this.refs.canvas.height - (10));


        this.ctx.stroke()




    }
  }

  Cam.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(Cam);
  
//   export default Cam
