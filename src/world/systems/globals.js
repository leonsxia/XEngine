import { PHYSICS_TYPES } from "../components/utils/constants";
import { createRenderer } from "./renderer";

const modelRenderer = createRenderer();
modelRenderer.name = 'model_renderer';

const GLOBALS = {
    CURRENT_PHYSICS: PHYSICS_TYPES.SIMPLE
};

export { modelRenderer, GLOBALS };