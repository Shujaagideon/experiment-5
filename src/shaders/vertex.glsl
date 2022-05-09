uniform float time;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 worldPos;
varying vec2 vScreenSpace;

void main(){
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    worldPos = vec4(modelMatrix * vec4( position, 1.0 )).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    vScreenSpace = gl_Position.xy/gl_Position.w;
}