# Release d'une lib : make release-plan LIB=rtk (essai à blanc), puis make release LIB=rtk.
.PHONY: release-plan release clean-node

release-plan:
	bin/release $(LIB) --dry-run

release:
	bin/release $(LIB)

clean-node:
	find -name node_modules -prune -exec rm -rf "{}" +
