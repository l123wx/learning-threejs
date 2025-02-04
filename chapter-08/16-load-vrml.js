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
    webGLRenderer.setClearColor(new THREE.Color(0x000, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = 30
    camera.position.y = 30
    camera.position.z = 30
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    var orbit = new THREE.OrbitControls(camera)

    var dir1 = new THREE.DirectionalLight(0.4)
    dir1.position.set(-30, 30, -30)
    scene.add(dir1)

    var dir2 = new THREE.DirectionalLight(0.4)
    dir2.position.set(-30, 30, 30)
    scene.add(dir2)

    var dir3 = new THREE.DirectionalLight(0.4)
    dir3.position.set(30, 30, -30)
    scene.add(dir3)

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(30, 30, 30)
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {
        // we need the first child, since it's a multimaterial
    })()

    var group
    var gui = new dat.GUI()

    var loader = new THREE.VRMLLoader()
    var group = new THREE.Object3D()
    loader.load('../assets/models/vrml/tree.wrl', function (model) {
        console.log(model)

        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                //                    child.material = new THREE.MeshLambertMaterial({color:0xaaaaaa});
                console.log(child.geometry)
            }
        })

        model.scale.set(10, 10, 10)

        scene.add(model)
    })

    render()

    function render() {
        stats.update()

        orbit.update()

        if (group) {
            group.rotation.y += 0.006
            // group.rotation.x+=0.006;
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
