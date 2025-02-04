/** @type {import('../types/three')} */

var canvas = document.createElement('canvas')
canvas.setAttribute('width', 256)
canvas.setAttribute('height', 256)
canvas.setAttribute('style', 'position: absolute; x:0; y:0; bottom: 0px')

document.getElementById('canvas-output').appendChild(canvas)
var ctx = canvas.getContext('2d')
var date = new Date()
var pn = new Perlin('rnd' + date.getTime())

fillWithPerlin(pn, ctx)

function fillWithPerlin(perlin, ctx) {
    for (var x = 0; x < 512; x++) {
        for (var y = 0; y < 512; y++) {
            var base = new THREE.Color(0xffffff)
            var value = perlin.noise(x / 10, y / 10, 0)
            base.multiplyScalar(value)
            ctx.fillStyle = '#' + base.getHexString()
            ctx.fillRect(x, y, 1, 1)
        }
    }
}

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
    webGLRenderer.setClearColor(new THREE.Color(0xeeeeee, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    var cube = createMesh(new THREE.BoxGeometry(12, 12, 12), 'floor-wood.jpg')
    cube.position.x = 3
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
        this.bumpScale = cube.material.bumpScale
        this.regenerateMap = function () {
            var date = new Date()
            pn = new Perlin('rnd' + date.getTime())
            fillWithPerlin(pn, ctx)
            cube.material.bumpMap.needsUpdate = true
        }

        this.updateScale = function () {
            cube.material.bumpScale = controls.bumpScale
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'regenerateMap')
    gui.add(controls, 'bumpScale', -2, 2).onChange(controls.updateScale)

    render()

    function createMesh(geom, texture) {
        var texture = THREE.ImageUtils.loadTexture(
            '../assets/textures/general/' + texture
        )
        var bumpMap = new THREE.Texture(canvas)

        geom.computeVertexNormals()
        var mat = new THREE.MeshPhongMaterial()
        mat.color = new THREE.Color(0x77ff77)
        mat.bumpMap = bumpMap
        bumpMap.needsUpdate = true

        // create a multimaterial
        var mesh = new THREE.Mesh(geom, mat)
        return mesh
    }

    function render() {
        stats.update()

        cube.rotation.y += 0.01
        cube.rotation.x += 0.01

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
