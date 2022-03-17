"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const upath_1 = __importDefault(require("upath"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const readFileAsync = util_1.default.promisify(fs_1.default.readFile);
/**
 * Create a HTML form the SVG file.
 * @param filePath Path of the SVG file.
 * @returns HTML.
 */
const createHTML = async (filePath) => {
    const svg = await readFileAsync(filePath, 'utf8');
    return `<!DOCTYPE html><style>html, body { margin: 0; padding: 0; } svg { position: absolute; top: 0; left: 0; }</style>${svg}`;
};
/**
 * Create the PNG file with the specified size.
 * @param page Page instance with SVG loaded.
 * @param size Size of the PNG image (px).
 * @param filePath Path of the output PNG file.
 */
const createPNG = async (page, size, filePath) => {
    await page.setViewport({ width: size.width, height: size.height });
    // Explicitly fix the size of SVG tags.
    // see: https://github.com/neocotic/convert-svg/blob/master/packages/convert-svg-core/src/Converter.js
    await page.evaluate(({ width, height }) => {
        const elm = document.querySelector('svg');
        if (!elm) {
            return;
        }
        if (typeof width === 'number') {
            elm.setAttribute('width', `${width}px`);
        }
        else {
            elm.removeAttribute('width');
        }
        if (typeof height === 'number') {
            elm.setAttribute('height', `${height}px`);
        }
        else {
            elm.removeAttribute('height');
        }
    }, {
        width: size.width,
        height: size.height
    });
    await page.screenshot({ path: filePath, omitBackground: true });
};
/**
 * Create the output PNG file path based on the size specification.
 * @param dir Path of the parent directory.
 * @param name Name of the PNG file.
 * @param ext File extention of the PNG file (User specified).
 * @param size Size of the PNG image.
 * @returns If width and height of the size specification are equal (square), it is a path with a file name such as `sample-32.png`, otherwise `sample.32x48.png`.
 */
const createFilePath = (dir, name, ext, size) => {
    const fileName = size.width === size.height
        ? `${name}-${size.width}${ext}`
        : `${name}-${size.width}x${size.height}${ext}`;
    return upath_1.default.join(dir, fileName);
};
/**
 * Convert the SVG to the PNG.
 * @param options Options.
 * @returns Path collection of the output PNG files.
 */
const convert = async (options) => {
    const browser = await puppeteer_core_1.default.launch({
        executablePath: options.executablePath,
        args: process.getuid() == 0 ? ['--no-sandbox'] : undefined
    });
    const page = await browser.newPage();
    const results = [];
    try {
        await page.setContent(await createHTML(options.input));
        if (options.sizes.length === 1) {
            await createPNG(page, options.sizes[0], options.output);
            results.push(options.output);
        }
        else {
            const dir = upath_1.default.dirname(options.output);
            const ext = upath_1.default.extname(options.output);
            const name = upath_1.default.basename(options.output, ext);
            for (const size of options.sizes) {
                const filePath = createFilePath(dir, name, ext, size);
                await createPNG(page, size, filePath);
                results.push(filePath);
            }
        }
        return results;
    }
    catch (error) {
        throw error;
    }
    finally {
        await browser.close();
    }
};
exports.convert = convert;
