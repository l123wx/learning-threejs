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

    var sphere = createMesh(new THREE.SphereGeometry(10, 40, 40))
    // add the sphere to the scene
    scene.add(sphere)

    // position and point the camera to the center of the scene
    camera.position.x = -10
    camera.position.y = 15
    camera.position.z = 25

    camera.lookAt(new THREE.Vector3(0, 0, 0))

    var orbitControls = new THREE.OrbitControls(camera)
    orbitControls.autoRotate = false
    var clock = new THREE.Clock()

    var ambi = new THREE.AmbientLight(0x686868)
    scene.add(ambi)

    var spotLight = new THREE.DirectionalLight(0xffffff)
    spotLight.position.set(550, 100, 550)
    spotLight.intensity = 0.6

    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    var renderPass = new THREE.RenderPass(scene, camera)
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader)
    effectCopy.renderToScreen = true

    var bloomPass = new THREE.BloomPass(3, 25, 5.0, 256)
    var effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false)
    effectFilm.renderToScreen = true

    var dotScreenPass = new THREE.DotScreenPass()

    // basic renderer that renders the scene, and uses the
    // effectCopy shader to output the image to the defined
    // rendertarget.
    var composer = new THREE.EffectComposer(webGLRenderer)
    composer.addPass(renderPass)
    composer.addPass(effectCopy)

    // we use a texture pass to pass the rendered output to
    // a texture, so we can reuse it
    var renderScene = new THREE.TexturePass(composer.renderTarget2)

    // lower left corner
    var composer1 = new THREE.EffectComposer(webGLRenderer)
    composer1.addPass(renderScene)
    composer1.addPass(dotScreenPass)
    composer1.addPass(effectCopy)

    // lower right corner
    var composer2 = new THREE.EffectComposer(webGLRenderer)
    composer2.addPass(renderScene)
    composer2.addPass(effectCopy)

    // upper left corner
    var composer3 = new THREE.EffectComposer(webGLRenderer)
    composer3.addPass(renderScene)
    composer3.addPass(bloomPass)
    composer3.addPass(effectCopy)

    // upper right corner
    var composer4 = new THREE.EffectComposer(webGLRenderer)
    composer4.addPass(renderScene)
    composer4.addPass(effectFilm)

    // setup the control gui
    var controls = new (function () {
        // film
        this.scanlinesCount = 256
        this.grayscale = false
        this.scanlinesIntensity = 0.3
        this.noiseIntensity = 0.8

        // bloompass
        this.strength = 3
        this.kernelSize = 25
        this.sigma = 5.0
        this.resolution = 256

        // dotscreen
        this.centerX = 0.5
        this.centerY = 0.5
        this.angle = 1.57
        this.scale = 1

        this.updateEffectFilm = function () {
            effectFilm.uniforms.grayscale.value = controls.grayscale
            effectFilm.uniforms.nIntensity.value = controls.noiseIntensity
            effectFilm.uniforms.sIntensity.value = controls.scanlinesIntensity
            effectFilm.uniforms.sCount.value = controls.scanlinesCount
        }

        this.updateDotScreen = function () {
            var dotScreenPass = new THREE.DotScreenPass(
                new THREE.Vector2(controls.centerX, controls.centerY),
                controls.angle,
                controls.scale
            )

            composer1 = new THREE.EffectComposer(webGLRenderer)
            composer1.addPass(renderScene)
            composer1.addPass(dotScreenPass)
            composer1.addPass(effectCopy)
        }

        this.updateEffectBloom = function () {
            bloomPass = new THREE.BloomPass(
                controls.strength,
                controls.kernelSize,
                controls.sigma,
                controls.resolution
            )
            composer3 = new THREE.EffectComposer(webGLRenderer)
            composer3.addPass(renderScene)
            composer3.addPass(bloomPass)
            composer3.addPass(effectCopy)
        }
    })()

    var gui = new dat.GUI()

    var bpFolder = gui.addFolder('BloomPass')
    bpFolder
        .add(controls, 'strength', 1, 10)
        .onChange(controls.updateEffectBloom)
    bpFolder
        .add(controls, 'kernelSize', 1, 100)
        .onChange(controls.updateEffectBloom)
    bpFolder.add(controls, 'sigma', 1, 10).onChange(controls.updateEffectBloom)
    bpFolder
        .add(controls, 'resolution', 0, 1024)
        .onChange(controls.updateEffectBloom)

    var fpFolder = gui.addFolder('FilmPass')
    fpFolder
        .add(controls, 'scanlinesIntensity', 0, 1)
        .onChange(controls.updateEffectFilm)
    fpFolder
        .add(controls, 'noiseIntensity', 0, 3)
        .onChange(controls.updateEffectFilm)
    fpFolder.add(controls, 'grayscale').onChange(controls.updateEffectFilm)
    fpFolder
        .add(controls, 'scanlinesCount', 0, 2048)
        .step(1)
        .onChange(controls.updateEffectFilm)

    var dsFolder = gui.addFolder('DotScreenPass')
    dsFolder.add(controls, 'centerX', 0, 1).onChange(controls.updateDotScreen)
    dsFolder.add(controls, 'centerY', 0, 1).onChange(controls.updateDotScreen)
    dsFolder.add(controls, 'angle', 0, 3.14).onChange(controls.updateDotScreen)
    dsFolder.add(controls, 'scale', 0, 10).onChange(controls.updateDotScreen)

    // call the render function
    var step = 0

    render()

    function createMesh(geom) {
        var planetTexture = THREE.ImageUtils.loadTexture(
            '../assets/textures/planets/Earth.png'
        )
        var specularTexture = THREE.ImageUtils.loadTexture(
            '../assets/textures/planets/EarthSpec.png'
        )
        var normalTexture = THREE.ImageUtils.loadTexture(
            '../assets/textures/planets/EarthNormal.png'
        )

        var planetMaterial = new THREE.MeshPhongMaterial()
        planetMaterial.specularMap = specularTexture
        planetMaterial.specular = new THREE.Color(0x4444aa)

        planetMaterial.normalMap = normalTexture
        planetMaterial.map = planetTexture
        //               planetMaterial.shininess = 150;

        // create a multimaterial
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [
            planetMaterial
        ])

        return mesh
    }

    var width = window.innerWidth || 2
    var height = window.innerHeight || 2

    var halfWidth = width / 2
    var halfHeight = height / 2

    function render() {
        stats.update()

        //sphere.rotation.y=step+=0.01;
        var delta = clock.getDelta()
        orbitControls.update(delta)

        sphere.rotation.y += 0.002

        // render using requestAnimationFrame
        requestAnimationFrame(render)

        webGLRenderer.autoClear = false
        webGLRenderer.clear()

        webGLRenderer.setViewport(0, 0, 2 * halfWidth, 2 * halfHeight)
        composer.render(delta)

        webGLRenderer.setViewport(0, 0, halfWidth, halfHeight)
        composer1.render(delta)

        webGLRenderer.setViewport(halfWidth, 0, halfWidth, halfHeight)
        composer2.render(delta)

        webGLRenderer.setViewport(0, halfHeight, halfWidth, halfHeight)
        composer3.render(delta)

        webGLRenderer.setViewport(halfWidth, halfHeight, halfWidth, halfHeight)
        composer4.render(delta)
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
