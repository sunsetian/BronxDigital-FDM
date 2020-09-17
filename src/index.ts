//imports
import 'pepjs';
//import '@babylonjs/loaders';
import { Artist, Movie } from './Artist';
//import * as cannon from 'cannon';

import { HemisphericLight, Vector3, SceneLoader, AbstractMesh, Mesh, StandardMaterial, PickingInfo, Ray, Matrix, ArcRotateCamera, Tools, VideoTexture, Texture, ActionManager, ExecuteCodeAction, KeyboardEventTypes, VideoTextureSettings } from '@babylonjs/core'
import { createEngine, createScene, createSkybox, createArcRotateCamera, getMeshesMaterials, setMeshesMaterials } from './babylon'

import { SampleMaterial } from "./Materials/SampleMaterial"

//import * as viAPI from './virtualInsanityAPI'

const canvas: HTMLCanvasElement = document.getElementById('virtualInsanityCanvas') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

let room:Mesh;
let limits:Mesh;

let targetBox: Mesh;
let targetPosition: Vector3;
let targetCameraPosition: Vector3;
let roomCenter: Vector3;

let artist: Artist[]  = [];
let numArtists: number =  0;
let numCuadros: number =  0;
let actualArtist: number = -1;
let actualCuadroID: number = -1;
let movies: Movie[] = []
let numMovies: number = 0;
let actualMovie: number = -1;


const numVentanas: number = 0;

const targetSpeed: number = 0.015;
const cameraSpeed: number = 0.03;

let cameraSetted: boolean = false;

var URL_SCENE_JS:string;//Todo pasar a archivo de importacion API

const camera = createArcRotateCamera() as ArcRotateCamera;
var oldTargetPosition: Vector3;
var oldTargetCameraPosition: Vector3;

/**GUI SCENE CLASS*/
/* ******************************* GUI SCENE BABYLON CLASS ***************************** */

class GuiSceneBabylon{
  constructor(){
    canvas.style.backgroundColor = 'black';
  }
  
