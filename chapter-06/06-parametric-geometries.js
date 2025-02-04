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
    camera.position.x = -30
    camera.position.y = 50
    camera.position.z = 50
    camera.lookAt(new THREE.Vector3(10, -20, 0))

    var spotLight = new THREE.DirectionalLight()
    spotLight.position = new THREE.Vector3(-20, 250, -50)
    spotLight.target.position.x = 30
    spotLight.target.position.y = -40
    spotLight.target.position.z = -20
    spotLight.intensity = 0.3

    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {})()

    var gui = new dat.GUI()

    klein = function (u, v) {
        u *= Math.PI
        v *= 2 * Math.PI

        u = u * 2
        var x, y, z
        if (u < Math.PI) {
            x =
                3 * Math.cos(u) * (1 + Math.sin(u)) +
                2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v)
            z =
                -8 * Math.sin(u) -
                2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v)
        } else {
            x =
                3 * Math.cos(u) * (1 + Math.sin(u)) +
                2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI)
            z = -8 * Math.sin(u)
        }

        y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v)

        return new THREE.Vector3(x, y, z)
    }

    radialWave = function (u, v) {
        var r = 50

        var x = Math.sin(u) * r
        var z = Math.sin(v / 2) * 2 * r
        var y = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 2.8

        return new THREE.Vector3(x, y, z)
    }

    var mesh = createMesh(
        new THREE.ParametricGeometry(radialWave, 120, 120, false)
    )
    scene.add(mesh)

    render()

    function createMesh(geom) {
        geom.applyMatrix(new THREE.Matrix4().makeTranslation(-25, 0, -25))
        // assign two materials
        //            var meshMaterial = new THREE.MeshLambertMaterial({color: 0xff5555});
        //var meshMaterial = new THREE.MeshNormalMaterial();
        var meshMaterial = new THREE.MeshPhongMaterial({
            specular: 0xaaaafff,
            color: 0x3399ff,
            shininess: 40,
            metal: true
        })
        meshMaterial.side = THREE.DoubleSide
        // create a multimaterial
        var plane = THREE.SceneUtils.createMultiMaterialObject(geom, [
            meshMaterial
        ])

        return plane
    }

    function render() {
        stats.update()
        mesh.rotation.y = step += 0.01
        mesh.rotation.x = step
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
