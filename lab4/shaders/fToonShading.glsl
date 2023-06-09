#version 300 es
#ifdef GL_ES
precision highp float;
#endif

in highp vec3 vLightDir;
in vec3 vNormal;
in vec4 vColor;
in vec3 vPosition;
uniform vec3 uLightPosition;
uniform float uAmbientIntensity;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;

uniform float kc;
uniform float kl;
uniform float kq;

uniform float uAmbientContribution;

const float edge0 = 0.1;
const float edge1 = 0.3;

const float shininess = 32.0;
precision mediump float;
out vec4 fragColor;
void main(void) {
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    float intensity = dot(vNormal, lightDirection);
    float diffuseLightDot = max(dot(vNormal, lightDirection), 0.0);
    float d = distance(uLightPosition, vPosition);
    float attenuation = 1.0 / (kc + kl * d + kq * d * d);
    vec3 diffuse = uDiffuseLightColor * diffuseLightDot;
    vec3 specular = vec3(0.0);
    vec3 vLightWeighting = vec3(0.0);
    if (intensity > 0.90) {
        specular = uSpecularLightColor * pow(max(dot(normalize(reflect(-normalize(uLightPosition - vPosition), normalize(vNormal))), normalize(-vPosition)), 0.0), shininess);
        vLightWeighting = uAmbientLightColor * uAmbientIntensity + (specular) * attenuation;
        fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);
    } else if (intensity > 0.5) {
        vLightWeighting = uAmbientLightColor * uAmbientIntensity + (specular + diffuse) * attenuation;
        fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);
    } else {
        vLightWeighting = uAmbientLightColor * uAmbientIntensity + (diffuse) * attenuation;
        fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);
    }
    if (fragColor.r + fragColor.g + fragColor.b > 0.8) {
        fragColor.rgb = vLightWeighting * vColor.rgb * vec3(1.0);
    } else if (fragColor.r + fragColor.g + fragColor.b > 0.6) {
        fragColor.rgb = vLightWeighting * vColor.rgb * 0.8;
    } else if (fragColor.r + fragColor.g + fragColor.b > 0.4) {
        fragColor.rgb = vLightWeighting * vColor.rgb * 0.6;
    } else if (fragColor.r + fragColor.g + fragColor.b > 0.2) {
        fragColor.rgb = vLightWeighting * vColor.rgb * 0.4;
    } else {
        fragColor.rgb = vLightWeighting * vColor.rgb * 0.2;
    }
}