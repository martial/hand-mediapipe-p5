#ifdef GL_ES
precision mediump float;
#endif

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform vec2 point1;
uniform vec2 point2;
uniform vec2 point3;
uniform vec2 point4;
uniform float radius;

uniform int numOfHands;

bool isInsideCircle(vec2 p, vec2 center, float radius) {

  vec2 diff = p - center;
  vec2 resolution = vec2(1.0, gl_FragCoord.w / gl_FragCoord.z);
  vec2 normalizedDiff = diff / resolution;
  float dist = length(normalizedDiff);
  return dist < radius;

}


bool isInsideQuad(vec2 p, vec2 a, vec2 b, vec2 c, vec2 d) {
    // quad is clockwise: a, b, c, d

    // Create vectors from the quad points to the test point
    vec2 pa = p - a, pb = p - b, pc = p - c, pd = p - d;

    // Create edge vectors
    vec2 ab = b - a, bc = c - b, cd = d - c, da = a - d;

    // Compute the cross product of these vectors
    float c1 = ab.x * pa.y - ab.y * pa.x;
    float c2 = bc.x * pb.y - bc.y * pb.x;
    float c3 = cd.x * pc.y - cd.y * pc.x;
    float c4 = da.x * pd.y - da.y * pd.x;

    // Check if all the signs are positive or all are negative
    if((c1 < 0.0 && c2 < 0.0 && c3 < 0.0 && c4 < 0.0) || 
       (c1 > 0.0 && c2 > 0.0 && c3 > 0.0 && c4 > 0.0)) {
        return true; // p is inside the quad
    }

    return false; // p is not inside the quad
}


void main() {
  vec2 uv = vTexCoord;

  if(numOfHands == 0 ) {
    vec4 tex = texture2D(tex0, uv);
    gl_FragColor = tex;
    return;
  }


  if(numOfHands == 1) {

    vec4 tex = texture2D(tex0, uv);
    if (isInsideCircle(uv, point1, radius)) {
      
       // GOOFY
      
      // calculate scale factor based on distance from centroid and point x
      vec2 translatedUV = uv - point1;
      // Perform scaling
      float scaleFactor = 1.0 + radius * 12.0; // Scaling factor
      vec2 scaledUV = translatedUV * scaleFactor;
      // Translate back to original coordinate system
      vec2 finalUV = scaledUV + point1;
      // Fetch the texture at the scaled coordinate
      vec4 texScale = texture2D(tex0, finalUV);
      // if inside the quad, render grayscale
      gl_FragColor = texScale;

      
    } else {

      gl_FragColor = tex;


    } 


    return;
  }

  if(numOfHands == 2) {

    if (isInsideQuad(uv, point1, point2, point3, point4)) {

      vec2 centroid = (point1 + point2 + point3 + point4) / 4.0;
      // Translate so that centroid is the origin
      vec2 translatedUV = uv - centroid;



      // GOOFY
      /*
      // calculate scale factor based on distance from centroid and point x
      float dist = distance(centroid, point1);
      float dist2 = distance(centroid, uv);
      float scale = dist2 / dist;
      // Perform scaling
      float scaleFactor = .25 + scale; // Scaling factor
      */

      float dist = distance(point1.x, point2.x);
      // Perform scaling
      float scaleFactor = .25 + ( dist); // Scaling factor
      
      scaleFactor = 1.0;

      vec2 scaledUV = translatedUV * scaleFactor;

      // Translate back to original coordinate system
      vec2 finalUV = scaledUV + centroid;
      
      // Fetch the texture at the scaled coordinate
      vec4 texScale = texture2D(tex0, finalUV);
      

      // if inside the quad, render grayscale
      gl_FragColor = texScale;
      
    } else {
      // else, render normally
      vec4 tex = texture2D(tex0, uv);
      // grey scale
      float grey = (tex.r + tex.g + tex.b) / 3.0;
      tex.r = grey;
      tex.g = grey;
      tex.b = grey;

      gl_FragColor = tex;
    }

  }
}