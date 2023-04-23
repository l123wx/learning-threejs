/** @type {import('../types/three')} */

var canvas = document.createElement('canvas')
document.getElementById('canvas-output').appendChild(canvas)
$('#canvas-output').literallycanvas({ imageURLPrefix: '../libs/literally/img' })

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
    webGLRenderer.setClearColor(new THREE.Color(0xbbbbbb, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    var cube = createMesh(new THREE.BoxGeometry(10, 10, 10), 'floor-wood.jpg')
    cube.position.x = 0
    scene.add(cube)

    // position and point the camera to the center of the scene
    camera.position.x = 00
    camera.position.y = 12
    camera.position.z = 28
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    var ambiLight = new THREE.AmbientLight(0x141414)
    scene.add(ambiLight)

    var light = new THREE.DirectionalLight()
    light.position.set(0, 30, 20)
    scene.add(light)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    //        var polyhedron = createMesh(new THREE.PolyhedronGeometry(vertices, faces, controls.radius, controls.detail));

    // setup the control gui
    var controls = new (function () {
        this.showTexture = true

        this.showCanvas = function () {
            if (controls.showTexture) {
                $('.fs-container').show()
            } else {
                $('.fs-container').hide()
            }
        }

        this.regenerateMap = function () {
            var date = new Date()
            pn = new Perlin('rnd' + date.getTime())
            fillWithPerlin(pn, ctx)
            cube.material.map.needsUpdate = true
            $('#cv').sketch()
        }

        this.applyTexture = function () {
            cube.material.map.needsUpdate = true
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'showTexture').onChange(controls.showCanvas)

    render()

    function createMesh(geom) {
        var canvasMap = new THREE.Texture(canvas)
        var mat = new THREE.MeshPhongMaterial()
        mat.map = canvasMap
        var mesh = new THREE.Mesh(geom, mat)

        return mesh
    }

    function render() {
        stats.update()

        cube.rotation.y += 0.01
        cube.rotation.x += 0.01

        cube.material.map.needsUpdate = true
        // render using requestAnimationFrame
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
