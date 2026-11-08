## rtk@2.1.0

2026-10-15 refactor: clean up
2026-10-15 feat: createThunk peut être sync et renvoyer directement une response
un thunk standard reste synchrone tant que possible.
(arg)=>dispatch=>return myResponse
J'en ai profité pour libérer (arg) :
la signature devient :
(...args)=>dispatch=>return myResponse
et la response n'a plus besoin d'être unwrap
2026-10-08 fix: effect in addListener doesnt return a value

## rtk@2.0.0

feat!: remove useSlice, useDispatch is auto unwrap()
feat!: cli/export adapté à rtk2
feat!: change l'api de createActons / remove createThunks
feat!: passage à rtk2
feat: default consoleLogger parse .begin et .end actions
feat: add .begin et .end actions au thunkActions
feat: CONST_NAME for events + createThunk can unwrap
docs: prettier .md
docs: ajout de docs sur rtk2
refactor: suppression de inflected
refactor: cleanup

## rtk@1.1.0

ne publie plus build

## rtk@1.0.19

passe react en peerDependency
un peu de clean up
Attention utiliser cette lib en peerDependency

## rtk@1.0.0

addListener rencoie un listener et ne commence pas à écouter directement
idem pour le reducer : il n'est plus ajouter automatiquement, c'est au dev de prendre ça en charge

## rtk@1.0.0

addListener rencoie un listener et ne commence pas à écouter directement
idem pour le reducer : il n'est plus ajouter automatiquement, c'est au dev de prendre ça en charge

## rtk@0.2.0

suppression de react-redux pour un remplacement minimaliste
