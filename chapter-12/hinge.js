'use strict'

/** @type {import('../types/three')} */

Physijs.scripts.worker = '../libs/physijs_worker.js'
Physijs.scripts.ammo = '../libs/ammo.js'

var initScene,
    render,
    projector,
    renderer,
    render_stats,
    physics_stats,
    scene,
    light,
    camera

initScene = function () {
    projector = new THREE.Projector()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = true
    renderer.shadowMapSoft = true
    document.getElementById('viewport').appendChild(renderer.domElement)

    render_stats = new Stats()
    render_stats.domElement.style.position = 'absolute'
    render_stats.domElement.style.top = '1px'
    render_stats.domElement.style.zIndex = 100
    document.getElementById('viewport').appendChild(render_stats.domElement)

    physics_stats = new Stats()
    physics_stats.domElement.style.position = 'absolute'
    physics_stats.domElement.style.top = '50px'
    physics_stats.domElement.style.zIndex = 100
    document.getElementById('viewport').appendChild(physics_stats.domElement)

    scene = new Physijs.Scene()
    scene.setGravity(new THREE.Vector3(0, -10, 0))
    scene.addEventListener('update', function () {
        physics_stats.update()
        setTimeout(function () {
            scene.simulate(undefined, 1)
        }, 50)
    })

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(60, 50, 60)
    camera.lookAt(scene.position)
    scene.add(camera)

    // Light
    light = new THREE.DirectionalLight(0xffffff)
    light.position.set(20, 40, -15)
    light.target.position.copy(scene.position)
    light.castShadow = true
    light.shadowCameraLeft = -60
    light.shadowCameraTop = -60
    light.shadowCameraRight = 60
    light.shadowCameraBottom = 60
    light.shadowCameraNear = 20
    light.shadowCameraFar = 200
    light.shadowBias = -0.0001
    light.shadowMapWidth = light.shadowMapHeight = 2048
    light.shadowDarkness = 0.7
    scene.add(light)

    // Materials
    var ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('images/rocks.jpg')
        }),
        0.8, // high friction
        0.4 // low restitution
    )
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping
    ground_material.map.repeat.set(2.5, 2.5)

    // Ground
    var ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(50, 1, 50),
        //new THREE.PlaneGeometry(50, 50),
        ground_material,
        0 // mass
    )
    ground.receiveShadow = true
    scene.add(ground)

    var size = 3
    var mass = 1
    var NUM = 6
    var geometry = new THREE.BoxGeometry(size, size, size)
    for (var i = 0; i < NUM; i++) {
        var material1 = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color: 0x992222 + i * 0x3333 }),
            0.1,
            0.1
        )
        var material2 = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                color: 0x992222 + i * 0x3333,
                transparent: true,
                opacity: 0.7
            }),
            0.1,
            0.1
        )
        var material3 = new THREE.MeshLambertMaterial({
            color: 0x992222 + i * 0x3333,
            transparent: true,
            opacity: 0.3
        })

        var base = new Physijs.BoxMesh(geometry, material1, 0)
        base.add(new THREE.AxisHelper(size))

        var satellite = new Physijs.BoxMesh(geometry, material2, mass)
        base.position.set(size * 6 * (i - NUM / 2), size * i + size * 2, 0)
        satellite.add(new THREE.AxisHelper(size))

        satellite.position.copy(base.position)
        satellite.position.x += size * 2
        if (false) base.rotation.set((i * Math.PI) / 4, 0, 0)
        satellite.rotation.set(
            (i * Math.PI) / 7,
            (i * Math.PI) / 7,
            (-i * Math.PI) / 7
        )
        var ghost = new THREE.Mesh(geometry, material3)
        ghost.add(new THREE.AxisHelper(size))
        ghost.position.copy(satellite.position)
        ghost.rotation.copy(satellite.rotation)

        var position = base.position.clone()
        var axis = new THREE.Vector3(0, 1, 0)

        scene.add(base)
        scene.add(satellite)
        scene.add(ghost)

        var constraint = new Physijs.HingeConstraint(
            base,
            satellite,
            position,
            axis
        )
        scene.addConstraint(constraint)
        constraint.setLimits(1, 0)
        constraint.enableAngularMotor(3, 10000)
    }

    requestAnimationFrame(render)
    scene.simulate()
}

render = function () {
    renderer.render(scene, camera)
    render_stats.update()
    setTimeout(function () {
        requestAnimationFrame(render)
    }, 100)
}

window.onload = initScene
