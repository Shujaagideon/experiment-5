uniform float time;
uniform vec3 u_color;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 worldPos;
varying vec2 vScreenSpace;


void main(){
    vec3 newPos = worldPos;
    newPos.z -=  0.2;
    float light = 0.2 * (dot( vec3(worldPos.x, worldPos.y, worldPos.z-0.5), normalize(vec3(-1., 1.0, 1.)))) + 0.16;
    vec4 fin1 = texture2D(uTexture2, vUv);
    vec4 fin2 = texture2D(uTexture2, vUv);
    if(fin2.r > 0.9){
        fin2*= 150.;
    }

    fin1.xyz -= 0.8;
    fin1.xyz = mix( u_color, vec3(0.1765, 0.1765, 0.1765) , (fin1.x ));
    // fin1.xyz = mix( u_color, vec3(0.1765, 0.1765, 0.1765) , (fin1.y + 0.2));
    fin2.xyz = mix( u_color, vec3(0.1765, 0.1765, 0.1765) , (fin2.z ));


    fin1 = (fin1 + vec4(vec3(light), 1.));
    fin2 = (fin2);
    // float mixValue = (( worldPos.x + 1. - worldPos.y + worldPos.z - 1.8) + 3.3) * 0.005;
    // float mixValue = (0.5 * ( worldPos.x + 0.5)) * 0.2 + 0.02;
    float mixValue = (0.5 * ( worldPos.x + 0.5 - worldPos.z)) * 0.2 + 0.02;

    mixValue = clamp(mixValue, 0., 1.);

    vec4 final = mix(fin1, fin2, mixValue);
    gl_FragColor = final;
    // gl_FragColor = fin1 + fin2; 
    // gl_FragColor = (vec4(vec3(light2), 1.) + fin2);
    // gl_FragColor = (vec4(vec3(light2), 1.) + fin2) * (fin1 + vec4(vec3(light), 1.));
}