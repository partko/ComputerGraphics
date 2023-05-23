#version 300 es
#ifdef GL_ES
precision highp float;
#endif
in vec3 vLightWeighting;
in lowp vec4 vColor;
in vec2 vTextureCoords;

uniform float uPropMat;
uniform float uPropDig;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

out vec4 fragColor;
void main(void) {
    vec4 matTex = texture(uSampler0, vTextureCoords);
    vec4 digTex = texture(uSampler1, vTextureCoords);
    matTex.a *= uPropMat;
    digTex.a *= uPropDig;
    fragColor = vec4(vLightWeighting *(digTex.rgb * digTex.a + (1.0-digTex.a) * (matTex.a * matTex.rgb + vColor.rgb * (1.0 - matTex.a))),1);
}
