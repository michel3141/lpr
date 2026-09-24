import ModelAdapter from "./model";

export default function createJsonApiAdapter(resourceMap) {
  Object.entries(resourceMap).forEach(([key, value]) => {
    window[key] = value;
  });

  return new GraphitiAdapter(resourceMap);
}

class GraphitiAdapter {
  #resourceMap;

  constructor(resourceMap) {
    this.#resourceMap = resourceMap;
  }

  getModel(model) {
    const Model = this.#resourceMap[model];

    if (!Model) {
      throw new Error(`Model "${model}" not found`);
    }

    return new ModelAdapter(Model);
  }

  getObjectFor({ data, raw }) {
    const type = data.klass.jsonapiType;

    return this.getModel(type).getObjectFor({ data, raw });
  }
}
