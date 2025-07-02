define('waymark-to:views/fields/geo-json', ['views/fields/json-object'], (Dep) => {

	return class extends Dep {

		type = 'geoJson';

		detailTemplate = 'waymark-to:fields/geo-json/detail';
		editTemplate = 'waymark-to:fields/geo-json/edit';

		events = {
			'click [data-action="addFeature"]': 'actionAddFeature',
			'click [data-action="removeFeature"]': 'actionRemoveFeature',
			'click [data-action="moveFeatureUp"]': 'actionMoveFeatureUp',
			'click [data-action="moveFeatureDown"]': 'actionMoveFeatureDown',
			'click [data-action="addGeometry"]': 'actionAddGeometry',
			'click [data-action="removeGeometry"]': 'actionRemoveGeometry',
			'click [data-action="addProperty"]': 'actionAddProperty',
			'change .geojson-type-select': 'onGeoJsonTypeChange'
		};

		geometryTypeField;

		setup() {
			super.setup();

			this.geoJsonType = this.params.geoJsonType || 'Feature';
			this.allowedGeometryTypes = this.params.allowedGeometryTypes || ['Polygon'];
			this.coordinateSystem = this.params.coordinateSystem || 'WGS84';

			if (this.params.validateGeometry !== false) {
				this.validations.push('geometry');
			}

			this.hasSortable = typeof $.fn.sortable === 'function';

			const actualAttributePartList = this.getMetadata().get(['fields', this.type, 'actualFields']) || [];
			actualAttributePartList.forEach(item => {
				this[item + 'Field'] = this.name + Espo.Utils.upperCaseFirst(item);
			});

			this.listenTo(this.model, 'change:' + this.name, () => {
				if (!this.isEditMode()) {
					this.reRender();
				}
			});

			// Initialize child view references
			this.featureViews = {};
			this.geometryViews = {};
		}

		afterRender() {
			super.afterRender();

			if (this.isEditMode()) {
				this.createChildViews();
				// Initialize sortable after child views are created
				setTimeout(() => {
					this.initializeSortable();
				}, 100);
			}
		}

		createChildViews() {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();

			switch (this.geoJsonType) {
				case 'FeatureCollection':
					this.createFeatureCollectionViews(geoJson);
					break;
				case 'GeometryCollection':
					this.createGeometryCollectionViews(geoJson);
					break;
				case 'Feature':
					this.createSingleFeatureView(geoJson);
					break;
				default:
					// Single geometry
					this.createSingleGeometryView(geoJson);
					break;
			}
		}

		createFeatureCollectionViews(geoJson) {
			const features = geoJson.features || [];

			features.forEach((feature, index) => {
				this.createFeatureView(feature, index);
			});
		}

		createFeatureView(feature, index) {
			const viewName = 'feature-' + index;
			const $container = $('<div data-name="' + viewName + '"></div>');
			this.$el.find('.features-list').append($container);

			this.createView(viewName, 'waymark-to:views/fields/geo-json/feature-editor', {
				el: this.getSelector() + ' [data-name="' + viewName + '"]',
				geometry: feature.geometry,
				properties: feature.properties,
				featureIndex: index,
				displayNumber: index + 1,
				allowedGeometryTypes: this.allowedGeometryTypes,
				coordinateSystem: this.coordinateSystem,
				isExpanded: index === 0
			}, view => {
				this.featureViews[viewName] = view;

				this.listenTo(view, 'feature-change', data => {
					this.updateFeature(index, data);
				});

				view.render();
			});
		}

		createGeometryCollectionViews(geoJson) {
			const geometries = geoJson.geometries || [];

			geometries.forEach((geometry, index) => {
				this.createGeometryView(geometry, index);
			});
		}

		createGeometryView(geometry, index) {
			const viewName = 'geometry-' + index;
			const coordinates = this.extractCoordinatesFromGeometry(geometry);

			// Create wrapper structure
			const $wrapper = $('<div class="geometry-item panel panel-default" data-index="' + index + '"></div>');
			const $heading = $('<div class="panel-heading"></div>');
			$heading.append('<span class="geometry-drag-handle" style="cursor: move; margin-right: 10px;"><i class="fas fa-grip-vertical"></i></span>');
			$heading.append('<span class="panel-title">' + this.translate('Geometry', 'labels', 'Global') + ' ' + (index + 1) + '</span>');
			$wrapper.append($heading);
			$wrapper.append('<div class="panel-body" data-name="' + viewName + '"></div>');
			this.$el.find('.geometries-list').append($wrapper);

			this.createView(viewName, 'waymark-to:views/fields/geo-json/geometry-editor', {
				el: this.getSelector() + ' [data-name="' + viewName + '"]',
				geometryType: geometry.type,
				coordinates: coordinates,
				allowedGeometryTypes: this.allowedGeometryTypes,
				coordinateSystem: this.coordinateSystem
			}, view => {
				this.geometryViews[viewName] = view;

				this.listenTo(view, 'geometry-type-change', data => {
					this.updateGeometry(index, {type: data.type, coordinates: data.coordinates});
				});

				this.listenTo(view, 'coordinates-change', coordinates => {
					this.updateGeometry(index, {type: geometry.type, coordinates: coordinates});
				});

				view.render();
			});
		}

		createSingleFeatureView(geoJson) {
			const coordinates = this.extractCoordinatesFromGeometry(geoJson.geometry);

			// Create geometry editor
			this.createView('single-geometry', 'waymark-to:views/fields/geo-json/geometry-editor', {
				el: this.getSelector() + ' .geometry-container',
				geometryType: geoJson.geometry?.type || this.allowedGeometryTypes[0],
				coordinates: coordinates,
				allowedGeometryTypes: this.allowedGeometryTypes,
				coordinateSystem: this.coordinateSystem
			}, view => {
				this.listenTo(view, 'geometry-type-change', data => {
					const current = this.model.get(this.name) || this.createEmptyGeoJson();
					current.geometry = {type: data.type, coordinates: data.coordinates};
					this.model.set(this.name, current);
					this.trigger('change');
				});

				this.listenTo(view, 'coordinates-change', coordinates => {
					const current = this.model.get(this.name) || this.createEmptyGeoJson();
					current.geometry.coordinates = coordinates;
					this.model.set(this.name, current);
					this.trigger('change');
				});

				view.render();
			});

			// Create property editors
			const properties = geoJson.properties || {};
			this.createPropertyViews(properties);
		}

		createSingleGeometryView(geoJson) {
			const coordinates = this.extractCoordinatesFromGeometry(geoJson);

			this.createView('single-geometry', 'waymark-to:views/fields/geo-json/geometry-editor', {
				el: this.options.el + ' .single-geometry-editor',
				geometryType: geoJson.type || this.geoJsonType,
				coordinates: coordinates,
				allowedGeometryTypes: this.allowedGeometryTypes,
				coordinateSystem: this.coordinateSystem
			}, view => {
				this.listenTo(view, 'geometry-type-change', data => {
					const current = {type: data.type, coordinates: data.coordinates};
					this.model.set(this.name, current);
					this.trigger('change');
				});

				this.listenTo(view, 'coordinates-change', coordinates => {
					const current = this.model.get(this.name) || {type: this.geoJsonType};
					current.coordinates = coordinates;
					this.model.set(this.name, current);
					this.trigger('change');
				});

				view.render();
			});
		}

		createPropertyViews(properties) {
			Object.entries(properties).forEach(([key, value], index) => {
				this.createPropertyView(key, value, index);
			});
		}

		createPropertyView(key, value, index) {
			const viewName = 'property-' + index;

			const $propertyContainer = $('<div data-name="' + viewName + '"></div>');
			this.$el.find('.properties-container').append($propertyContainer);

			this.createView(viewName, 'waymark-to:views/fields/geo-json/property-input', {
				el: this.getSelector() + ' [data-name="' + viewName + '"]',
				key: key,
				value: value,
				index: index
			}, view => {
				this.listenTo(view, 'property-change', data => {
					this.updateProperty(data);
				});

				this.listenTo(view, 'property-remove', data => {
					this.removeProperty(data);
				});

				view.render();
			});
		}

		updateFeature(index, data) {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			if (geoJson.features && geoJson.features[index]) {
				geoJson.features[index] = data;
				this.model.set(this.name, geoJson);
				this.trigger('change');
			}
		}

		updateGeometry(index, data) {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			if (geoJson.geometries && geoJson.geometries[index]) {
				geoJson.geometries[index] = data;
				this.model.set(this.name, geoJson);
				this.trigger('change');
			}
		}

		updateProperty(data) {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			if (!geoJson.properties) {
				geoJson.properties = {};
			}

			if (data.oldKey && data.oldKey !== data.key) {
				delete geoJson.properties[data.oldKey];
			}

			if (data.key && data.key.trim()) {
				geoJson.properties[data.key.trim()] = data.value || '';
			}

			this.model.set(this.name, geoJson);
			this.trigger('change');
		}

		removeProperty(data) {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			if (geoJson.properties) {
				delete geoJson.properties[data.key];
				this.model.set(this.name, geoJson);
				this.trigger('change');
			}
		}

		createEmptyGeoJson() {
			const defaultGeometryType = this.allowedGeometryTypes[0] || 'Polygon';

			switch (this.geoJsonType) {
				case 'FeatureCollection':
					return {
						type: 'FeatureCollection',
						features: []
					};
				case 'GeometryCollection':
					return {
						type: 'GeometryCollection',
						geometries: []
					};
				case 'Feature':
					return {
						type: 'Feature',
						geometry: {
							type: defaultGeometryType,
							coordinates: this.getDefaultCoordinates(defaultGeometryType)
						},
						properties: {}
					};
				default:
					// Single geometry
					return {
						type: this.geoJsonType,
						coordinates: this.getDefaultCoordinates(this.geoJsonType)
					};
			}
		}

		getDefaultCoordinates(geometryType) {
			switch (geometryType) {
				case 'Point':
					return [0, 0];
				case 'LineString':
				case 'MultiPoint':
					return [[0, 0], [1, 1]];
				case 'Polygon':
				case 'MultiLineString':
					return [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]];
				case 'MultiPolygon':
					return [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]];
				default:
					return [];
			}
		}


		initializeSortable() {
			if (!this.hasSortable) return;

			// Initialize sortable for features (if FeatureCollection)
			if (this.geoJsonType === 'FeatureCollection') {
				this.$el.find('.features-list').sortable({
					handle: '.feature-drag-handle',
					items: '[data-name^="feature-"]',
					axis: 'y',
					containment: 'parent',
					cursor: 'grabbing',
					distance: 5,
					update: (event, ui) => {
						this.reorderFeatures();
					}
				});
			}

			// Initialize sortable for geometries (if GeometryCollection)
			if (this.geoJsonType === 'GeometryCollection') {
				this.$el.find('.geometries-list').sortable({
					handle: '.geometry-drag-handle',
					items: '.geometry-item',
					axis: 'y',
					containment: 'parent',
					cursor: 'grabbing',
					distance: 5,
					update: (event, ui) => {
						this.reorderGeometries();
					}
				});
			}
		}

		reorderFeatures() {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			const newFeatures = [];

			this.$el.find('[data-name^="feature-"]').each((i, el) => {
				const viewName = $(el).attr('data-name');
				const oldIndex = parseInt(viewName.split('-')[1]);
				if (geoJson.features[oldIndex]) {
					newFeatures.push(geoJson.features[oldIndex]);
				}
			});

			geoJson.features = newFeatures;
			this.model.set(this.name, geoJson);
			this.trigger('change');

			this.reRender();
		}

		reorderGeometries() {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			const newGeometries = [];

			this.$el.find('.geometry-item').each((i, el) => {
				const oldIndex = parseInt($(el).attr('data-index'));
				if (geoJson.geometries[oldIndex]) {
					newGeometries.push(geoJson.geometries[oldIndex]);
				}
			});

			geoJson.geometries = newGeometries;
			this.model.set(this.name, geoJson);
			this.trigger('change');

			this.reRender();
		}

		extractCoordinatesFromGeometry(geometry) {
			if (!geometry || !geometry.type) return [];

			switch (geometry.type) {
				case 'Point':
					if (geometry.coordinates) {
						return [{
							lon: geometry.coordinates[0],
							lat: geometry.coordinates[1],
							alt: geometry.coordinates[2]
						}];
					}
					break;

				case 'LineString':
				case 'MultiPoint':
					if (geometry.coordinates) {
						return geometry.coordinates.map(coord => ({
							lon: coord[0],
							lat: coord[1],
							alt: coord[2]
						}));
					}
					break;

				case 'Polygon':
				case 'MultiLineString':
					if (geometry.coordinates && geometry.coordinates[0]) {
						return geometry.coordinates[0].map(coord => ({
							lon: coord[0],
							lat: coord[1],
							alt: coord[2]
						}));
					}
					break;
			}

			return [];
		}

		data() {
			const data = super.data();
			const geoJson = this.model.get(this.name) || {};

			data.geoJsonType = this.geoJsonType;
			data.coordinateSystem = this.coordinateSystem;
			data.allowedGeometryTypes = this.allowedGeometryTypes;
			data.hasSortable = this.hasSortable;

			if (this.isEditMode()) {
				data.isFeatureCollection = this.geoJsonType === 'FeatureCollection';
				data.isGeometryCollection = this.geoJsonType === 'GeometryCollection';
				data.isFeature = this.geoJsonType === 'Feature';
				data.isSingleGeometry = !['FeatureCollection', 'GeometryCollection', 'Feature'].includes(this.geoJsonType);

				// Count for empty state display
				if (data.isFeatureCollection) {
					data.hasFeatures = geoJson.features && geoJson.features.length > 0;
				} else if (data.isGeometryCollection) {
					data.hasGeometries = geoJson.geometries && geoJson.geometries.length > 0;
				}
			} else {
				data.formattedValue = this.getFormattedValue();
				data.summary = this.getGeoJsonSummary(geoJson);
			}

			return data;
		}


		getGeoJsonSummary(geoJson) {
			if (!geoJson.type) return {type: 'None', count: 0};

			switch (geoJson.type) {
				case 'FeatureCollection':
					return {
						type: 'FeatureCollection',
						count: geoJson.features ? geoJson.features.length : 0
					};
				case 'GeometryCollection':
					return {
						type: 'GeometryCollection',
						count: geoJson.geometries ? geoJson.geometries.length : 0
					};
				case 'Feature':
					return {
						type: 'Feature',
						geometryType: geoJson.geometry ? geoJson.geometry.type : 'None'
					};
				default:
					return {
						type: geoJson.type,
						coordinateCount: this.extractCoordinatesFromGeometry(geoJson).length
					};
			}
		}

		// Action methods for FeatureCollection
		actionAddFeature() {
			const geoJson = this.model.get(this.name) || {type: 'FeatureCollection', features: []};
			const newFeature = {
				type: 'Feature',
				geometry: {
					type: this.allowedGeometryTypes[0] || 'Polygon',
					coordinates: this.getDefaultCoordinates(this.allowedGeometryTypes[0] || 'Polygon')
				},
				properties: {}
			};

			geoJson.features = geoJson.features || [];
			geoJson.features.push(newFeature);

			this.model.set(this.name, geoJson);
			this.reRender();
		}

		actionRemoveFeature(e) {
			const index = parseInt($(e.currentTarget).data('index'));
			const geoJson = this.model.get(this.name) || {type: 'FeatureCollection', features: []};

			if (geoJson.features && geoJson.features.length > index) {
				geoJson.features.splice(index, 1);
				this.model.set(this.name, geoJson);
				this.reRender();
			}
		}

		actionAddGeometry() {
			const geoJson = this.model.get(this.name) || {type: 'GeometryCollection', geometries: []};
			const newGeometry = {
				type: this.allowedGeometryTypes[0] || 'Polygon',
				coordinates: this.getDefaultCoordinates(this.allowedGeometryTypes[0] || 'Polygon')
			};

			geoJson.geometries = geoJson.geometries || [];
			geoJson.geometries.push(newGeometry);

			this.model.set(this.name, geoJson);
			this.reRender();
		}

		actionRemoveGeometry(e) {
			const index = parseInt($(e.currentTarget).data('index'));
			const geoJson = this.model.get(this.name) || {type: 'GeometryCollection', geometries: []};

			if (geoJson.geometries && geoJson.geometries.length > index) {
				geoJson.geometries.splice(index, 1);
				this.model.set(this.name, geoJson);
				this.reRender();
			}
		}

		getFormattedValue() {
			const value = this.model.get(this.name);
			if (!value) return '';

			try {
				return JSON.stringify(value, null, 2);
			} catch (e) {
				return '';
			}
		}


		actionAddProperty() {
			const geoJson = this.model.get(this.name) || this.createEmptyGeoJson();
			const existingCount = Object.keys(geoJson.properties || {}).length;
			const key = `property_${existingCount + 1}`;

			if (!geoJson.properties) {
				geoJson.properties = {};
			}
			geoJson.properties[key] = '';

			this.model.set(this.name, geoJson);

			this.createPropertyView(key, '', existingCount);
		}

		onGeoJsonTypeChange(e) {
			const newType = $(e.currentTarget).val();
			this.geoJsonType = newType;

			this.model.set(this.name, this.createEmptyGeoJson());
			this.trigger('change');
			this.reRender();
		}

		actionMoveFeatureUp(e) {
			const index = parseInt($(e.currentTarget).data('index'));
			const geoJson = this.model.get(this.name) || {type: 'FeatureCollection', features: []};

			if (geoJson.features && index > 0 && index < geoJson.features.length) {
				const temp = geoJson.features[index];
				geoJson.features[index] = geoJson.features[index - 1];
				geoJson.features[index - 1] = temp;

				this.model.set(this.name, geoJson);
				this.reRender();
			}
		}

		actionMoveFeatureDown(e) {
			const index = parseInt($(e.currentTarget).data('index'));
			const geoJson = this.model.get(this.name) || {type: 'FeatureCollection', features: []};

			if (geoJson.features && index >= 0 && index < geoJson.features.length - 1) {
				const temp = geoJson.features[index];
				geoJson.features[index] = geoJson.features[index + 1];
				geoJson.features[index + 1] = temp;

				this.model.set(this.name, geoJson);
				this.reRender();
			}
		}

		fetch() {
			const data = {};
			data[this.name] = this.model.get(this.name);
			return data;
		}

		getCoordinateBounds() {
			if (this.coordinateSystem === 'WebMercator') {
				return {
					lonMin: -20037508.34,
					lonMax: 20037508.34,
					latMin: -20037508.34,
					latMax: 20037508.34
				};
			}

			// Default to WGS84 bounds
			return {
				lonMin: -180,
				lonMax: 180,
				latMin: -90,
				latMax: 90
			};
		}

		showValidationError(message, context = '') {
			const fullMessage = context ? `${context}: ${message}` : message;
			console.error('[GeoJSON Validation]', fullMessage);
			Espo.Ui.error(fullMessage);
		}

		validateGeometry() {
			const geoJson = this.model.get(this.name);
			if (!geoJson) return false; // No data is valid (not an error)

			let hasError = false;

			switch (this.geoJsonType) {
				case 'FeatureCollection':
					hasError = this.validateFeatureCollectionViews();
					break;
				case 'GeometryCollection':
					hasError = this.validateGeometryCollectionViews();
					break;
				case 'Feature':
					hasError = this.validateSingleFeatureView();
					break;
				default:
					hasError = this.validateSingleGeometryView();
					break;
			}

			return hasError; // Return true if validation failed
		}

		validateFeatureCollectionViews() {
			let hasError = false;
			const geoJson = this.model.get(this.name);

			if (!geoJson.features || geoJson.features.length === 0) {
				this.showValidationError('At least one feature is required', 'FeatureCollection');
				return true;
			}

			Object.entries(this.featureViews).forEach(([viewName, view]) => {
				if (view && view.validate && !view.validate()) {
					const index = parseInt(viewName.split('-')[1]) + 1;
					this.showValidationError(`Validation failed`, `Feature ${index}`);
					hasError = true;
				}
			});

			return hasError;
		}

		validateGeometryCollectionViews() {
			let hasError = false;
			const geoJson = this.model.get(this.name);

			if (!geoJson.geometries || geoJson.geometries.length === 0) {
				this.showValidationError('At least one geometry is required', 'GeometryCollection');
				return true;
			}

			Object.entries(this.geometryViews).forEach(([viewName, view]) => {
				if (view && view.validate && !view.validate()) {
					const index = parseInt(viewName.split('-')[1]) + 1;
					this.showValidationError(`Validation failed`, `Geometry ${index}`);
					hasError = true;
				}
			});

			return hasError;
		}

		validateSingleFeatureView() {
			const geometryView = this.getView('single-geometry');
			let hasError = false;

			if (geometryView && geometryView.validate && !geometryView.validate()) {
				hasError = true;
			}

			const geoJson = this.model.get(this.name) || {};
			if (geoJson.properties) {
				Object.keys(geoJson.properties).forEach((key, index) => {
					const viewName = 'property-' + index;
					const view = this.getView(viewName);
					if (view && view.validate && !view.validate()) {
						this.showValidationError(`Invalid property: ${key}`, 'Feature');
						hasError = true;
					}
				});
			}

			return hasError;
		}

		validateSingleGeometryView() {
			const geometryView = this.getView('single-geometry');

			if (geometryView && geometryView.validate) {
				return !geometryView.validate();
			}

			return false;
		}

	};
});