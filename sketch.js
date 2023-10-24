import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
export const createHandLandmarker = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      //demosSection.classList.remove("invisible");
      resolve(handLandmarker); // Resolving with the created handLandmarker object
    } catch (error) {
      reject(error); // Rejecting with the encountered error
    }
  });
};

// Exporting a function called 'mySketch'
export const mySketch = (p) => {
  let handLandmarker; // HandLandmarker object, managed by p5.js

  let capture; // webcam capture, managed by p5.js
  let videoDataLoaded = false; // indicates whether the video has been loaded

  let myShader;
  let layer;

  const setHandLandmarker = (hl) => {
    handLandmarker = hl;
  };

  p.preload = () => {
    // load the shader
    myShader = p.loadShader("webcam.vert", "webcam.frag");
    console.log("loaded");
  };

  // Calling p5.js functions, using the variable 'p'
  p.setup = () => {
    p.smooth();
    p.curveDetail(24); // Set the circle detail to 24

    capture = p.createCapture(p.VIDEO);

    // this is to make sure the capture is loaded before asking handpose to take a look
    // otherwise handpose will be very unhappy
    capture.elt.onloadeddata = () => {
      videoDataLoaded = true;
      // Creating a canvas using the entire screen of the webpage
      p.createCanvas(capture.width, capture.height, p.WEBGL);
      p.strokeWeight(5);
      p.background(255);
      capture.hide();
      layer = p.createFramebuffer();
    };
  };

  p.draw = () => {
    if (videoDataLoaded) {
      const results = handLandmarker.detectForVideo(
        capture.elt,
        performance.now()
      );

      layer.begin();
      p.clear();

      // Clear the frame
      p.background(255, 50);
      p.image(capture, 0, 0, capture.width, capture.height);
      p.shader(myShader);
      myShader.setUniform("tex0", capture);

      p.rect(0, 0, capture.width, capture.height);
      layer.end();

      p.push();
      // flip all graphics

      // p.translate(p.width, 0);
      //p.scale(-1, 1);
      p.translate(-p.width / 2, -p.height / 2);
      p.image(layer, p.width, 0, -p.width, p.height);

      /*
      for (const hand of results.landmarks) {
        for (const point of hand) {
          const x = (1.0 - point.x) * capture.width; // Assuming 'width' is the width of the p5 canvas
          const y = point.y * capture.height; // Assuming 'height' is the height of the p5 canvas

          // Draw each landmark as a circle
          p.fill(255, 255, 255); // Red color
          p.noStroke();
          p.ellipse(x, y, 10, 10);
        }
      }
      */

      myShader.setUniform("numOfHands", results.landmarks.length);

      // if we have one hand draw circles around each landmark
      if (results.landmarks.length === 1) {
        const hand = results.landmarks[0];
        let x1 = hand[8].x;
        let y1 = hand[8].y;

        let x2 = hand[4].x;
        let y2 = hand[4].y;

        // flip x coordinates
        x1 = 1 - x1;
        x2 = 1 - x2;

        // get center of points
        let centerX = (x1 + x2) / 2;
        let centerY = (y1 + y2) / 2;
        let distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

        myShader.setUniform("point1", [1.0 - centerX, centerY]);
        myShader.setUniform("radius", distance * 0.25);

        // get distance between points
        x1 *= capture.width;
        x2 *= capture.width;
        y1 *= capture.height;
        y2 *= capture.height;

        distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

        // draw circle
        p.strokeWeight(2);
        p.stroke(255, 255, 255); // Red color
        p.noFill();

        /*
        p.ellipse(
          centerX * capture.width,
          centerY * capture.height,
          distance,
          distance
        );
        */
      }

      // if we have two hands, draw a rectangle where corners are as specified
      if (results.landmarks.length === 2) {
        const swapCoords = (x1, y1, x2, y2) => [x2, y2, x1, y1];

        const hand0 = results.landmarks[0];
        const hand1 = results.landmarks[1];

        let x1 = hand0[8].x;
        let y1 = hand0[8].y;

        let x2 = hand1[8].x;
        let y2 = hand1[8].y;

        let x3 = hand1[4].x;
        let y3 = hand1[4].y;

        let x4 = hand0[4].x;
        let y4 = hand0[4].y;

        if (y2 < y3 && y1 > y4) {
          [x2, y2, x3, y3] = swapCoords(x2, y2, x3, y3);
        }

        if (y1 < y4 && y2 > y3) {
          [x1, y1, x4, y4] = swapCoords(x1, y1, x4, y4);
        }

        myShader.setUniform("point1", [x1, y1]);
        myShader.setUniform("point2", [x2, y2]);
        myShader.setUniform("point3", [x3, y3]);
        myShader.setUniform("point4", [x4, y4]);

        // Draw shape
        p.fill(0, 255, 0, 0.0); // Semi-transparent green color
        p.stroke(0, 0, 0); // Green outline
        p.strokeWeight(1);

        // flip the x coordinates
        x1 = 1 - x1;
        x2 = 1 - x2;
        x3 = 1 - x3;
        x4 = 1 - x4;

        p.beginShape();
        p.vertex(x1 * capture.width, y1 * capture.height); // First corner (hand0, point 8)
        p.vertex(x2 * capture.width, y2 * capture.height); // Second corner (hand1, point 8)
        p.vertex(x3 * capture.width, y3 * capture.height); // Third corner (hand1, point 4)
        p.vertex(x4 * capture.width, y4 * capture.height); // Fourth corner (hand0, point 4)
        p.endShape(p.CLOSE);
      }
      p.pop();
    }

    // Draw your objects here
    // ...
    // For instance, you can draw a rectangle that covers the entire canvas
    // p.rect(0, 0, capture.width, capture.height);
  };

  p.windowResized = () => {
    // p.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  return {
    setHandLandmarker,
  };
};
