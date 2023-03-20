var gl; // глобальная переменная для контекста WebGL

const squareVS =
    [
        'attribute vec3 vertPosition;',
        'void main() {',
        '  gl_Position = vec4(vertPosition, 1.0);',
        '}'
    ].join('\n');

const squareFS =
    [
        'precision mediump float;',
        'varying vec3 fragColor;',
        'void main() {',
        '  gl_FragColor = vec4(0.0, 0.8, 0.0, 1.0);',
        '}'
    ].join('\n');

const triangleVS =
    [
        'attribute vec3 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        'void main() {',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition, 1.0);',
        '}'
    ].join('\n');

const triangleFS =
    [
        'precision mediump float;',
        'varying vec3 fragColor;',
        'void main() {',
        '  gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n');

function initWebGL(canvas) { // инициализация контекста GL
    gl = null;
    try { // Попытаться получить стандартный контекст
        // Если не получится, попробовать получить экспериментальный
        gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimentalwebgl");
    } catch(e) {}
    // Если мы не получили контекст GL, завершить работу
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // Создание шейдерной программы
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    // Если не получилось создать - alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    // Передача source в объект шейдера
    gl.shaderSource(shader, source);
    // Компилирование шейдерной программы
    gl.compileShader(shader);
    // alert если не получилось
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function start() { // вызывается при запуске
    main('rectangle')
    main('triangle')
}

function main(type) {
    var canvas = document.getElementById(type);
    if (!canvas) {
        console.log('failed to find canvas');
        return;
    }

    gl = initWebGL(canvas);

    if (gl) { // продолжать только если WebGL доступен и работает
        // Устанавливаем размер вьюпорта
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // включает использование буфера глубины
        gl.enable(gl.DEPTH_TEST);
        // определяет работу буфера глубины: более ближние объекты перекрывают дальние
        gl.depthFunc(gl.LEQUAL);
        // очистить буфер цвета и буфер глубины
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    }
    
    if (type == 'rectangle') {
        const shaderProgram = initShaderProgram(gl, squareVS, squareFS);
        gl.useProgram(shaderProgram);
        drawSquare(shaderProgram);
    } else if (type == 'triangle') {
        const shaderProgram = initShaderProgram(gl, triangleVS, triangleFS);
        gl.useProgram(shaderProgram);
        drawTriangle(shaderProgram);
    }
}

function drawSquare(shaderProgram) {
    const vertices = [
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, -0.5, 0.0,
    ];
    
    var squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(
        vertexPositionAttribute, // Attribute location
        3, // число значений для каждой вершины, которые хранятся в буфере
        gl.FLOAT, // тип значений, который хранятся в буфере
        false, // True, если будут нормализованы
        0, // шаг между значениями
        0 // смешение - позиция в буфере, с которой начинается обработка
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function drawTriangle(shaderProgram) {
    const vertices = [
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ];
    const colors = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
    ];
    
    var triangleVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(
        vertexPositionAttribute, // Attribute location
        3, // число значений для каждой вершины, которые хранятся в буфере
        gl.FLOAT, // тип значений, который хранятся в буфере
        false, // True, если будут нормализованы
        0, // шаг между значениями
        0 // смешение - позиция в буфере, с которой начинается обработка
    );

    var triangleColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var colorPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertColor');
    gl.enableVertexAttribArray(colorPositionAttribute);
    gl.vertexAttribPointer(
        colorPositionAttribute,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
