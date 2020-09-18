//imports
import 'pepjs';
//import '@babylonjs/loaders';
import { Artist, Movie } from './Artist';
//import * as cannon from 'cannon';

import { HemisphericLight, Vector3, SceneLoader, AbstractMesh, Mesh, StandardMaterial, PickingInfo, Ray, Matrix, ArcRotateCamera, Tools, VideoTexture, Texture, ActionManager, ExecuteCodeAction, KeyboardEventTypes, VideoTextureSettings, AssetsManager, Color3, InterpolateValueAction } from '@babylonjs/core'
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
let apuntador: Mesh 

let artist: Artist[]  = [];
let numArtists: number =  0;
let numCuadros: number =  0;
let actualArtist: number = -1;
let actualAbsoluteCuadro: number = -1;
let movies: Movie[] = []
let numMovies: number = 0;
let actualMovie: number = -1;


const numVentanas: number = 0;

const targetSpeed: number = 0.03;
const cameraSpeed: number = 0.015;

let cameraSetted: boolean = false;
let cameraAtCenter: boolean = true;

let cameraLevel: number = 0;

var URL_SCENE_JS:string;//Todo pasar a archivo de importacion API

const camera = createArcRotateCamera() as ArcRotateCamera;
var oldTargetPosition: Vector3;
var oldTargetCameraPosition: Vector3;

/**GUI SCENE CLASS*/
/* ******************************* GUI SCENE BABYLON CLASS ***************************** */

class GuiSceneBabylon{
  constructor(){}
  
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

  getArtistIndexByOrder(order: number):number{

    let newIndex: number = -1;

    artist.forEach(artistElement => {
      if(artistElement.order === order) newIndex = artistElement.arrayIndex;
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
  
  getCuadroArtistByAbsOrder(absOrder: number): number{

    let newArtistIndex: number = -1;
    //let cuadroID: number = id;
    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement => {
        if(cuadroElement.absoluteOrder === absOrder) newArtistIndex = cuadroElement.myArtist;
      });
    });
    

    return newArtistIndex;

  }

