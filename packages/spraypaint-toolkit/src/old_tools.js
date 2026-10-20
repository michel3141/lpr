import { Scope } from 'spraypaint';
async function getAllPages(options = {}) {
  const { meta } = await this.per(0).stats({ total: 'count' }).all();
  const { count } = meta.stats.total;
  return this.per(count).all();
  /*
  const { per } = options;
  let endpoint = this;
  if (per) {
    endpoint = endpoint.per(per);
  }
  endpoint = endpoint.stats({ total: 'count' });
  const items = [];
  let page = 1;
  let again = true;
  while (again) {
    const response = await endpoint.page(page).all();
    const { meta } = response.raw;
    const { data } = response;
    items.push(...data);
    page += 1;
    again = items.length < meta.stats.total.count;
  }
  return items;
  */
}
Scope.prototype.getAllPages = getAllPages;

export const oldTools = {
  methods: {
    afterSync: function (diff = {}) {
      // const { type, id } = this.resourceIdentifier
      return this;
      // console.log(`Change in ${type}-${id}`)
      // console.log(diff)
    },
    commit: async function (saveOpts = {}) {
      const saved = await this.save(saveOpts);
      if (saved) {
        return this;
      } else {
        throw new Error(
          Object.values(this.errors)
            .map(({ message }) => message)
            .join('|')
        );
      }
    },
    updateAttributes: function (attributes = {}, updateOpts = {}) {
      const { isPersisted } = updateOpts;
      Object.entries(attributes).forEach(
        ([key, value]) => key !== 'id' && key in this._attributes && (this[key] = value)
      );
      if (isPersisted === true) {
        if (!attributes.id) {
          throw new Error('No id, no persistence');
        }
        this.isPersisted = true;
      }
      return this;
    },
    update: async function (attributes = {}, saveOpts = {}) {
      this.updateAttributes(attributes);
      return this.commit(saveOpts);
    },
    deepAttributes: function () {
      const { attributes, relationships } = this;
      for (const [relationshipName, relationshipData] of Object.entries(relationships)) {
        if (Array.isArray(relationshipData)) {
          attributes[relationshipName] = relationshipData.map((relationshipDatum) =>
            relationshipDatum.deepAttributes()
          );
        } else {
          attributes[relationshipName] = relationshipData.deepAttributes();
        }
      }
      return attributes;
    },
  },

  static: {
    findOrFetchAttributes: function (id, tryFetch = true) {
      const { jsonapiType, store } = this;
      const storeKey = `${jsonapiType}-${id}`;
      return store.data[storeKey]
        ? Promise.resolve(store.data[storeKey])
        : tryFetch
          ? this.find(id).then((x) => x.data.attributes)
          : undefined;
    },
    inflate: function (raw, first) {
      // attention, les raw_data provenant de .first()
      // sont des tableaux
      if (Array.isArray(raw.data)) {
        return first
          ? this.scope()._buildRecordResult(raw).data
          : this.scope()._buildCollectionResult(raw).data;
      } else {
        return this.scope()._buildRecordResult(raw).data;
      }
    },
  },
};
