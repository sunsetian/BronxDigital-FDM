//imports
import 'pepjs';
//import '@babylonjs/loaders';
import { Artist, Movie } from './Artist';
//import * as cannon from 'cannon';

import { HemisphericLight, Vector3, SceneLoader, AbstractMesh, Mesh, StandardMaterial, PickingInfo, Ray, Matrix, ArcRotateCamera, Tools, VideoTexture, Texture, ActionManager, ExecuteCodeAction, KeyboardEventTypes, VideoTextureSettings, AssetsManager, Color3, InterpolateValueAction } from '@babylonjs/core'
import { createEngine, createScene, createSkybox, createArcRotateCamera, getMeshesMaterials, setMeshesMaterials, setupVoltajeArcRotateCamera} from './babylon'

import { SampleMaterial } from "./Materials/SampleMaterial"

//import * as viAPI from './virtualInsanityAPI'

const canvas: HTMLCanvasElement = document.getElementById('virtualInsanityCanvas') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

let room:Mesh;
let limits:Mesh;
let sceneModel: Mesh;

let targetBox: Mesh;
let targetPosition: Vector3;
let targetCameraPosition: Vector3;
let roomCenter: Vector3;
let apuntador: Mesh 

let artist: Artist[]  = [];
let numArtists: number =  0;
let numCuadros: number =  0;
let actualArtist: number = 0;
let actualAbsoluteCuadro: number = 0;
let movies: Movie[] = []
let numMovies: number = 0;
let actualMovie: number = -1;

const numVentanas: number = 0;

let targetSpeed: number = 0.03;
let cameraSpeed: number = 0.015;

const targetVoltajeSpeed: number = 0.04;
const cameraVoltajeSpeed: number = 0.03;

let sceneName: string = "auto";

let cameraSetted: boolean = false;
let cameraAtCenter: boolean = true;

let cameraLevel: number = 0;

var URL_SCENE_JS:string;//Todo pasar a archivo de importacion API

let camera: ArcRotateCamera = createArcRotateCamera() as ArcRotateCamera;

var oldTargetPosition: Vector3;
var oldTargetCameraPosition: Vector3;

/* ******************************* GUI SCENE BABYLON CLASS ***************************** */

