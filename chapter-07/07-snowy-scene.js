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
        200
    )

    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer()
    webGLRenderer.setClearColor(new THREE.Color(0x000000, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)

    // position and point the camera to the center of the scene
    camera.position.x = 20
    camera.position.y = 40
    camera.position.z = 110
    camera.lookAt(new THREE.Vector3(20, 30, 0))

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    var system1
    var system2

    var controls = new (function () {
        this.size = 10
        this.transparent = true
        this.opacity = 0.6
        this.color = 0xffffff

        this.sizeAttenuation = true

        this.redraw = function () {
            var toRemove = []
            scene.children.forEach(function (child) {
                if (child instanceof THREE.PointCloud) {
                    toRemove.push(child)
                }
            })
            toRemove.forEach(function (child) {
                scene.remove(child)
            })
            createPointClouds(
                controls.size,
                controls.transparent,
                controls.opacity,
                controls.sizeAttenuation,
                controls.color
            )
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'size', 0, 20).onChange(controls.redraw)
    gui.add(controls, 'transparent').onChange(controls.redraw)
    gui.add(controls, 'opacity', 0, 1).onChange(controls.redraw)
    gui.addColor(controls, 'color').onChange(controls.redraw)
    gui.add(controls, 'sizeAttenuation').onChange(controls.redraw)

    controls.redraw()

    render()

    function createPointCloud(
        name,
        texture,
        size,
        transparent,
        opacity,
        sizeAttenuation,
        color
    ) {
        var geom = new THREE.Geometry()

        var color = new THREE.Color(color)
        color.setHSL(
            color.getHSL().h,
            color.getHSL().s,
            Math.random() * color.getHSL().l
        )

        var material = new THREE.PointCloudMaterial({
            size: size,
            transparent: transparent,
            opacity: opacity,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: sizeAttenuation,
            color: color
        })

        var range = 40
        for (var i = 0; i < 50; i++) {
            var particle = new THREE.Vector3(
                Math.random() * range - range / 2,
                Math.random() * range * 1.5,
                Math.random() * range - range / 2
            )
            particle.velocityY = 0.1 + Math.random() / 5
            particle.velocityX = (Math.random() - 0.5) / 3
            particle.velocityZ = (Math.random() - 0.5) / 3
            geom.vertices.push(particle)
        }

        var system = new THREE.PointCloud(geom, material)
        system.name = name
        system.sortParticles = true
        return system
    }

    function createPointClouds(
        size,
        transparent,
        opacity,
        sizeAttenuation,
        color
    ) {
        var texture1 = THREE.ImageUtils.loadTexture(
            '../assets/textures/particles/snowflake1.png'
        )
        var texture2 = THREE.ImageUtils.loadTexture(
            '../assets/textures/particles/snowflake2.png'
        )
        var texture3 = THREE.ImageUtils.loadTexture(
            '../assets/textures/particles/snowflake3.png'
        )
        var texture4 = THREE.ImageUtils.loadTexture(
            '../assets/textures/particles/snowflake5.png'
        )

        scene.add(
            createPointCloud(
                'system1',
                texture1,
                size,
                transparent,
                opacity,
                sizeAttenuation,
                color
            )
        )
        scene.add(
            createPointCloud(
                'system2',
                texture2,
                size,
                transparent,
                opacity,
                sizeAttenuation,
                color
            )
        )
        scene.add(
            createPointCloud(
                'system3',
                texture3,
                size,
                transparent,
                opacity,
                sizeAttenuation,
                color
            )
        )
        scene.add(
            createPointCloud(
                'system4',
                texture4,
                size,
                transparent,
                opacity,
                sizeAttenuation,
                color
            )
        )
    }

    function render() {
        stats.update()

        scene.children.forEach(function (child) {
            if (child instanceof THREE.PointCloud) {
                var vertices = child.geometry.vertices
                vertices.forEach(function (v) {
                    v.y = v.y - v.velocityY
                    v.x = v.x - v.velocityX
                    v.z = v.z - v.velocityZ

                    if (v.y <= 0) v.y = 60
                    if (v.x <= -20 || v.x >= 20) v.velocityX = v.velocityX * -1
                    if (v.z <= -20 || v.z >= 20) v.velocityZ = v.velocityZ * -1
                })
            }
        })

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
