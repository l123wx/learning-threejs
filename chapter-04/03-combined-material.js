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
        10,
        130
    )

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer()

    renderer.sortObjects = false

    renderer.setClearColor(new THREE.Color(0x00000, 1.0))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = -50
    camera.position.y = 40
    camera.position.z = 50
    camera.near = 7
    camera.far = 139
    camera.lookAt(scene.position)

    // add the output of the renderer to the html element
    document.getElementById('WebGL-output').appendChild(renderer.domElement)

    // call the render function
    var step = 0

    var controls = new (function () {
        this.cameraNear = camera.near
        this.cameraFar = camera.far
        this.rotationSpeed = 0.02
        this.numberOfObjects = scene.children.length
        this.color = 0x00ff00

        this.removeCube = function () {
            var allChildren = scene.children
            var lastObject = allChildren[allChildren.length - 1]
            if (lastObject instanceof THREE.Mesh) {
                scene.remove(lastObject)
                this.numberOfObjects = scene.children.length
            }
        }

        this.addCube = function () {
            var cubeSize = Math.ceil(3 + Math.random() * 3)
            var cubeGeometry = new THREE.BoxGeometry(
                cubeSize,
                cubeSize,
                cubeSize
            )

            //var cubeMaterial = new THREE.MeshLambertMaterial({color:  Math.random() * 0xffffff });
            var cubeMaterial = new THREE.MeshDepthMaterial()
            var colorMaterial = new THREE.MeshBasicMaterial({
                color: controls.color,
                transparent: true,
                blending: THREE.MultiplyBlending
            })
            var cube = new THREE.SceneUtils.createMultiMaterialObject(
                cubeGeometry,
                [colorMaterial, cubeMaterial]
            )
            cube.children[1].scale.set(0.99, 0.99, 0.99)
            cube.castShadow = true

            // position the cube randomly in the scene
            cube.position.x = -60 + Math.round(Math.random() * 100)
            cube.position.y = Math.round(Math.random() * 10)
            cube.position.z = -100 + Math.round(Math.random() * 150)

            // add the cube to the scene
            scene.add(cube)
            this.numberOfObjects = scene.children.length
        }

        this.outputObjects = function () {
            console.log(scene.children)
        }
    })()

    var gui = new dat.GUI()
    gui.addColor(controls, 'color')
    gui.add(controls, 'rotationSpeed', 0, 0.5)
    gui.add(controls, 'addCube')
    gui.add(controls, 'removeCube')
    gui.add(controls, 'cameraNear', 0, 50).onChange(function (e) {
        camera.near = e
    })
    gui.add(controls, 'cameraFar', 50, 200).onChange(function (e) {
        camera.far = e
    })

    var i = 0
    while (i < 10) {
        controls.addCube()
        i++
    }

    render()

    function render() {
        stats.update()

        // rotate the cubes around its axes
        scene.traverse(function (e) {
            if (e instanceof THREE.Mesh) {
                e.rotation.x += controls.rotationSpeed
                e.rotation.y += controls.rotationSpeed
                e.rotation.z += controls.rotationSpeed
            }
        })

        // render using requestAnimationFrame
        requestAnimationFrame(render)
        renderer.render(scene, camera)
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
