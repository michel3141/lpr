import { createConsumer } from '@rails/actioncable';

const DEBUG = 'cable';
const debug = (...args) => DEBUG && console.debug(`[${DEBUG}]`, ...args);

const state = {
  consumer: null,
};

function getConsumer() {
  // if (!state.consumer?.connection.isActive()) {
  //  throw Error('Consumer not open');
  //}
  // oui, mais on doit pouvoir demander à enlever la subscription
  // même quand il n'est plus actif.
  // En déconnectant le consumer, les subcribers reçoivent un disconnected
  // avec willAttemptReconnect=true. Ça permet de déclencher la désincription
  // et, en cascade, tout un tas de clean up.
  //
  // ce test serait plutôt à faire dans subscribe et unsubscribe selon le besoin :
  // .isOpen() ou .isActive.... on verra une autre fois
  return state.consumer;
}

function openAndConnectConsumer(url, token) {
  if (state.consumer?.connection.isActive()) {
    throw Error('Consumer is already opened');
  }

  // coment s'en passer ???
  // https://github.com/rails/rails/issues/54127 mais je n'ai pas trop insisté
  url.search = new URLSearchParams({ token });

  debug('Creating consumer');
  state.consumer = createConsumer(url);
  // When a consumer is created, it automatically connects with the server.
  // To disconnect from the server, call
  //   consumer.disconnect()
  // and to restart the connection:
  //   consumer.connect()

  // peut-être auto à la première subscription ??
  // j'ai dû l'activer à la main pour .isActive()
  state.consumer.connect();

  // en cas de coupure ?? l'état actuel serait dans consumer.connect.isOpen() ?
  // les caneaux recoived tous deconcted mais pas le consumer
  // return this.subscriptions.notifyAll("disconnected", {willAttemptReconnect: this.monitor.isRunning()})
}

function disconnectConsumer() {
  debug('Disconnecting consumer');
  /*
   * disconnect n'enlève pas les subscriptions,
   * mais envoie un disconnected({willAttemptReconnect: false})
   * Sauf que si on unsubscribe trop vite, cet event n'a pas le
   * temps d'être reçu (même si on disconnect avant les unsubscribe)
   */
  state.consumer?.disconnect();
  // state.consumer=null // what happens to subscriptions ?
}
/////////////////////////////////////////////////////////////////////

function subscribe(identifier, onActions = {}) {
  const defaultOnActions = {
    onRejected: () => debug('rejected', identifier),
    onConnected: ({ reconnected }) => debug('connected', identifier, { reconnected }),
    onDisconnected: ({ willAttemptReconnect }) =>
      debug('disconnected', identifier, { willAttemptReconnect }),
    onReceived: (message) => debug('received', identifier, message),
  };

  // conmment vérifer si on et déjà inscrit ?

  try {
    const consumer = getConsumer();
    const { onRejected, onConnected, onDisconnected, onReceived } = {
      ...defaultOnActions,
      ...onActions,
    };
    const actions = {
      rejected() {
        onRejected.bind(this)();
      },
      connected({ reconnected }) {
        onConnected.bind(this)({ reconnected });
      },
      disconnected({ willAttemptReconnect }) {
        onDisconnected.bind(this)({ willAttemptReconnect });
      },
      received(message) {
        onReceived.bind(this)(message);
      },
      initialized() {
        debug('initialized', this.identifier);
      },
    };
    debug('Creating subscription to', identifier);
    const subscription = consumer.subscriptions.create(identifier, actions);
    /*
     * subscriptions can
     * - send
     * - perform (add action filed before send !
     * - unsubscribe (send unsubribe to server, remove from subscriptions list)
     */
    return subscription.identifier;
  } catch (e) {
    console.warn('Cannot create subscription:', e.message);
  }
}

function say(identifier, action, message) {
  try {
    const consumer = getConsumer();
    const subscriptions = consumer.subscriptions.findAll(identifier);
    subscriptions.forEach((subscription) =>
      subscription.perform(action.replace('/', '_'), message)
    );
    return subscriptions.length;
  } catch (e) {
    console.warn('Cannot say:', e.message);
  }
}

function unsubscribe(identifier) {
  try {
    debug('Stoping subscription for', identifier);
    const consumer = getConsumer();
    const subscriptions = consumer.subscriptions.findAll(identifier);
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    return subscriptions.length;
  } catch (e) {
    console.warn('Cannot stop subscription:', e.message);
  }
}

export { getConsumer, openAndConnectConsumer, disconnectConsumer, subscribe, unsubscribe, say };
window.cc = disconnectConsumer;
window.ss = state;
window.oc = openAndConnectConsumer;
window.gc = getConsumer;
window.sub = subscribe;
window.usub = unsubscribe;
