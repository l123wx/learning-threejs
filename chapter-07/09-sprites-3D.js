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
    var webGLRenderer = new THREE.WebGLRenderer()
    webGLRenderer.setClearColor(new THREE.Color(0x000000, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)

    // position and point the camera to the center of the scene
    camera.position.x = 20
    camera.position.y = 0
    camera.position.z = 150

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    createSprites()
    render()

    var group

    function createSprites() {
        group = new THREE.Object3D()
        var range = 200
        for (var i = 0; i < 400; i++) {
            group.add(createSprite(10, false, 0.6, 0xffffff, i % 5, range))
        }
        scene.add(group)
    }

    function getTexture() {
        var texture = new THREE.ImageUtils.loadTexture(
            '../assets/textures/particles/sprite-sheet.png'
        )
        return texture
    }

    function createSprite(
        size,
        transparent,
        opacity,
        color,
        spriteNumber,
        range
    ) {
        var spriteMaterial = new THREE.SpriteMaterial({
            opacity: opacity,
            color: color,
            transparent: transparent,
            map: getTexture()
        })

        // we have 1 row, with five sprites
        spriteMaterial.map.offset = new THREE.Vector2(0.2 * spriteNumber, 0)
        spriteMaterial.map.repeat = new THREE.Vector2(1 / 5, 1)
        spriteMaterial.depthTest = false

        spriteMaterial.blending = THREE.AdditiveBlending

        var sprite = new THREE.Sprite(spriteMaterial)
        sprite.scale.set(size, size, size)
        sprite.position.set(
            Math.random() * range - range / 2,
            Math.random() * range - range / 2,
            Math.random() * range - range / 2
        )
        sprite.velocityX = 5

        return sprite
    }

    var step = 0

    function render() {
        stats.update()
        step += 0.01
        group.rotation.x = step

        requestAnimationFrame(render)
        webGLRenderer.render(scene, camera)
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
