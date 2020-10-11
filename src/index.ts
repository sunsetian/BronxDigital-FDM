/** Versión: 0.9.4.2.Seb.4 */

//imports
import 'pepjs';
//import '@babylonjs/loaders';
import { Artist, Cuadro, Movie } from './Artist';
//import * as cannon from 'cannon';

import { HemisphericLight, Vector3, SceneLoader, AbstractMesh, Mesh, StandardMaterial, PickingInfo, Ray, Matrix, ArcRotateCamera, Tools, KeyboardEventTypes, Color3, PBRMaterial, Sound, Color4} from '@babylonjs/core'
import { createEngine, createScene, createSkybox, createArcRotateCamera, getMeshesMaterials, setMeshesMaterials, setupVoltajeArcRotateCamera} from './babylon'

import { SampleMaterial } from "./Materials/SampleMaterial"

//import * as viAPI from './virtualInsanityAPI'

const canvas: HTMLCanvasElement = document.getElementById('virtualInsanityCanvas') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()
const ID_POPUP_INFO = 175;
const ID_POPUP_VOLTAJE_INFO = 8336;

let room:Mesh;
let limits:Mesh;
let sceneModel: Mesh;

let targetBox: Mesh;
let targetPosition: Vector3;
let targetCameraPosition: Vector3;
let roomCenter: Vector3;
let apuntador: Mesh;

let currentCuadro: Cuadro;

let artist: Artist[]  = [];
let numArtists: number =  0;
let numCuadros: number =  0;
let actualArtist: number = 0;
let initArtistSlug: string;
let actualAbsoluteCuadro: number = 0;
let movies: Movie[] = []
let numMovies: number = 0;
let actualMovie: number = -1;
let currentCuadroAbsoluteIndex: number = 0;
let currentCuadroPrevAbsoluteIndex: number = 0;

let playTimeLine: number = 0.0;
let autoPlayDuration: number = 8000.0;

let targetSpeed: number = 0.03;
let cameraSpeed: number = 0.027;

const targetVoltajeSpeed: number = 0.03;
const cameraVoltajeSpeed: number = 0.027;

let sceneName: string = "auto";

let cameraSetted: boolean = false;

let cameraLevel: number = 0;
let firstClick:boolean = true;

var URL_SCENE_JS:string;//Todo pasar a archivo de importacion API

let camera: ArcRotateCamera = createArcRotateCamera() as ArcRotateCamera;

var oldTargetPosition: Vector3;
var oldTargetCameraPosition: Vector3;

let sound: Sound;
let soundIsActive = false;
let soundIsPlaying = false;

let idIlluminated = false;

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 
/* ******************************* GUI SCENE BABYLON CLASS ***************************** */

/**GUI SCENE CLASS*/
class GuiSceneBabylon{
  constructor(){
    
  }
  initPosArtist(){
    this.getVarsFromUrl();
    if(initArtistSlug){
      this.gotoArtistBySlug(removeAccents(initArtistSlug));
      
      //setTimeout(function(){globalThis.bronxControl.loadInfoByPostSlug(initArtistSlug,ID_POPUP_INFO);},3000);
      //setTimeout(function(){globalThis.bronxControl.showInfo(ID_POPUP_INFO) ;},4000);
    }
  }
  
  getVarsFromUrl(){
    let varsArray = location.search.substring(1,location.search.length).split("&");
    varsArray.forEach(varUrl => {
      if(varUrl){
        let newVar = varUrl.split("=");
        console.log("varUrl captured: "+newVar[0]+"="+newVar[1]);
        if (isNaN(parseFloat(newVar[1])))
          eval(newVar[0]+"='"+unescape(newVar[1])+"';");
        else
          eval(newVar[0]+"="+newVar[1]+";");
      }
    });
  }

  isIndexButton(button):boolean{
    let result = false;
    let classNames = button.classNames;
    for(let i=0; i< classNames.length;i++){
      if(classNames[i]==='VI_index_posts'){
        result = true;
        break;
      }
    }
    return result;
  }

  isArtistInThisRoom(slug: string):boolean{
    let slugFlat = removeAccents(slug);
    let result = false;
    for(let i=0; i< artist.length; i++){
      if(artist[i].slug === slugFlat){
        result=true;
        break;
      }
    }
    return result;
  }

