/** @type {import('../types/three')} */

var elem = document.getElementById('canvas')
var context = elem.getContext('2d')

var scale = chroma.scale(['green', 'brown'])
console.log(scale(0.5).hex())

//  context.fillStyle   = '#000';
//    context.lineWidth   = 2;

var deg_to_rad = Math.PI / 180.0
var depth = 10

function drawLine(x1, y1, x2, y2, brightness) {
    context.lineWidth = brightness
    //        context.fillStyle=scale(brightness/10).hex();
    context.strokeStyle = scale(brightness / 12).hex()

    console.log(context.fillStyle)

    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
}
function drawTree(x1, y1, angle, depth) {
    if (depth != 0) {
        var x2 = x1 + Math.cos(angle * deg_to_rad) * depth * 10.0
        var y2 = y1 + Math.sin(angle * deg_to_rad) * depth * 10.0

        context.beginPath()

        drawLine(x1, y1, x2, y2, depth)
        context.closePath()
        context.stroke()
        drawTree(x2, y2, angle / 1.4 - 40, depth - 1)
        drawTree(x2, y2, angle + 20, depth - 1)
    }
}

drawTree(300, 800, -90, depth)
//    context.closePath();
//    context.stroke();
