<div class="feature-editor panel panel-default" data-index="{{featureIndex}}">
    <div class="panel-heading">
        <div class="row">
            <div class="col-xs-1">
                <span class="feature-drag-handle" style="cursor: move; padding: 5px;" title="{{translate 'Drag to reorder' scope='Global'}}">
                    <span class="fas fa-grip-vertical"></span>
                </span>
            </div>
            <div class="col-xs-7">
                <h5 class="panel-title">
                    <a href="#" data-action="toggleFeature" class="feature-toggle">
                        <i class="fas toggle-icon {{#if isExpanded}}fa-chevron-up{{else}}fa-chevron-down{{/if}}"></i>
                        {{translate 'Feature' scope='Global'}} {{displayNumber}} 
                        <span class="text-muted">({{geometryType}})</span>
                    </a>
                </h5>
            </div>
            <div class="col-xs-4 text-right">
                <div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-danger" data-action="removeFeature" data-index="{{featureIndex}}" title="{{translate 'Remove' scope='Global'}}">
                        <span class="fas fa-trash"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <div class="panel-body feature-content" {{#unless isExpanded}}style="display: none;"{{/unless}}>
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
</div>