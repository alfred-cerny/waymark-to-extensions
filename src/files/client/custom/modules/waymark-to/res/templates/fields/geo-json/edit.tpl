<div class="geo-json-edit-container">
    {{#if isFeatureCollection}}
        <div class="feature-collection-editor">
            <div class="form-group">
                <label>{{translate 'Features' scope='Global'}}</label>
                <button type="button" class="btn btn-default btn-sm pull-right" data-action="addFeature">
                    <span class="fas fa-plus"></span> {{translate 'Add Feature' scope='Global'}}
                </button>
            </div>
            
            <div class="features-list" data-sortable="true">
                <!-- Feature views will be rendered here -->
            </div>
            
            {{#unless hasFeatures}}
            <div class="text-center text-muted" style="padding: 20px;">
                <p>{{translate 'No features added yet' scope='Global'}}</p>
                <button type="button" class="btn btn-default" data-action="addFeature">
                    <span class="fas fa-plus"></span> {{translate 'Add First Feature' scope='Global'}}
                </button>
            </div>
            {{/unless}}
        </div>
    {{else if isGeometryCollection}}
        <div class="geometry-collection-editor">
            <div class="form-group">
                <label>{{translate 'Geometries' scope='Global'}}</label>
                <button type="button" class="btn btn-default btn-sm pull-right" data-action="addGeometry">
                    <span class="fas fa-plus"></span> {{translate 'Add Geometry' scope='Global'}}
                </button>
            </div>
            
            <div class="geometries-list">
                <!-- Geometry views will be rendered here -->
            </div>
            
            {{#unless hasGeometries}}
            <div class="text-center text-muted" style="padding: 20px;">
                <p>{{translate 'No geometries added yet' scope='Global'}}</p>
                <button type="button" class="btn btn-default" data-action="addGeometry">
                    <span class="fas fa-plus"></span> {{translate 'Add First Geometry' scope='Global'}}
                </button>
            </div>
            {{/unless}}
        </div>
    {{else if isFeature}}
        <div class="feature-editor">
            <div class="geometry-container">
                <!-- Geometry editor view will be rendered here -->
            </div>
            
            <div class="properties-section" style="margin-top: 20px;">
                <div class="form-group">
                    <label>{{translate 'Properties' scope='Global'}}</label>
                    <button type="button" class="btn btn-default btn-sm pull-right" data-action="addProperty">
                        <span class="fas fa-plus"></span> {{translate 'Add Property' scope='Global'}}
                    </button>
                </div>
                
                <div class="properties-container">
                    <!-- Property views will be rendered here -->
                </div>
            </div>
        </div>
    {{else if isSingleGeometry}}
        <div class="single-geometry-editor">
            <!-- Geometry editor view will be rendered here -->
        </div>
    {{/if}}
    
    <div class="geo-json-info" style="margin-top: 15px;">
        <small class="text-muted">
            <span class="fas fa-map-marker-alt"></span> 
            {{translate 'GeoJSON Type' scope='Global'}}: <strong>{{geoJsonType}}</strong>
            {{#if coordinateSystem}}• {{translate 'Coordinate System' scope='Global'}}: {{coordinateSystem}}{{/if}}
        </small>
    </div>
</div>

