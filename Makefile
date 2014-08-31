uglify = ./node_modules/.bin/uglifyjs
csso = ./node_modules/.bin/csso
# duo = ./node_modules/.bin/duo

default: build

app: bower_components
	@$(MAKE) build
	@atom .

build: node_modules index.html
	@mkdir -p build
	@mkdir -p build/css build/js
	@$(MAKE) build/js/index.js
	@$(MAKE) build/css/lib.css
	@$(MAKE) build/css/index.css
	@$(MAKE) build/fonts

build/js/index.js: node_modules index.js
	@echo ""
	@echo ">>> resolve JavaScript dependencies with duo"
	cat index.js > build/js/index.js
	@echo ">>> minify JavaScript with uglify"
	#$(uglify) --output build/js/index.js build/js/index.js

build/css/lib.css: node_modules bower_components
	@echo ""
	@echo ">>> resolve CSS dependencies with duo"
	cat bower_components/normalize.css/normalize.css bower_components/font-awesome/css/font-awesome.css > build/css/lib.css
	@echo ">>> minify CSS with CSSO"
	#$(csso) --output build/css/lib.css build/css/lib.css

build/css/index.css: node_modules index.css
	@echo ""
	@echo ">>> resolve CSS dependencies with duo"
	cat index.css > build/css/index.css
	@echo ">>> minify CSS with CSSO"
	#$(csso) --output build/css/index.css build/css/index.css

build/fonts: bower_components/font-awesome/fonts
	cp -r bower_components/font-awesome/fonts build

node_modules: package.json
	@echo ""
	@echo ">>> install node modules"
	@npm install
	@touch node_modules

.PHONY: app