  getCuadroOrientationByAbsOrder(absOrder: number): string{

    let newOrientation: string = "";
    //let cuadroID: number = id;
    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement => {
        if(cuadroElement.absoluteOrder === absOrder) newOrientation = cuadroElement.orientation;
      });
    });
    

    return newOrientation;

  }

  getCuadroIndexByOrder(order: number, artist: Artist):number{

    let newIndex: number = -1;
    //let cuadroID: number = id;

    artist.cuadro.forEach(cuadroElement => {
      if(cuadroElement.order === order) newIndex = cuadroElement.arrayIndex;
    });

    return newIndex;
  }

  getCuadroPositionsByID(id:number): Vector3{

    let newCuadroPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement =>{
        if(cuadroElement.absoluteOrder === id) newCuadroPos = cuadroElement.position;
      });
        
    });

    return newCuadroPos;
  }

  getCuadroViewerPositionsByID(id:number): Vector3{

    let newCuadroPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement =>{
        if(cuadroElement.absoluteOrder === id) newCuadroPos = cuadroElement.viewerPosition;
      });
        
    });

    return newCuadroPos;
  }

  selectArtist(artistOrderID: number): void{

    let pos = this.getArtistPositionsByID(artistOrderID);
    let viewPos = this.getArtistViewerPositionsByID(artistOrderID);

    actualArtist = artistOrderID;

    targetPosition = new Vector3(pos.x, pos.y, pos.z);
    targetCameraPosition = new Vector3(viewPos.x, viewPos.y, viewPos.z);
    
    camera.useAutoRotationBehavior = false;
 
    canvas.classList.remove('horizTranslate');
    canvas.classList.add('resetPosition');

    actualAbsoluteCuadro = artist[this.getArtistIndexByOrder(artistOrderID)].firstCuadroAbsoluteOrder - 1;

    cameraAtCenter = false;
    cameraLevel = 1;

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

  selectCuadro(cuadroAbsoluteID: number): void{

    let pos = this.getCuadroPositionsByID(cuadroAbsoluteID);
    let viewPos = this.getCuadroViewerPositionsByID(cuadroAbsoluteID);

    actualAbsoluteCuadro = cuadroAbsoluteID;

    actualArtist = this.getCuadroArtistByAbsOrder(cuadroAbsoluteID);
    
    
    targetPosition = new Vector3(pos.x, pos.y, pos.z);
    targetCameraPosition = new Vector3(viewPos.x, viewPos.y, viewPos.z);

    apuntador.position = new Vector3(pos.x, pos.y + 0.5, pos.z);

    let actualCuadroOrientation: string = this.getCuadroOrientationByAbsOrder(cuadroAbsoluteID);

    /* if(actualCuadroOrientation == "north" || actualCuadroOrientation == "south"){
      apuntador.rotation.z = Tools.ToRadians(90);
      apuntador.rotation.x = Tools.ToRadians(0);
    }
    else if(actualCuadroOrientation == "east" || actualCuadroOrientation == "west")
    {
      apuntador.rotation.x = Tools.ToRadians(90);
      apuntador.rotation.z = Tools.ToRadians(0);
    }  */   
    
    cameraAtCenter = false;
    cameraLevel = 2;

    camera.useAutoRotationBehavior = false;
    camera.detachControl(canvas);

    canvas.classList.remove('horizTranslate');
    canvas.classList.add('resetPosition');

  }

  next_cuadro(): void{  
    actualAbsoluteCuadro = (actualAbsoluteCuadro + 1)% numCuadros;
    this.selectCuadro(actualAbsoluteCuadro);
  }

  prev_cuadro(): void{ 
    if(actualAbsoluteCuadro > 0){
      actualAbsoluteCuadro = (actualAbsoluteCuadro + (numCuadros-1))%numCuadros;
    }
    else{
      actualAbsoluteCuadro = numCuadros - 1; 
    }
    this.selectCuadro(actualAbsoluteCuadro);
  }

  getMovieIndexByID(id: number, movies: Movie[]):number{

    let newIndex: number = -1;
    //let cuadroID: number = id;

    movies.forEach(movieElement => {
      if(movieElement.id === id) newIndex = movieElement.arrayIndex;
    });

    return newIndex;
  }

  center_camera(): void{
  
    targetPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
    targetCameraPosition = camera.position;
    oldTargetCameraPosition = targetCameraPosition;

    canvas.classList.remove('horizTranslate');
    canvas.classList.add('resetPosition');

    camera.attachControl(canvas);

    cameraAtCenter = true;
    cameraLevel = 0;

    camera.useAutoRotationBehavior = true;
    camera.angularSensibilityX = -5000;

    if(camera.autoRotationBehavior !== null){
      camera.autoRotationBehavior.idleRotationSpeed = 0.05;
    } 
  }

  /** AUTO PLAY CAMERA */

  private intervalID: NodeJS.Timeout;
  private autoPlaySetted: boolean = false;

  setCameraAutoPlay(set: boolean){
    if(set && !this.autoPlaySetted){
      this.intervalID = setInterval( function() {
        guiVI.next_artist();
      }, 8000);
      this.autoPlaySetted = true;
      guiVI.next_artist();

    }
    else{
      clearInterval(this.intervalID);
      this.autoPlaySetted = false;

      
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


/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

/** MAIN SCENE 
Main function that is async so we can call the scene manager with await
*/

const main = async () => {
  //createSkybox(URL_SCENE_JS);

  const light01 = new HemisphericLight("light1", new Vector3(3, 1, 1), scene);
  const light02 = new HemisphericLight("light2", new Vector3(-3, 1, -1), scene);
  const light03 = new HemisphericLight("light3", new Vector3(0, 1, 0), scene);

  light01.intensity = 0.8;
  light02.intensity = 0.8;
  light03.intensity = 0.8;

  apuntador= Mesh.CreateTorus("apuntador", 0.08, 0.02, 3, scene);
  apuntador.rotation.x = Tools.ToRadians(90);
  apuntador.position = new Vector3(0, 10, 0);
  let apuntadorMat = new StandardMaterial("greenMat", scene);
  apuntadorMat.diffuseColor = new Color3(0, 1, 0);

  apuntador.material = apuntadorMat;

  

  /** IMPORTACIÓN DE LA ESCENA DE BLENDER 
   * 
   * Las mallas que llegan importadas desde Blender deben ser 
   * manipuladas dentro de la misma función que las importa.
   * 
  */
  SceneLoader.ImportMesh(
    "",
    URL_SCENE_JS+"data/models/",
    "thisBronxScene.babylon",
    scene,
    function (importedMeshes) {

      let index = 0;
      let movieIndex = 0;
      let cuadroAbsoluteOrder = 0;

      let sceneMaterials = getMeshesMaterials(importedMeshes);
      setTimeout(function(){
        setMeshesMaterials(importedMeshes,sceneMaterials);
        createSkybox(URL_SCENE_JS);
      },11000);


      importedMeshes.forEach(newMesh => {
        console.log(newMesh);
        if(newMesh.material){
          let meshTexture = newMesh.material.getActiveTextures()[0] as Texture;
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

        }
      });
      
      for(let i=0; i < artist.length; i++){

        let artistIndex = guiVI.getArtistIndexByOrder(i);

        for(let j=0; j < artist[artistIndex].cuadro.length; j++){

          let cuadroIndex = guiVI.getCuadroIndexByOrder(j, artist[artistIndex]);

          if(j === 0){
            artist[artistIndex].firstCuadroAbsoluteOrder = cuadroAbsoluteOrder;
          }

          artist[artistIndex].cuadro[cuadroIndex].absoluteOrder = cuadroAbsoluteOrder ;

          cuadroAbsoluteOrder++;
        }
      }


      numArtists = artist.length;
      numCuadros = cuadroAbsoluteOrder;
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
        room.metadata = "sala";
        //room.checkCollisions = true;
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

        canvas.classList.remove('horizTranslate');
        canvas.classList.add('resetPosition');

        function predicate(mesh: AbstractMesh){
          if (mesh === targetBox){
            return false;
          }
          return true;
        }

        let pickMesh: Ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
        let hit: PickingInfo = scene.pickWithRay(pickMesh, predicate) as PickingInfo;

        let cuadrosName = "cuadro";
        let moviesName = "movie";

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

              camera.angularSensibilityX = 5000;

              let currentArtistIndex: number = -1;

              if(hit.pickedMesh.parent != null){
                 
                 currentArtistIndex = guiVI.getArtistIndexByName(hit.pickedMesh.parent.name);

              }
            
              if(actualArtist !== iArtist){
                actualArtist = iArtist;
                guiVI.selectArtist(actualArtist);
                
              }
              else{
                let cuadroIndex:number = guiVI.getCuadroIndexByOrder(iCuadro, artist[currentArtistIndex]);
                let currentCuadro = artist[currentArtistIndex].cuadro[cuadroIndex];
                let currentCuadroAbsoluteIndex: number = artist[currentArtistIndex].cuadro[cuadroIndex].absoluteOrder

                if(actualAbsoluteCuadro !== artist[currentArtistIndex].cuadro[cuadroIndex].absoluteOrder){
                
                  guiVI.selectCuadro(currentCuadroAbsoluteIndex);

                }
                else{
                  console.log("show Cuadro info");
                  //canvas.width = canvas.width - 500;
                  canvas.classList.remove('resetPosition');
                  canvas.classList.add('horizTranslate');

                  try {
                    globalThis.bronxControl.showInfoByPostSlug(currentCuadro.slug,175);
                  } catch (error) {
                    console.log("No hay informacion detallada del cuadro")
                  }
                }
              }
            }
            else if (hit.pickedMesh && hit.pickedMesh.metadata === moviesName) {

              let currentMoviePos: Vector3 = new Vector3();
              let currentMovieViewPos: Vector3 = new Vector3();
              let currentMovieIndex: number = -1;

              if(hit.pickedMesh != null){

                currentMoviePos = guiVI.getMoviePositionsByName(hit.pickedMesh.name);
                currentMovieViewPos = guiVI.getMovieViewPositionsByName(hit.pickedMesh.name);
                currentMovieIndex = guiVI.getMovieIndexByName(hit.pickedMesh.name);

                camera.useAutoRotationBehavior = false;

             }

              let movieIndex:number = guiVI.getMovieIndexByID(parseInt(hit.pickedMesh.id), movies);

              if(actualMovie !== movieIndex){
                actualMovie = movieIndex;
                targetCameraPosition = new Vector3(currentMovieViewPos.x, currentMovieViewPos.y, currentMovieViewPos.z);
              
                targetPosition = new Vector3(currentMoviePos.x, currentMoviePos.y, currentMoviePos.z);
              }

              if(!movies[movieIndex].videoTexturePlaying){
                movies[movieIndex].videoTexture.video.play();
                movies[movieIndex].videoTexturePlaying = true;
              }
              else{
                movies[movieIndex].videoTexture.video.pause();
                movies[movieIndex].videoTexturePlaying = false;
              }

            }
            else{
              canvas.classList.remove('horizTranslate');
              canvas.classList.add('resetPosition');
            }


          }
        }
      }
    }
  );
  
  /** Animation Loop */
 /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  let time = 0;

  scene.registerBeforeRender(function() {
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

          }
          if(Math.abs(camera.position.x - targetCameraPosition.x) < 0.02 && Math.abs(camera.position.y - targetCameraPosition.y) < 0.02 && Math.abs(camera.position.z - targetCameraPosition.z) < 0.02){
              oldTargetCameraPosition = targetCameraPosition;

          }


          
      }

      time += 0.05;
      let apuntadorPosition: number;

      if(cameraLevel == 2){
        apuntadorPosition = targetBox.position.y + 0.5 + Math.sin(time)*0.03;
      }
      else{
        apuntadorPosition = targetBox.position.y + 5;
      }
      apuntador.position = new Vector3(apuntador.position.x, apuntadorPosition, apuntador.position.z);
      apuntador.rotation.y = (apuntador.rotation.y + Tools.ToRadians(1))%Tools.ToRadians(360);

      /** Camera colides with wall and return */
       /* camera.onCollide = function(collider) {
            if(collider.name === 'limits') {
                //console.log('onCollide', collider.name);
                camera.autoRotationBehavior.idleRotationSpeed = camera.autoRotationBehavior.idleRotationSpeed*(-1)
          
            } 
        
      } */
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


