import { Mesh, AbstractMesh, Vector3, Scene } from "@babylonjs/core";

export class Artist {

    public wall: string = "";
    public id: number = 0;
    public slug: string = "";
    public name: string = "";
    public numCuadros: number = 0;
    public cuadro: Cuadro[] = [];
    public position: Vector3 = new Vector3();
    public viewerPosition: Vector3 = new Vector3();
    public firstBoundingBox: Vector3  = new Vector3();
    public arrayIndex: number = -1;
    private closeDistance = 5;

    constructor(cuadrosGroup: AbstractMesh, arrayIndex: number, scene: Scene) {

        this.arrayIndex = arrayIndex;

        this.id = parseInt(cuadrosGroup.name.split(".")[1]);

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

        //console.log("this.wall: " + this.wall);

        /*  ESTE ES UN COMENTARIO PAR COMMIT */
        /*  ESTE ES OTRO COMENTARIO PAR COMMIT */
    }
}

export class Cuadro {

    public slug: string = "";
    public id: string = "";
    public order: number = -1;
    //public material: StandardMaterial;
    public position: Vector3 = new Vector3();
    public viewerPosition:  Vector3 = new Vector3();
    public mesh: Mesh = new Mesh("");

    private closeDistance = 1.8;

    public arrayIndex: number = -1;
    public name: string = "";
    
    constructor(cuadro: Mesh, wall: string, idArtist: number, slugArtista:string, ubicacion: Vector3, arrayIndex: number, scene: Scene) {
        this.name = cuadro.name;
        this.arrayIndex = arrayIndex;
        this.order = parseInt(cuadro.name.split("@")[1])-1;
        this.slug = slugArtista + "_" + (this.order + 1);
        //console.log("cuadr slug.: " + this.slug);
        this.id = idArtist + "_" + cuadro.name.split("@")[1];
        //console.log("cuadro.id: " + this.id)
        //this.order = parseInt(this.slug.split("_")[2])-1;

        this.mesh = cuadro;

        this.mesh.name = this.slug;
        this.mesh.metadata = "cuadro";
        this.mesh.id = this.id;

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