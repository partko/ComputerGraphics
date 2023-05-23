#version 300 es
#ifdef GL_ES
precision highp float;
#endif
in vec3 vLightWeighting;
in lowp vec4 vColor;

in highp vec3 vLightDir;
in vec3 vNormal;
in vec3 vPosition;
uniform vec3 uLightPosition;

uniform float kc;
uniform float kl;
uniform float kq;

uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;

uniform float uAmbientContribution;

const float shininess = 16.0;

out vec4 fragColor;
void main(void) {
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    float d = distance(uLightPosition, vPosition);
    float diffuseLightDot = max(dot(vNormal, lightDirection), 0.0);
    vec3 reflectionVector = normalize(reflect(-lightDirection, vNormal));
    vec3 viewVectorEye = -normalize(vPosition);
    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);
    float attenuation = 1.0 / (kc + kl * d + kq * d * d);
    vec3 vLightWeighting = uAmbientLightColor * uAmbientContribution +  (uDiffuseLightColor * diffuseLightDot + uSpecularLightColor * specularLightParam) * attenuation;
    fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);
}
