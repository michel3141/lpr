# Release d'une lib : make release-plan (essai à blanc), puis make release.
# Depuis packages/<lib> (Makefile : lien vers celui-ci), la lib est celle du dossier ;
# à la racine, la donner : make release LIB=rtk.
ROOT := $(patsubst %/,%,$(dir $(realpath $(firstword $(MAKEFILE_LIST)))))
ifeq ($(dir $(CURDIR)),$(ROOT)/packages/)
LIB ?= $(notdir $(CURDIR))
endif
need-lib = $(if $(LIB),,$(error LIB manquant : depuis packages/<lib>, ou make $@ LIB=<lib>))

.PHONY: release-plan release clean-node

release-plan:
	$(need-lib)$(ROOT)/bin/release $(LIB) --dry-run

release:
	$(need-lib)$(ROOT)/bin/release $(LIB)

clean-node:
	find $(ROOT) -name node_modules -prune -exec rm -rf "{}" +
