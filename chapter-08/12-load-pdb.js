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
    camera.position.x = 6
    camera.position.y = 6
    camera.position.z = 6
    camera.lookAt(new THREE.Vector3(0, 0, 0))

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

    var gui = new dat.GUI()
    var mesh

    var loader = new THREE.PDBLoader()
    var group = new THREE.Object3D()
    loader.load(
        '../assets/models/aspirin.pdb',
        function (geometry, geometryBonds) {
            //        loader.load("../assets/models/diamond.pdb", function (geometry, geometryBonds) {
            var i = 0

            geometry.vertices.forEach(function (position) {
                var sphere = new THREE.SphereGeometry(0.2)
                var material = new THREE.MeshPhongMaterial({
                    color: geometry.colors[i++]
                })
                var mesh = new THREE.Mesh(sphere, material)
                mesh.position.copy(position)
                group.add(mesh)
            })

            for (var j = 0; j < geometryBonds.vertices.length; j += 2) {
                var path = new THREE.SplineCurve3([
                    geometryBonds.vertices[j],
                    geometryBonds.vertices[j + 1]
                ])
                var tube = new THREE.TubeGeometry(path, 1, 0.04)
                var material = new THREE.MeshPhongMaterial({ color: 0xcccccc })
                var mesh = new THREE.Mesh(tube, material)
                group.add(mesh)
            }

            scene.add(group)
        }
    )

    render()

    function render() {
        stats.update()

        if (group) {
            group.rotation.y += 0.006
            group.rotation.x += 0.006
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
