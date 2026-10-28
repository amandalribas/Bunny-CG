import { HalfEdgeDS } from '../lib/half-edge.js';
import {
    createNormalMat4,
    createRotationYMat4,
    createTranslationMat4,
    multiplyMat4,
    createScaleMat4,
} from '../lib/utils.js';



class Mesh {
    constructor(gpu, program, position, coords, indices, color) {
        this.angle = 2.4;
        this.position = position;
        this.program = program;
        this.heds = new HalfEdgeDS();
        this.heds.build(coords, indices);
        for (const vertex of this.heds.vertices) {
            vertex.color = color;
        }
        
        const [positions, colors, normals, triangles] = this.heds.getVBOs();

        // Normaliza as normais calculadas pela estrutura half-edge.
        for (let i = 0; i < normals.length; i += 4) {
            const length = Math.hypot(
                normals[i],
                normals[i + 1],
                normals[i + 2]
            );

            if (length > 0) {
                normals[i] /= length;
                normals[i + 1] /= length;
                normals[i + 2] /= length;
            }

            normals[i + 3] = 0;
        }


        this.shape = gpu.createShape({
            buffers: [positions, colors, normals],
            indices: triangles,
            indexFormat: 'uint32',
            vertexCount: this.heds.vertices.length,
        });
        this.uniform = gpu.createUniform(program, new Float32Array(84));
    }

    createModelMatrix() {
        this.angle += 0.005;
        const rotate = createRotationYMat4(this.angle);
        const translate = createTranslationMat4(...this.position);
        const scale = createScaleMat4(5, 5, 5);

        
        return multiplyMat4(translate, multiplyMat4(rotate, scale));
    }

    updateUniform(model, view, projection, light) {
        const modelView = multiplyMat4(view, model);
        const normalMatrix = createNormalMat4(modelView);

        this.uniform.data.set(model, 0);
        this.uniform.data.set(view, 16);
        this.uniform.data.set(projection, 32);
        this.uniform.data.set(normalMatrix, 48);
        this.uniform.data.set(light.position, 64);
        this.uniform.data.set(light.ambient, 68);
        this.uniform.data.set(light.diffuse, 72);
        this.uniform.data.set(light.specular, 76);
        this.uniform.data.set(light.params, 80);
    }

    draw(gpu, view, projection, light) {
        const model = this.createModelMatrix();

        this.updateUniform(model, view, projection, light);
        gpu.writeBuffer(this.uniform.buffer, this.uniform.data);
        gpu.draw(this.program, this.shape, [this.uniform.bindGroup]);
    }
}
export default Mesh;
