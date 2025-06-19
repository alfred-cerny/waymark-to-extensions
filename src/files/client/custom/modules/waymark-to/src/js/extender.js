(() => {
	'use strict';

	/**
	 * @fileoverview EspoCRM View Extension System - Performance Optimized
	 *
	 * Provides a high-performance AMD module extension system for EspoCRM that allows
	 * extending core views without modifying original files. Features include:
	 * - Automatic module ID generation from file paths
	 * - LRU caching for optimal memory usage
	 * - Lazy initialization for faster startup
	 * - V8-optimized stack trace parsing
	 *
	 * @module waymark-to/extender
	 * @requires Espo.loader
	 */

	const MODULE_PATH_REGEX = /\/client\/(?:custom\/)?modules\/([^\/]+)\/src\/(.+?)\.js/;
	const MODULE_ID_SPLIT_REGEX = /:(.+)$/;
	const TRANSPILED_PATH_REGEX = /\/client\/lib\/transpiled\/src\/(.+?)\.js/;

	const STATE_NORMAL = 0;
	const STATE_EXTENDING = 1;

	let cachedBoundFunctions = null;

	const checkLoaderInterval = setInterval(() => {
		if (window.Espo && window.Espo.loader && window.define && window.require) {
			clearInterval(checkLoaderInterval);
			setupViewExtensions();
		}
	}, 10);

	/**
	 * @class LRUCache
	 * @classdesc Least Recently Used cache implementation for optimal memory management.
	 * Automatically evicts least recently accessed items when capacity is reached.
	 *
	 * @param {number} [maxSize=100] - Maximum number of entries before eviction begins
	 *
	 * @example
	 * const cache = new LRUCache(50);
	 * cache.set('key', 'value');
	 * cache.get('key'); // 'value' - also marks as recently used
	 */
	class LRUCache {
		constructor(maxSize = 100) {
			this.maxSize = maxSize;
			this.cache = new Map();
		}

		/**
		 * Retrieves a value from cache and marks it as recently used
		 * @param {string} key - Cache key
		 * @returns {*} Cached value or undefined if not found
		 */
		get(key) {
			if (!this.cache.has(key)) return undefined;
			const value = this.cache.get(key);
			this.cache.delete(key);
			this.cache.set(key, value);
			return value;
		}

		/**
		 * Stores a value in cache, evicting LRU entry if at capacity
		 * @param {string} key - Cache key
		 * @param {*} value - Value to cache
		 */
		set(key, value) {
			if (this.cache.has(key)) {
				this.cache.delete(key);
			} else if (this.cache.size >= this.maxSize) {
				const firstKey = this.cache.keys().next().value;
				this.cache.delete(firstKey);
			}
			this.cache.set(key, value);
		}

		/**
		 * Checks if key exists in cache without affecting LRU order
		 * @param {string} key - Cache key
		 * @returns {boolean} True if key exists
		 */
		has(key) {
			return this.cache.has(key);
		}
	}

	/**
	 * @function setupViewExtensions
	 * @description Initializes the view extension system by overriding AMD loader methods
	 * and setting up global define/require/extend functions. Uses lazy initialization
	 * and caching strategies for optimal performance.
	 *
	 * @private
	 */
	function setupViewExtensions() {
		const loader = window.Espo.loader;

		const moduleCache = new Set();
		const dependencyCache = new LRUCache(150);
		const pathCache = new LRUCache(100);

		let viewExtensionMap = null;
		let viewExtensionSet = null;
		let extensionsDependencyGraph = null;
		let state = STATE_NORMAL;

		/**
		 * @function initializeExtensions
		 * @description Lazily initializes extension mappings from DOM script tag.
		 * Parses viewExtensions configuration and builds dependency graph for
		 * extension chains. Only executes once when first needed.
		 *
		 * @private
		 */
		const initializeExtensions = () => {
			if (viewExtensionMap !== null) return;

			viewExtensionMap = {};
			extensionsDependencyGraph = {};

			const extensionsTag = document.querySelector('script[data-name="extension-views"]');
			if (extensionsTag) {
				try {
					viewExtensionMap = JSON.parse(extensionsTag.textContent) || {};
					viewExtensionSet = new Set(Object.keys(viewExtensionMap));

					for (const [view, extensions] of Object.entries(viewExtensionMap)) {
						let prev = view;
						for (const extension of extensions) {
							extensionsDependencyGraph[extension] = prev;
							prev = extension;
						}
					}
				} catch (e) {
					console.error('Failed to parse extension views:', e);
					viewExtensionMap = {};
					viewExtensionSet = new Set();
				}
			} else {
				viewExtensionMap = {};
				viewExtensionSet = new Set();
			}
		};

		if (!cachedBoundFunctions) {
			cachedBoundFunctions = {
				originalLoaderRequire: loader.require.bind(loader),
				originalLoaderDefine: loader.define.bind(loader)
			};
		}
		const {originalLoaderRequire, originalLoaderDefine} = cachedBoundFunctions;

		/**
		 * @function getModuleId
		 * @description Extracts module ID from current call stack using optimized
		 * stack trace parsing. Uses V8's captureStackTrace when available for
		 * better performance. Results are cached in LRU cache.
		 *
		 * @returns {string|null} Module ID in format "module-name:path/to/file" or null
		 * @private
		 *
		 * @example
		 * // Called from /client/modules/waymark-to/src/views/about.js
		 * getModuleId(); // Returns: "waymark-to:views/about"
		 */
		const getModuleId = () => {
			let stack;

			if (Error.captureStackTrace) {
				const obj = {};
				Error.captureStackTrace(obj, getModuleId);
				stack = obj.stack;
			} else {
				stack = new Error().stack;
			}

			const cachedId = pathCache.get(stack);
			if (cachedId !== undefined) return cachedId;

			// Filter out transpiled paths and extender.js itself from stack trace
			const lines = stack.split('\n');
			let moduleId = null;

			for (const line of lines) {
				// Skip transpiled paths
				if (TRANSPILED_PATH_REGEX.test(line)) continue;

				// Skip extender.js itself
				if (line.includes('/extender.js')) continue;

				// Look for actual module paths
				const match = line.match(MODULE_PATH_REGEX);
				if (match) {
					moduleId = match[1] + ':' + match[2];
					break;
				}
			}

			pathCache.set(stack, moduleId);
			return moduleId;
		};

		/**
		 * @function loader.require
		 * @description Override of EspoCRM's require method to handle view extension
		 * mapping. Transparently redirects requires to extended views when configured.
		 *
		 * @param {string|string[]} id - Module ID(s) to require
		 * @param {Function} callback - Callback receiving resolved modules
		 * @param {Function} [errorCallback] - Error handler
		 * @returns {*} Result from original loader.require
		 */
		loader.require = function (id, callback, errorCallback) {
			if (viewExtensionMap === null) initializeExtensions();

			if (state === STATE_NORMAL) {
				if (typeof id === 'string' && viewExtensionSet.has(id)) {
					const extensions = viewExtensionMap[id];
					id = extensions[extensions.length - 1];
				} else if (Array.isArray(id)) {
					id = id.map(dep => {
						if (viewExtensionSet.has(dep)) {
							const extensions = viewExtensionMap[dep];
							return extensions[extensions.length - 1];
						}
						return dep;
					});
				}
			}

			state = STATE_NORMAL;
			return originalLoaderRequire(id, callback, errorCallback);
		};

		/**
		 * @function loader.define
		 * @description Override of EspoCRM's define method to handle extension
		 * dependencies and prevent duplicate module definitions. Automatically
		 * adjusts dependencies for extension modules.
		 *
		 * @param {string} id - Module ID
		 * @param {string[]} deps - Dependency array
		 * @param {Function} factory - Module factory function
		 * @returns {*} Result from original loader.define
		 */
		loader.define = function (id, deps, factory) {
			if (id && moduleCache.has(id)) {
				return;
			}

			if (extensionsDependencyGraph === null) initializeExtensions();

			if (id && id in extensionsDependencyGraph && deps && deps.length) {
				state = STATE_EXTENDING;
				deps[0] = extensionsDependencyGraph[id];
			}

			if (id) {
				moduleCache.add(id);
			}

			return originalLoaderDefine(id, deps, factory);
		};

		/**
		 * @function resolveDependencies
		 * @description Resolves dependencies for a module ID, using cached results
		 * when available. For extension modules, returns the parent module from
		 * dependency graph. For regular modules, extracts base path after colon.
		 *
		 * @param {string} moduleId - Module ID to resolve dependencies for
		 * @returns {string[]} Array of dependency module IDs
		 * @private
		 *
		 * @example
		 * resolveDependencies('waymark-to:views/about'); // ['views/about']
		 * resolveDependencies('custom:views/contact/detail'); // ['views/contact/detail']
		 */
		const resolveDependencies = (moduleId) => {
			const cached = dependencyCache.get(moduleId);
			if (cached) return cached;

			if (extensionsDependencyGraph === null) initializeExtensions();

			let dependencies;
			if (extensionsDependencyGraph[moduleId]) {
				dependencies = [extensionsDependencyGraph[moduleId]];
			} else {
				const colonIndex = moduleId.lastIndexOf(':');
				dependencies = colonIndex > -1 ? [moduleId.substring(colonIndex + 1)] : [];
			}

			dependencyCache.set(moduleId, dependencies);
			return dependencies;
		};

		/**
		 * @function window.extend
		 * @description Global function for extending EspoCRM views. Automatically
		 * determines module ID from file location and resolves parent dependencies.
		 *
		 * @global
		 * @param {string[]|Function} dependenciesOrCallback - Optional dependency array or callback function
		 * @param {Function} [callback] - Module factory callback (required if first param is array)
		 * @returns {*} Result from loader.define
		 *
		 * @throws {Error} If callback is not a function or module context cannot be determined
		 *
		 * @example
		 * // Extend with auto-detected dependencies
		 * extend((Dep) => {
		 *     return class extends Dep {
		 *         setup() {
		 *             super.setup();
		 *         }
		 *     };
		 * });
		 *
		 * @example
		 * // Extend with explicit dependencies
		 * extend(['views/record/detail', 'lib/utils'], (DetailView, Utils) => {
		 *     return class extends DetailView {
		 *         setup() {
		 *             super.setup();
		 *             Utils.doSomething();
		 *         }
		 *     };
		 * });
		 */
		window.extend = (dependenciesOrCallback, callback) => {
			let dependencies;

			if (typeof dependenciesOrCallback === 'function') {
				callback = dependenciesOrCallback;
				dependencies = null;
			} else if (Array.isArray(dependenciesOrCallback)) {
				dependencies = dependenciesOrCallback;
				if (typeof callback !== 'function') {
					throw new Error('extend() requires callback function when dependencies array is provided');
				}
			} else {
				throw new Error('extend() requires either a callback function or [dependencies, callback]');
			}

			const moduleId = getModuleId();
			if (!moduleId) {
				throw new Error('Could not determine module context for extend()');
			}

			if (!dependencies) {
				dependencies = resolveDependencies(moduleId);
			}

			state = STATE_EXTENDING;
			return loader.define(moduleId, dependencies, callback);
		};

		/**
		 * @function window.define
		 * @description Global AMD define function. Supports standard AMD signatures
		 * and automatically generates module ID from file location when not provided.
		 *
		 * @global
		 * @param {string|string[]|Function} arg1 - Module ID, dependencies array, or factory function
		 * @param {string[]|Function} [arg2] - Dependencies array or factory function
		 * @param {Function} [arg3] - Factory function
		 * @returns {*} Result from loader.define
		 *
		 * @example
		 * // Define with dependencies
		 * define(['views/base'], (BaseView) => {
		 *     return class extends BaseView {};
		 * });
		 *
		 * @example
		 * // Define without dependencies
		 * define(() => {
		 *     return { someValue: 123 };
		 * });
		 *
		 * @example
		 * // Define with explicit ID
		 * define('my-module', ['dep1'], (Dep1) => {
		 *     return class {};
		 * });
		 */
		window.define = (arg1, arg2, arg3) => {
			let id, deps, factory;

			// Parse arguments based on AMD spec
			if (typeof arg1 === 'string') {
				// define(id, deps, factory) or define(id, factory)
				id = arg1;
				if (Array.isArray(arg2)) {
					deps = arg2;
					factory = arg3;
				} else {
					deps = [];
					factory = arg2;
				}
			} else if (Array.isArray(arg1)) {
				// define(deps, factory)
				id = getModuleId();
				deps = arg1;
				factory = arg2;
			} else if (typeof arg1 === 'function') {
				// define(factory)
				id = getModuleId();
				deps = [];
				factory = arg1;
			}

			return loader.define(id, deps, factory);
		};

		/**
		 * @function window.require
		 * @description Global AMD require function. Loads and executes modules
		 * asynchronously. Supports multiple signatures for compatibility.
		 *
		 * @global
		 * @param {string|string[]|Object} arg1 - Module ID, dependencies array, or config object
		 * @param {string[]|Function} [arg2] - Dependencies array or callback function
		 * @param {Function} [arg3] - Callback function
		 * @param {Function} [arg4] - Error callback
		 * @returns {*} Result from loader.require
		 *
		 * @example
		 * // Require with dependencies
		 * require(['views/record/list'], (ListView) => {
		 *     const view = new ListView();
		 * });
		 *
		 * @example
		 * // Require single module as string
		 * require('views/base', (BaseView) => {
		 *     console.log(BaseView);
		 * });
		 *
		 * @example
		 * // With error handling
		 * require(['custom-module'],
		 *     (Module) => console.log('Loaded:', Module),
		 *     (error) => console.error('Failed to load:', error)
		 * );
		 */
		window.require = (arg1, arg2, arg3, arg4) => {
			let deps, callback, errorCallback;

			// Handle config object (not implemented, just pass through)
			if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
				return loader.require(arg1, arg2, arg3);
			}

			// Parse arguments
			if (typeof arg1 === 'string') {
				// require(moduleId, callback, errorCallback)
				deps = [arg1];
				callback = arg2;
				errorCallback = arg3;
			} else if (Array.isArray(arg1)) {
				// require(deps, callback, errorCallback)
				deps = arg1;
				callback = arg2;
				errorCallback = arg3;
			}

			// Just pass through to loader - let it handle validation
			return loader.require(deps, callback, errorCallback);
		};
	}
})();