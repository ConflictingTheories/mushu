/**
 * mushu/core/loader — Asset Loading System
 * 
 * Centralized system for loading and parsing external assets:
 * - OBJ models
 * - glTF models (basic support)
 * - Textures and other resources
 * 
 * @module mushu/core/loader
 */

import { loadOBJ } from './geometry.js';

export class Loader {
    /**
     * Load an OBJ file from URL.
     * @param {string} url - URL of the .obj file.
     * @returns {Promise<Object>} Geometry data.
     */
    static async obj(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load OBJ: ${response.statusText}`);
            const text = await response.text();
            return loadOBJ(text);
        } catch (err) {
            console.error('Loader.obj error:', err);
            throw err;
        }
    }

    /**
     * Load a glTF file from URL.
     * Note: This is a basic implementation for glTF JSON.
     * @param {string} url - URL of the .gltf file.
     * @returns {Promise<Object>} Parsed glTF object.
     */
    static async gltf(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load glTF: ${response.statusText}`);
            const data = await response.json();

            // Basic glTF parsing logic would go here
            // For now, we just return the raw JSON data
            return data;
        } catch (err) {
            console.error('Loader.gltf error:', err);
            throw err;
        }
    }

    /**
     * Load multiple assets in parallel.
     * @param {Object} assets - Map of { name: url }
     * @returns {Promise<Object>} Map of { name: loadedAsset }
     */
    static async all(assets) {
        const keys = Object.keys(assets);
        const promises = keys.map(key => {
            const url = assets[key];
            if (url.endsWith('.obj')) return this.obj(url);
            if (url.endsWith('.gltf') || url.endsWith('.json')) return this.gltf(url);
            return fetch(url).then(r => r.blob());
        });

        const results = await Promise.all(promises);
        return keys.reduce((acc, key, i) => {
            acc[key] = results[i];
            return acc;
        }, {});
    }
}

export default Loader;