  cleanRoomIndex(){
    console.log("CleanRoomIndex");
    let indexContainer = document.getElementsByClassName("indexRoom")[0];
    console.log(indexContainer);
    if(indexContainer){
      let indexRoom = indexContainer.children;
      for (let i = 0; i < indexRoom.length; i++){
        let a = indexRoom[i].getElementsByTagName("a")[0];
        console.log("artistas en la sala" + a.textContent);
        let slugFlat = removeAccents(a.getAttribute("slug"));
        if(!this.isArtistInThisRoom(slugFlat)){
          indexContainer.removeChild(indexRoom[i]);
          i--;
        }
      }
    }

  }
  
  gotoPageByArtistSlugs(artistSlug: string, roomSlug: string):void{
    let artistSlugFlat=removeAccents(artistSlug);
    let roomSlugFlat=removeAccents(roomSlug);
    //alert(roomSlugFlat);
    let urlRoom = location.origin+'/'+ roomSlugFlat;
    let varsUsr = "?initArtistSlug="+artistSlugFlat;
    window.open(urlRoom+varsUsr,"_self");
  }
  gotoCuadroBySlug(slug: string): void{
    let slugFlat = removeAccents(slug);
    artist.forEach(artistElement => {
      for(let i=0; i<artistElement.cuadro.length; i++)
      {
        let cuadroElement = artistElement.cuadro[i];
        if(cuadroElement.slug === slugFlat){
          this.selectCuadro(cuadroElement.absoluteOrder,cuadroElement.slug);
          break;
        }
      }
    });
  }
  gotoArtistBySlug(slug: string): void{
    let slugFlat = removeAccents(slug);
    console.log("gotoArtistBySlug 1 Slug: " + slugFlat)
    for(let i=0; i<artist.length; i++){
      let artistElement = artist[i];
      console.log("artistElement.slug: "+ artistElement.slug);
      if(artistElement.slug === slugFlat){
        this.selectArtist(artistElement.order);
        break;
      }
    }
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

    getCuadroByAbsOrder(absOrder: number): Cuadro{
      let newCuadro: Cuadro;
      artist.forEach(artistElement => {
        artistElement.cuadro.forEach(cuadroElement => {
          if(cuadroElement.absoluteOrder === absOrder) newCuadro = cuadroElement;
        });
      });
      return newCuadro;
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
    camera.attachControl(canvas, false);
    canvas.classList.remove('horizTranslate');
    canvas.classList.add('resetPosition');
    actualAbsoluteCuadro = artist[this.getArtistIndexByOrder(artistOrderID)].firstCuadroAbsoluteOrder;
    //cameraAtCenter = false;
    cameraLevel = 1;
    this.change();
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

  selectCuadro(cuadroAbsoluteID: number, cuadroSlug = ""): void{

    if(cuadroSlug!="") guiVI.loadCuadroInfo(cuadroSlug);

    let pos = this.getCuadroPositionsByID(cuadroAbsoluteID);
    let viewPos = this.getCuadroViewerPositionsByID(cuadroAbsoluteID);
    actualAbsoluteCuadro = cuadroAbsoluteID;
    actualArtist = this.getCuadroArtistByAbsOrder(cuadroAbsoluteID);
    targetPosition = new Vector3(pos.x, pos.y, pos.z);
    targetCameraPosition = new Vector3(viewPos.x, viewPos.y, viewPos.z);
    apuntador.position = new Vector3(pos.x, pos.y + 0.5, pos.z);
    let actualCuadroOrientation: string = this.getCuadroOrientationByAbsOrder(cuadroAbsoluteID);
    //cameraAtCenter = false;
    cameraLevel = 2;
    camera.useAutoRotationBehavior = false;
    canvas.classList.remove('horizTranslate');
    canvas.classList.add('resetPosition');

    this.change();

    currentCuadro = this.getCuadroByAbsOrder(cuadroAbsoluteID);

    if(currentCuadro.mesh.metadata === "cuadromovie"){
      console.log("play video cuadro");
      currentCuadro.videoTexture.video.play();
      currentCuadro.videoTexturePlaying = true;
    }

  }

  change():void{

    artist.forEach(artistElement => {
      artistElement.cuadro.forEach(cuadroElement =>{
        if(cuadroElement.mesh.metadata === "cuadromovie") {
          
          if(cuadroElement.videoTexturePlaying){

            console.log("currentCuadro.videoTexturePlaying " + currentCuadro.videoTexturePlaying);
            cuadroElement.videoTexture.video.pause();
            cuadroElement.videoTexturePlaying = false;
          }
        }
      });
    });

  }

  next_cuadro(): void{  
    actualAbsoluteCuadro = (actualAbsoluteCuadro + 1)% numCuadros;
    let currentCuadroSlug = guiVI.getActualCuadroSlugByAbsOrder(actualAbsoluteCuadro);
    this.selectCuadro(actualAbsoluteCuadro,currentCuadroSlug);
  }

  prev_cuadro(): void{ 
    if(actualAbsoluteCuadro > 0){
      actualAbsoluteCuadro = (actualAbsoluteCuadro + (numCuadros-1))%numCuadros;
    }
    else{
      actualAbsoluteCuadro = numCuadros - 1; 
    }
    let currentCuadroSlug = guiVI.getActualCuadroSlugByAbsOrder(actualAbsoluteCuadro);
    this.selectCuadro(actualAbsoluteCuadro,currentCuadroSlug);
  }

  next_navigation(): void{
    this.setCameraAutoPlay(false);
    if(cameraLevel == 0){
      this.next_artist();
      
    }
    else if(cameraLevel == 1){
      this.next_artist();
    }
    else if(cameraLevel == 2 || cameraLevel == 3){
      this.next_cuadro();
    }
  }

  prev_navigation(): void{
    this.setCameraAutoPlay(false);
    if(cameraLevel == 0){
      this.prev_artist();  
    }
    else if(cameraLevel == 1){
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
      let currentCuadroSlug = guiVI.getActualCuadroSlugByAbsOrder(actualAbsoluteCuadro);
      this.selectCuadro(actualAbsoluteCuadro,currentCuadroSlug);
    }
    else if(cameraLevel == 2){
      let currentCuadroSlug = guiVI.getActualCuadroSlugByAbsOrder(actualAbsoluteCuadro);
      this.showCuadroInfo()
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

  loadCuadroInfo(thisCuadroSlug){
    console.log("Load Info de: " + thisCuadroSlug);
    try {
      globalThis.bronxControl.loadInfoByPostSlug(thisCuadroSlug,ID_POPUP_INFO);
    } catch (error) {
      console.log("No hay informacion detallada del cuadro, error: "+error);
    }
  }

  showCuadroInfo(){
    try {
      canvas.classList.remove('resetPosition');
      canvas.classList.add('horizTranslate');
      cameraLevel = 3;
      globalThis.bronxControl.showInfo(ID_POPUP_INFO)
    } catch (error) {
      console.log("Paila candonga arete calavera en al frente");
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
    //cameraAtCenter = true;
    cameraLevel = 0;
    camera.angularSensibilityX = -3000;  // SENTIDO EN EL QUE SE AGARRA Y ARRASTRA LA CAMARA
    camera.angularSensibilityY = -3000;
    /* if(sceneName == "voltaje"){
      camera.angularSensibilityX = -3000;
    } */

    if(this.autoPlaySetted){
      camera.useAutoRotationBehavior = true;
     
      let rotationSpeed = 0.05;

      if(sceneName == "voltaje"){
        rotationSpeed = -0.1;
      }
      
      if(camera.autoRotationBehavior !== null){
        camera.autoRotationBehavior.idleRotationSpeed = rotationSpeed;
      } 
    }
    
    cameraLevel = 0;
  }

  /** SOUND STATE */

  setSoundState():void{
    if(soundIsPlaying){
      sound.stop();
      soundIsPlaying = false;
    }
    else{
      sound.play();
      soundIsPlaying = false;
    }
  }

  /** AUTO PLAY CAMERA */

  private intervalID: NodeJS.Timeout;
  public autoPlaySetted: boolean = true;

  setCameraAutoPlay(set?: boolean): void{

    if(set === undefined){
      this.autoPlaySetted = !this.autoPlaySetted;
    }
    else{
      this.autoPlaySetted = set;
    }
    console.log("auto play: " + this.autoPlaySetted );
    if(this.autoPlaySetted){
      if(cameraLevel != 0){
        this.intervalID = setInterval( function() {
          if(cameraLevel < 2){
            guiVI.next_artist();
          }
          else{
            guiVI.next_cuadro();
          }
          playTimeLine = Date.now();
        }, autoPlayDuration);
        playTimeLine = Date.now();
      }

      if(cameraLevel == 0){
        camera.useAutoRotationBehavior = true;
        camera.angularSensibilityX = -3000;  // SENTIDO EN EL QUE SE AGARRA Y ARRASTRA LA CAMARA
        camera.angularSensibilityY = -3000;

        let rotationSpeed = 0.05;
        if(sceneName == "voltaje"){
          rotationSpeed = -0.1;
          //camera.angularSensibilityX = -3000;
        }
        if(camera.autoRotationBehavior !== null){
          camera.autoRotationBehavior.idleRotationSpeed = rotationSpeed;
        }
      }
      else if(cameraLevel < 2){
        this.next_artist();
      }
      else{
        this.next_cuadro();
      }

      this.autoPlaySetted = true; 
      let VI_GUI_Play = document.getElementById("VI_GUI_Play");
      if(VI_GUI_Play){
        VI_GUI_Play.getElementsByTagName('a')[0].textContent = "stop auto";
        VI_GUI_Play.getElementsByTagName('a')[0].style.backgroundColor = "#00ff00";
      }
    }
    else{
    
      clearInterval(this.intervalID);
      this.autoPlaySetted = false;
      let VI_GUI_Play = document.getElementById("VI_GUI_Play");
      if(VI_GUI_Play){
        VI_GUI_Play.getElementsByTagName('a')[0].textContent = "auto play";
        VI_GUI_Play.getElementsByTagName('a')[0].style.backgroundColor = "#d6d6d6";      
      }
      camera.useAutoRotationBehavior = false;
    }
  }
}

var guiVI = new GuiSceneBabylon()
/** SCENE GUI CLASS END */ 

/** DETECTAR SI LA VENTANA ESTA VISIBLE PARA DETENER SONIDO */

document.addEventListener("visibilitychange", function() {
  if(sound !== null && soundIsActive){
    if(document.hidden){
      sound.stop();
      soundIsPlaying = false;
    }
    else{
      sound.play();
      soundIsPlaying = true;
    }
  }
});

playTimeLine = Date.now();

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

/** MAIN SCENE 
Main function that is async so we can call the scene manager with await
*/

const main = async () => {
 
  /** IMPORTACIÓN DE LA ESCENA DE BLENDER 
   * 
   * Las mallas que llegan importadas desde Blender deben ser 
   * manipuladas dentro de la misma función que las importa.
   * 
  */

  createSkybox(URL_SCENE_JS);

   sound = new Sound("sound",  URL_SCENE_JS + "data/sound/texturas-feria_01.mp3", scene, null, {
    loop: true,
    autoplay: false,
    //spatialSound: true,
    //distanceModel: "lineal",
    //rolloffFactor: 0.1
  });

  //sound.setPosition(new Vector3(0, 1.7, 1.5));

  SceneLoader.ImportMesh(
    "",
    URL_SCENE_JS+"data/models/",
    "thisBronxScene.babylon", // MEJOR UTILIZAR ESTE FORMATO DE NOMBRE PARA LOS MODELOS thisBabylonScene.babylon
    //"thisBabylonScene.babylon", 
    scene,
    function (importedMeshes) {

      let index = 0;
      let movieIndex = 0;
      let cuadroAbsoluteOrder = 0;

      let sceneMaterials = getMeshesMaterials(importedMeshes);
      setTimeout(function(){guiVI.cleanRoomIndex();},1000);
      setTimeout(function(){guiVI.initPosArtist();},2000);

      if(scene.getMeshByName("Room.000")){  
        room = scene.getMeshByName("Room.000") as Mesh;
        room.metadata = "sala";
        //room.checkCollisions = true;
        room.freezeWorldMatrix();

        roomCenter = new Vector3(room.position.x, room.position.y + 1.9, room.position.z);
      
      }

      if(scene.getMeshByName("Voltaje.000")){
        sceneName = "voltaje";

        console.log("sceneName " + sceneName);

        //sceneModel = scene.getMeshByName("Voltaje.000") as Mesh;
        //sceneModel.metadata = "scenario";
        //sceneModel.freezeWorldMatrix(); // ESTOS FreezWorldMatrix son para optimizar rendimiento en objetos inmoviles.

        targetSpeed = targetVoltajeSpeed;
        cameraSpeed = cameraVoltajeSpeed;

        camera = setupVoltajeArcRotateCamera(camera, roomCenter);
      }

      //loadCodedSceneElements(); // CONTINÚE LOADING DESPUES DE HABER DECLARADO EL NOMBRE DE LA ESCENA!!!
      let light01: HemisphericLight;
      let light02: HemisphericLight;
      let light03: HemisphericLight;

      if(sceneName == "voltaje"){
        if(!idIlluminated){
          light01 = new HemisphericLight("light1", new Vector3(0, 3, -15), scene);
          light02 = new HemisphericLight("light2", new Vector3(-25, 7, 0), scene);
          light03 = new HemisphericLight("light3", new Vector3(0, 3, 15), scene);
          
          light01.intensity = 0.1;
          light02.intensity = 0.3;
          light03.intensity = 0.1;

          light01.diffuse = new Color3(0.6, 0.6, 0.3);
          light02.diffuse = new Color3(0.5, 0.7, 0.7);
          light03.diffuse = new Color3(0.4, 0.4, 0.2);
          idIlluminated=true;
        }
      }
      else{
        if(!idIlluminated){
          light01 = new HemisphericLight("light1", new Vector3(3, 1, 1), scene);
          light02 = new HemisphericLight("light2", new Vector3(-3, 1, -1), scene);
          light03 = new HemisphericLight("light3", new Vector3(0, 1, 0), scene);

          light01.intensity = 0.8;
          light02.intensity = 0.85;
          light03.intensity = 0.8;

          idIlluminated = true;
        }
      }

      apuntador= Mesh.CreateTorus("apuntador", 0.08, 0.02, 3, scene);
      apuntador.rotation.x = Tools.ToRadians(90);
      apuntador.position = new Vector3(0, 10, 0);
      let apuntadorMat = new StandardMaterial("greenMat", scene);
      apuntadorMat.diffuseColor = new Color3(0, 1, 0);

      apuntador.material = apuntadorMat;
      
      if(scene.getMeshByName("Limits.000")){
        limits = scene.getMeshByName("Limits.000") as Mesh;
        limits.metadata = "limits";
        limits.name = "limits";
        limits.checkCollisions = true;
        limits.visibility = 0;
        limits.freezeWorldMatrix();
      }

      if(scene.getMeshByName("domo_wireframe")){
        let wireframeMaterial: StandardMaterial = new StandardMaterial("wireframeMat_domo", scene);
        wireframeMaterial.wireframe = true;
        let domoWireframe = scene.getMeshByName("domo_wireframe") as Mesh;

        domoWireframe.material = wireframeMaterial;

        domoWireframe.enableEdgesRendering(.9999999999);	
        domoWireframe.edgesWidth = 0.1;
        domoWireframe.edgesColor = new Color4(1, 1, 1, 1);

        domoWireframe.metadata = "domoWireFrame";
      }


      /** LOOP DE MESHES CARGADOS PARA ASIGNARLES COSAS */
      importedMeshes.forEach(newMesh => {

        //console.log("MESH NAME " + newMesh.name);
        
          if(newMesh.material != null){
            let meshMaterial = new PBRMaterial("Mat", scene);
            meshMaterial = newMesh.material as PBRMaterial;
            meshMaterial.backFaceCulling = false;
            if(sceneName != "voltaje"){
              meshMaterial.metallic = 0.2;
            //meshMaterial.roughness = 0.8;
            }
            newMesh.material =  meshMaterial;
          }
        
       
        let meshNames: string[] = newMesh.name.split(".");
        if( meshNames[0] === "Artist" ){
          artist.push(new Artist(newMesh, index, sceneName, URL_SCENE_JS, scene));
          index++;
        }
        if( meshNames[0] === "Movie" ){
          movies.push(new Movie(newMesh as Mesh, movieIndex, URL_SCENE_JS, scene));
          movieIndex++;
        }

        /** CARGA SHADERS COMO LOADING */
       /*  if(newMesh.material){
          let meshTexture = newMesh.material.getActiveTextures()[0] as Texture;
          if(meshTexture ){
            var shaderMaterial = new SampleMaterial("material", scene);
            
            var textureTest = new Texture(URL_SCENE_JS+"data/loadingMeshImage/loadingShader0.jpg", scene);
            shaderMaterial.backFaceCulling = false;
            shaderMaterial.setTexture("uHeightMap", textureTest);
            shaderMaterial.setTexture("uDiffuseMap", meshTexture);
            newMesh.material = shaderMaterial;
          }
        }  */

        /***************/

      });

      setTimeout(function(){
       // setMeshesMaterials(importedMeshes,sceneMaterials);
       let VI_GUI_Play = document.getElementById("VI_GUI_Play");
       if(VI_GUI_Play){
        VI_GUI_Play.getElementsByTagName('a')[0].textContent = "stop auto";
        VI_GUI_Play.getElementsByTagName('a')[0].style.backgroundColor = "#00ff00";
       }
        try {
          globalThis.bronxControl.showInfo(1946);
        } catch (error) {
          console.log("Información no disponible")
        }
        
      },10000);
      
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
    
      /* if(scene.getMeshByName("Limits.000")){
        limits = scene.getMeshByName("Limits.000") as Mesh;
        limits.metadata = "limits";
        limits.name = "limits";
        limits.checkCollisions = true;
        limits.freezeWorldMatrix();
      } */

      /* if(scene.getMeshByName("Room.000")){
        room = scene.getMeshByName("Room.000") as Mesh;
        room.metadata = "sala";
        //room.checkCollisions = true;
        room.freezeWorldMatrix();
      } */

      targetPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
      targetCameraPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
      oldTargetPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
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

        if(!soundIsActive){
          sound.play();
          soundIsActive = true;
          soundIsPlaying = true;
        }

        let pickMesh: Ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
        let hit: PickingInfo = scene.pickWithRay(pickMesh, predicate) as PickingInfo;

        let cuadrosName = "cuadro";
        let moviesName = "movie";
        let cuadrosMovieName = "cuadromovie";

        if(hit.pickedMesh != null){
          guiVI.setCameraAutoPlay(false); 
         
          if(hit.pickedMesh.metadata != null){

            if (hit.pickedMesh && (hit.pickedMesh.metadata === cuadrosName || hit.pickedMesh.metadata === cuadrosMovieName)) {
              let currentMesh: AbstractMesh = new AbstractMesh("");
              if(hit.pickedMesh!= null){  
                currentMesh = hit.pickedMesh;
              }

              console.log("CUADRO NAME " + currentMesh.name)
            
              oldTargetPosition = targetPosition;
              oldTargetCameraPosition = targetCameraPosition;

              let iArtistOrdered = parseInt(currentMesh.id.split("_")[0]); 
              let iCuadroOrdered = parseInt(currentMesh.id.split("_")[1])-1;

              camera.angularSensibilityX = 3000;  // SENTIDO EN EL QUE SE AGARRA Y ARRASTRA LA CAMARA
              camera.angularSensibilityY = 3000;

              let rotationSpeed = 0.05;
              if(sceneName == "voltaje"){
                rotationSpeed = -0.1;
                //camera.angularSensibilityX = -3000;
              }

              let currentArtistIndex: number = -1;

              if(hit.pickedMesh.parent != null){
                 currentArtistIndex = guiVI.getArtistIndexByName(hit.pickedMesh.parent.name);
              }
              //console.log("iArtistOrdered " + iArtistOrdered);
              //console.log("actualArtist " + actualArtist);

              if(actualArtist !== iArtistOrdered || firstClick){
                actualArtist = iArtistOrdered;
                guiVI.selectArtist(actualArtist);
                firstClick = false;
                try {
                  globalThis.bronxControl.showInfo(1955);
                } catch (error) {
                  console.log("Información no disponible")
                }
              }
              else{
                let cuadroIndex:number = guiVI.getCuadroIndexByOrder(iCuadroOrdered, artist[currentArtistIndex]);
                currentCuadro = artist[currentArtistIndex].cuadro[cuadroIndex];
                currentCuadroPrevAbsoluteIndex = currentCuadroAbsoluteIndex;
                currentCuadroAbsoluteIndex = artist[currentArtistIndex].cuadro[cuadroIndex].absoluteOrder

                if(cameraLevel == 1){

                  guiVI.selectCuadro(currentCuadroAbsoluteIndex,currentCuadro.slug);
                  try {
                    globalThis.bronxControl.showInfo(1959);
                  } catch (error) {
                    console.log("Información no disponible")
                  }

                  if(hit.pickedMesh.metadata === cuadrosMovieName){
                    //console.log("play video cuadro");
                    currentCuadro.videoTexture.video.play();
                    currentCuadro.videoTexturePlaying = true;
                  }
                  else if(hit.pickedMesh.metadata === "domo"){
                 // TODO: PLAY 3 VIDEOS A LA VEZ
                  }
                }
                else{
                  if(cameraLevel == 2 && currentCuadroPrevAbsoluteIndex == currentCuadroAbsoluteIndex){      
                    guiVI.showCuadroInfo();       
                  }
                  else{
                    guiVI.selectCuadro(currentCuadroAbsoluteIndex,currentCuadro.slug);
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

  //

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
              
              if(Math.abs(targetBox.position.x - targetPosition.x) < 0.02 && Math.abs(targetBox.position.y - targetPosition.y) < 0.02 && Math.abs(targetBox.position.z - targetPosition.z) < 0.02){
                oldTargetPosition = targetPosition;
              }
          }
          
          if (oldTargetCameraPosition !== targetCameraPosition){
              camera.position = new Vector3(camera.position.x*(1-cameraSpeed) + targetCameraPosition.x*cameraSpeed, camera.position.y*(1-cameraSpeed) + targetCameraPosition.y*cameraSpeed, camera.position.z*(1-cameraSpeed) + targetCameraPosition.z*cameraSpeed);
              
              if(Math.abs(camera.position.x - targetCameraPosition.x) < 0.05 && Math.abs(camera.position.y - targetCameraPosition.y) < 0.05 && Math.abs(camera.position.z - targetCameraPosition.z) < 0.05){
                oldTargetCameraPosition = targetCameraPosition;
              }
          }
      }

      time += 0.05;
      let apuntadorPosition: number;

      if(cameraLevel == 2){
        apuntadorPosition = targetBox.position.y + currentCuadro.cuadroHeight + 0.1 + Math.sin(time)*0.03;
      }
      else{
        apuntadorPosition = targetBox.position.y + 5;
      }
      apuntador.position = new Vector3(apuntador.position.x, apuntadorPosition, apuntador.position.z);
      apuntador.rotation.y = (apuntador.rotation.y + Tools.ToRadians(1))%Tools.ToRadians(360);

      if(Date.now() < playTimeLine + autoPlayDuration){

        let timelinePercent: number = 1 - (Date.now() - playTimeLine)/autoPlayDuration;
        timelinePercent = timelinePercent*100;
        //console.log("AUTOPLAY TIMER: " + Math.floor(timelinePercent*100));
        let autoPlayTimeline = document.getElementById("autoPlayTimeline");
        if(autoPlayTimeline){
          autoPlayTimeline.style.width = timelinePercent + "%";
        }
      }

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
      guiVI.setCameraAutoPlay();
      console.log("VI_GUI_Play at Babylon");
       break; 
    }
    case 'VI_GUI_Sound': { 
      guiVI.setSoundState();
      console.log("VI_GUI_Play at Babylon");
       break; 
    }
    default: { 
      if(guiVI.isIndexButton(buttonClickData)){
        
        /**Si el artista no esta aqui se busca en las etiquetas */
        if(guiVI.isArtistInThisRoom(buttonClickData.slug)){
          guiVI.gotoArtistBySlug(buttonClickData.slug);
          globalThis.bronxControl.closeInfo(1521);
          globalThis.bronxControl.loadInfoByPostSlug(buttonClickData.slug,ID_POPUP_INFO);
          setTimeout(function(){globalThis.bronxControl.showInfo(ID_POPUP_INFO) ;},1000);
        }else {
          /**Get roomSlug */
          console.log(buttonClickData);
          let tagsVector = buttonClickData.tags;
          let roomSlug;
          for(let i=0; i<tagsVector.length; i++){
            let tagSplite = tagsVector[i].split(":");
            if(tagSplite){
              if(tagSplite[0]==="roomSlug"){
                roomSlug=tagSplite[1];
              }
            }
          }
          if(roomSlug){
            guiVI.gotoPageByArtistSlugs(buttonClickData.slug, roomSlug);
          }
        }
      }
      break; 
    } 
  } 
  //console.log("Button clicked: "+buttonId);
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
            guiVI.setCameraAutoPlay();
            break;
          case "m":
            guiVI.setSoundState();
            break;
          case "v":
              console.log("Virtual Insanity Engine Version 0.9.3")
              console.log("Developed by Sebastian Gonzalez Dixon and Carlos Adrian Serna")
              console.log("Setian Technologies")
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


