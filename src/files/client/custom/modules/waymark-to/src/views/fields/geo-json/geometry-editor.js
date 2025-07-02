define('waymark-to:views/fields/geo-json/geometry-editor', ['view'], (Dep) => {

    return class extends Dep {
        
        template = 'waymark-to:fields/geo-json/geometry-editor';
        
        coordinateViews = {};
        
        data() {
            const geometryType = this.options.geometryType || 'Polygon';
            
            return {
                geometryType: geometryType,
                allowedGeometryTypes: this.options.allowedGeometryTypes || ['Polygon'],
                isPoint: geometryType === 'Point',
                hasCoordinates: this.options.coordinates && this.options.coordinates.length > 0,
                showAddButton: geometryType !== 'Point' || !this.hasCoordinates()
            };
        }
        
        events = {
            'change .geometry-type-select': 'onGeometryTypeChange',
            'click [data-action="addCoordinate"]': 'actionAddCoordinate'
        };
        
        setup() {
            this.coordinates = this.options.coordinates || [];
            this.geometryType = this.options.geometryType || 'Polygon';
            this.coordinateSystem = this.options.coordinateSystem || 'WGS84';
            
            this.listenTo(this, 'after:render', () => {
                this.initializeSortable();
            });
        }
        
        afterRender() {
            this.clearView('coordinates-container');
            
            this.coordinates.forEach((coord, index) => {
                this.createCoordinateView(coord, index);
            });
            
            // Initialize sortable after coordinate views are created
            setTimeout(() => {
                this.initializeSortable();
            }, 50);
        }
        
        createCoordinateView(coord, index) {
            const viewName = 'coordinate-' + index;
            const $container = $('<div data-name="' + viewName + '"></div>');
            this.$el.find('.coordinates-container').append($container);
            
            this.createView(viewName, 'waymark-to:views/fields/geo-json/coordinate-input', {
                el: this.getSelector() + ' [data-name="' + viewName + '"]',
                lon: coord.lon || coord[0] || 0,
                lat: coord.lat || coord[1] || 0,
                alt: coord.alt || coord[2] || null,
                index: index,
                allowRemove: this.geometryType !== 'Point' || this.coordinates.length > 1,
                allowDrag: this.geometryType !== 'Point' && this.coordinates.length > 1,
                coordinateSystem: this.coordinateSystem
            }, view => {
                this.coordinateViews[viewName] = view;
                
                this.listenTo(view, 'coordinate-change', data => {
                    this.updateCoordinate(data.index, data);
                });
                
                this.listenTo(view, 'coordinate-remove', index => {
                    this.removeCoordinate(index);
                });
                
                view.render();
            });
        }
        
        onGeometryTypeChange(e) {
            const newType = e.currentTarget.value;
            this.geometryType = newType;
            
            // Reset coordinates with appropriate defaults
            this.coordinates = this.getDefaultCoordinates(newType);
            
            this.trigger('geometry-type-change', {
                type: newType,
                coordinates: this.coordinates
            });
            
            this.reRender();
        }
        
        getDefaultCoordinates(geometryType) {
            switch (geometryType) {
                case 'Point':
                    return [{lon: 0, lat: 0}];
                case 'LineString':
                case 'MultiPoint':
                    return [{lon: 0, lat: 0}, {lon: 1, lat: 1}];
                case 'Polygon':
                case 'MultiLineString':
                    return [
                        {lon: 0, lat: 0},
                        {lon: 1, lat: 0},
                        {lon: 1, lat: 1},
                        {lon: 0, lat: 1},
                        {lon: 0, lat: 0}
                    ];
                default:
                    return [];
            }
        }
        
        actionAddCoordinate() {
            if (this.geometryType === 'Point' && this.coordinates.length >= 1) {
                Espo.Ui.notify(this.translate('Point can only have one coordinate', 'messages', 'Global'), 'warning');
                return;
            }
            
            const newCoord = {lon: 0, lat: 0};
            this.coordinates.push(newCoord);
            
            const index = this.coordinates.length - 1;
            this.createCoordinateView(newCoord, index);
            
            this.trigger('coordinates-change', this.getCoordinates());
        }
        
        updateCoordinate(index, data) {
            if (this.coordinates[index]) {
                this.coordinates[index] = {
                    lon: data.lon,
                    lat: data.lat,
                    alt: data.alt
                };
                
                this.trigger('coordinates-change', this.getCoordinates());
            }
        }
        
        removeCoordinate(index) {
            this.coordinates.splice(index, 1);
            
            // Re-render to update indices
            this.reRender();
            
            this.trigger('coordinates-change', this.getCoordinates());
        }
        
        initializeSortable() {
            if (!$.fn.sortable || this.geometryType === 'Point') return;
            
            this.$el.find('.coordinates-container').sortable({
                handle: '.drag-handle',
                items: '[data-name^="coordinate-"]',
                axis: 'y',
                containment: 'parent',
                cursor: 'grabbing',
                distance: 5,
                update: (event, ui) => {
                    const newOrder = [];
                    this.$el.find('[data-name^="coordinate-"]').each((i, el) => {
                        const viewName = $(el).attr('data-name');
                        const oldIndex = parseInt(viewName.split('-')[1]);
                        if (this.coordinates[oldIndex]) {
                            newOrder.push(this.coordinates[oldIndex]);
                        }
                    });
                    
                    this.coordinates = newOrder;
                    this.reRender();
                    this.trigger('coordinates-change', this.getCoordinates());
                }
            });
        }
        
        getCoordinates() {
            return this.formatCoordinatesForGeometry(this.coordinates, this.geometryType);
        }
        
        formatCoordinatesForGeometry(coords, geometryType) {
            const formatted = coords.map(c => {
                const coord = [c.lon, c.lat];
                if (c.alt !== null && c.alt !== undefined) {
                    coord.push(c.alt);
                }
                return coord;
            });
            
            switch (geometryType) {
                case 'Point':
                    return formatted[0] || [0, 0];
                case 'LineString':
                case 'MultiPoint':
                    return formatted;
                case 'Polygon':
                case 'MultiLineString':
                    // Auto-close polygon if needed
                    if (geometryType === 'Polygon' && formatted.length > 0) {
                        const first = formatted[0];
                        const last = formatted[formatted.length - 1];
                        if (first[0] !== last[0] || first[1] !== last[1]) {
                            formatted.push([first[0], first[1]]);
                        }
                    }
                    return [formatted];
                case 'MultiPolygon':
                    return [[formatted]];
                default:
                    return formatted;
            }
        }
        
        validate() {
            let isValid = true;
            
            // Validate each coordinate
            Object.values(this.coordinateViews).forEach(view => {
                if (view && !view.validate()) {
                    isValid = false;
                }
            });
            
            // Validate minimum coordinate requirements
            const minimumRequirements = {
                'LineString': {min: 2, message: 'LineString must have at least 2 positions'},
                'Polygon': {min: 4, message: 'Polygon must have at least 4 positions'}
            };
            
            const requirement = minimumRequirements[this.geometryType];
            if (requirement && this.coordinates.length < requirement.min) {
                console.error(`[${this.geometryType}] ${requirement.message} (currently has ${this.coordinates.length})`);
                isValid = false;
            }
            
            return isValid;
        }
        
        
        hasCoordinates() {
            return this.coordinates && this.coordinates.length > 0;
        }
    };
});