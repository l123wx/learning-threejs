/** @type {import('../types/three')} */

// once everything is loaded, we run our Three.js stuff.
function init() {
    var stats = initStats()

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene()

    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    // create a render and set the size
    //        var canvasRenderer = new THREE.CanvasRenderer();
    var canvasRenderer = new THREE.WebGLRenderer()
    canvasRenderer.setClearColor(new THREE.Color(0x000000, 1.0))
    canvasRenderer.setSize(window.innerWidth, window.innerHeight)

    // position and point the camera to the center of the scene
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 150

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(canvasRenderer.domElement)

    createSprites()
    render()

    function createSprites() {
        var material = new THREE.SpriteMaterial()

        for (var x = -5; x < 5; x++) {
            for (var y = -5; y < 5; y++) {
                var sprite = new THREE.Sprite(material)
                sprite.position.set(x * 10, y * 10, 0)
                scene.add(sprite)
            }
        }
    }

    function render() {
        stats.update()

        requestAnimationFrame(render)
        canvasRenderer.render(scene, camera)
    }

    function initStats() {
        var stats = new Stats()
        stats.setMode(0) // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.left = '0px'
        stats.domElement.style.top = '0px'

        document.getElementById('Stats-output').appendChild(stats.domElement)

        return stats
    }
}
window.onload = init
