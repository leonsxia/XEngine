class GeometryDesc {

    isGeometryDesc = true;

    parameters = {};

    type = '';

    constructor(params) {

        Object.assign(this.parameters, params);

        this.type = params.type;

    }

}

export { GeometryDesc };