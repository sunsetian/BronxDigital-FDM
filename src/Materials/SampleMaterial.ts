import { Scene, ShaderMaterial, Effect } from "@babylonjs/core"

import * as sampleVertexShader from "./Shaders/Sample/sample.vertex.glsl"
import * as sampleFragmentShader from "./Shaders/Sample/sample.fragment.glsl"

Effect.ShadersStore["sampleVertexShader"] = sampleVertexShader
Effect.ShadersStore["sampleFragmentShader"] = sampleFragmentShader

export class SampleMaterial extends ShaderMaterial {

    constructor(name: string, scene: Scene) {
        super(name, scene, { vertex: "sample", fragment: "sample" }, {
            uniforms: [
                "worldViewProjection",
                "time"
            ],
            attributes: [
                "position",
                "normal",
                "uv"
            ],
        })

        const startTime = Date.now()

        
        scene.onBeforeRenderObservable.add(() => {
            const currentTime = Date.now()
            const time = currentTime - startTime

            this.time = time / 10000
        })
        /*
        scene.registerBeforeRender(() => {
            const currentTime = Date.now()
            const time = currentTime - startTime

            this.time = time / 10000
        })*/
    }

    set time(value: number) {
        this.setFloat("time", value)
    }
}
