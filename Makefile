uglify = ./node_modules/.bin/uglifyjs
csso = ./node_modules/.bin/csso
duo = ./node_modules/.bin/duo

default: build

app: bower_components
	@$(MAKE) build
	@atom .

build: node_modules index.html
	@mkdir -p build
	@$(MAKE) build/index.min.js
	@$(MAKE) build/index.min.css

build/index.min.js: node_modules index.js
	@echo ""
	@echo ">>> resolve JavaScript dependencies with duo"
	duo index.js > build/index.js
	@echo ">>> minify JavaScript with uglify"
	$(uglify) --output build/index.js build/index.js

build/index.min.css: node_modules index.css
	@echo ""
	@echo ">>> resolve CSS dependencies with duo"
	duo index.css > build/index.css
	@echo ">>> minify CSS with CSSO"
	$(csso) --output build/index.css build/index.css

node_modules: package.json
	@echo ""
	@echo ">>> install node modules"
	@npm install
	@touch node_modules

.PHONY: app