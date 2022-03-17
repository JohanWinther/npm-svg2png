"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRenderer = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const upath_1 = __importDefault(require("upath"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const statAsync = util_1.default.promisify(fs_1.default.stat);
/**
 * Check that path is a valid folder.
 * @param path Path of the download folder.
 * @returns `true` if enabled
 */
const isValidDownloadPath = async (path) => {
    if (!path) {
        return false;
    }
    try {
        const info = await statAsync(path);
        return info.isDirectory();
    }
    catch (err) {
        return false;
    }
};
/**
 * Download Chromium for rendering SVG.
 * @param revision Revision of the download Chromium.
 * @param path Path of the directory to download. If not specified, it will be selected in the puppeteer-core directory of `node_moduels`.
 * @returns Path of the downloaded Chromium.
 */
const fetchRenderer = async (revision, path) => {
    const downloadPath = isValidDownloadPath(path)
        ? upath_1.default.resolve(path) // Target directory is expected to be absolute
        : undefined;
    const fetcher = puppeteer_core_1.default.createBrowserFetcher({ path: downloadPath });
    if (!fetcher.canDownload(revision)) {
        throw new Error('The specified `revision` cannot be download.');
    }
    const info = await fetcher.download(revision);
    return info.executablePath;
};
exports.fetchRenderer = fetchRenderer;
