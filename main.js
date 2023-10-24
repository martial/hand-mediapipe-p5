import "./style.css";
import p5 from "p5";
import { mySketch, createHandLandmarker } from "./sketch.js";


createHandLandmarker()
  .then((handLandmarker) => {
    console.log("HandLandmarker created:", handLandmarker);

    // Create a wrapper object to hold both the p5 instance and the sketch instance
    const sketchWrapper = {};

    // Create the p5 instance and keep a reference to the returned object
    sketchWrapper.p5Instance = new p5((p) => {
      const sketchInstance = mySketch(p);
      sketchWrapper.sketchInstance = sketchInstance;
    });

    // Now you can access setHandLandmarker like this:
    sketchWrapper.sketchInstance.setHandLandmarker(handLandmarker);
  })
  .catch((error) => {
    console.error("Failed to create HandLandmarker:", error);
  });
