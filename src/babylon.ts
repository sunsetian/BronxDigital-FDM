import { Engine, Scene, ArcRotateCamera, Vector3, CubeTexture, Color4, Mesh, StandardMaterial, Texture, Color3 } from '@babylonjs/core';
//import '@babylonjs/inspector';

export let canvas: HTMLCanvasElement
export let engine: Engine
export let scene: Scene
export let camera: ArcRotateCamera
let handleResize: any

export const createEngine = (hostCanvas: HTMLCanvasElement) => {
  canvas = hostCanvas
  engine = new Engine(canvas, true, {}, true)

  handleResize = () => engine.resize()
  window.addEventListener('resize', handleResize)

  return engine
}

export const createScene = () => {
  scene = new Scene(engine)

  scene.clearColor = new Color4(0.8, 0.8, 0.8, 1);

  // optimize scene for opaque background
  scene.autoClear = false;
  scene.autoClearDepthAndStencil = false;

  //scene.gravity = new Vector3(0, -0.9, 0);
  scene.collisionsEnabled = true;

  scene.enablePhysics(new Vector3(0, -0.9, 0));

  // show the inspector when pressing shift + alt + I
  /* scene.onKeyboardObservable.add(({ event }) => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
      if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide()
      } else {
        scene.debugLayer.show()
      }
    }
  }) */

  return scene
}

export const createArcRotateCamera = () => {
    const startAlpha = Math.PI / 2;
    const startBeta = Math.PI / 2;
    const startRadius = 3
    const startPosition = new Vector3(0, 1.9, 0)
    const camera = new ArcRotateCamera('camera', startAlpha, startBeta, startRadius, startPosition, scene, true)
    //camera.attachControl(canvas, false)

    // Set some basic camera settings
    camera.minZ = 0.1;
    camera.lowerBetaLimit = Math.PI * 1.8/ 4;
    camera.upperBetaLimit = Math.PI * 2.2 / 4;
    camera.lowerRadiusLimit = 1.71;
    camera.upperRadiusLimit = 6;
    camera.allowUpsideDown = false;
    camera.wheelPrecision = 250;
    camera.angularSensibilityX = -5000;
    camera.angularSensibilityY = 5000;

    //camera.radius = 7;

    //camera01.framingBehavior.mode = BABYLON.FramingBehavior.FitFrustumSidesMode;
    //camera01.framingBehavior.elevationReturnTime = 6000;

    camera.useAutoRotationBehavior = true;
    if(camera.autoRotationBehavior != null){
      camera.autoRotationBehavior.idleRotationSpeed = 0.05;
    }

    //console.log("camera01.pinchPrecision: " + camera.pinchPrecision );

    camera.pinchPrecision = 1000;

    camera.checkCollisions = true // make the camera collide with meshes
    camera.collisionRadius = new Vector3(1.7, 0.2, 1.7) // how close can the camera go to other meshes

    //camera.applyGravity = true;

    return camera
}

export const createSkybox = (urlScene:string) => {

  var skybox = Mesh.CreateBox("skyBox", 100.0, scene);
  var skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture(urlScene+"data/images/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;
  
  return skybox
}
