import 'pepjs';
import '@babylonjs/loaders';
import { Artist } from './Artist';
//import * as cannon from 'cannon';

import { HemisphericLight, Vector3, SceneLoader, AbstractMesh, Mesh, StandardMaterial, PickingInfo, Ray, Matrix, ArcRotateCamera } from '@babylonjs/core'
import { createEngine, createScene, createSkybox, createArcRotateCamera } from './babylon'

// Import stylesheets
// import './index.css';

const canvas: HTMLCanvasElement = document.getElementById('virtualInsanityCanvas') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

let targetBox: Mesh;
let targetPosition: Vector3;
let targetCameraPosition: Vector3;
let roomCenter: Vector3;

let artist: Artist[]  = [];
let numArtists: number =  0;
let actualArtist: number = -1;

const numVentanas: number = 0;

const targetSpeed: number = 0.02;
const cameraSpeed: number = 0.03;

let cameraSetted: boolean = false;

var URL_SCENE_JS:string;//Todo pasar a archivo de importacion API

// main function that is async so we can call the scene manager with await
const main = async () => {
  createSkybox(URL_SCENE_JS);
  const camera = createArcRotateCamera() as ArcRotateCamera;

  const light = new HemisphericLight("light1", new Vector3(0, 2, 0), scene);

  //const light = new PointLight("pointLight1",  new Vector3(3, 2, 3), scene);

  light.intensity = 0.8

  //var paintings;
  var floor:Mesh;
  var ceiling01:Mesh;
  var door:Mesh;
  var room01:Mesh;

  var ventana: Mesh[] = [];

  var oldTargetPosition: Vector3;
  var oldTargetCameraPosition: Vector3;

  SceneLoader.ImportMesh(
    "",
    URL_SCENE_JS+"data/models/",
    "SalaDos_07.babylon",
    scene,
    function (importedMeshes) {

      //console.log("importedMeshes[0].name: " + importedMeshes[0].name);
      let index = 0;
      importedMeshes.forEach(newMesh => {
        
        let meshNames: string[] = newMesh.name.split(".");
        if( meshNames[0] === "Artist" ){
          artist.push(new Artist(newMesh, index));
          index++;
        }
      });

      numArtists = artist.length;
      
      //for(let i = 0; i < numCuadros; i++){

        //cuadro.push(scene.getMeshByName("Cuadro.00"+i) as Mesh);
        //cuadro[i].metadata = "cuadro0"+(i);

        //cuadroUser.push(scene.getMeshByName("CuadroUser.00"+i) as Mesh);

        //cuadroUser[i].visibility = 0;
      //}

      for(let i = 0; i < numVentanas; i++){
          ventana.push(scene.getMeshByName("Ventana.00"+i) as Mesh);
          ventana[i].visibility = 0;
          ventana[i].checkCollisions = true;
          ventana[i].metadata = "ventanta0"+i;
      }

      if(scene.getMeshByName("Floor.000")){
        floor = scene.getMeshByName("Floor.000") as Mesh;
        floor.metadata = "floor";
        floor.checkCollisions = true;
        floor.freezeWorldMatrix();
        
      
      }
      if(scene.getMeshByName("Ceiling.000")){
        ceiling01 = scene.getMeshByName("Ceiling.000") as Mesh;
        ceiling01.metadata = "techo01";
        ceiling01.checkCollisions = true;
        ceiling01.freezeWorldMatrix() ;
        
      
      }
      if(scene.getMeshByName("Room.000")){
        room01 = scene.getMeshByName("Room.000") as Mesh;
        room01.metadata = "sala01";
        room01.checkCollisions = true;
        room01.freezeWorldMatrix();
        
      
      }
      if(scene.getMeshByName("Door.000")){
        door = scene.getMeshByName("Door.000") as Mesh;
        door.metadata = "door";
        door.checkCollisions = true;
        door.freezeWorldMatrix();
        
      }
      
      //console.log("metadata setted");

      
      
      targetPosition = new Vector3(floor.position.x, floor.position.y + 1.7, floor.position.z);
      targetCameraPosition = new Vector3(floor.position.x, floor.position.y + 1.7, floor.position.z);
      oldTargetPosition = new Vector3(floor.position.x, floor.position.y + 1.7, floor.position.z);
      oldTargetCameraPosition = targetCameraPosition;
      roomCenter = new Vector3(floor.position.x, floor.position.y + 1.7, floor.position.z);

      targetBox = Mesh.CreateBox("TargetBox.000", 0.5, scene);
      var baseMat = new StandardMaterial("BaseMaterial", scene);

      baseMat.alpha = 0.0;

      targetBox.material = baseMat;

      targetBox.position = targetPosition;

      //finally, say which mesh will be collisionable

      

      //console.log("Camera Setted");

      if(camera !== undefined && targetBox !== undefined && cameraSetted === false){
        camera.setTarget(targetBox);
        cameraSetted = true;
  
      }

      scene.onPointerDown = function selectMesh() {
        // check if we are under a mesh
        //var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== cuadro09; }, true, camera);

        function predicate(mesh: AbstractMesh){
          if (mesh === targetBox){
            return false;
          }
          return true;
        }

        var pickMesh: Ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
        var hit: PickingInfo = scene.pickWithRay(pickMesh, predicate) as PickingInfo;

        var cuadrosName = "cuadro";

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

              console.log("currentMesh.id: " + currentMesh.id);

              //let currentArtist :AbstractMesh = new AbstractMesh("");
              let currentArtistPos: Vector3 = new Vector3();
              let currentArtistViewPos: Vector3 = new Vector3();
              let currentArtistIndex: number = -1;

              if(hit.pickedMesh.parent != null){
                 
                 currentArtistPos = getArtistPositionsByName(hit.pickedMesh.parent.name);
                 currentArtistViewPos = getArtistViewPositionsByName(hit.pickedMesh.parent.name);
                 currentArtistIndex = getArtistIndexByName(hit.pickedMesh.parent.name);

                 console.log("hit.pickedMesh.parent.name: "+ hit.pickedMesh.parent.name);
              }
              console.log("currentArtistID: " + currentArtistIndex);

              if(actualArtist !== iArtist){
                actualArtist = iArtist;
                targetCameraPosition = new Vector3(currentArtistViewPos.x, currentArtistViewPos.y, currentArtistViewPos.z);
              
                targetPosition = new Vector3(currentArtistPos.x, currentArtistPos.y, currentArtistPos.z);
              }
              else{

                let cuadroIndex:number = getCuadroIndexByID(iCuadro, artist[currentArtistIndex]);
                let currentCuadro = artist[currentArtistIndex].cuadro[cuadroIndex];

                //console.log("currentCuadro.slug: " + currentCuadro.slug)
                console.log("currentCuadro.id: " + currentCuadro.id)

                targetCameraPosition = new Vector3(currentCuadro.viewerPosition.x, currentCuadro.viewerPosition.y, currentCuadro.viewerPosition.z);
                targetPosition = new Vector3(currentCuadro.position.x, currentCuadro.position.y, currentCuadro.position.z);

              }
              /* if(actualCuadro !== iCuadro){
                  actualCuadro = iCuadro;
                  targetCameraPosition = new Vector3(cuadroUser[iCuadro].position.x, cuadroUser[iCuadro].position.y, cuadroUser[iCuadro].position.z);
              } */

              console.log("Artist selected id: " + artist[currentArtistIndex].id);
              camera.useAutoRotationBehavior = false;

            }
          }
        }
      }
    }
  );

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
    }

  });


  // Start the scene
  engine.runRenderLoop(() => {
    scene.render()
  });

