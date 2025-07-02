define('waymark-to:views/fields/geo-json/feature-editor', ['view'], (Dep) => {

    return class extends Dep {
        
        template = 'waymark-to:fields/geo-json/feature-editor';
        
        propertyViews = {};
        
        data() {
            return {
                isExpanded: this.options.isExpanded !== false,
                featureIndex: this.options.featureIndex,
                displayNumber: this.options.displayNumber || (this.options.featureIndex + 1),
                geometryType: this.geometry?.type || this.options.allowedGeometryTypes?.[0] || 'Polygon'
            };
        }
        
        events = {
            'click [data-action="toggleFeature"]': 'actionToggleFeature',
            'click [data-action="addProperty"]': 'actionAddProperty'
        };
        
        setup() {
            this.geometry = this.options.geometry || {
                type: this.options.allowedGeometryTypes?.[0] || 'Polygon',
                coordinates: []
            };
            
            this.properties = this.options.properties || {};
            this.coordinateSystem = this.options.coordinateSystem || 'WGS84';
        }
        
        afterRender() {
            if (this.options.isExpanded !== false) {
                this.createGeometryEditor();
                this.createPropertyEditors();
            }
        }
        
        actionToggleFeature(e) {
            e.preventDefault();
            
            const $content = this.$el.find('.feature-content');
            const $icon = this.$el.find('.toggle-icon');
            
            $content.slideToggle(() => {
                const isVisible = $content.is(':visible');
                $icon.toggleClass('fa-chevron-down fa-chevron-up');
                
                if (isVisible && !this.getView('geometry-editor')) {
                    this.createGeometryEditor();
                    this.createPropertyEditors();
                }
            });
        }
        
        createGeometryEditor() {
            const coordinates = this.extractCoordinatesFromGeometry(this.geometry);
            
            this.createView('geometry-editor', 'waymark-to:views/fields/geo-json/geometry-editor', {
                el: this.getSelector() + ' .geometry-container',
                geometryType: this.geometry.type,
                coordinates: coordinates,
                allowedGeometryTypes: this.options.allowedGeometryTypes,
                coordinateSystem: this.coordinateSystem
            }, view => {
                this.listenTo(view, 'geometry-type-change', data => {
                    this.geometry.type = data.type;
                    this.geometry.coordinates = data.coordinates;
                    this.trigger('feature-change', this.getFeatureData());
                });
                
                this.listenTo(view, 'coordinates-change', coordinates => {
                    this.geometry.coordinates = coordinates;
                    this.trigger('feature-change', this.getFeatureData());
                });
                
                view.render();
            });
        }
        
        createPropertyEditors() {
            this.clearView('properties-container');
            
            const properties = Object.entries(this.properties);
            properties.forEach(([key, value], index) => {
                this.createPropertyView(key, value, index);
            });
        }
        
        createPropertyView(key, value, index) {
            const viewName = 'property-' + index;
            const $container = $('<div data-name="' + viewName + '"></div>');
            this.$el.find('.properties-container').append($container);
            
            this.createView(viewName, 'waymark-to:views/fields/geo-json/property-input', {
                el: this.getSelector() + ' [data-name="' + viewName + '"]',
                key: key,
                value: value,
                index: index
            }, view => {
                this.propertyViews[viewName] = view;
                
                this.listenTo(view, 'property-change', data => {
                    this.updateProperty(data);
                });
                
                this.listenTo(view, 'property-remove', data => {
                    this.removeProperty(data);
                });
                
                view.render();
            });
        }
        
        extractCoordinatesFromGeometry(geometry) {
            if (!geometry || !geometry.type || !geometry.coordinates) return [];
            
            let coords = [];
            
            switch (geometry.type) {
                case 'Point':
                    if (geometry.coordinates) {
                        coords = [{
                            lon: geometry.coordinates[0],
                            lat: geometry.coordinates[1],
                            alt: geometry.coordinates[2]
                        }];
                    }
                    break;
                    
                case 'LineString':
                case 'MultiPoint':
                    if (geometry.coordinates) {
                        coords = geometry.coordinates.map(coord => ({
                            lon: coord[0],
                            lat: coord[1],
                            alt: coord[2]
                        }));
                    }
                    break;
                    
                case 'Polygon':
                case 'MultiLineString':
                    if (geometry.coordinates && geometry.coordinates[0]) {
                        coords = geometry.coordinates[0].map(coord => ({
                            lon: coord[0],
                            lat: coord[1],
                            alt: coord[2]
                        }));
                    }
                    break;
            }
            
            return coords;
        }
        
        actionAddProperty() {
            const existingCount = Object.keys(this.properties).length;
            const key = `property_${existingCount + 1}`;
            const value = '';
            
            this.properties[key] = value;
            this.createPropertyView(key, value, existingCount);
            
            this.trigger('feature-change', this.getFeatureData());
        }
        
        updateProperty(data) {
            if (data.oldKey && data.oldKey !== data.key) {
                delete this.properties[data.oldKey];
            }
            
            if (data.key && data.key.trim()) {
                this.properties[data.key.trim()] = data.value || '';
            }
            
            this.trigger('feature-change', this.getFeatureData());
        }
        
        removeProperty(data) {
            delete this.properties[data.key];
            
            // Re-render property editors to update indices
            this.createPropertyEditors();
            
            this.trigger('feature-change', this.getFeatureData());
        }
        
        getFeatureData() {
            return {
                type: 'Feature',
                geometry: this.geometry,
                properties: this.properties
            };
        }
        
        validate() {
            let isValid = true;
            
            // Validate geometry
            const geometryView = this.getView('geometry-editor');
            if (geometryView && !geometryView.validate()) {
                isValid = false;
            }
            
            // Validate properties
            Object.values(this.propertyViews).forEach(view => {
                if (view && !view.validate()) {
                    isValid = false;
                }
            });
            
            return isValid;
        }
    };
});