import vPhong from "./shaders/vPhong.glsl"
import vLambert from "./shaders/vLambert.glsl"
import vBlinnPhong from "./shaders/vBlinnPhong.glsl"
import fGouraud from "./shaders/fGouraud.glsl"
import fPhong from "./shaders/fPhong.glsl"
import fToonShading from "./shaders/fToonShading.glsl"
import glm from "gl-matrix";

var gl;

// const cubeVS =
//     [
//         '#version 300 es',
//         'in vec3 aVertexPosition;',
//         'uniform mat4 mWorld;',
//         'uniform mat4 mView;',
//         'uniform mat4 mProj;',
//         'out vec3 vPosition;',
//         'void main() {',
//         '    gl_Position = mProj * mView * mWorld * vec4(aVertexPosition, 1.0);',
//         '    vPosition = aVertexPosition;',
//         '}',
//     ].join('\n');

// const cubeFS =
//     [
//         '#version 300 es',
//         '#ifdef GL_ES',
//         'precision highp float;',
//         '#endif',
//         'uniform vec4 fColor;',
//         'out vec4 fragColor;',
//         'void main(void) {',
//         '    fragColor = fColor;',
//         '}',
//     ].join('\n');

let vs= [ vPhong, vLambert, vBlinnPhong ]
let fs= [ fGouraud, fPhong, fToonShading ]

let shadingModel = 0
let lightingModel = 0
let ambientContribution = 1.0
let Kc = 1.0
let Kl = 0.0009
let Kq = 0.0003
let distance= 30

let corners = {
    current_cube: "1",
    cube1: 0.0,
    cube2: 0.0,
    cube3: 0.0,
    cube4: 0.0,
    pedestal: 0.0,
    scene: 0.0,
    cubes: 0.0,
}

function initWebGL(canvas) {
    gl = null;
    try {
        gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimentalwebgl");
    } catch(e) {}
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}


