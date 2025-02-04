/** @type {import('../types/three')} */

// once everything is loaded, we run our Three.js stuff.
function init() {
    var clock = new THREE.Clock()
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
    var orbitControl = new THREE.OrbitControls(camera)

    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer()
    webGLRenderer.setClearColorHex(0xaaaaff, 1.0)
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = 40
    camera.position.y = 40
    camera.position.z = 40
    //  camera.lookAt(new THREE.Vector3(0,30,0));

    var ambiLight = new THREE.AmbientLight(0xeeeeee)
    scene.add(ambiLight)

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(0, 20, 150)
    spotLight.intensity = 1
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0
    var mesh

    var loader = new THREE.OBJMTLLoader()
    loader.addEventListener('load', function (event) {
        var object = event.content
        object.rotation.x = -0.5 * Math.PI

        object.position.y = -40
        object.children[0].material.normalMap = THREE.ImageUtils.loadTexture(
            '../assets/models/jessica/jessica/Jessica Body Normals.png'
        )
        object.children[0].material.ambient = new THREE.Color(0xffffff)
        object.children[0].material.shading = THREE.SmoothShading

        object.children[0].geometry.computeVertexNormals(true)
        object.children[0].geometry.computeFaceNormals(true)
        object.children[0].geometry.computeVertexNormals(true)
        object.children[0].geometry.computeTangents()
        console.log(object.children[0].geometry)

        var mat = new THREE.MeshPhongMaterial()
        mat.normalMap = THREE.ImageUtils.loadTexture(
            '../assets/models/jessica/jessica/Jessica Body Normals.png'
        )
        object.children[0].material = mat

        mesh = object

        scene.add(object)
    })

    loader.load(
        '../assets/models/jessica/jessica.obj',
        '../assets/models/jessica/jessica.mtl'
    )

    render()

    function render() {
        stats.update()
        var delta = clock.getDelta()
        orbitControl.update(delta)

        if (mesh) {
            mesh.rotation.z += 0.01
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
