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



const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});



class Cam extends React.Component {
    
    setRef = webcam => {
      this.webcam = webcam;
      
    };
  
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
        
        info.forEach((face) => {
            this.ctx.beginPath();
            this.ctx.lineWidth="6";
            this.ctx.strokeStyle="orange";

            this.ctx.rect(face.faceRectangle.left, face.faceRectangle.top, 
                face.faceRectangle.width, face.faceRectangle.height);
            this.ctx.stroke()

            this.ctx.font = "50px Arial";
            this.ctx.fillStyle = "orange"
            this.ctx.fillText(face.faceAttributes.age,face.faceRectangle.left+face.faceRectangle.width + 20,
                face.faceRectangle.height+10);

        })
        
        
    }
    render() {
      const videoConstraints = {
        width: 1000,
        height: 700,
        facingMode: "user",
      };

     const divStyle= {
        width: 1000,
        height: 700

      }

    const webcamStyle = {
        borderRadius: 10,
        position: "relative"

    }

    const canvasStyle = {
        borderRadius: 10,
        top: "-700px",
        position: "relative"

    }

  
        const { classes } = this.props;

      return (
        <div className={classes.root}>
        <Grid container spacing={24}>

          <Grid item xs={8}>
            <Paper className={classes.paper}>
            
                    <div>
                    <h1 >Cityzen Backend View</h1>
                <div style={divStyle}>
                    <Webcam
                    audio={false}
                    height={700}
                    ref={this.setRef}
                    style={webcamStyle}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.1}
                    width={1000}
                    videoConstraints={videoConstraints}
                />

                <canvas ref="canvas" width={1000} height={700} style={canvasStyle}/>


                </div>
                
                <button onClick={this.capture}>Capture photo</button>
                </div>

            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
                <h1> Pedestrian Light</h1>
            </Paper>
          </Grid>
        </Grid>
      </div>
  
      )
    }
    componentDidMount(){
        // this.interval = setInterval(() => this.capture(), 3000);
        this.storage = firebase.storage()
        this.storageRef = this.storage.ref()
        this.draw = this.draw.bind(this)
        this.capture = this.capture.bind(this)
        this.facerequest = this.facerequest.bind(this)
    }
  }

  Cam.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(Cam);
  
//   export default Cam
