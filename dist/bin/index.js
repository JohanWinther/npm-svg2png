#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_js_1 = require("./cli.js");
(0, cli_js_1.exec)(process.argv).catch((err) => {
    console.error(err);
});
