import { Mesh, AbstractMesh, Vector3, Scene, PBRMetallicRoughnessMaterial, StandardMaterial, VideoTextureSettings, VideoTexture, InterpolateValueAction, ActionManager, Color3 } from "@babylonjs/core";

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
    private closeDistance = 4;

    constructor(cuadrosGroup: AbstractMesh, arrayIndex: number, scene: Scene) {

        this.arrayIndex = arrayIndex;

        this.id = parseInt(cuadrosGroup.name.split(".")[1]); 
        this.order = parseInt(cuadrosGroup.name.split(".")[1]); 

        if(cuadrosGroup.name.split(".")[2] !== null){
            this.slug = cuadrosGroup.name.split(".")[2].toLowerCase();
            //console.log("artist slug. " + this.slug);
        }

        let cuadrosArray : AbstractMesh[] = cuadrosGroup.getChildMeshes(true);

        this.name = cuadrosGroup.name;

        this.numCuadros = cuadrosArray.length;

        //console.log("·············· id: " + this.id);

        this.position = cuadrosGroup.position;

        this.firstBoundingBox = cuadrosArray[0].getBoundingInfo().boundingBox.extendSize;

        const calculateViewerPosition = (): Vector3 => {

            let newViewerPosition: Vector3 = new Vector3();
            newViewerPosition.copyFromFloats(cuadrosGroup.position.x, cuadrosGroup.position.y, cuadrosGroup.position.z);


            if(this.firstBoundingBox.x >= this.firstBoundingBox.z){

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

            //console.log("newViewerPosition: " + newViewerPosition);

            return newViewerPosition;
        }

        this.viewerPosition = calculateViewerPosition();

       let cuadroIndex = 0;

        cuadrosArray.forEach(newCuadro => {
            this.cuadro.push(new Cuadro(newCuadro as Mesh, this.wall, this.id, this.slug, this.position, cuadroIndex, scene));
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
    //public material: StandardMaterial;
    public position: Vector3 = new Vector3();
    public viewerPosition:  Vector3 = new Vector3();
    public mesh: Mesh = new Mesh("");
    public myArtist: number = -1;

    private closeDistance = 1.71;

    public arrayIndex: number = -1; // posición en el array de cuadros del artista, diferente al orden de visualización
    public name: string = "";
    
    constructor(cuadro: Mesh, wall: string, idArtist: number, slugArtista:string, ubicacion: Vector3, arrayIndex: number, scene: Scene) {
        this.orientation = wall;
        this.name = cuadro.name;
        this.arrayIndex = arrayIndex;
        this.order = parseInt(cuadro.name.split("@")[1])-1;
        this.slug = slugArtista + "_" + (this.order + 1);
        //console.log("cuadr slug.: " + this.slug);
        this.id = idArtist + "_" + cuadro.name.split("@")[1];
        this.myArtist = idArtist;


        this.mesh = cuadro;

        this.mesh.name = this.slug;
        this.mesh.metadata = "cuadro";
        this.mesh.id = this.id;

        let meshMaterial = new PBRMetallicRoughnessMaterial("cuadrosMat", scene);
        meshMaterial = this.mesh.material as PBRMetallicRoughnessMaterial;

        meshMaterial.roughness = 0.9;
        meshMaterial.metallic = 0.1;
  
        this.mesh.actionManager = new ActionManager(scene);
        //this.mesh.actionManager.hoverCursor = "none";

        let makeOverOut = function (mesh) {
    
            mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor, 200));
            mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", new Color3(0, 0.1, 0), 200));
        }
        
        makeOverOut(this.mesh);

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

        //console.log("·············· id: " + this.id);

        this.position = movieMesh.position;

        let videoMaterial: StandardMaterial = new StandardMaterial("videoMat" + this.id, scene);

        let myVideoSettings: VideoTextureSettings = new Object({autoPlay: false, autoUpdateTexture: true, loop: false, clickToPlay: true, poster: scenePath + "data/models/premovie_" + this.id + ".jpg"}) as VideoTextureSettings;
    
        this.videoTexture = new VideoTexture("video" + this.id, [scenePath + "data/movies/movie_" + this.id + ".mp4"], scene, true, false, VideoTexture.TRILINEAR_SAMPLINGMODE, myVideoSettings);
        //let preVideoTexture = new Texture(URL_SCENE_JS + "data/images/premovie01.png", scene, true, true);
    
        videoMaterial.diffuseTexture = this.videoTexture;
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

            //console.log("newViewerPosition: " + newViewerPosition);

            return newViewerPosition;
        }

        this.viewerPosition = calculateViewerPosition();

       

    }

}