/**GUI SCENE CLASS*/
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
    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement => {
        if(cuadroElement.absoluteOrder === absOrder) newArtistIndex = cuadroElement.myArtist;
      });
    });
    return newArtistIndex;
  }

  getActualCuadroSlugByAbsOrder(absOrder: number): string{
    let newArtistSlug: string = "";
    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement => {
        if(cuadroElement.absoluteOrder === absOrder) newArtistSlug = cuadroElement.slug;
      });
    });
    return newArtistSlug;
  }

  getCuadroOrientationByAbsOrder(absOrder: number): string{
    let newOrientation: string = "";
    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement => {
        if(cuadroElement.absoluteOrder === absOrder) newOrientation = cuadroElement.orientation;
      });
    });
    return newOrientation;
  }

  getCuadroIndexByOrder(order: number, artist: Artist):number{
    let newIndex: number = -1;
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
    actualAbsoluteCuadro = artist[this.getArtistIndexByOrder(artistOrderID)].firstCuadroAbsoluteOrder;
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
    cameraAtCenter = false;
    cameraLevel = 2;
    camera.useAutoRotationBehavior = false;
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

  next_navigation(): void{
    this.setCameraAutoPlay(false);
    if(cameraLevel == 1){
      this.next_artist();
    }
    else if(cameraLevel == 2 || cameraLevel == 3){
      this.next_cuadro();
    }
  }

  prev_navigation(): void{
    this.setCameraAutoPlay(false);
    if(cameraLevel == 1){
      this.prev_artist();
    }
    else if(cameraLevel == 2 || cameraLevel == 3){
      this.prev_cuadro();
    }
  }

  next_view_level(): void{  /// Mejor control de Navegación
    this.setCameraAutoPlay(false); 
    if(cameraLevel == 0){
      this.selectArtist(actualArtist);
    }
    else if(cameraLevel == 1){
      this.selectCuadro(actualAbsoluteCuadro);
    }
    else if(cameraLevel == 2){
      let currentCuadroSlug = guiVI.getActualCuadroSlugByAbsOrder(actualAbsoluteCuadro);
      this.showCuadroInfo(currentCuadroSlug)
    }
  }

  prev_view_level(): void{
    this.setCameraAutoPlay(false);
    if(cameraLevel == 3){
      cameraLevel = 2;
    }
    else if(cameraLevel == 2){
      this.selectArtist(actualArtist);
    }
    else if(cameraLevel == 1){
      this.center_camera();
    }
  }

  showCuadroInfo(thisCuadroSlug){
    canvas.classList.remove('resetPosition');
    canvas.classList.add('horizTranslate');
    try {
      globalThis.bronxControl.showInfoByPostSlug(thisCuadroSlug,175);
      console.log("Show Info de: " + thisCuadroSlug);
      cameraLevel = 3;
    } catch (error) {
      console.log("No hay informacion detallada del cuadro")
    }
  }

  getMovieIndexByID(id: number, movies: Movie[]):number{
    let newIndex: number = -1;
    movies.forEach(movieElement => {
      if(movieElement.id === id) newIndex = movieElement.arrayIndex;
    });
    return newIndex;
  }

  center_camera(): void{
    if(this.intervalID != null){
      this.setCameraAutoPlay(false);
    }
    
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

    let rotationSpeed = 0.05;
    if(sceneName == "voltaje"){
      rotationSpeed = -0.1;
    }
    if(camera.autoRotationBehavior !== null){
      camera.autoRotationBehavior.idleRotationSpeed = rotationSpeed;
    } 
    cameraLevel = 0;
  }

  /** AUTO PLAY CAMERA */

  private intervalID: NodeJS.Timeout;
  public autoPlaySetted: boolean = false;

  setCameraAutoPlay(set: boolean): void{
    console.log("autoplay is before: " + this.autoPlaySetted)
    if(set && !this.autoPlaySetted){
      this.intervalID = setInterval( function() {
        if(cameraLevel < 2){
          guiVI.next_artist();
        }
        else{
          guiVI.next_cuadro();
        }
      }, 8000);

      this.autoPlaySetted = true; 
      document.getElementById("VI_GUI_Play").getElementsByTagName('a')[0].textContent = "stop auto";
      if(cameraLevel < 2){
        this.next_artist();
      }
      else{
        this.next_cuadro();
      }
    }
    else{
      if(this.autoPlaySetted){
        clearInterval(this.intervalID);
        this.autoPlaySetted = false;
        document.getElementById("VI_GUI_Play").getElementsByTagName('a')[0].textContent = "auto play";
      }
    }
    console.log("autoplay is after: " + this.autoPlaySetted)
  }

  // PROXIMAMENTE DEPRECATED
  toggle_camera(): void{
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

var guiVI = new GuiSceneBabylon()
/** SCENE GUI CLASS END */ 

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

/** MAIN SCENE 
Main function that is async so we can call the scene manager with await
*/

const main = async () => {
  
  /** Carga de los elementos de la escena creados por codigo */
  function loadCodedSceneElements():void{

    if(sceneName == "voltaje"){
      createSkybox(URL_SCENE_JS);
    } 
    
    let light01: HemisphericLight;
    let light02: HemisphericLight;
    let light03: HemisphericLight;

    if(sceneName == "voltaje"){
      light01 = new HemisphericLight("light1", new Vector3(0, 3, -15), scene);
      light02 = new HemisphericLight("light2", new Vector3(-25, 7, 0), scene);
      light03 = new HemisphericLight("light3", new Vector3(0, 3, 15), scene);
      
      light01.intensity = 0.1;
      light02.intensity = 0.3;
      light03.intensity = 0.1;

      light01.diffuse = new Color3(0.0, 1, 0);
      light02.diffuse = new Color3(0.5, 0.7, 0.7);
      light03.diffuse = new Color3(1, 0, 0);
    }
    else{
      light01 = new HemisphericLight("light1", new Vector3(3, 1, 1), scene);
      light02 = new HemisphericLight("light2", new Vector3(-3, 1, -1), scene);
      light03 = new HemisphericLight("light3", new Vector3(0, 1, 0), scene);

      light01.intensity = 0.8;
      light02.intensity = 0.8;
      light03.intensity = 0.8;
    }

    apuntador= Mesh.CreateTorus("apuntador", 0.08, 0.02, 3, scene);
    apuntador.rotation.x = Tools.ToRadians(90);
    apuntador.position = new Vector3(0, 10, 0);
    let apuntadorMat = new StandardMaterial("greenMat", scene);
    apuntadorMat.diffuseColor = new Color3(0, 1, 0);

    apuntador.material = apuntadorMat;
  }

  /** IMPORTACIÓN DE LA ESCENA DE BLENDER 
   * 
   * Las mallas que llegan importadas desde Blender deben ser 
   * manipuladas dentro de la misma función que las importa.
   * 
  */

  SceneLoader.ImportMesh(
    "",
    URL_SCENE_JS+"data/models/",
    "thisBabylonScene.babylon", // MEJOR UTILIZAR ESTE FORMATO DE NOMBRE PARA LOS MODELOS thisBabylonScene.babylon
    scene,
    function (importedMeshes) {

      let index = 0;
      let movieIndex = 0;
      let cuadroAbsoluteOrder = 0;

        if(scene.getMeshByName("Room.000")){  
          room = scene.getMeshByName("Room.000") as Mesh;
          room.metadata = "sala";
          //room.checkCollisions = true;
          room.freezeWorldMatrix();
  
          roomCenter = new Vector3(room.position.x, room.position.y + 1.7, room.position.z);
        
        }
  
        // INCLUIR EN EL MASTER
        if(scene.getMeshByName("Voltaje.000")){
          sceneName = "voltaje";
  
          sceneModel = scene.getMeshByName("Voltaje.000") as Mesh;
          sceneModel.metadata = "scenario";
          sceneModel.freezeWorldMatrix(); // ESTOS FreezWorldMatrix son para optimizar rendimiento en objetos inmoviles.
  
          targetSpeed = targetVoltajeSpeed;
          cameraSpeed = cameraVoltajeSpeed;
  
          camera = setupVoltajeArcRotateCamera(camera, roomCenter);
  
          loadCodedSceneElements(); // CONTINÚE LOADING DESPUES DE HABER DECLARADO EL NOMBRE DE LA ESCENA!!!
  
        }
  
        if(scene.getMeshByName("Limits.000")){
          limits = scene.getMeshByName("Limits.000") as Mesh;
          limits.metadata = "limits";
          limits.name = "limits";
          limits.checkCollisions = true;
          limits.visibility = 0;
          limits.freezeWorldMatrix();
        }

      let sceneMaterials = getMeshesMaterials(importedMeshes);
      setTimeout(function(){
        setMeshesMaterials(importedMeshes,sceneMaterials);
        createSkybox(URL_SCENE_JS);
      },11000);

      /** LOOP DE MESHES CARGADOS PARA ASIGNARLES COSAS */
      importedMeshes.forEach(newMesh => {
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
          artist.push(new Artist(newMesh, index, sceneName, scene));
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

      targetPosition = new Vector3(roomCenter.x, roomCenter.y + 1.7, roomCenter.z);
      targetCameraPosition = new Vector3(roomCenter.x, roomCenter.y + 1.7, roomCenter.z);
      oldTargetPosition = new Vector3(roomCenter.x, roomCenter.y + 1.7, roomCenter.z);
      oldTargetCameraPosition = targetCameraPosition;

      // TODO Sacar esto fuera del SceneImport
      targetBox = Mesh.CreateBox("TargetBox.000", 0.5, scene);
      let baseMat = new StandardMaterial("BaseMaterial", scene);

      baseMat.alpha = 0.0;

      targetBox.material = baseMat;

      targetBox.position = targetPosition;

      if(camera !== undefined && targetBox !== undefined && cameraSetted === false){
        camera.setTarget(targetBox.position); /// USAR .position para mas compatibilidad
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
          if (mesh === targetBox || mesh === room || mesh === limits || mesh === sceneModel){
            return false;
          }
          return true;
        }

        let pickMesh: Ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
        let hit: PickingInfo = scene.pickWithRay(pickMesh, predicate) as PickingInfo;

        let cuadrosName = "cuadro";
        let moviesName = "movie";

        if(hit.pickedMesh != null){
          guiVI.setCameraAutoPlay(false); 
         
          if(hit.pickedMesh.metadata != null){

            if (hit.pickedMesh && hit.pickedMesh.metadata === cuadrosName) {
              let currentMesh: AbstractMesh = new AbstractMesh("");
              if(hit.pickedMesh!= null){  
                currentMesh = hit.pickedMesh;
              }
            
              oldTargetPosition = targetPosition;
              oldTargetCameraPosition = targetCameraPosition;

              let iArtistOrdered = parseInt(currentMesh.id.split("_")[0]); 
              let iCuadroOrdered = parseInt(currentMesh.id.split("_")[1])-1;

              camera.angularSensibilityX = 5000; /// Para cambiar la direccion de la rotacion de la camara al hacer GRAB 

              let currentArtistIndex: number = -1;

              if(hit.pickedMesh.parent != null){
                 currentArtistIndex = guiVI.getArtistIndexByName(hit.pickedMesh.parent.name);
              }

              if(actualArtist !== iArtistOrdered){
                actualArtist = iArtistOrdered;
                guiVI.selectArtist(actualArtist);
              }
              else{
                let cuadroIndex:number = guiVI.getCuadroIndexByOrder(iCuadroOrdered, artist[currentArtistIndex]);
                let currentCuadro = artist[currentArtistIndex].cuadro[cuadroIndex];
                let currentCuadroAbsoluteIndex: number = artist[currentArtistIndex].cuadro[cuadroIndex].absoluteOrder

                if(cameraLevel == 1){
                  guiVI.selectCuadro(currentCuadroAbsoluteIndex);
                }
                else{
                  if(cameraLevel == 2){
                    guiVI.showCuadroInfo(currentCuadro.slug);
                  }
                  else if(cameraLevel == 3){
                    guiVI.selectCuadro(currentCuadroAbsoluteIndex);
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

              if(sceneName == "voltaje"){
                movies.forEach(movie => {
                  movie.videoTexture.video.play();
                });
              }
              else{
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
            else{
              guiVI.prev_navigation();
              canvas.classList.remove('horizTranslate');
              canvas.classList.add('resetPosition');
            }
          }
        }
      }
    },
    function (evt) {
      // onProgress
      let loadedPercent: string = "";
      if (evt.lengthComputable) {
          loadedPercent = (evt.loaded * 100 / evt.total).toFixed();
      } else {
          var dlCount = evt.loaded / (1024 * 1024);
          loadedPercent = (Math.floor(dlCount * 100.0) / 100.0) + "";
      }
      console.log("loadedPercent: " + loadedPercent + "%");
      if(loadedPercent == "100"){
        console.log("LOADED");
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
              camera.position = new Vector3(camera.position.x*(1-cameraSpeed) + targetCameraPosition.x*cameraSpeed, camera.position.y*(1-cameraSpeed) + targetCameraPosition.y*cameraSpeed, camera.position.z*(1-cameraSpeed) + targetCameraPosition.z*cameraSpeed);
          }
          if(Math.abs(camera.position.x - targetCameraPosition.x) < 0.1 && Math.abs(camera.position.y - targetCameraPosition.y) < 0.1 && Math.abs(camera.position.z - targetCameraPosition.z) < 0.1){
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

      // NO BORRAR: POSIBLE USO
      /** Camera colides with wall and return */
       /* camera.onCollide = function(collider) {
            if(collider.name === 'limits') {
                camera.autoRotationBehavior.idleRotationSpeed = camera.autoRotationBehavior.idleRotationSpeed*(-1)
            } 
      } ************* */

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
      guiVI.prev_navigation();
      console.log("VI_GUI_Left at Babylon");
       break; 
    } 
    case 'VI_GUI_Right': { 
      guiVI.next_navigation();
      console.log("VI_GUI_Right at Babylon");
       break; 
    } 
    case 'VI_GUI_Down': { 
      guiVI.prev_view_level();
      console.log("VI_GUI_Down at Babylon");
       break; 
    } 
    case 'VI_GUI_Up': { 
      guiVI.next_view_level();
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
      console.log("VI_GUI_Play at Babylon");
       break; 
    } 
  } 
  console.log("Button clicked: "+buttonId);
}

/** Keyboard events */
 /**************************** Key Control Multiple Keys ************************************************/

 scene.onKeyboardObservable.add((kbInfo) => {

  canvas.classList.remove('horizTranslate');
  canvas.classList.add('resetPosition');

  switch (kbInfo.type) {
      case KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key){
            case "c":
              guiVI.center_camera();
              break;
            case "ArrowRight":
              guiVI.next_navigation();
              break;
            case "ArrowLeft":
              guiVI.prev_navigation();
              break;
            case "ArrowUp":
              guiVI.next_view_level();
              break;
            case "ArrowDown":
              guiVI.prev_view_level();
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