  getArtistPositionsByID(id:number): Vector3{

    let newArtistPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
        if(artistElement.id === id) newArtistPos = artistElement.position;
    });

    return newArtistPos;
  }

  getArtistIndexByName(name: string):number{

    let newIndex: number = -1;

    artist.forEach(artistElement => {
      if(artistElement.name === name) newIndex = artistElement.arrayIndex;
    });

    return newIndex;
  }

  getArtistPositionsByName(name: string):Vector3{

    let newPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      if(artistElement.name === name) newPos = artistElement.position;
    });

    return newPos;
  }

  getArtistViewPositionsByName(name: string):Vector3{

    let newPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      if(artistElement.name === name) newPos = artistElement.viewerPosition;
    });

    return newPos;
  }

  getArtistViewerPositionsByID(id:number): Vector3{

    let newPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
        if(artistElement.id === id) newPos = artistElement.viewerPosition;
    });

    return newPos;
  }

  getMoviePositionsByName(name: string):Vector3{

    let newPos: Vector3 = new Vector3();

    movies.forEach(movieElement => {
      if(movieElement.name === name) newPos = movieElement.position;
    });

    return newPos;
  }
  
  getMovieViewPositionsByName(name: string):Vector3{

    let newPos: Vector3 = new Vector3();

    movies.forEach(movieElement => {
      if(movieElement.name === name) newPos = movieElement.viewerPosition;
    });

    return newPos;
  }
  
  getMovieIndexByName(name: string):number{

    let newIndex: number = -1;

    movies.forEach(movieElement => {
      console.log("movieElement.name  " + movieElement.name + " : name " + name);
      if(movieElement.name === name) newIndex = movieElement.arrayIndex;
      
    });

    return newIndex;
  }

  getMovieViewerPositionsByID(id:number): Vector3{

    let newPos: Vector3 = new Vector3();

    movies.forEach(moviesElement => {
        if(moviesElement.id === id) newPos = moviesElement.viewerPosition;
    });

    return newPos;
  }
  

  getCuadroIndexByID(id: number, artist: Artist):number{

    let newIndex: number = -1;
    //let cuadroID: number = id;

    artist.cuadro.forEach(cuadroElement => {
      if(cuadroElement.order === id) newIndex = cuadroElement.arrayIndex;
    });

    return newIndex;
  }

  getCuadroPositionsByID(id:number): Vector3{

    let newCuadroPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement =>{
        if(cuadroElement.absoluteIndex === id) newCuadroPos = cuadroElement.position;
      });
        
    });

    return newCuadroPos;
  }

  getCuadroViewerPositionsByID(id:number): Vector3{

    let newCuadroPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement =>{
        if(cuadroElement.absoluteIndex === id) newCuadroPos = cuadroElement.viewerPosition;
      });
        
    });

    return newCuadroPos;
  }

  selectArtist(artistID: number): void{

    let pos = this.getArtistPositionsByID(artistID);
    let viewPos = this.getArtistViewerPositionsByID(artistID);

    actualArtist = artistID;

    //console.log("actualArtist: " + actualArtist);
    targetPosition = new Vector3(pos.x, pos.y, pos.z);
    targetCameraPosition = new Vector3(viewPos.x, viewPos.y, viewPos.z);
    //camera.useAutoRotationBehavior = false;

  }

  prev_artist(): void{

    if(actualArtist > 0){
      actualArtist = (actualArtist + (numArtists-1))%numArtists;
    }
    else{
      actualArtist = numArtists - 1; 
    }
    
    this.selectArtist(actualArtist);
    
  }

  next_artist(): void{
    actualArtist = (actualArtist + 1)%numArtists;

    this.selectArtist(actualArtist);
  }

  selectCuadro(cuadroID: number): void{

    let pos = this.getCuadroPositionsByID(cuadroID);
    let viewPos = this.getCuadroViewerPositionsByID(cuadroID);

    actualCuadroID = cuadroID;

    console.log("cuadroID: " + cuadroID);
    targetPosition = new Vector3(pos.x, pos.y, pos.z);
    targetCameraPosition = new Vector3(viewPos.x, viewPos.y, viewPos.z);
    //camera.useAutoRotationBehavior = false;

  }

  next_cuadro(): void{
    actualCuadroID = (actualCuadroID + 1)% numCuadros;
    this.selectCuadro(actualCuadroID);
  }

  prev_cuadro(): void{
    if(actualCuadroID > 0){
      actualCuadroID = (actualCuadroID + (numCuadros-1))%numCuadros;
    }
    else{
      actualCuadroID = numCuadros - 1; 
    }
    this.selectCuadro(actualCuadroID);
  }

  getMovieIndexByID(id: number, movies: Movie[]):number{

    let newIndex: number = -1;
    //let cuadroID: number = id;

    movies.forEach(movieElement => {
      if(movieElement.id === id) newIndex = movieElement.arrayIndex;
    });

    return newIndex;
  }
  

  center_camera(){
  
    targetPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
    targetCameraPosition = camera.position;
    oldTargetCameraPosition = targetCameraPosition;

    camera.useAutoRotationBehavior = true;
    camera.angularSensibilityX = -5000;

    if(camera.autoRotationBehavior !== null){
      camera.autoRotationBehavior.idleRotationSpeed = 0.1;
    }
  }

  /** AUTO PLAY CAMERA */
  private intervalID: NodeJS.Timeout;

  setCameraAutoPlay(set: boolean){
    if(set){
      this.intervalID = setInterval( function() {

        guiVI.next_artist();
        
      }, 8000);
    }
    else{
      clearInterval(this.intervalID);
    }
  }

  toggle_camera(){
    if(scene.activeCamera !== null){
      if( scene.activeCamera.name === "ArcCamera"){
        //scene.activeCamera = camera02;
      }
      else if( scene.activeCamera.name === "FreeCamera"){
        //scene.activeCamera = camera01;
      }
    }

  }
}

/** SCENE GUI CLASS END */ 

