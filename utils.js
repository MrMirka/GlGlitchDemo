import * as THREE from 'three';
export function createTextTexture(text, width, fontSize) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = 200; // Вы можете настроить этот размер
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

    // Создаем текстуру, указывая, что фон должен быть прозрачным
    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true; // Обеспечиваем обновление текстуры

    return texture;
}