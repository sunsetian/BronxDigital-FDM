/*
precision highp float;

// Uniforms
uniform float time;

// Varying
varying vec2 uvV;

void main(void) {
    vec3 color = 0.5 + 0.5*cos(time + uvV.xyx +vec3(0,2,4));

    gl_FragColor = vec4(color, 1.);
}
*/
precision highp float;
varying vec2 vUV;

uniform sampler2D uDiffuseMap;
uniform sampler2D uHeightMap;
uniform float time;

void main(void)
{
    float height = texture2D(uHeightMap, vUV).r;
    //vec4 color=vec4(1, 0, 0, 1.0);
    vec4 color= texture2D(uDiffuseMap, vUV);
    
    if (height > time) {
        discard;
    }
    
    if (height > (time-0.04)) {
        color = vec4(0, 1, 0, 1.0);
    }
    gl_FragColor = color;
}