var guiVI = new GuiSceneBabylon()

/** MAIN SCENE */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// main function that is async so we can call the scene manager with await
const main = async () => {
  //createSkybox(URL_SCENE_JS);

  const light01 = new HemisphericLight("light1", new Vector3(3, 1, 1), scene);
  const light02 = new HemisphericLight("light2", new Vector3(-3, 1, -1), scene);
  const light03 = new HemisphericLight("light3", new Vector3(0, 1, 0), scene);

  light01.intensity = 0.8;
  light02.intensity = 0.8;
  light03.intensity = 0.8;

  /** IMPORTACIÓN DE LA ESCENA DE BLENDER 
   * 
   * Las mallas que llegan importadas desde Blender deben ser 
   * manipuladas dentro de la función que se ejecuta al terminar la importacion.
   * 
  */
  SceneLoader.ImportMesh(
    "",
    URL_SCENE_JS+"data/models/",
    "thisBronxScene.babylon",
    scene,
    function (importedMeshes) {

      //console.log("importedMeshes[0].name: " + importedMeshes[0].name);
      let index = 0;
      let movieIndex = 0;
      let cuadroAbsoluteIndex = 0;

      /** shaders */
      /*
      var shaderMaterial = new 
      SampleMaterial("material", scene);
      var textureTest = new Texture(URL_SCENE_JS+"data/models/1.jpg", scene);
      shaderMaterial.setTexture("uHeightMap", textureTest);
      shaderMaterial.backFaceCulling = false;*/
      let sceneMaterials = getMeshesMaterials(importedMeshes);
      //setMeshesMaterials(importedMeshes,shaderMaterial);
      setTimeout(function(){
        setMeshesMaterials(importedMeshes,sceneMaterials);
        createSkybox(URL_SCENE_JS);
      },11000);
      //setMeshesMaterials(importedMeshes,sceneMaterials);

      var myMaterial = new StandardMaterial("myMaterial", scene);

      importedMeshes.forEach(newMesh => {
        if(newMesh.material){
          let meshTexture = newMesh.material.getActiveTextures()[0] as Texture;
          console.log(newMesh.material.getActiveTextures());
          if(meshTexture){
            var shaderMaterial = new SampleMaterial("material", scene);
            /*Los mejores:
             loadingShader1.jpg
             loadingShader2.jpg */
            var textureTest = new Texture(URL_SCENE_JS+"data/loadingMeshImage/loadingShader0.jpg", scene);
            shaderMaterial.backFaceCulling = false;
            shaderMaterial.setTexture("uHeightMap", textureTest);
            shaderMaterial.setTexture("uDiffuseMap", meshTexture);
            newMesh.material = shaderMaterial;
          }
        }
        /***************/


        let meshNames: string[] = newMesh.name.split(".");
        if( meshNames[0] === "Artist" ){
          artist.push(new Artist(newMesh, index, scene));
          index++;
        }

        if( meshNames[0] === "Movie" ){
          movies.push(new Movie(newMesh as Mesh, movieIndex, URL_SCENE_JS, scene));
          movieIndex++;
          console.log("movieIndex: " + movieIndex);
        }
      });
      
      for(let i=0; i < artist.length; i++){
        for(let j=0; j < artist[i].cuadro.length; j++){
          artist[i].cuadro[j].absoluteIndex = cuadroAbsoluteIndex ;
          cuadroAbsoluteIndex ++
        }
      }

      numArtists = artist.length;
      numCuadros = cuadroAbsoluteIndex;
      numMovies = movies.length;
    
      if(scene.getMeshByName("Limits.000")){
        limits = scene.getMeshByName("Limits.000") as Mesh;
        limits.metadata = "limits";
        limits.name = "limits";
        limits.checkCollisions = true;
        limits.freezeWorldMatrix();
      }

      if(scene.getMeshByName("Room.000")){
        room = scene.getMeshByName("Room.000") as Mesh;
        room.metadata = "sala01";
        room.freezeWorldMatrix();
      }
      targetPosition = new Vector3(room.position.x, room.position.y + 1.7, room.position.z);
      targetCameraPosition = new Vector3(room.position.x, room.position.y + 1.7, room.position.z);
      oldTargetPosition = new Vector3(room.position.x, room.position.y + 1.7, room.position.z);
      oldTargetCameraPosition = targetCameraPosition;
      roomCenter = new Vector3(room.position.x, room.position.y + 1.7, room.position.z);
      
      targetBox = Mesh.CreateBox("TargetBox.000", 0.5, scene);
      let baseMat = new StandardMaterial("BaseMaterial", scene);

      baseMat.alpha = 0.0;

      targetBox.material = baseMat;

      targetBox.position = targetPosition;

      if(camera !== undefined && targetBox !== undefined && cameraSetted === false){
        camera.setTarget(targetBox);
        cameraSetted = true;
  
      }

      /** FUNCION DE OBSERVACION DE EVENTOS DE CLICK
       * 
       * Aqui se determina que mesh fue clickeado
       * 
       */

      scene.onPointerDown = function selectMesh() {

        function predicate(mesh: AbstractMesh){
          if (mesh === targetBox){
            return false;
          }
          return true;
        }

        let pickMesh: Ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
        let hit: PickingInfo = scene.pickWithRay(pickMesh, predicate) as PickingInfo;

        let cuadrosName = "cuadro";

        if(hit.pickedMesh != null){
          if(hit.pickedMesh.metadata != null){
            if (hit.pickedMesh && hit.pickedMesh.metadata === cuadrosName) {

              let currentMesh: AbstractMesh = new AbstractMesh("");

              if(scene.getMeshByName(hit.pickedMesh.name) != null){
                currentMesh = scene.getMeshByName(hit.pickedMesh.name) as AbstractMesh;
              }
              
              oldTargetPosition = targetPosition;
              oldTargetCameraPosition = targetCameraPosition;

              let iArtist = parseInt(currentMesh.id.split("_")[0]);
              let iCuadro = parseInt(currentMesh.id.split("_")[1])-1;

              //actualCuadroID = currentMesh.;

              camera.angularSensibilityX = 5000;

              //console.log("currentMesh.id: " + currentMesh.id);

              //let currentArtist :AbstractMesh = new AbstractMesh("");
              let currentArtistPos: Vector3 = new Vector3();
              let currentArtistViewPos: Vector3 = new Vector3();
              let currentArtistIndex: number = -1;

              if(hit.pickedMesh.parent != null){
                 
                 currentArtistPos = guiVI.getArtistPositionsByName(hit.pickedMesh.parent.name);
                 currentArtistViewPos = guiVI.getArtistViewPositionsByName(hit.pickedMesh.parent.name);
                 currentArtistIndex = guiVI.getArtistIndexByName(hit.pickedMesh.parent.name);

                 //console.log("hit.pickedMesh.parent.name: "+ hit.pickedMesh.parent.name);
              }
              //console.log("currentArtistID: " + currentArtistIndex);

              if(actualArtist !== iArtist){
                actualArtist = iArtist;
                targetCameraPosition = new Vector3(currentArtistViewPos.x, currentArtistViewPos.y, currentArtistViewPos.z);
              
                targetPosition = new Vector3(currentArtistPos.x, currentArtistPos.y, currentArtistPos.z);
              }
              else{

                let cuadroIndex:number = guiVI.getCuadroIndexByID(iCuadro, artist[currentArtistIndex]);
                let currentCuadro = artist[currentArtistIndex].cuadro[cuadroIndex];
                actualCuadroID = artist[currentArtistIndex].cuadro[cuadroIndex].absoluteIndex;

                console.log("currentCuadro.slug: " + currentCuadro.slug)
                //console.log("currentCuadro.id: " + currentCuadro.id)

                targetCameraPosition = new Vector3(currentCuadro.viewerPosition.x, currentCuadro.viewerPosition.y, currentCuadro.viewerPosition.z);
                targetPosition = new Vector3(currentCuadro.position.x, currentCuadro.position.y, currentCuadro.position.z);
          
                globalThis.bronxControl.showInfoByPostSlug(currentCuadro.slug,175);
              }
              
              //console.log("Artist selected id: " + artist[currentArtistIndex].id);
            }

            let moviesName = "movie";

            if (hit.pickedMesh && hit.pickedMesh.metadata === moviesName) {

              let currentMoviePos: Vector3 = new Vector3();
              let currentMovieViewPos: Vector3 = new Vector3();
              let currentMovieIndex: number = -1;

              if(hit.pickedMesh != null){

                console.log("hit.pickedMesh.name " + hit.pickedMesh.name);
                 
                currentMoviePos = guiVI.getMoviePositionsByName(hit.pickedMesh.name);
                currentMovieViewPos = guiVI.getMovieViewPositionsByName(hit.pickedMesh.name);
                currentMovieIndex = guiVI.getMovieIndexByName(hit.pickedMesh.name);

                console.log("currentMovieIndex: " + currentMovieIndex);

                //console.log("hit.pickedMesh.parent.name: "+ hit.pickedMesh.parent.name);
             }

              let movieIndex:number = guiVI.getMovieIndexByID(parseInt(hit.pickedMesh.id), movies);

              if(actualMovie !== movieIndex){
                actualMovie = movieIndex;
                targetCameraPosition = new Vector3(currentMovieViewPos.x, currentMovieViewPos.y, currentMovieViewPos.z);
              
                targetPosition = new Vector3(currentMoviePos.x, currentMoviePos.y, currentMoviePos.z);
              }

              console.log("movies[movieIndex].videoTexturePlaying " + movies[movieIndex].videoTexturePlaying);

              if(!movies[movieIndex].videoTexturePlaying){
                movies[movieIndex].videoTexture.video.play();
                movies[movieIndex].videoTexturePlaying = true;
              }
              else{
                movies[movieIndex].videoTexture.video.pause();
                movies[movieIndex].videoTexturePlaying = false;
              }

            }


          }
        }
      }
    }
  );

  /** VIDEO SCREENS */
  /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
  
  /* let videoScreen = Mesh.CreateBox("videoScreen", 1, scene);

  videoScreen.scaling = new Vector3(1.6*2.5, 0.9*2.5, 0.02);

 //videoScreen.rotate(new Vector3(0, 1, 0), Tools.ToRadians(90));

  videoScreen.position = new Vector3(2.6, 2.2, 7.5);

  let videoMat01 = new StandardMaterial("videoMat01", scene);

  let myVideoSettings: VideoTextureSettings = new Object({autoPlay: false, autoUpdateTexture: true, loop: false, clickToPlay: true, poster: URL_SCENE_JS + "data/images/premovie01.png"}) as VideoTextureSettings;

  let videoTexture = new VideoTexture("video01", [URL_SCENE_JS + "data/movies/movie01.mp4"], scene, true, false, VideoTexture.TRILINEAR_SAMPLINGMODE, myVideoSettings);
  //let preVideoTexture = new Texture(URL_SCENE_JS + "data/images/premovie01.png", scene, true, true);

  videoMat01.diffuseTexture = videoTexture;
  videoScreen.material = videoMat01;

  let videoTexturePlaying = false;

  scene.onPointerUp = function () {
    if(!videoTexturePlaying){
      videoTexture.video.play();
      videoTexturePlaying = true;
    }
    else{
      videoTexture.video.pause();
      videoTexturePlaying = false;
    }
      
    //videoMat01.diffuseTexture = videoTexture;
  }
 */
  

  /** Animation Loop */
 /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  scene.registerBeforeRender(function() {

    //time += 0.1;
    if(cameraSetted){
      if(targetBox !== undefined){
          if (oldTargetPosition !== targetPosition){
              targetBox.position.x = targetBox.position.x*(1-targetSpeed) + targetPosition.x*targetSpeed;
              targetBox.position.y = targetBox.position.y*(1-targetSpeed) + targetPosition.y*targetSpeed;
              targetBox.position.z = targetBox.position.z*(1-targetSpeed) + targetPosition.z*targetSpeed;
          }
          if(Math.abs(targetBox.position.x - targetPosition.x) < 0.02 && Math.abs(targetBox.position.y - targetPosition.y) < 0.02 && Math.abs(targetBox.position.z - targetPosition.z) < 0.02){
              oldTargetPosition = targetPosition;
          }

          if (oldTargetCameraPosition !== targetCameraPosition){

              camera.setPosition(new Vector3(camera.position.x*(1-cameraSpeed) + targetCameraPosition.x*cameraSpeed, camera.position.y*(1-cameraSpeed) + targetCameraPosition.y*cameraSpeed, camera.position.z*(1-cameraSpeed) + targetCameraPosition.z*cameraSpeed));
              //console.log("camera01 x :" +  camera01.position.x);
          }
          if(Math.abs(camera.position.x - targetCameraPosition.x) < 0.02 && Math.abs(camera.position.y - targetCameraPosition.y) < 0.02 && Math.abs(camera.position.z - targetCameraPosition.z) < 0.02){
              oldTargetCameraPosition = targetCameraPosition;

          }

      }


      /** Camera colides with wall and return */
      camera.onCollide = function(collider) {
        if(collider.name === 'limits') {
            //console.log('onCollide', collider.name);
            camera.autoRotationBehavior.idleRotationSpeed = camera.autoRotationBehavior.idleRotationSpeed*(-1)
      
        }
        
      }
    }

    if(map["c"]){
      guiVI.center_camera();
    }

  });


  /** RUN RENDER LOOP */
  engine.runRenderLoop(() => {
    scene.render()
  });


  /** RESIZE */
  window.addEventListener("resize", function () {
    engine.resize();
  });

}