/** Buttons events */
 /**************************** CONTROL NAVIGATION BUTTONS ************************************************/

globalThis.virtualInButtonClick = function(buttonClickData){
  let buttonId = buttonClickData.id;
  switch(buttonId) { 
    case 'VI_GUI_Left': { 
      guiVI.prev_artist();
      console.log("VI_GUI_Left at Babylon");
       break; 
    } 
    case 'VI_GUI_Right': { 
      guiVI.next_artist();
      console.log("VI_GUI_Right at Babylon");
       break; 
    } 
    case 'VI_GUI_Down': { 
      guiVI.prev_cuadro();
      console.log("VI_GUI_Down at Babylon");
       break; 
    } 
    case 'VI_GUI_Up': { 
      guiVI.next_cuadro();
      console.log("VI_GUI_Up at Babylon");
       break; 
    } 
    case 'VI_GUI_Center': { 
      guiVI.center_camera();
      console.log("VI_GUI_Center at Babylon");
       break; 
    } 
    case 'VI_GUI_Play': { 
      guiVI.setCameraAutoPlay(true);
       break; 
    } 
  } 
  console.log("Button clicked: "+buttonId);
  console.log(buttonClickData);
}

/** Keyboard events */
 /**************************** Key Control Multiple Keys ************************************************/

 scene.onKeyboardObservable.add((kbInfo) => {

  canvas.classList.remove('horizTranslate');
  canvas.classList.add('resetPosition');

  switch (kbInfo.type) {
      case KeyboardEventTypes.KEYDOWN:
          //console.log("KEY DOWN: ", kbInfo.event.key);
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
            case "ArrowUp":
              guiVI.next_cuadro();
              break;
            case "ArrowDown":
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


