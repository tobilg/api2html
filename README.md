# api2html
A CLI tool to transform Swagger/OpenAPI/AsyncAPI docs to beautiful HTML pages via [Shins](https://github.com/mermade/shins)/[Widdershins](https://github.com/mermade/widdershins).

You can find an example generated page at [http://tobilg.github.io/api2html/petstore/](http://tobilg.github.io/api2html/petstore/).

## Installation

To install `api2html` globally, use

```bash
$ npm i api2html -g
```

You can also install it to use as `devDependencies`, and use it locally via a `npm run` task in your `package.json`:

```bash
$ npm i api2html --save-dev
```

Usage in `package.json`:

```javascript
{
  "scripts": {
    "api-docs": "node_modules/.bin/api2html -o docs/api.html -l shell,javascript--nodejs docs/openapi/api.yml"
  }
}
```

## Usage

### Available commands

```bash
$ api2html --help

  Usage: api2html [options] <sourcePath>

  Options:

    -V, --version                   output the version number
    -r, --resolve <source>          resolve external dependencies, source should be a url or a path
    -o, --out <outputPath>          output path for the resulting HTML document
    -t, --theme <themeName>         theme to use (see https://highlightjs.org/static/demo/ for a list)
    -c, --customLogo <logoPath>     use custom logo at the respective path
    -i, --includes <includesList>   comma-separated list of files to include
    -l, --languages <languageList>  comma-separated list of languages to use for the language tabs (out of shell, http, javascript, javascript--nodejs, ruby, python, java, go)
    -s, --search                    enable search
    -h, --help                      output usage information
```

### Usage examples

#### Render OpenAPI v3 file as HTML

This will render the `api.yml` file in the current directory as `myapi.html` file in the current directory.

```bash
$ api2html -o myapi.html myapi.yml
```

#### Use custom logo

This will render the `api.yml` file in the current directory as `myapi.html` file in the same directory, and use the custom logo `mylogo.png`.

```bash
$ api2html -o myapi.html -c mylogo.png myapi.yml
```

#### Define which language examples should be generated

This will render the `api.yml` file in the current directory as `myapi.html` file in the same directory, and use `go` and `javascript` examples.

```bash
$ api2html -o myapi.html -l go,javascript myapi.yml
```

#### Use different syntax highlighter

This will render the `api.yml` file in the current directory as `myapi.html` file in the same directory, and use `go` and `javascript` examples, as well as a different syntax higlighter from [highlight.js](https://highlightjs.org/static/demo/).

```bash
$ api2html -o myapi.html -l go,javascript -t arta myapi.yml
```

#### Resolve external dependencies

If you add refs to external files in your source file, you can enable them by using `-r <source>`. The following command will resolve all your relative imports from the current directory.

```bash
$ api2html -o myapi.html -r ./ myapi.yml
```
