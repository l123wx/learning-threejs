/** @type {import('../types/three')} */

// once everything is loaded, we run our Three.js stuff.
function init() {
    var scale = chroma.scale(['white', 'blue'])

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
    webGLRenderer.setClearColor(new THREE.Color(0xaaaaff, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    //        // position and point the camera to the center of the scene
    camera.position.x = 30
    camera.position.y = 30
    camera.position.z = 30
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    var dirLight = new THREE.DirectionalLight(0xffffff)
    dirLight.position.set(30, 30, 30)
    dirLight.intensity = 0.8
    scene.add(dirLight)

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.castShadow = true
    spotLight.position.set(-30, 30, -100)
    spotLight.target.position.x = -10
    spotLight.target.position.z = -10
    spotLight.intensity = 0.6
    spotLight.shadowMapWidth = 4096
    spotLight.shadowMapHeight = 4096
    spotLight.shadowCameraFov = 120
    spotLight.shadowCameraNear = 1
    spotLight.shadowCameraFar = 200

    scene.add(spotLight)
    var plane = new THREE.BoxGeometry(1600, 1600, 0.1, 40, 40)

    var cube = new THREE.Mesh(
        plane,
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/floor-wood.jpg'
            ),
            normalScale: new THREE.Vector2(0.6, 0.6)
        })
    )
    cube.material.map.wrapS = THREE.RepeatWrapping
    cube.material.map.wrapT = THREE.RepeatWrapping

    cube.rotation.x = Math.PI / 2
    cube.material.map.repeat.set(80, 80)

    cube.receiveShadow = true
    cube.position.z = -150
    cube.position.x = -150
    scene.add(cube)

    var range = 3
    var stepX = 8
    var stepZ = 8
    for (var i = -25; i < 5; i++) {
        for (var j = -15; j < 15; j++) {
            var cube = new THREE.Mesh(
                new THREE.BoxGeometry(3, 4, 3),
                new THREE.MeshPhongMaterial({
                    color: scale(Math.random()).hex(),
                    opacity: 0.8,
                    transparent: true
                })
            )
            cube.position.x = i * stepX + (Math.random() - 0.5) * range
            cube.position.z = j * stepZ + (Math.random() - 0.5) * range
            cube.position.y = (Math.random() - 0.5) * 2
            cube.castShadow = true
            scene.add(cube)
        }
    }

    // add the output of the renderer to the html element

    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    var hBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader)
    hBlur.enabled = false
    hBlur.uniforms.h.value = 1 / window.innerHeight
    var vBlur = new THREE.ShaderPass(THREE.VerticalBlurShader)
    vBlur.enabled = false
    vBlur.uniforms.v.value = 1 / window.innerWidth

    var hTilt = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader)
    hTilt.enabled = false
    hTilt.uniforms.h.value = 1 / window.innerHeight
    var vTilt = new THREE.ShaderPass(THREE.VerticalTiltShiftShader)
    vTilt.enabled = false
    vTilt.uniforms.v.value = 1 / window.innerWidth

    var tri = new THREE.ShaderPass(THREE.TriangleBlurShader, 'texture')
    tri.enabled = false

    var renderPass = new THREE.RenderPass(scene, camera)
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader)
    effectCopy.renderToScreen = true

    var composer = new THREE.EffectComposer(webGLRenderer)
    composer.addPass(renderPass)
    composer.addPass(hBlur)
    composer.addPass(vBlur)
    composer.addPass(vTilt)
    composer.addPass(hTilt)
    composer.addPass(tri)
    composer.addPass(effectCopy)

    var controls = new (function () {
        this.hBlur = false
        this.vBlur = false
        this.hTilt = false
        this.vTilt = false
        this.triBlur = false

        this.hTiltR = 0.35
        this.vTiltR = 0.35

        this.deltaX = 0.05
        this.deltaY = 0.05

        this.onChange = function () {
            hBlur.enabled = controls.hBlur
            vBlur.enabled = controls.vBlur

            hTilt.enabled = controls.hTilt
            hTilt.uniforms.r.value = controls.hTiltR
            vTilt.enabled = controls.vTilt
            vTilt.uniforms.r.value = controls.vTiltR

            tri.enabled = controls.triBlur
            tri.uniforms.delta.value = new THREE.Vector2(
                controls.deltaX,
                controls.deltaY
            )
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'hBlur').onChange(controls.onChange)
    gui.add(controls, 'vBlur').onChange(controls.onChange)
    gui.add(controls, 'hTilt').onChange(controls.onChange)
    gui.add(controls, 'hTiltR', 0, 1).onChange(controls.onChange)
    gui.add(controls, 'vTilt').onChange(controls.onChange)
    gui.add(controls, 'vTiltR', 0, 1).onChange(controls.onChange)
    gui.add(controls, 'triBlur').onChange(controls.onChange)
    gui.add(controls, 'deltaX', 0, 0.05).step(0.001).onChange(controls.onChange)
    gui.add(controls, 'deltaY', 0, 0.05).step(0.001).onChange(controls.onChange)

    render()

    function render() {
        stats.update()

        //
        //

        requestAnimationFrame(render)
        //        webGLRenderer.render(scene, camera);
        composer.render()
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
