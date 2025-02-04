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
    webGLRenderer.setClearColor(new THREE.Color(0xdddddd, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = -50
    camera.position.y = 40
    camera.position.z = 60
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-50, 70, 60)
    spotLight.intensity = 1
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
        this.animations = 'crattack'
        this.fps = 10
    })()

    var gui = new dat.GUI()
    var mesh
    var clock = new THREE.Clock()

    var loader = new THREE.JSONLoader()
    loader.load('../assets/models/ogre/ogro.js', function (geometry, mat) {
        geometry.computeMorphNormals()

        var mat = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(
                '../assets/models/ogre/skins/skin.jpg'
            ),
            morphTargets: true,
            morphNormals: true
        })

        mesh = new THREE.MorphAnimMesh(geometry, mat)

        mesh.rotation.y = 0.7
        mesh.parseAnimations()

        // parse the animations and add them to the control
        var animLabels = []
        for (var key in mesh.geometry.animations) {
            if (
                key === 'length' ||
                !mesh.geometry.animations.hasOwnProperty(key)
            )
                continue
            animLabels.push(key)
        }

        gui.add(controls, 'animations', animLabels).onChange(function (e) {
            mesh.playAnimation(controls.animations, controls.fps)
        })
        gui.add(controls, 'fps', 1, 20)
            .step(1)
            .onChange(function (e) {
                mesh.playAnimation(controls.animations, controls.fps)
            })
        mesh.playAnimation('crattack', 10)

        scene.add(mesh)
    })

    render()

    function render() {
        stats.update()
        var delta = clock.getDelta()

        if (mesh) {
            //            mesh.rotation.x+=0.006;
            //                mesh.rotation.y+=0.006;
            if (mesh) {
                mesh.updateAnimation(delta * 1000)
                //    mesh.rotation.y+=0.01;
            }
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
