import { Mesh, AbstractMesh, Vector3, Scene, PBRMetallicRoughnessMaterial, StandardMaterial, VideoTextureSettings, VideoTexture, InterpolateValueAction, ActionManager, Color3, ExecuteCodeAction, PBRMaterial } from "@babylonjs/core";
const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } 
export class Artist {

    /** Orientacion del cuadro: north, south, east, west */
    public wall: string = "";
    /** Orden de aparicion establecido en Blender */
    public id: number = 0;
    /** Orden de aparicion de los artistas */ 
    public order: number = 0;
    public firstCuadroAbsoluteOrder: number = -1;
    public slug: string = "";
    public name: string = "";
    public numCuadros: number = 0;
    public cuadro: Cuadro[] = [];
    public position: Vector3 = new Vector3();
    public viewerPosition: Vector3 = new Vector3();
    public firstBoundingBox: Vector3  = new Vector3();
    public arrayIndex: number = -1;
    public closeDistance = 4;

    constructor(cuadrosGroup: AbstractMesh, arrayIndex: number, sceneName: string, scenePath: string, scene: Scene) {

        this.arrayIndex = arrayIndex;
        this.id = parseInt(cuadrosGroup.name.split(".")[1]); 
        this.order = parseInt(cuadrosGroup.name.split(".")[1]); 

        if(cuadrosGroup.name.split(".")[2] !== null){
            this.slug = removeAccents(cuadrosGroup.name.split(".")[2].toLowerCase());
        }

        let cuadrosArray : AbstractMesh[] = cuadrosGroup.getChildMeshes(true);
        this.name = cuadrosGroup.name;
        this.numCuadros = cuadrosArray.length;
        this.position = cuadrosGroup.position;

        if(sceneName == "voltaje"){  
            this.closeDistance = 18;

        }
        this.firstBoundingBox = cuadrosArray[0].getBoundingInfo().boundingBox.extendSize;
        const calculateViewerPosition = (): Vector3 => {

            let newViewerPosition: Vector3 = new Vector3();
            newViewerPosition.copyFromFloats(cuadrosGroup.position.x, cuadrosGroup.position.y, cuadrosGroup.position.z);

            if(this.firstBoundingBox.x > this.firstBoundingBox.z){
                if(cuadrosGroup.position.z > 0){
                    this.wall = "east"
                    newViewerPosition.z = newViewerPosition.z - this.closeDistance;             
                }
                else{
                    this.wall = "west";
                    newViewerPosition.z = newViewerPosition.z + this.closeDistance;                   
                } 
            }
            else{
                if(cuadrosGroup.position.x > 0){
                    this.wall = "north";
                    newViewerPosition.x = newViewerPosition.x - this.closeDistance;                 
                }
                else{
                    this.wall = "south";
                    newViewerPosition.x = newViewerPosition.x + this.closeDistance;                   
                }
            }
            return newViewerPosition;
        }

        this.viewerPosition = calculateViewerPosition();

        let cuadroIndex = 0;

        cuadrosArray.forEach(newCuadro => {
            this.cuadro.push(new Cuadro(newCuadro as Mesh, this.wall, this.id, this.slug, this.position, cuadroIndex, sceneName, scenePath, scene));
            cuadroIndex++;
        });
    }
}

export class Cuadro {

    public orientation: string = "";
    public slug: string = ""; // url de la info
    public id: string = ""; // orden identificado en blender
    public order: number = -1; // orden interno  de visualizacion de las obras del artista
    public absoluteOrder: number = 0; // 
    public position: Vector3 = new Vector3();
    public viewerPosition:  Vector3 = new Vector3();
    public mesh: Mesh = new Mesh("");
    public myArtist: number = -1;
    private cuadroWidth: number = 1;
    private cuadroHeight: number = 1;
    private closeDistance = 1.71;
    public arrayIndex: number = -1; // posición en el array de cuadros del artista, diferente al orden de visualización
    public name: string = "";

    public videoTexturePlaying: boolean = false;
    public videoTexture: VideoTexture;

    /* private resetActiveColor(unit_mesh): void{
        if (unit_mesh.source !== null) {
            //unit_mesh.source.renderOutline = false;
            unit_mesh.material.emissiveColor = new Color3(0,0,0);
        }
    } */

    private mouseOverUnit = function(unit_mesh) {
    	//console.log ("mouse over "+unit_mesh.meshUnderPointer.id);
    	//console.log (unit_mesh);
    	if (unit_mesh.meshUnderPointer !== null) {
        	unit_mesh.meshUnderPointer.renderOutline = true;	
            unit_mesh.meshUnderPointer.outlineWidth = 0.1;
            unit_mesh.meshUnderPointer.outlineColor = new Color3(0,1,0);
            //unit_mesh.material.emissiveColor = new Color3(0,1,0);
            setTimeout(function(){unit_mesh.source.renderOutline = false;},1000);
    	}
    }
    
