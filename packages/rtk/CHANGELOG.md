# next 1.1.1

séparation de rtk()
ajout de createSliceSelectors
rtk-export gère createEntitySelectors

breaking changes :
'rtk' n'exporte plus {select}
plus de selector constants

# 1.1.0

ne publie plus build

# 1.0.19

passe react en peerDependency
un peu de clean up
Attention utiliser cette lib en peerDependency

# 1.0.0

addListener rencoie un listener et ne commence pas à écouter directement
idem pour le reducer : il n'est plus ajouter automatiquement, c'est au dev de prendre ça en charge

# 1.0.0

addListener rencoie un listener et ne commence pas à écouter directement
idem pour le reducer : il n'est plus ajouter automatiquement, c'est au dev de prendre ça en charge

# 0.2.0

suppression de react-redux pour un remplacement minimaliste
