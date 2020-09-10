import 'pepjs'
import '@babylonjs/loaders'
//import * as cannon from 'cannon';
import { HemisphericLight, Vector3, SceneLoader, AbstractMesh, Mesh,MeshBuilder, StandardMaterial, PickingInfo, Ray, Matrix, ArcRotateCamera } from '@babylonjs/core'
import { createEngine, createScene, createSkybox, createArcRotateCamera } from './babylon'

const canvas: HTMLCanvasElement = document.getElementById('virtualInsanityCanvas') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

let targetBox: Mesh;
let targetPosition: Vector3;
let targetCameraPosition: Vector3;
let roomCenter: Vector3;

let cuadro: Mesh[]  = [];
let cuadroUser: Mesh[] = [];
let numCuadros =  6;
let actualCuadro = 0;

const numVentanas: number = 6;

const targetSpeed: number = 0.02;
const cameraSpeed: number = 0.03;

let cameraSetted: boolean = false;


// main function that is async so we can call the scene manager with await
const main = async () => {

  const skybox = createSkybox() as Mesh;

  const camera = createArcRotateCamera() as ArcRotateCamera;

  const light = new HemisphericLight("light1", new Vector3(10, 20, 0), scene)
  light.intensity = 0.8

  //var paintings;
  var floor:Mesh;
  var ceiling01:Mesh;
  var ceiling02:Mesh;
  var ceiling03:Mesh;
  var door:Mesh;
  var room01:Mesh;
  var room02:Mesh;
  var room03:Mesh;

  var ventana: Mesh[] = [];

  var oldTargetPosition: Vector3;
  var oldTargetCameraPosition: Vector3;

  
  SceneLoader.ImportMesh(
    "",
    "assets/models/",
    "Galeria-04-20.babylon",
    scene,
    function (importedMeshes) {
        console.log("inicio");
        console.log("importedMeshes[0].name: " + importedMeshes[0].name);
        console.log("Salida");

        for(let i = 0; i < numCuadros; i++){

          cuadro.push(scene.getMeshByName("Cuadro.00"+i) as Mesh);
          cuadro[i].metadata = "cuadro0"+(i);

          cuadroUser.push(scene.getMeshByName("CuadroUser.00"+i) as Mesh);

          cuadroUser[i].visibility = 0;
        }

        for(let i = 0; i < numVentanas; i++){
            ventana.push(scene.getMeshByName("Ventana.00"+i) as Mesh);
            ventana[i].visibility = 0;
            ventana[i].checkCollisions = true;
            ventana[i].metadata = "ventanta0"+i;
        }

        floor = scene.getMeshByName("Floor.000") as Mesh;
        ceiling01 = scene.getMeshByName("Techo.000") as Mesh;
        ceiling02 = scene.getMeshByName("Techo.001") as Mesh;
        ceiling03 = scene.getMeshByName("Techo.002") as Mesh;
        room01 = scene.getMeshByName("Room.000") as Mesh;
        room02 = scene.getMeshByName("Room.001") as Mesh;
        room03 = scene.getMeshByName("Room.002") as Mesh;
        door = scene.getMeshByName("Door.000") as Mesh;

        floor.metadata = "floor";
        ceiling01.metadata = "techo01";
        ceiling02.metadata = "techo02";
        ceiling03.metadata = "techo03";
        room01.metadata = "sala01";
        room02.metadata = "sala02";
        room03.metadata = "sala03";
        door.metadata = "door";

        floor.freezeWorldMatrix();
        ceiling01.freezeWorldMatrix() ;
        ceiling02.freezeWorldMatrix();
        ceiling03.freezeWorldMatrix();
        room01.freezeWorldMatrix();
        room02.freezeWorldMatrix();
        room03.freezeWorldMatrix();
        door.freezeWorldMatrix();
        

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

        floor.checkCollisions = true;
        ceiling01.checkCollisions = true;
        ceiling02.checkCollisions = true;
        ceiling03.checkCollisions = true;
        room01.checkCollisions = true;
        room02.checkCollisions = true;
        room03.checkCollisions = true;
        door.checkCollisions = true;

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
            var cuadrosNameLength = cuadrosName.length;

            //console.log("hit.pickedMesh.metadata.substring(0,cuadrosNameLength): " + hit.pickedMesh.metadata.substring(0,cuadrosNameLength));
            // hit.pickedMesh.metadata  != "floor" && hit.pickedMesh.metadata != "sala01" && hit.pickedMesh.metadata != "sala02" && hit.pickedMesh.metadata != "sala03" && hit.pickedMesh.metadata != "techo01" && hit.pickedMesh.metadata != "techo02" && hit.pickedMesh.metadata != "techo03" && hit.pickedMesh.metadata != "ventana01" && hit.pickedMesh.metadata != "ventana02" && hit.pickedMesh.metadata != "ventana03")

            if(hit.pickedMesh != null){
              if(hit.pickedMesh.metadata != null){
                if (hit.pickedMesh && hit.pickedMesh.metadata.substring(0,cuadrosNameLength) === cuadrosName) {
                    let currentMesh: AbstractMesh = hit.pickedMesh;
                    oldTargetPosition = targetPosition;
                    oldTargetCameraPosition = targetCameraPosition;

                    var iCuadro = parseInt(currentMesh.metadata.substr(currentMesh.metadata.length - 1));

                    //console.log("cuadro: " + iCuadro);

                    if(actualCuadro !== iCuadro){
                        actualCuadro = iCuadro;
                        targetCameraPosition = new Vector3(cuadroUser[iCuadro].position.x, cuadroUser[iCuadro].position.y, cuadroUser[iCuadro].position.z);
                    }

                    targetPosition = new Vector3(currentMesh.position.x, currentMesh.position.y, currentMesh.position.z) ;

                    console.log("MESH HIT");
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

function selectArtist(artistID: number): void{

  actualCuadro = artistID;

  console.log("actualCuadro: " + actualCuadro);
  targetPosition = new Vector3(cuadro[actualCuadro].position.x, cuadro[actualCuadro].position.y, cuadro[actualCuadro].position.z);
  targetCameraPosition = new Vector3(cuadroUser[actualCuadro].position.x, cuadroUser[actualCuadro].position.y, cuadroUser[actualCuadro].position.z);
  camera.useAutoRotationBehavior = false;

}

function prev_artist(): void{

  console.log("cuadro.length: " + cuadro.length)

  if(cuadro.length > 0 && cuadroUser.length > 0){
    actualCuadro = (actualCuadro + (numCuadros-1))%numCuadros;

    console.log("actualCuadro: " + actualCuadro);
    targetPosition = new Vector3(cuadro[actualCuadro].position.x, cuadro[actualCuadro].position.y, cuadro[actualCuadro].position.z);
    targetCameraPosition = new Vector3(cuadroUser[actualCuadro].position.x, cuadroUser[actualCuadro].position.y, cuadroUser[actualCuadro].position.z);
    camera.useAutoRotationBehavior = false;
  }
}

function next_artist(): void{

  actualCuadro = (actualCuadro + 1)%numCuadros;
  console.log("actualCuadro: " + actualCuadro);
  targetPosition = new Vector3(cuadro[actualCuadro].position.x, cuadro[actualCuadro].position.y, cuadro[actualCuadro].position.z);
  targetCameraPosition = new Vector3(cuadroUser[actualCuadro].position.x, cuadroUser[actualCuadro].position.y, cuadroUser[actualCuadro].position.z);
  camera.useAutoRotationBehavior = false;
}

function center_camera(){

//actualCuadro = (actualCuadro + 1)%numCuadros;
//console.log("actualCuadro: " + actualCuadro);

targetPosition = new Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
targetCameraPosition = camera.position;
oldTargetCameraPosition = targetCameraPosition;
//targetCameraPosition = new BABYLON.Vector3(cuadroUser[actualCuadro].position.x, cuadroUser[actualCuadro].position.y, cuadroUser[actualCuadro].position.z);
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

//Start the program from html
main();