    private mouseOutUnit = function(unit_mesh) {
        //console.log("mouse out "+unit_mesh.meshUnderPointer.id);
    	//console.log (unit_mesh);
    	if (unit_mesh.source !== null) {
        	unit_mesh.source.renderOutline = false;	
            //unit_mesh.material.emissiveColor = new Color3(0,1,0);
    	}
    }
    
    constructor(cuadro: Mesh, wall: string, idArtist: number, slugArtista:string, ubicacion: Vector3, arrayIndex: number, sceneName: string, scenePath: string, scene: Scene) {
        this.orientation = wall;
        this.name = cuadro.name;
        this.arrayIndex = arrayIndex;
        this.order = parseInt(cuadro.name.split("@")[1])-1;
        this.slug = removeAccents(slugArtista + "_" + (this.order + 1));
        this.id = idArtist + "_" + cuadro.name.split("@")[1];
        this.myArtist = idArtist;

        if(this.orientation == "east" || this.orientation == "west" ){
            this.cuadroWidth = cuadro.getBoundingInfo().boundingBox.extendSize.x;
        }
        else if(this.orientation == "north" || this.orientation == "south" ){
            this.cuadroWidth = cuadro.getBoundingInfo().boundingBox.extendSize.z;
        }

        this.cuadroHeight = cuadro.getBoundingInfo().boundingBox.extendSize.y;

        if(this.cuadroHeight >= this.cuadroWidth){
            this.closeDistance = this.cuadroHeight*3.5;
        }
        else{
            this.closeDistance = this.cuadroWidth*3.5;
        }

        this.mesh = cuadro;

        //this.mesh.name = this.slug;
        this.mesh.metadata = "cuadro";
        this.mesh.id = this.id;

        let meshMaterial = new PBRMaterial("cuadrosMat", scene);
        meshMaterial = this.mesh.material as PBRMaterial;

        meshMaterial.roughness = 0.9;
        meshMaterial.metallic = 0.1;
  
        // Creación DE MOVIE CUADROS

        if(cuadro.name.split("@")[0].split(".")[0] === "movie"){
            let videoMaterial: StandardMaterial = new StandardMaterial("videoMat" + this.id, scene);
            let myVideoSettings: VideoTextureSettings = new Object({autoPlay: false, loop: true, clickToPlay: true, poster: scenePath + "data/models/premovie_" + this.id + ".jpg", autoUpdateTexture: true}) as VideoTextureSettings;
            this.videoTexture = new VideoTexture("video" + this.id, [scenePath + "data/movies/movie_" + this.id + ".mp4"], scene, true, false, VideoTexture.TRILINEAR_SAMPLINGMODE, myVideoSettings);
            videoMaterial.emissiveTexture = this.videoTexture;
            videoMaterial.roughness = 1;
            videoMaterial.specularColor = new Color3(0, 0, 0);
            this.mesh.material = videoMaterial;
            this.videoTexturePlaying = false;
            this.mesh.metadata = "cuadromovie";

        }

         if(sceneName == "voltaje"){  
  
            if(cuadro.name.split("@")[0].split(".")[0] === "arbol"){  
                //arbol = scene.getMeshByName("Artist.007.arbol_ariel") as Mesh;
                //arbol.metadata = "arbol";
                //arbol.freezeWorldMatrix();
                console.log("arbol in")

                this.mesh.getChildMeshes().forEach(arbolPart => {
                let meshMaterial = new PBRMaterial("arbolMat", scene);
                    meshMaterial = arbolPart.material as PBRMaterial;
                    console.log("arbolPart.name " + arbolPart.name)
                    //let partColor: Color3 = meshMaterial.baseColor;
                    if(arbolPart.name === "branches" || arbolPart.name === "leaves"){
                        meshMaterial.emissiveColor = new Color3(0.061, 0.195, 0.15);
                    }
                    else if(arbolPart.name === "flowers"){
                        meshMaterial.emissiveColor = new Color3(0.799, 0.056, 0.084);
                    }
                    //console.log("ARBOL Before asigne material")
                    arbolPart.material = meshMaterial;
                    console.log("ARBOL PART SETTED")
                });

                this.mesh.metadata = "arbol";
                
              }
        } 


    // NO BORRAR: CODIGO ALTERNATIVO PARA RESALTAR LOS BORDES DEL CUADRO   
      

	let action = new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, this.mouseOverUnit);
	let action2 = new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, this.mouseOutUnit);

    this.mesh.actionManager = new ActionManager(scene);	
	this.mesh.actionManager.registerAction(action);
    this.mesh.actionManager.registerAction(action2); 
    

        /*  let overAction = new InterpolateValueAction(ActionManager.OnPointerOverTrigger, this.mesh.material, "emissiveColor", new Color3(0.05, 0.05, 0.05), 200);
        let outAction = new InterpolateValueAction(ActionManager.OnPointerOutTrigger, this.mesh.material, "emissiveColor", new Color3(0, 0, 0), 200);

        this.mesh.actionManager = new ActionManager(scene);
        //this.mesh.actionManager.hoverCursor = "";
        this.mesh.actionManager.registerAction(overAction);
        this.mesh.actionManager.registerAction(outAction);
        */

       /*  this.mesh.actionManager = new ActionManager(scene);

        let makeOverOut = function (mesh) {
    
            mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor, 200));
            mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", new Color3(0, 0.1, 0), 200));
        }
        
        makeOverOut(this.mesh); */

        this.position.copyFromFloats(cuadro.position.x + ubicacion.x, cuadro.position.y + ubicacion.y, cuadro.position.z + ubicacion.z);

        switch (wall) {
            case "north":
                this.viewerPosition.copyFromFloats(this.position.x-this.closeDistance, this.position.y, this.position.z);
                break;

            case "south":
                this.viewerPosition.copyFromFloats(this.position.x+this.closeDistance, this.position.y, this.position.z);
                break;
        
            case "east":
                this.viewerPosition.copyFromFloats(this.position.x, this.position.y, this.position.z-this.closeDistance);
                break;
            
            case "west":
                this.viewerPosition.copyFromFloats(this.position.x, this.position.y, this.position.z+this.closeDistance);
                break;
            default:
                break;
        }
    }
}

