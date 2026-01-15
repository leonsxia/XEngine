import { CAPSULE_GEOMETRY, SPHERE_GEOMETRY } from "../../../utils/constants";
import { GeometryDesc } from "./GeometryDesc";
import { MeshDesc } from "./MeshDesc";

function generateRapierCharacterInstance(name, size) {

    const { width, depth, height } = size;
    let meshDesc = null;

    if (Math.max(width, depth, height) === height) {

        const diameter = Math.max(width, depth);
        const capRadius = diameter / 2;
        const capHeight = height - diameter;
        const capsuleGeometryDesc = new GeometryDesc({ type: CAPSULE_GEOMETRY, radius: capRadius, height: capHeight });
        meshDesc = new MeshDesc(capsuleGeometryDesc);
        meshDesc.name = name;

    } else {

        const radius = height / 2;
        const sphereGeometryDesc = new GeometryDesc({ type: SPHERE_GEOMETRY, radius });
        meshDesc = new MeshDesc(sphereGeometryDesc);
        meshDesc.name = name;

    }

    return meshDesc;

}

export {
    generateRapierCharacterInstance
};