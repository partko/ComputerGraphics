#version 300 es
#ifdef GL_ES
precision highp float;
#endif
in vec3 vLightWeighting;
in lowp vec4 vColor;

out vec4 fragColor;
void main(void) {
    fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);
}
