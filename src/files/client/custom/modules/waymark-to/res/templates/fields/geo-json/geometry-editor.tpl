<div class="geometry-editor">
    <div class="form-group">
        <label>{{translate 'Geometry Type' scope='Global'}}</label>
        <select class="form-control geometry-type-select">
            {{#each allowedGeometryTypes}}
            <option value="{{this}}" {{#ifEqual this ../geometryType}}selected{{/ifEqual}}>{{this}}</option>
            {{/each}}
        </select>
    </div>
    
    <div class="coordinates-section">
        <label>{{translate 'Coordinates' scope='Global'}}</label>
        
        <div class="coordinates-container">
            <!-- Coordinate views will be rendered here -->
        </div>
        
        {{#if showAddButton}}
        <div class="add-coordinate-section" style="margin-top: 10px;">
            <button type="button" class="btn btn-default btn-sm" data-action="addCoordinate">
                <span class="fas fa-plus"></span> 
                {{#if isPoint}}
                    {{translate 'Set Coordinate' scope='Global'}}
                {{else}}
                    {{translate 'Add Coordinate' scope='Global'}}
                {{/if}}
            </button>
            
            {{#ifEqual geometryType 'Polygon'}}
            <small class="text-muted" style="margin-left: 10px;">
                <span class="fas fa-info-circle"></span> {{translate 'Polygon will be automatically closed' scope='Global'}}
            </small>
            {{/ifEqual}}
        </div>
        {{/if}}
    </div>
</div>