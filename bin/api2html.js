#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const shins = require("shins");
const converter = require("widdershins");
const yaml = require("js-yaml");
const program = require("commander");
const chalk = require("chalk");
const pkg = require("../package.json");

const languageMap = {
    "shell": "Shell",
    "http": "HTTP",
    "javascript": "JavaScript",
    "javascript--nodejs": "Node.js",
    "ruby": "Ruby",
    "python": "Python",
    "java": "Java",
    "go": "Go",
    "php": "PHP"
};

const icons = {
    ok: "✓",
    fail: "✗"
};

async function main() {

    program
        .version(pkg.version)
        .usage("[options] <sourcePath>")
        .option("-r, --resolve <source>", "resolve external dependencies, source should be a url or a path")
        .option("-o, --out <outputPath>", "output path for the resulting HTML document")
        .option("-t, --theme <themeName>", "theme to use (see https://highlightjs.org/static/demo/ for a list)")
        .option("-c, --customLogo <logoPath>", "use custom logo at the respective path")
        .option("-u, --customLogoUrl <logoURL>", "url for the custom logo to point to")
        .option("-C, --customCss", "use custom css")
        .option("-P, --customCssPath <cssPath>", "use custom css file")
        .option("-i, --includes <includesList>", "comma-separated list of files to include")
        .option("-l, --languages <languageList>", "comma-separated list of languages to use for the language tabs (out of " + Object.getOwnPropertyNames(languageMap).join(", ") + ")")
        .option("-s, --search", "enable search")
        .option("-S, --summary", "use summary instead of operationId for TOC")
        .option("-b, --omitBody", "Omit top-level fake body parameter object")
        .option("-R, --raw", "Show raw schemas in samples, not example values")
        .parse(process.argv);

    if (program.args.length === 0) {
        console.log(chalk.red(icons.fail) + " Please specify the source file path as argument!");
        process.exit(-1);
    } else if (program.args.length > 1) {
        console.error(chalk.red(icons.fail) + " Please specify only one argument!");
        process.exit(-1);
    } else if (!program.hasOwnProperty("out")) {
        console.error(chalk.red(icons.fail) + " Please specify an output path via the '-o' option!");
        process.exit(-1);
    } else {

        // Widdershin options
        let options = {};

        options.codeSamples = true;
        options.httpsnippet = false;
        options.theme = program.theme ? program.theme.toLowerCase() : "darkula";
        options.search = program.search || true;
        options.discovery = false;
        options.shallowSchemas = false;
        options.tocSummary = program.summary;
        options.headings = 2;
        options.verbose = false;
        options.omitBody = program.omitBody || false;
        options.language_tabs = [];
        options.sample = !program.raw;

        // Default languages: All
        Object.getOwnPropertyNames(languageMap).forEach((lang) => {
            let obj = {};
            obj[lang] = languageMap[lang];
            options.language_tabs.push(obj);
        });

        if (program.resolve) {
            options.resolve = true;
            options.source = program.resolve;
        }

        if (program.includes) {
            options.includes = program.includes.split(",");
        }

        if (program.languages) {
            const temp = program.languages.split(",");
            let tempLanguages = [];
            temp.forEach((lang) => {
                if (Object.getOwnPropertyNames(languageMap).indexOf(lang.toLowerCase()) > -1) {
                    tempLanguages.push(lang);
                } else {
                    console.log(lang);
                    console.log(chalk.red(icons.fail) + " Invalid language '" + lang + "'. Please specify valid languages (such as " + Object.getOwnPropertyNames(languageMap).join(", ") + ").");
                    process.exit(-1);
                }
            });
            if (tempLanguages.length > 0) {
                // Reset languages
                options.language_tabs.length = 0;
                tempLanguages.forEach((lang) => {
                    let obj = {};
                    obj[lang] = languageMap[lang];
                    options.language_tabs.push(obj);
                });
            }
        }

        // Shin options
        let shinOptions = {};
        shinOptions.inline = true;
        shinOptions.unsafe = false;

        // Check for custom logo option
        if (program.customLogo) {
            shinOptions.logo = program.customLogo;

            // Check for logo url option
            if (program.customLogoUrl) {
                shinOptions['logo-url'] = program.customLogoUrl;
            }
        }

        // Check for custom css option
        if (program.customCss) {
            shinOptions.customCss = true;
        }

        let customCss = "";
        if (program.customCssPath) {
            shinOptions.customCss = true;

            try {
                customCss = fs.readFileSync(path.resolve(program.customCssPath), "utf8");
                console.log(chalk.green(icons.ok) + " Read custom css file!");
            }
            catch (error) {
                console.log(chalk.red(icons.fail) + " Error loading custom css file:");
                console.log(err.message);
            }
        }

        let api = null;

        try {

            // Read source file
            const file = fs.readFileSync(path.resolve(program.args[0]), "utf8");

            console.log(chalk.green(icons.ok) + " Read source file!");

            try {

                // Load source yaml
                api = yaml.safeLoad(file, { json: true });

                try {

                    // Convert the yaml to markdown for usage with Shin
                    const markdownString = await converter.convert(api, options);

                    console.log(chalk.green(icons.ok) + " Converted OpenAPI docs to markdown!");

                    // Render the markdown as HTML and inline all the assets
                    shins.render(markdownString, shinOptions, (err, html) => {

                        if (err) {
                            console.log(chalk.red(icons.fail) + " Error during rendering via Shin:");
                            console.log(err.message);
                            process.exit(-1);
                        }

                        console.log(chalk.green(icons.ok) + " Rendered HTML from markdown!");

                        if (customCss) {
                            html = html.replace(/\/\* place your custom CSS overrides here \*\//i, customCss);
                        }

                        try {

                            // Write output file
                            fs.writeFileSync(path.resolve(program.out), html, "utf8");

                            console.log(chalk.green(icons.ok) + " Wrote output file!");

                        } catch (err) {
                            console.log(chalk.red(icons.fail) + " Failed to write output file:");
                            console.log(err.message);
                            process.exit(-1);
                        } finally {
                            console.log(chalk.green(icons.ok) + " Finished!");
                        }
                    });

                } catch (err) {
                    console.log(chalk.red(icons.fail) + " Error during conversion via Widdershin:");
                    console.log(err.message);
                    process.exit(-1);
                }

            } catch (ex) {
                console.error("Failed to parse the source OpenAPI document");
                process.exit(-1);
            }

        } catch (err) {
            console.error("Source file wasn't found: " + program.args[0]);
            process.exit(-1);
        }

    }

}

main().catch(err => {
    console.error("Unexpected error: " + err);
    process.exit(-1);
});
