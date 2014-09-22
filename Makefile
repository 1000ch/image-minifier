NAME = "imgo-app"

grunt = ./node_modules/.bin/grunt
bower = ./node_modules/.bin/bower

default: clean node_modules bower_components build index.html main.js
	@curl -O https://github.com/atom/atom-shell/releases/download/v0.16.3/atom-shell-v0.16.3-darwin-x64.zip
	@guzip atom-shell-v0.16.3-darwin-x64.zip

clean:
	@rm -r build
	@rm -rf node_modules
	@rm -r bower_components

node_modules: package.json
	@npm install
	@touch node_modules

bower_components: bower.json
	@$(bower) install
	@touch bower_components

build: gruntfile.js
	@mkdir -p build
	@$(grunt) build

.PHONY: default