
import vertShaderSrc from './illumination.vert.js';
import fragShaderSrc from './illumination.frag.js';
import Mesh from './mesh.js';
import {
    createLookAtMat4,
    createPerspectiveMat4,
} from '../lib/utils.js';


class Scene {
    constructor(gpu, coords, indices) {
        this.light = {
            position: [-2, 3, 4, 1],
            ambient: [1, 1, 1, 0.25],
            diffuse: [1, 1, 1, 0.75],
            specular: [1, 1, 1, 0.2],
            params: [48, 0, 0, 0],
        };

        this.program = gpu.createProgram(vertShaderSrc, fragShaderSrc, {
            cullMode: 'back',
            buffers: [
                {
                    arrayStride: 4 * 4,
                    attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }],
                },
                {
                    arrayStride: 4 * 4,
                    attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x4' }],
                },
                {
                    arrayStride: 4 * 4,
                    attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x4' }],
                },
            ],
        });

        this.meshes = [
            new Mesh(gpu, this.program, [0, 0, 0], coords, indices, [0.996, 0.998, 0.906, 1]),
        ];
    }

    createViewMatrix() {
        const eye = [0, 1.2, 4];
        const at = [0, 0, 0];
        const up = [0, 1, 0];

        return createLookAtMat4(eye, at, up, true);
    }

    createProjectionMatrix() {
        const aspect = 1024 / 768;
        return createPerspectiveMat4(Math.PI / 4, aspect, 0.1, 20);
    }

    draw(gpu) {
        const view = this.createViewMatrix();
        const projection = this.createProjectionMatrix();

        for (const mesh of this.meshes) {
            mesh.draw(gpu, view, projection, this.light);
        }
    }
}
export default Scene;