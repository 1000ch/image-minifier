NAME = "imgo-app"

grunt = ./node_modules/.bin/grunt
bower = ./node_modules/.bin/bower

default: clean node_modules bower_components build index.html main.js
	@wget https://github.com/atom/atom-shell/releases/download/v0.16.3/atom-shell-v0.16.3-darwin-x64.zip
	@unzip -o atom-shell-v0.16.3-darwin-x64.zip
	@mkdir -p ./Atom.app/Contents/Resources/app
	@cp -r node_modules ./Atom.app/Contents/Resources/app/
	@cp -r build ./Atom.app/Contents/Resources/app/
	@cp index.html ./Atom.app/Contents/Resources/app/
	@cp main.js ./Atom.app/Contents/Resources/app/
	@cp package.json ./Atom.app/Contents/Resources/app/

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