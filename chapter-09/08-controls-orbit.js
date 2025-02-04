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

    var sphere = createMesh(new THREE.SphereGeometry(20, 40, 40))
    // add the sphere to the scene
    scene.add(sphere)

    // position and point the camera to the center of the scene
    camera.position.x = -20
    camera.position.y = 30
    camera.position.z = 40
    camera.lookAt(new THREE.Vector3(00, 0, 0))

    var orbitControls = new THREE.OrbitControls(camera)
    orbitControls.autoRotate = true
    var clock = new THREE.Clock()

    var ambiLight = new THREE.AmbientLight(0x111111)
    scene.add(ambiLight)
    var spotLight = new THREE.DirectionalLight(0xffffff)
    spotLight.position.set(-20, 30, 40)
    spotLight.intensity = 1.5
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    render()

    function createMesh(geom) {
        var planetTexture = THREE.ImageUtils.loadTexture(
            '../assets/textures/planets/mars_1k_color.jpg'
        )
        var normalTexture = THREE.ImageUtils.loadTexture(
            '../assets/textures/planets/mars_1k_normal.jpg'
        )

        var planetMaterial = new THREE.MeshPhongMaterial({
            map: planetTexture,
            bumpMap: normalTexture
        })

        var wireFrameMat = new THREE.MeshBasicMaterial()
        wireFrameMat.wireframe = true

        // create a multimaterial
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [
            planetMaterial
        ])

        return mesh
    }

    function render() {
        stats.update()

        //sphere.rotation.y=step+=0.01;
        var delta = clock.getDelta()
        orbitControls.update(delta)

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
