<div class="row">
    <div class="col-md-6">
        <label>{{translate 'Edit Template' category='labels'}}</label>
        <textarea
            class="main-element form-control auto-height"
            data-name="{{name}}"
            {{#if params.maxLength}}maxlength="{{params.maxLength}}"{{/if}}
            rows="{{rows}}"
            style="resize: vertical; min-height: 400px;"
        ></textarea>
        <div class="summernote hidden"></div>
        <div class="small text-muted" style="margin-top: 5px;">
            {{translate 'Supported placeholders' category='labels'}}: version, text.
        </div>
    </div>
    <div class="col-md-6">
        <label>{{translate 'Preview' category='labels'}}</label>
        <div class="panel panel-default">
            <div class="panel-body">
                <div class="html-preview" style="min-height: 400px;">
                    {{{htmlPreview}}}
                </div>
            </div>
        </div>
    </div>
</div>