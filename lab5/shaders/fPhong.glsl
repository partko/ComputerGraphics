#version 300 es
#ifdef GL_ES
precision highp float;
#endif
in vec3 vLightWeighting;
in lowp vec4 vColor;

in highp vec3 vLightDir;
in vec3 vNormal;
in vec3 vPosition;
in vec2 vTextureCoords;

uniform vec3 uLightPosition;

uniform float kc;
uniform float kl;
uniform float kq;

uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;

uniform float uAmbientContribution;

uniform float uPropMat;
uniform float uPropDig;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

const float shininess = 16.0;

out vec4 fragColor;
void main(void) {
    vec4 matTex = texture(uSampler0, vTextureCoords);
    vec4 digTex = texture(uSampler1, vTextureCoords);
    matTex.a *= uPropMat;
    digTex.a *= uPropDig;
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    float d = distance(uLightPosition, vPosition);
    float diffuseLightDot = max(dot(vNormal, lightDirection), 0.0);
    vec3 reflectionVector = normalize(reflect(-lightDirection, vNormal));
    vec3 viewVectorEye = -normalize(vPosition);
    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);
    float attenuation = 1.0 / (kc + kl * d + kq * d * d);
    vec3 vLightWeighting = uAmbientLightColor * uAmbientContribution +  (uDiffuseLightColor * diffuseLightDot + uSpecularLightColor * specularLightParam) * attenuation;
    fragColor=vec4(vLightWeighting * (digTex.rgb * digTex.a + (1.0-digTex.a) * (matTex.a * matTex.rgb + vColor.rgb * (1.0 - matTex.a))),1);
}