export class Movie {

    public wall: string = "";
    public id: number = 0;
    public slug: string = "";
    public name: string = "";
    public numMovies: number = 0;
    public position: Vector3 = new Vector3();
    public viewerPosition: Vector3 = new Vector3();
    public firstBoundingBox: Vector3  = new Vector3();
    public arrayIndex: number = -1;
    private closeDistance = 5;

    public mesh: Mesh = new Mesh("");
    public videoTexturePlaying: boolean = false;
    public videoTexture: VideoTexture;
    
    constructor(movieMesh: Mesh, arrayIndex: number,  scenePath: string, scene: Scene) {

        this.arrayIndex = arrayIndex;
        this.id = parseInt(movieMesh.name.split(".")[1]);
        this.name = movieMesh.name;
        this.mesh = movieMesh;
        this.mesh.name = movieMesh.name;
        this.mesh.metadata = "movie";
        this.mesh.id = this.id + "";
        this.position = movieMesh.position;
        let videoMaterial: StandardMaterial = new StandardMaterial("videoMat" + this.id, scene);
        let myVideoSettings: VideoTextureSettings = new Object({autoPlay: false, autoUpdateTexture: true, loop: false, clickToPlay: true, poster: scenePath + "data/models/premovie_" + this.id + ".jpg"}) as VideoTextureSettings;
        this.videoTexture = new VideoTexture("video" + this.id, [scenePath + "data/movies/movie_" + this.id + ".mp4"], scene, true, false, VideoTexture.TRILINEAR_SAMPLINGMODE, myVideoSettings);
        videoMaterial.emissiveTexture = this.videoTexture;
        movieMesh.material = videoMaterial;
        this.videoTexturePlaying = false;
    
        this.firstBoundingBox = movieMesh.getBoundingInfo().boundingBox.extendSize;

        const calculateViewerPosition = (): Vector3 => {
            let newViewerPosition: Vector3 = new Vector3();
            newViewerPosition.copyFromFloats(movieMesh.position.x, movieMesh.position.y, movieMesh.position.z);

            if(this.firstBoundingBox.x >= this.firstBoundingBox.z){
                if(movieMesh.position.z > 0){
                    this.wall = "east"
                    newViewerPosition.z = newViewerPosition.z - this.closeDistance;                  
                }
                else{
                    this.wall = "west";
                    newViewerPosition.z = newViewerPosition.z + this.closeDistance;                  
                } 
            }
            else{
                if(movieMesh.position.x > 0){
                    this.wall = "north";
                    newViewerPosition.x = newViewerPosition.x - this.closeDistance;                 
                }
                else{
                    this.wall = "south";
                    newViewerPosition.x = newViewerPosition.x + this.closeDistance;                 
                }
            }
            return newViewerPosition;
        }
        this.viewerPosition = calculateViewerPosition();
    }
}