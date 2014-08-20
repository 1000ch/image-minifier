uglify = ./node_modules/.bin/uglifyjs
csso = ./node_modules/.bin/csso

default: build

app: node_modules
	@$(MAKE) build
	@atom .

build: node_modules index.html
	@mkdir -p build
	@$(MAKE) build/index.min.js
	@$(MAKE) build/index.min.css

build/index.min.js: node_modules index.js
	cat index.js > build/index.js
	$(uglify) --output build/index.js build/index.js

build/index.min.css: node_modules index.css
	cat node_modules/normalize.css/normalize.css index.css > build/index.css
	$(csso) --output build/index.css build/index.css

node_modules: package.json
	@npm install
	@touch node_modules

.PHONY: app