///////////// HTML INTERFACING

  // Resize
  window.addEventListener("resize", function () {
    engine.resize();
  });

  let prevArrowDOM: HTMLElement = document.getElementById("prev_arrow") as HTMLElement;
  if(prevArrowDOM) prevArrowDOM.addEventListener("click", prev_artist);

  let nextArrowDOM: HTMLElement = document.getElementById("next_arrow") as HTMLElement;
  if(nextArrowDOM) nextArrowDOM.addEventListener("click", next_artist);

  let cameracenterDOM: HTMLElement = document.getElementById("center_camera") as HTMLElement;
  if(cameracenterDOM) cameracenterDOM.addEventListener("click", center_camera);

  let togglecameraDOM: HTMLElement = document.getElementById("toggle_camera") as HTMLElement;
  if(togglecameraDOM) togglecameraDOM.addEventListener("click", toggle_camera);


  function getArtistPositionsByID(id:number): Vector3{

    let newArtistPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
        if(artistElement.id === id) newArtistPos = artistElement.position;
    });

    return newArtistPos;
  }

  function getArtistIndexByName(name: string):number{

    let newIndex: number = -1;

    artist.forEach(artistElement => {
      if(artistElement.name === name) newIndex = artistElement.arrayIndex;
    });

    return newIndex;
  }

  function getArtistPositionsByName(name: string):Vector3{

    let newPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      if(artistElement.name === name) newPos = artistElement.position;
    });

    return newPos;
  }

  function getCuadroIndexByID(id: number, artist: Artist):number{

    let newIndex: number = -1;
    //let cuadroID: number = id;

    artist.cuadro.forEach(cuadroElement => {
      if(cuadroElement.order === id) newIndex = cuadroElement.arrayIndex;
    });

    return newIndex;
  }

  function getArtistViewPositionsByName(name: string):Vector3{

    let newPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
      if(artistElement.name === name) newPos = artistElement.viewerPosition;
    });

    return newPos;
  }

  function getArtistViewerPositionsByID(id:number): Vector3{

    let newPos: Vector3 = new Vector3();

    artist.forEach(artistElement => {
        if(artistElement.id === id) newPos = artistElement.viewerPosition;
    });

    return newPos;
  }

  function selectArtist(artistID: number): void{

    let pos = getArtistPositionsByID(artistID);
    let viewPos = getArtistViewerPositionsByID(artistID);

    actualArtist = artistID;

    console.log("actualArtist: " + actualArtist);
    targetPosition = new Vector3(pos.x, pos.y, pos.z);
    targetCameraPosition = new Vector3(viewPos.x, viewPos.y, viewPos.z);
    camera.useAutoRotationBehavior = false;

  }

  function prev_artist(): void{

    if(actualArtist > 0){
      actualArtist = (actualArtist + (numArtists-1))%numArtists;
    }
    else{
      actualArtist = numArtists - 1; 
    }
    
    selectArtist(actualArtist);
    
  }

  function next_artist(): void{
    actualArtist = (actualArtist + 1)%numArtists;

    selectArtist(actualArtist);
  }

  function center_camera(){

  
  targetPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
  targetCameraPosition = camera.position;
  oldTargetCameraPosition = targetCameraPosition;

  camera.useAutoRotationBehavior = true;

  if(camera.autoRotationBehavior !== null){
    camera.autoRotationBehavior.idleRotationSpeed = 0.18;}
  }

  function toggle_camera(){

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

/** Buttons events */
globalThis.virtualInButtonClick = function (buttonClickData, ownerEvent){
  console.log("Click");
  console.log(buttonClickData);
  console.log(ownerEvent);
}

export {
  initBabylonScene
}

function initBabylonScene(srcScene:string){
  //alert(srcScene);
  URL_SCENE_JS = srcScene;
  main();
}

/*
// start the program
var URL_SCENE_JS:string;//Todo pasar a archivo de importacion API
export default function initBabylonScene(srcScene:string){
  //alert(srcScene);
  URL_SCENE_JS = srcScene;
  main();
}*/


/*
    libraryTarget:'umd', 
    library:'initBabylonScene',
    umdNamedDefine: true,
    libraryExport: 'default'
*/


