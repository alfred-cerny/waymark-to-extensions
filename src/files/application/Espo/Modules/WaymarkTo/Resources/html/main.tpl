<!doctype html>
<html lang="{{lang}}">
<head>
    <title>{{applicationName}}</title>
    <script type="application/json" data-name="loader-params">{{loaderParams}}</script>
    <script type="application/json" data-name="extension-views">{{extensionViews}}</script>
    <script type="text/javascript" src="{{basePath}}client/modules/waymark-to/src/js/extender.js?r={{appTimestamp}}"></script>
    {{scriptsHtml}}
    <link rel="stylesheet" href="{{basePath}}{{stylesheet}}?r={{cacheTimestamp}}" id='main-stylesheet'>
        {{additionalStyleSheetsHtml}}
        {{additionalThemeStyleSheetsHtml}}
        {{linksHtml}}
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="{{applicationDescription}}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="alternate icon" href="{{basePath}}{{faviconAlternate}}" type="image/x-icon">
    <link rel="icon" href="{{basePath}}{{favicon}}" type="{{faviconType}}">
    <script type="text/javascript" nonce="{{nonce}}">
        let loadedApp;

        const run = app => {
            {{runScript}}
        };

        const init = () => {
            require('{{appClientClassName}}', App => {
                new App({
                id: '{{applicationId}}',
                useCache: {{useCache}},
                cacheTimestamp: {{cacheTimestamp}},
                appTimestamp: {{appTimestamp}},
                basePath: '{{basePath}}',
                apiUrl: '{{apiUrl}}',
                ajaxTimeout: {{ajaxTimeout}},
                internalModuleList: {{internalModuleList}},
                bundledModuleList: {{bundledModuleList}},
                theme: {{theme}},
            }, app => {
                    Espo.Ui.notifyWait ??= () => Espo.Ui.notify(' ... ');
                    loadedApp = app;

                    run(app);
                });
            });
        };

        window.addEventListener('pageshow', event => {
            if (event.persisted && loadedApp) {
                run(loadedApp);

                return;
            }

            init();
        });
    </script>
</head>
<body data-id="{{applicationId}}">
    <div class="container content"></div>
</body>
</html>