function main() {
    var canvas = document.getElementById('cubes');
    if (!canvas) {
        console.log('failed to find canvas');
        return;
    }

    gl = initWebGL(canvas);

    if (gl) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    }


    window.addEventListener("keydown", checkKeyPressed);

    function render() {
        const shaderProgram = initShaderProgram(gl, vs[lightingModel], fs[shadingModel]);
        //const shaderProgram = initShaderProgram(gl, cubeVS, cubeFS);
        gl.useProgram(shaderProgram);
        if(shaderProgram) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearDepth(1.0);

            drawCube(shaderProgram, [0.79, 0.79, 0.79, 1.0], corners.cube1,
                corners.pedestal, corners.scene, corners.cubes, [-8.0, 0.0, 0.0], 1.4);
            drawCube(shaderProgram, [1.0, 0.2, 0.0, 1.0], corners.cube2,
                corners.pedestal, corners.scene, corners.cubes, [-2.0, 0.0, 0.0], 2.4);
            drawCube(shaderProgram, [1.0, 0.84, 0.0, 1.0], corners.cube3,
                corners.pedestal, corners.scene, corners.cubes, [4.0, 0.0, 0.0], 1.8);
            drawCube(shaderProgram, [0.8, 0.5, 0.2, 1.0], corners.cube4,
                corners.pedestal, corners.scene, corners.cubes, [8.0, 0.0, 0.0], 1);
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function checkKeyPressed(e) {
    if (e.keyCode == "49") { corners.current_cube = "1"; }
    if (e.keyCode == "50") { corners.current_cube = "2"; }
    if (e.keyCode == "51") { corners.current_cube = "3"; }
    if (e.keyCode == "52") { corners.current_cube = "4"; }
    if (e.keyCode == "53") { corners.current_cube = "p"; }
    if (e.keyCode == "54") { corners.current_cube = "s"; }
    if (e.keyCode == "55") { corners.current_cube = "c"; }

    if (e.keyCode == "37") {
        switch (corners.current_cube) {
            case "1": corners.cube1 -= 0.04; break;
            case "2": corners.cube2 -= 0.04; break;
            case "3": corners.cube3 -= 0.04; break;
            case "4": corners.cube4 -= 0.04; break;
            case "p": corners.pedestal -= 0.04; break;
            case "s": corners.scene -= 0.04; break;
            case "c": corners.cubes -= 0.04; break;
        }
    }

    if (e.keyCode == "39") {
        switch (corners.current_cube) {
            case "1": corners.cube1 += 0.04; break;
            case "2": corners.cube2 += 0.04; break;
            case "3": corners.cube3 += 0.04; break;
            case "4": corners.cube4 += 0.04; break;
            case "p": corners.pedestal += 0.04; break;
            case "s": corners.scene += 0.04; break;
            case "c": corners.cubes += 0.04; break;
        }
    }
}

function drawCube(shaderProgram, color, rotateCube, rotatePedestal, rotateScene, rotateAll, pos, size) {
    //позиция источника света
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uLightPosition"), [0.0, 10.0, distance]);

    //соствавляющие света
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uAmbientLightColor"), [0.1, 0.1, 0.1]);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uDiffuseLightColor"), [0.7, 0.7, 0.7]);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uSpecularLightColor"), [1.0, 1.0, 1.0]);

    // постоянный коэффициент рассеивания
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "kc"), Kc);
    // линейный коэффициент рассеивания
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "kl"), Kl);
    // квадратичный коэффициент рассеивания
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "kq"), Kq);

    //коэффициент фонового освещения
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "uAmbientContribution"),ambientContribution);

    const vertices = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Front
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // Back
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Top
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Bottom
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // Right
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, // Left
    ];

    for (let i = 0; i < vertices.length; ++i) {
        vertices[i] = vertices[i] * size;
    }
    pos = [pos[0], pos[1] + size , pos[2]];

    let cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);
    //обращение к точкам вершин по индексу
    const indexBuffer = gl.createBuffer()
    let indices = [
        0,  1,  2,  2,  3,  0,  // front
        4,  5,  6,  6,  7,  4,  // back
        8,  9,  10, 10, 11, 8,  // top
        12, 13, 14, 14, 15, 12, // bottom
        16, 17, 18, 18, 19, 16, // right
        20, 21, 22, 22, 23, 20 // left
    ]
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    //нормали
    const vertexNormals = [
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // Front
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, // Back
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Top
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // Bottom
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // Right
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // Left
    ];

    let cubeNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    const vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalAttribute);


    //цвета
    const faceColors = [
        color,
        color,
        color,
        color,
        color,
        color,
    ];
    let colors = [];

    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"),4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));

    const mProj = gl.getUniformLocation(shaderProgram, "mProj");
    const mView = gl.getUniformLocation(shaderProgram, "mView");
    //const fColor = gl.getUniformLocation(shaderProgram, "fColor");

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();
    const normalMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


    glMatrix.mat4.translate(viewMatrix, viewMatrix, [0.0, -4.0, -30]); //отдаляем кубы чтобы их было видно

    glMatrix.mat4.rotate(viewMatrix, viewMatrix, rotateScene, [0, 1, 0]);
    glMatrix.mat4.translate(viewMatrix, viewMatrix, [12.0, 0.0, 0.0]);
    glMatrix.mat4.rotate(viewMatrix, viewMatrix, rotatePedestal, [0, 1, 0]);
    glMatrix.mat4.translate(viewMatrix, viewMatrix, pos); //перемещяем куб на свою позицию
    glMatrix.mat4.rotate(viewMatrix, viewMatrix, rotateCube, [0, 1, 0]);
    glMatrix.mat4.rotate(viewMatrix, viewMatrix, rotateAll, [0, 1, 0]);


    glMatrix.mat4.invert(normalMatrix, viewMatrix);
    glMatrix.mat4.transpose(normalMatrix, normalMatrix);

    //gl.uniform4f(fColor, color[0], color[1], color[2], color[3]);
    gl.uniformMatrix4fv(mProj, false, projectionMatrix);
    gl.uniformMatrix4fv(mView, false, viewMatrix);

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "mNorm"),false, normalMatrix);

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 36);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}

main()

document.getElementById("applyBtn").onclick = function setModel() {
    let LightingSelect = document.getElementById('LightingModel')
    let ShadingSelect = document.getElementById('ShadingModel')
    lightingModel = Number(LightingSelect.value)
    shadingModel = Number(ShadingSelect.value)
    ambientContribution = Number(document.getElementById('ambient').value)
    Kc = Number(document.getElementById('kc').value);
    Kl = Number(document.getElementById('kl').value);
    Kq = Number(document.getElementById('kq').value);
}