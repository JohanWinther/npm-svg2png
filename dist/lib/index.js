"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.svg2png = exports.checkOptions = void 0;
const fs_1 = __importDefault(require("fs"));
const upath_1 = __importDefault(require("upath"));
const convert_1 = require("./convert");
const fetch_renderer_1 = require("./fetch-renderer");
/**
 * Gets the Chromium path for rendering SVG.
 * @param options Options.
 * @returns Path of Chromium.
 * @throws `fetcher` is not specified even though `executablePath` is omitted.
 */
const getExecutablePath = async (options) => {
    if (options.executablePath && fs_1.default.existsSync(options.executablePath)) {
        return options.executablePath;
    }
    if (!options.fetcher) {
        throw new Error('`fetcher` is not specified even though `executablePath` is omitted. Be sure to specify either.');
    }
    return (0, fetch_renderer_1.fetchRenderer)(options.fetcher.revision, options.fetcher.path);
};
/**
 * Optimize the size specification.
 * @param sizes Sizes.
 * @returns Optimized sizes.
 * @throws No `sizes` is specified.
 */
const optimizeSizes = (sizes) => {
    const results = sizes
        .filter((value) => 0 < value.width && 0 < value.height)
        .filter((value, index, self) => self.findIndex((v) => v.width === value.width && v.height === value.height) === index);
    if (results.length === 0) {
        throw new Error('There is no valid `sizes` specification.');
    }
    return results;
};
/**
 * Check options.
 * Correct the exception if the required value is invalid, and fix it if it can.
 * @param options Options.
 * @returns Checked options.
 */
const checkOptions = (options) => {
    const opts = Object.assign({}, options);
    if (!fs_1.default.existsSync(opts.input)) {
        throw new Error('The file specified in `input` does not exist.');
    }
    {
        const dir = upath_1.default.dirname(opts.output);
        if (!fs_1.default.existsSync(dir)) {
            const pngDir = upath_1.default.dirname(opts.input);
            opts.output = upath_1.default.join(pngDir, upath_1.default.basename(opts.output));
        }
    }
    opts.sizes = optimizeSizes(opts.sizes);
    return opts;
};
exports.checkOptions = checkOptions;
/**
 * Create the PNG file from the SVG file.
 * @param options Options.
 * @returns Path collection of the output PNG files.
 */
const svg2png = async (options) => {
    const opts = (0, exports.checkOptions)(options);
    return (0, convert_1.convert)({
        input: opts.input,
        output: opts.output,
        sizes: opts.sizes,
        executablePath: await getExecutablePath(opts)
    });
};
exports.svg2png = svg2png;