/** Action Events */



/*
cuadros.actionManager.registerAction(
  new SetValueAction(
      {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: limits
      },
      camera,
      'autoRotationBehavior.idleRotationSpeed',
      camera.autoRotationBehavior.idleRotationSpeed*(-1)
  )
);
*/


/** Buttons events */
 /**************************** CONTROL NAVIGATION BUTTONS ************************************************/

globalThis.virtualInButtonClick = function(buttonClickData){
  let buttonId = buttonClickData.id;
  switch(buttonId) { 
    case 'VI_GUI_Left': { 
      guiVI.prev_artist();
       break; 
    } 
    case 'VI_GUI_Right': { 
      guiVI.next_artist();
       break; 
    } 
    case 'VI_GUI_Center': { 
      guiVI.center_camera();
       break; 
    } 
    case 'VI_GUI_Toggle': { 
      guiVI.toggle_camera();
       break; 
    } 
  } 
  console.log("Button clicked: "+buttonId);
}

/** Keyboard events */
 /**************************** Key Control Multiple Keys ************************************************/

 var map = {}; //object for multiple key presses
 scene.actionManager = new ActionManager(scene);

 scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
     map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

 }));

 scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
     map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
 }));

 scene.onKeyboardObservable.add((kbInfo) => {
  switch (kbInfo.type) {
      case KeyboardEventTypes.KEYDOWN:
          console.log("KEY DOWN: ", kbInfo.event.key);
          switch (kbInfo.event.key){
            case "c":
              guiVI.center_camera();
              break;
            case "ArrowRight":
              guiVI.next_artist();
              break;
            case "ArrowLeft":
              guiVI.prev_artist();
              break;
            case "w":
              guiVI.next_cuadro();
              break;
            case "q":
              guiVI.prev_cuadro();
              break;
            case "p":
              guiVI.setCameraAutoPlay(true);
              break;
            case "s":
              guiVI.setCameraAutoPlay(false);
              break;
            default:
              break;

          }       
          break;
  }
});


 /** INIT SCENE */

export {
  initBabylonScene
}

function initBabylonScene(srcScene:string){
  //alert(srcScene);
  URL_SCENE_JS = srcScene;
  main();
}


