angular.module('ieecloud-fm.config', ['pascalprecht.translate']).provider('fileManagerConfig', function () {
    var values = {
        appName: 'ieecloud-fm',
        defaultLang: 'en',
        listUrl: 'https://store-grf.ieecloud.com/api/jsonws/fm/listUrl',
        siteListUrl: 'https://store-grf.ieecloud.com/api/jsonws/site/list',
        uploadUrl: 'bridges/php/handler.php',
        renameUrl: 'bridges/php/handler.php',
        copyUrl: 'bridges/php/handler.php',
        removeUrl: 'bridges/php/handler.php',
        editUrl: 'bridges/php/handler.php',
        getContentUrl: 'bridges/php/handler.php',
        createFolderUrl: 'bridges/php/handler.php',
        downloadFileUrl: 'bridges/php/handler.php',
        compressUrl: 'bridges/php/handler.php',
        extractUrl: 'bridges/php/handler.php',
        permissionsUrl: 'bridges/php/handler.php',

        searchForm: true,
        sidebar: true,
        breadcrumb: true,
        allowedActions: {
            createFolder: true,
            upload: true,
            rename: true,
            copy: true,
            edit: true,
            changePermissions: true,
            compress: true,
            compressChooseName: true,
            extract: true,
            download: true,
            preview: true,
            remove: true
        },

        cssClasses : {
          iconsPanelClass : '',
          sideBarPanelClass : ''
        },

        showSizeForDirectories: true,
        useBinarySizePrefixes: false,

        previewImagesInModal: true,
        enablePermissionsRecursive: true,
        compressAsync: true,
        extractAsync: true,

        isEditableFilePattern: /\.(txt|html?|aspx?|ini|pl|py|md|css|js|log|htaccess|htpasswd|json|sql|xml|xslt?|sh|rb|as|bat|cmd|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb)$/i,
        isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
        isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
        tplPath: 'common/directives/templates'
    };

    return {
        $get: function () {
            return values;
        },
        set: function (constants) {
            angular.extend(values, constants);
        }
    };

});

