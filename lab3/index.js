var gl;

const cubeFS =
    [
        '#version 300 es',
        '#ifdef GL_ES',
        'precision highp float;',
        '#endif',
        'uniform vec4 fColor;',
        'out vec4 fragColor;',
        'void main(void) {',
        '    fragColor = fColor;',
        '}',
    ].join('\n');

const cubeVS =
    [
        '#version 300 es',
        'in vec3 aVertexPosition;',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        'out vec3 vPosition;',
        'void main() {',
        '    gl_Position = mProj * mView * mWorld * vec4(aVertexPosition, 1.0);',
        '    vPosition = aVertexPosition;',
        '}',
    ].join('\n');

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
    
    const shaderProgram = initShaderProgram(gl, cubeVS, cubeFS);
    gl.useProgram(shaderProgram);
    window.addEventListener("keydown", checkKeyPressed);

    function render() {
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
    const vertices = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Front
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // Back
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Top
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Bottom
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // Right
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, // Left
    ];

    for (i = 0; i < vertices.length; ++i) {
        vertices[i] = vertices[i] * size;
    }
    pos = [pos[0], pos[1] + size , pos[2]];

    let cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    const mProj = gl.getUniformLocation(shaderProgram, "mProj");
    const mView = gl.getUniformLocation(shaderProgram, "mView");
    const mWorld = gl.getUniformLocation(shaderProgram, "mWorld");
    const fColor = gl.getUniformLocation(shaderProgram, "fColor");

    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();
    const worldMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


    glMatrix.mat4.translate(worldMatrix, worldMatrix, [0.0, -4.0, -30]);

    glMatrix.mat4.rotate(worldMatrix, worldMatrix, rotateScene, [0, 1, 0]);
    glMatrix.mat4.translate(worldMatrix, worldMatrix, [12.0, 0.0, 0.0]);
    glMatrix.mat4.rotate(worldMatrix, worldMatrix, rotatePedestal, [0, 1, 0]);
    glMatrix.mat4.translate(worldMatrix, worldMatrix, pos);
    glMatrix.mat4.rotate(worldMatrix, worldMatrix, rotateCube, [0, 1, 0]);
    glMatrix.mat4.rotate(worldMatrix, worldMatrix, rotateAll, [0, 1, 0]);
    
    gl.uniform4f(fColor, color[0], color[1], color[2], color[3]);
    gl.uniformMatrix4fv(mProj, false, projectionMatrix);
    gl.uniformMatrix4fv(mView, false, viewMatrix);
    gl.uniformMatrix4fv(mWorld, false, worldMatrix);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 36);
}
