var gl;

const pentagonVS =
    [
        'attribute vec3 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        'void main() {',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition, 1.0);',
        '}'
    ].join('\n');

const pentagonFS =
    [
        'precision mediump float;',
        'varying vec3 fragColor;',
        'void main() {',
        '  gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n');

const vsSource =
    [
        'attribute vec3 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'uniform mat4 mWorld;',
        'void main() {',
        '  fragColor = vertColor;',
        '  fragPosition = vertPosition;',
        '  gl_Position = mWorld * vec4(vertPosition, 1.0);',
        '}'
    ].join('\n');

const fsSource =
    [
    'precision mediump float;',
    'varying vec3 fragColor;',
    'void main() {' ,
    '  gl_FragColor = vec4(fragColor, 1.0);',
    '}'
    ].join('\n');

const squareFS =
    [
        'precision mediump float;',
        'varying vec3 fragPosition;',
        'void main() {',
        '  int x = int(fragPosition.x * 20.0 + 10.0);',
        '  float isColor = mod(float(x), 2.0);',
        '  if (isColor == 0.0) {',
        '    gl_FragColor = vec4(0.2, 0.8, 0.8, 1.0);',
        '  } else {',
        '    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
        '  }',
        '}'
    ].join('\n');

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

function start() {
    main('pentagon');
    main('cube');
    main('square');
}

function main(type) {
    var canvas = document.getElementById(type);
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
    
    if (type == 'pentagon') {
        const shaderProgram = initShaderProgram(gl, pentagonVS, pentagonFS);
        gl.useProgram(shaderProgram);
        drawPentagon(shaderProgram);
    } else if (type == 'cube') {
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        gl.useProgram(shaderProgram);
        drawCube(shaderProgram);
    } else if (type == 'square') {
        const shaderProgram = initShaderProgram(gl, vsSource, squareFS);
        gl.useProgram(shaderProgram);
        drawSquare(shaderProgram);
    }
    
}

function drawPentagon(shaderProgram) {
    let vertices = [0.0, 0.0, 0.0,      0.0, 0.8, 0.0,];
    const radius = 0.8; const n = 5;
    const r = 0.0; const g = 0.8; const b = 0.0;
    for(let i=0; i<n+1; i++) {
        let x = radius * Math.cos(360/5 + 2 * Math.PI * i/n);
        let y = radius * Math.sin(360/5 + 2 * Math.PI * i/n);
        let z = 0.0; 
        vertices.push(x); vertices.push(y); vertices.push(z);
        vertices.push(r); vertices.push(g); vertices.push(b);
    }
    //console.log(vertices);
    
    var pentagonVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pentagonVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(
        vertexPositionAttribute, // Attribute location
        3, // число значений для каждой вершины, которые хранятся в буфере
        gl.FLOAT, // тип значений, который хранятся в буфере
        false, // True, если будут нормализованы
        6 * Float32Array.BYTES_PER_ELEMENT, // шаг между значениями
        0 // смешение - позиция в буфере, с которой начинается обработка
    );

    var colorPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertColor');
    gl.enableVertexAttribArray(colorPositionAttribute);
    gl.vertexAttribPointer(
        colorPositionAttribute,
        3,
        gl.FLOAT,
        false,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);
}

function drawCube(shaderProgram) {
    let vertices =
    [
        -0.5, -0.5, -0.5,   0.8, 0.8, 0.0,
        -0.5, 0.5, -0.5,    0.8, 0.8, 0.0,
        0.5, 0.5, -0.5,     0.8, 0.8, 0.0,
        -0.5, -0.5, -0.5,   0.8, 0.8, 0.0,
        0.5, 0.5, -0.5,     0.8, 0.8, 0.0,
        0.5, -0.5, -0.5,    0.8, 0.8, 0.0,

        -0.5, 0.5, -0.5,    0.8, 0.8, 0.0,
        -0.5, 0.5, 0.5,     0.8, 0.8, 0.0,
        0.5, 0.5, 0.5,      0.8, 0.8, 0.0,
        -0.5, 0.5, -0.5,    0.8, 0.8, 0.0,
        0.5, 0.5, -0.5,     0.8, 0.8, 0.0,
        0.5, 0.5, 0.5,      0.8, 0.8, 0.0,

        -0.5, -0.5, -0.5,   0.8, 0.8, 0.0,
        0.5, -0.5, 0.5,     0.8, 0.8, 0.0,
        0.5, -0.5, -0.5,    0.8, 0.8, 0.0,
        -0.5, -0.5, -0.5,   0.8, 0.8, 0.0,
        0.5, -0.5, 0.5,     0.8, 0.8, 0.0,
        -0.5, -0.5, 0.5,    0.8, 0.8, 0.0,

        -0.5, -0.5, -0.5,   0.8, 0.8, 0.0,
        -0.5, 0.5, -0.5,    0.8, 0.8, 0.0,
        -0.5, -0.5, 0.5,    0.8, 0.8, 0.0,
        -0.5, 0.5, 0.5,     0.8, 0.8, 0.0,
        -0.5, 0.5, -0.5,    0.8, 0.8, 0.0,
        -0.5, -0.5, 0.5,    0.8, 0.8, 0.0,

        0.5, 0.5, -0.5,     0.8, 0.8, 0.0,
        0.5, -0.5, 0.5,     0.8, 0.8, 0.0,
        0.5, -0.5, -0.5,    0.8, 0.8, 0.0,
        0.5, 0.5, -0.5,     0.8, 0.8, 0.0,
        0.5, -0.5, 0.5,     0.8, 0.8, 0.0,
        0.5, 0.5, 0.5,      0.8, 0.8, 0.0,

        -0.5, 0.5, 0.5,     0.8, 0.8, 0.0,
        0.5, 0.5, 0.5,      0.8, 0.8, 0.0,
        -0.5, -0.5, 0.5,    0.8, 0.8, 0.0,
        0.5, -0.5, 0.5,     0.8, 0.8, 0.0,
        0.5, 0.5, 0.5,      0.8, 0.8, 0.0,
        -0.5, -0.5, 0.5,    0.8, 0.8, 0.0,
    ];

    let cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);
    
    colorPositionAttribute = gl.getAttribLocation(shaderProgram, "vertColor");
    gl.enableVertexAttribArray(colorPositionAttribute);
    gl.vertexAttribPointer(colorPositionAttribute, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);

    matWorldUniformLocation = gl.getUniformLocation(shaderProgram, 'mWorld');
    worldMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, 0.4, [1, 0, 0]);
    glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, 0.6, [0, 1, 0]);
    glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawSquare(shaderProgram) {
    let vertices =
    [
        -0.5, -0.5, 0.0,    0.0, 0.0, 0.0,
        -0.5, 0.5, 0.0,     0.0, 0.0, 0.0,
        0.5, -0.5, 0.0,     0.0, 0.0, 0.0,
        0.5, 0.5, 0.0,      0.0, 0.0, 0.0,
    ];

    let squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0);

    colorPositionAttribute = gl.getAttribLocation(shaderProgram, "vertColor");
    gl.enableVertexAttribArray(colorPositionAttribute);
    gl.vertexAttribPointer(colorPositionAttribute, 3, gl.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT);

    matWorldUniformLocation = gl.getUniformLocation(shaderProgram, 'mWorld');
    worldMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
