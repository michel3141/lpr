export function sptkFlatResource(data) {
  if (Array.isArray(data)) {
    console.warn(data);
    throw Error("Ne gère pas les collection. C'est une feature");
  }
  const walk = (datum) => {
    const { attributes, relationships } = datum;
    const resource = { ...datum.resourceIdentifier, attributes, relationships: {} };
    for (const [relationshipName, relationshipData] of Object.entries(relationships ?? {})) {
      if (Array.isArray(relationshipData)) {
        resource.relationships[relationshipName] = relationshipData.map(walk);
      } else {
        resource.relationships[relationshipName] = walk(relationshipData);
      }
    }
    return resource;
  };
  return walk(data);
}

export function sptkIncludedResources(data) {
  // /!\
  // si une resource apparait à différents endroits,
  // elle sera présente plusieurs fois avec Map
  // celui-ci supporte les collection aussi
  // if (Array.isArray(data)) {
  //   console.warn(data);
  //   throw Error("Ne gère pas les collection. C'est une feature");
  // }
  const included = new Set();

  function walk(resource, mainResource = false) {
    if (!mainResource) {
      included.add(resource);
    }

    Object.values(resource.relationships ?? {}).forEach((relationship) => {
      if (Array.isArray(relationship)) {
        relationship.forEach((item) => walk(item));
      } else {
        walk(relationship);
      }
    });
  }

  [data].flat().forEach((datum) => walk(datum, true));

  return [...included];
}

export function sptkIncludedResourceIdentifiers(data) {
  // celui-ci supporte les collection aussi
  const included = new Map();
  [data].flat().forEach((datum) => {
    sptkIncludedResources(datum).forEach((resource) => {
      const { resourceIdentifier } = resource;
      included.set(`${resourceIdentifier.type}:${resourceIdentifier.id}`, resourceIdentifier);
    });
  });
  return [...included.values()];
}

export function sptkRemoveIncluded(data, resourceIdentifier) {
  const keepResource = (item) =>
    item?.resourceIdentifier.type !== resourceIdentifier.type ||
    item?.resourceIdentifier.id !== resourceIdentifier.id;

  if (Array.isArray(data)) {
    console.warn(data);
    throw Error("Ne gère pas les collection. C'est une feature");
  }

  function walk(item) {
    Object.entries(item.relationships || {}).forEach(([key, relationship]) => {
      if (Array.isArray(relationship)) {
        item.relationships[key] = relationship.filter(keepResource);
        item.relationships[key].forEach(walk);
      } else if (keepResource(relationship)) {
        walk(relationship);
      } else {
        item.relationships[key] = null;
      }
    });
  }

  walk(data);
}

export function sptkKeepResources(raw) {
  const walkResource = ({ type, id, relationships, attributes }) => ({
    type,
    id,
    attributes: attributes && Object.keys(attributes),
    relationships:
      relationships &&
      Object.fromEntries(
        Object.entries(relationships).map(([relationship, { data }]) => [
          relationship,
          walkDoc({ data }),
        ])
      ),
  });
  const walkDoc = ({ data }) => {
    const resources = {
      data: data && (data.map ? data.map(walkResource) : walkResource(data)),
    };

    return resources;
  };
  return JSON.stringify(walkDoc(raw), undefined, 2);
}
