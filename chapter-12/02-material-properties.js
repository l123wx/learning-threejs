'use strict'

/** @type {import('../types/three')} */

Physijs.scripts.worker = '../libs/physijs_worker.js'
Physijs.scripts.ammo = '../libs/ammo.js'

var scale = chroma.scale(['white', 'blue', 'red', 'yellow'])

var initScene,
    render,
    applyForce,
    setMousePosition,
    mouse_position,
    ground_material,
    box_material,
    projector,
    renderer,
    render_stats,
    physics_stats,
    scene,
    ground,
    light,
    camera,
    box,
    boxes = []

initScene = function () {
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.setClearColor(new THREE.Color(0x000000))
    document.getElementById('viewport').appendChild(renderer.domElement)

    render_stats = new Stats()
    render_stats.domElement.style.position = 'absolute'
    render_stats.domElement.style.top = '1px'
    render_stats.domElement.style.zIndex = 100
    document.getElementById('viewport').appendChild(render_stats.domElement)

    scene = new Physijs.Scene()
    scene.setGravity(new THREE.Vector3(0, -90, 0))

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(80, 60, 80)
    camera.lookAt(scene.position)
    scene.add(camera)

    // Light
    light = new THREE.SpotLight(0xffffff)
    light.position.set(20, 100, 50)

    scene.add(light)

    // Materials
    ground_material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/floor-wood.jpg'
            )
        }),
        0.9, // high friction
        0.6 // low restitution
    )
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping
    ground_material.map.repeat.set(4, 8)

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(60, 1, 130),
        ground_material,
        0 // mass
    )
    ground.receiveShadow = true

    var borderLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, 130),
        ground_material,
        0 // mass
    )

    borderLeft.position.x = -31
    borderLeft.position.y = 2

    ground.add(borderLeft)

    var borderRight = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, 130),
        ground_material,
        0 // mass
    )
    borderRight.position.x = 31
    borderRight.position.y = 2

    ground.add(borderRight)

    var borderBottom = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 6, 2),
        ground_material,
        0 // mass
    )

    borderBottom.position.z = 65
    borderBottom.position.y = 2
    ground.add(borderBottom)

    var borderTop = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 6, 2),
        ground_material,
        0 // mass
    )

    borderTop.position.z = -65
    borderTop.position.y = 2
    ground.add(borderTop)

    //            var pilar_material = Physijs.createMaterial(
    //                    new THREE.MeshPhongMaterial({color:0xff3333}),
    //                    .3, // high friction
    //                    .9 // low restitution
    //            );
    //
    //            var pilar = new Physijs.CylinderMesh(new THREE.CylinderGeometry(2,2,24),pilar_material,0);
    //            ground.add(pilar);
    //
    //
    //            var pilar2 = new Physijs.CylinderMesh(new THREE.CylinderGeometry(2,2,24),pilar_material,0);
    //            pilar2.position.x=15;
    //            ground.add(pilar2);
    //
    //
    //            var pilar3 = new Physijs.CylinderMesh(new THREE.CylinderGeometry(2,2,24),pilar_material,0);
    //            ground.add(pilar3);
    //            pilar3.position.x=-15;

    scene.add(ground)

    var meshes = []

    var controls = new (function () {
        this.cubeRestitution = 0.4
        this.cubeFriction = 0.4
        this.sphereRestitution = 0.9
        this.sphereFriction = 0.1

        this.clearMeshes = function () {
            meshes.forEach(function (e) {
                scene.remove(e)
            })
            meshes = []
        }

        this.addSpheres = function () {
            var colorSphere = scale(Math.random()).hex()
            for (var i = 0; i < 5; i++) {
                box = new Physijs.SphereMesh(
                    new THREE.SphereGeometry(2, 20),
                    Physijs.createMaterial(
                        new THREE.MeshPhongMaterial({
                            color: colorSphere,
                            opacity: 0.8,
                            transparent: true
                            //                                                        map: THREE.ImageUtils.loadTexture( '../assets/textures/general/floor-wood.jpg' )
                        }),
                        controls.sphereFriction,
                        controls.sphereRestitution
                    )
                )
                box.position.set(
                    Math.random() * 50 - 25,
                    20 + Math.random() * 5,
                    Math.random() * 50 - 25
                )
                meshes.push(box)
                scene.add(box)
            }
        }

        this.addCubes = function () {
            var colorBox = scale(Math.random()).hex()

            for (var i = 0; i < 5; i++) {
                box = new Physijs.BoxMesh(
                    new THREE.BoxGeometry(4, 4, 4),
                    //                            new THREE.SphereGeometry( 2, 20 ),
                    Physijs.createMaterial(
                        new THREE.MeshPhongMaterial({
                            color: colorBox,
                            opacity: 0.8,
                            transparent: true
                            //                                                map: THREE.ImageUtils.loadTexture( '../assets/textures/general/stone.jpg' )
                        }),
                        controls.cubeFriction,
                        controls.cubeRestitution
                    )
                )
                box.position.set(
                    Math.random() * 50 - 25,
                    20 + Math.random() * 5,
                    Math.random() * 50 - 25
                )
                box.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                )

                meshes.push(box)
                scene.add(box)
            }
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'cubeRestitution', 0, 1)
    gui.add(controls, 'cubeFriction', 0, 1)
    gui.add(controls, 'sphereRestitution', 0, 1)
    gui.add(controls, 'sphereFriction', 0, 1)
    gui.add(controls, 'addCubes')
    gui.add(controls, 'addSpheres')
    gui.add(controls, 'clearMeshes')

    requestAnimationFrame(render)
    scene.simulate()
}

var stepX
var direction = 1

render = function () {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    render_stats.update()
    ground.rotation.x += 0.002 * direction

    if (ground.rotation.x < -0.4) direction = 1
    if (ground.rotation.x > 0.4) direction = -1
    ground.__dirtyRotation = true
    scene.simulate(undefined, 1)
}

window.onload = initScene
