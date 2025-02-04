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
    webGLRenderer.setClearColor(new THREE.Color(0xeeeeee, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 4
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(0, 50, 30)
    spotLight.intensity = 2
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    var mesh
    var helper
    var clock = new THREE.Clock()

    var controls = new (function () {
        this.showHelper = false
    })()
    var gui = new dat.GUI()
    gui.add(controls, 'showHelper', 0, 0.5).onChange(function (state) {
        helper.visible = state
    })

    var loader = new THREE.JSONLoader()
    loader.load(
        '../assets/models/hand-2.js',
        function (model, mat) {
            var mat = new THREE.MeshLambertMaterial({
                color: 0xf0c8c9,
                skinning: true
            })
            mesh = new THREE.SkinnedMesh(model, mat)

            var animation = new THREE.Animation(mesh, model.animation)

            mesh.rotation.x = 0.5 * Math.PI
            mesh.rotation.z = 0.7 * Math.PI
            scene.add(mesh)

            helper = new THREE.SkeletonHelper(mesh)
            helper.material.linewidth = 2
            helper.visible = false
            scene.add(helper)

            // start the animation
            animation.play()
        },
        '../assets/models'
    )

    render()

    function render() {
        stats.update()

        var delta = clock.getDelta()
        if (mesh) {
            helper.update()
            THREE.AnimationHandler.update(delta)
        }

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
