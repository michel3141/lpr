const defaultSaveOptions = { delay: 500 }; // ou false
class SpraypaintDocument {
  #data;
  #listener;
  #id;
  #committing;
  #error;
  #commitTasks;
  #commitTimer;

  constructor({ data }) {
    this.#id = crypto.randomUUID();
    this.#data = data;
    this.#listener = {};
    this.#commitTasks = [];
  }

  get id() {
    return this.#id;
  }

  get resourceId() {
    return this.#data.storeKey;
  }

  get data() {
    return this.#data;
  }

  get committing() {
    return this.#committing;
  }

  get error() {
    return this.#error;
  }

  open({
    onDocClose,
    onDocFulfiled,
    onDocModify,
    onDocOpen,
    onDocPending,
    onDocPersist,
    onDocRejected,

    onResourceDestroy,
    onResourceSync,
  }) {
    this.#listener = {
      /* Resource */

      destroy: onResourceDestroy,
      sync: onResourceSync,

      /* Document */

      close: onDocClose,
      fulfilled: onDocFulfiled,
      modify: onDocModify,
      open: onDocOpen,
      pending: onDocPending,
      persist: onDocPersist,
      rejected: onDocRejected,
    };

    this.#data.afterSync = (diff) => {
      this.emit('sync', this.#data, diff);
    };
    this.#data.listen(); // problème avec StrictMode
    this.emit('open', this);
  }

  close() {
    this.emit('close', this);
    this.#data.unlisten();
    this.#data._onStoreChange = null; // problème avec StrictMode
    this.#listener = {};
    // this.#data=null  // problème avec StrictMode
  }

  emit(signal, ...data) {
    // console.log('EMIT', signal, ...data, !!this.#listener[signal]);
    this.#listener[signal]?.(...data);
  }

  modify(changes, saveOptions) {
    const data = this.#data;
    const model = data.klass;
    const attributes = Object.fromEntries(
      Object.entries(changes).filter(
        ([key]) => model.attributeList[key] && !model.attributeList[key]?.isRelationship
      )
    );
    const relationships = Object.fromEntries(
      Object.entries(changes).filter(([key]) => model.attributeList[key]?.isRelationship)
    );
    Object.assign(data.attributes, attributes);
    Object.assign(data.relationships, relationships);
    this.emit('modify', this, changes);
    if (saveOptions !== false) {
      const { delay, ...options } = { ...defaultSaveOptions, ...saveOptions };
      this.addTask({ delay: delay ?? 0, options });
    }
  }

  // remove (someresource from some relationship)
  // => should use markAsDestroy ..
  // => so we need add(someresource)

  async commit(options) {
    this.addTask({ urgent: true, delay: 0, options });
  }

  addTask(task) {
    this.#commitTasks.push({ ...task, at: Date.now() + task.delay });
    this.#commitTasks.sort((a, b) => b.at - a.at);
    const urgent = this.#commitTasks.find((task) => task.urgent);
    const keep = urgent ?? this.#commitTasks[0];
    // une urgente passe en premier et annule les autres
    // s'il n'y a que des pas urgente, on garde la plus lointaine
    // Attention, on ne tient pas compte de options qui mérite d'être associé au doc
    // une fois pour toutes, dès sa création
    this.#commitTasks = [keep];

    this.loopCommit();
  }

  async loopCommit() {
    if (this.#committing) return;
    if (this.#commitTasks.length === 0) return;

    clearTimeout(this.#commitTimer);
    const task = this.#commitTasks[0];

    const delay = task.at - Date.now();

    if (delay > 0) {
      this.#commitTimer = setTimeout(() => this.loopCommit(), delay);
      return;
    }

    this.#committing = true;
    this.#commitTasks.shift();

    this.#error = null;
    this.emit('pending', this);
    const wasPersisted = this.#data.isPersisted;
    try {
      const success = await this.#data.save(task.options);
      if (success && !wasPersisted) {
        this.emit('persist', this);
      }
      this.#committing = false;
      this.emit('fulfilled', this);
    } catch (error) {
      this.#error = error;
      this.#committing = false;
      this.emit('rejected', this);
    } finally {
      this.loopCommit();
    }
  }

  async destroy() {
    await this.#data.destroy();
    this.emit('destroy', this.#data);
  }
}

export default SpraypaintDocument;
