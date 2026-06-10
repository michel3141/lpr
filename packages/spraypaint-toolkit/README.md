# Connextion.js

    import { ApiConnection } from 'spraypaint-toolkit';

    // default values
    const url = 'http://localhost:3000';
    const apiPath = '/api/v1';
    const clientApplication = 'client-name';

    const createConnection = (params) => ApiConnection({ url, apiPath, clientApplication, ...params });
    export const ConnectionV1 = createConnection()
    export const ConnectionV2 = createConnection({apiPath: '/api/v2'})

# Resource.js

    import { belongsTo } from 'spraypaint';
    import { createResource } from 'spraypaint-toolkit';

    const CardModel = {
      jsonapiType: 'cards',

      attrs: {
        id: attr({}),
        value: attr({}),
        player: belongsTo(),
      },
    };

    /*
     * static s'applique au model
     * methods s'applique à la resource
     */
    const extra = {
        static: {
            sync: false, // active le lancement de afterSync
        },
        methods: {},
      };

    export const CardResource = (Connection, extra) => createResource(Connection, CardModel, extra);

# consumer.js

    import {createConnection, PostEndpoint} from '~/path/to/api';

    const connection = createConnection({url, apiPath, clientApplication})
    const Post = PostEndpoint(connection)

    const post = new Post()
    post.save([saveOpts]) // renvoie une promesse resolvant sur success (post est mis à jour)
    // ou
    post.commit([saveOpts]) // comme .save mais renvoie une promesse resolvant sur l'object ou throw error
    // ou
    post.update(attributes,[saveOpts]) // met à jour les attributes et renvoie une promesse resolvant sur l'object ou throw error
    post.updateAttributes(attributes) // met à jour les attributes et renvoie l'objet

# Notes

TODO: en plus de .commit()
on a Post.inflate(raw) => reconstruit un objet (dont on est sûr de l'existance !) à partir du raw_json_api

??.addHeaders(headears) => utiliser pour passer une authentification dans un entête. Non tester dans cette version
Post??.findOrFetchAttributes(id, tryFetch) ??? très expérimental

# Notes

une connexion crée par createConnection()
permet de conserver les paramètres de connexions :

- connection.baseUrl
- connection.apiNamespace
- connection.clientApplication
