import * as THREE from 'three';
export function createTextTexture(text, width, fontSize) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = 200;
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = "rgba(255, 134, 23, 1)";

    // Очищаем canvas с прозрачным фоном
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Функция переноса строк
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    wrapText(context, text, 0, fontSize, canvas.width, fontSize * 1.2);


    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

export function createTextTextureFromHtml(obj) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    const htmlObj = document.getElementById(obj)

    const width = htmlObj.offsetWidth;
    const height = htmlObj.offsetHeight;

    // Получаем текст
    const text = htmlObj.innerText;
    const computedStyle = getComputedStyle(htmlObj);
    const fontFamily = computedStyle.fontFamily;
    const color = computedStyle.color;
    const fontSize = parseInt(computedStyle.fontSize) * window.devicePixelRatio;


    canvas.width = width * window.devicePixelRatio;
    canvas.height = (height + 24) * window.devicePixelRatio;
    
    context.font = `${fontSize}px ${fontFamily}`;
    //context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillStyle = color;
    context.imageSmoothingEnabled = true;
    

    // Очищаем canvas с прозрачным фоном
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Функция переноса строк
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    wrapText(context, text, 0, fontSize, canvas.width, fontSize * 1.2);


    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Получаем размер видимой области камеры в относительных еденицах
 * @param {*} camera 
 * @returns 
 */
export function getScreenDimention(camera) {
    let dimention = { width: 0, height: 0 }
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const width = height * (window.innerWidth / window.innerHeight);
    dimention.width = width
    dimention.height = height
    return dimention
}

export function getObjectDimention(object) {
    object.computeBoundingBox();
    const widht = object.boundingBox.max.x - object.boundingBox.min.x;
    const height = object.boundingBox.max.y - object.boundingBox.min.y;
    return { widht, height }
}

export function addTextBlock(x,y,obj, camera){
    const { width, height } = getScreenDimention(camera);
    const shiftSize = width / window.innerWidth;
    const textTexture = createTextTextureFromHtml(obj)
    const textureWidth = textTexture.image.width;
    const textureHeight = textTexture.image.height;
    const material = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        alphaTest: 0.5 
    });
    const geo = new THREE.PlaneGeometry(textureWidth * shiftSize * 0.5, textureHeight * shiftSize * 0.5)
    const mesh = new THREE.Mesh(geo, material)
    const text = getObjectDimention(geo)
    mesh.position.x = (-width / 2 + text.widht / 2) + x
    mesh.position.y = (height / 2 - text.height / 2) - y
    mesh.position.z = 0
    return mesh
}