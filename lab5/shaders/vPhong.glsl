#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec2 aTextureCoords;

uniform mat4 mView; // матрица вида
uniform mat4 mProj; // матрица проекции
uniform mat4 mNorm; // матрица нормалей

uniform vec3 uLightPosition;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;

uniform float kc;
uniform float kl;
uniform float kq;

uniform float uAmbientContribution;


out lowp vec4 vColor;
out vec3 vPosition;
out highp vec3 vLightWeighting;

out vec3 vNormal;
out vec3 vCameraPosition;
out vec2 vTextureCoords;

const float shininess = 32.0;
void main() {
    // установка позиции наблюдателя сцены
    vec4 vertexPositionEye4 = mView * vec4(aVertexPosition, 1.0);
    vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;

    // получаем вектор направления света
    vec3 lightDirection = normalize(uLightPosition - vertexPositionEye3);

    // получаем нормаль
    vec3 normal = normalize(mat3(mNorm) * aVertexNormal);

    //скалярное произведение векторов нормали и направления света
    float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

    // получаем вектор отраженного луча и нормализуем его
    vec3 reflectionVector = normalize(reflect(-lightDirection, normal));

    // установка вектора камеры
    vec3 viewVectorEye = -normalize(vertexPositionEye3);

    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);

    float specularLightParam = pow(specularLightDot, shininess);

    float d = distance(uLightPosition, vertexPositionEye3);
    float attenuation = 1.0 / (kc + kl * d + kq * d * d);

    // отраженный свет равен сумме фонового, диффузного и зеркального отражений света
    vLightWeighting = uAmbientLightColor * uAmbientContribution +  (uDiffuseLightColor * diffuseLightDot + uSpecularLightColor * specularLightParam) * attenuation;

    // Finally transform the geometry
    gl_Position = mProj * mView * vec4(aVertexPosition, 1.0);
    vPosition = vertexPositionEye3;

    vColor = aVertexColor;

    vNormal = normal;
    vCameraPosition = viewVectorEye;
    vTextureCoords = aTextureCoords;
}