angular.module('ieecloud-fm')

.directive('ieecloudFm', ['$parse', 'fileManagerConfig', function ($parse, fileManagerConfig) {
    return {
        restrict: 'EA',
        scope: {
            onSelectFile: '&'
        },
        templateUrl: fileManagerConfig.tplPath + '/ieecloud-fm.tpl.html',
        controllerAs: 'fileManagerCtrl',
        controller: function($scope, fileManagerConfig, $translate, Item, FileNavigator , FileUploader) {
            var self = this;
            self.config = fileManagerConfig;
            var $storage = window.localStorage;

            var init = function(){
                self.config = fileManagerConfig;
                self.reverse = false;
                self.predicate = ['model.type', 'model.name'];
                self.order = function(predicate) {
                    self.reverse = (self.predicate[1] === predicate) ? !self.reverse : false;
                    self.predicate[1] = predicate;
                };

                self.query = '';
                self.temp = new Item();
                self.fileNavigator = new FileNavigator();
                self.fileUploader = FileUploader;
                self.uploadFileList = [];
                self.viewTemplate = $storage.getItem('viewTemplate') || 'main-table.tpl.html';
                self.changeLanguage(self.getQueryParam('lang'));
                self.isWindows = self.getQueryParam('server') === 'Windows';
                self.fileNavigator.refresh();
            };



            self.toggleTemplate = function() {
                if(self.viewTemplate === 'main-icons.tpl.html'){
                    self.viewTemplate = 'main-table.tpl.html';
                }else{
                    self.viewTemplate = 'main-icons.tpl.html';
                }
                $storage.setItem('viewTemplate', self.viewTemplate);
            };

            self.setTemplate = function() {
                $storage.setItem('viewTemplate', name);
                self.viewTemplate = name;
            };

            self.changeLanguage = function (locale) {
                if (locale) {
                    $storage.setItem('language', locale);
                    return $translate.use(locale);
                }
                $translate.use($storage.getItem('language') || fileManagerConfig.defaultLang);
            };

            self.touch = function(item) {
                item = item instanceof Item ? item : new Item();
                item.revert();
                self.temp = item;
            };

            self.smartClick = function(item) {
                if (item.isFolder()) {
                    return self.fileNavigator.folderClick(item);
                }
                if (item.isImage()) {
                    if (self.config.previewImagesInModal) {
                        return self.openImagePreview(item);
                    }
                    return item.download(true);
                }
                if (item.isEditable()) {
                    return self.openEditItem(item);
                }
                $scope.onSelectFile({item: item.model});
            };

            self.openImagePreview = function(item) {
                item.inprocess = true;
                self.modal('imagepreview')
                    .find('#imagepreview-target')
                    .attr('src', item.getUrl(true))
                    .unbind('load error')
                    .on('load error', function() {
                        item.inprocess = false;
                        self.$apply();
                    });
                return self.touch(item);
            };

            self.openEditItem = function(item) {
                item.getContent();
                self.modal('edit');
                return self.touch(item);
            };

            self.modal = function(id, hide) {
                return $('#' + id).modal(hide ? 'hide' : 'show');
            };

            self.isInThisPath = function(path) {
                var currentPath = self.fileNavigator.currentPath.pathArray ? self.fileNavigator.currentPath.pathArray.join('/') : '';
                return currentPath.indexOf(path) !== -1;
            };

            self.edit = function(item) {
                item.edit().then(function() {
                    self.modal('edit', true);
                });
            };

            self.changePermissions = function(item) {
                item.changePermissions().then(function() {
                    self.modal('changepermissions', true);
                });
            };

            self.copy = function(item) {
                var samePath = item.tempModel.path.join() === item.model.path.join();
                if (samePath && self.fileNavigator.fileNameExists(item.tempModel.name)) {
                    item.error = $translate.instant('error_invalid_filename');
                    return false;
                }
                item.copy().then(function() {
                    self.fileNavigator.refresh();
                    self.modal('copy', true);
                });
            };

            self.compress = function(item) {
                item.compress().then(function() {
                    self.fileNavigator.refresh();
                    if (! self.config.compressAsync) {
                        return self.modal('compress', true);
                    }
                    item.asyncSuccess = true;
                }, function() {
                    item.asyncSuccess = false;
                });
            };

            self.extract = function(item) {
                item.extract().then(function() {
                    self.fileNavigator.refresh();
                    if (! self.config.extractAsync) {
                        return self.modal('extract', true);
                    }
                    item.asyncSuccess = true;
                }, function() {
                    item.asyncSuccess = false;
                });
            };

            self.remove = function(item) {
                item.remove().then(function() {
                    self.fileNavigator.refresh();
                    self.modal('delete', true);
                });
            };

            self.rename = function(item) {
                var samePath = item.tempModel.path.join() === item.model.path.join();
                if (samePath && self.fileNavigator.fileNameExists(item.tempModel.name)) {
                    item.error = $translate.instant('error_invalid_filename');
                    return false;
                }
                item.rename().then(function() {
                    self.fileNavigator.refresh();
                    self.modal('rename', true);
                });
            };

            self.createFolder = function(item) {
                var name = item.tempModel.name && item.tempModel.name.trim();
                item.tempModel.type = 'dir';
                item.tempModel.path = self.fileNavigator.currentPath;
                if (name && !self.fileNavigator.fileNameExists(name)) {
                    item.createFolder().then(function() {
                        self.fileNavigator.refresh();
                        self.modal('newfolder', true);
                    });
                } else {
                    item.error = $translate.instant('error_invalid_filename');
                    return false;
                }
            };

            self.uploadFiles = function() {
                self.fileUploader.upload(self.uploadFileList, self.fileNavigator.currentPath).then(function() {
                    self.fileNavigator.refresh();
                    self.modal('uploadfile', true);
                }, function(data) {
                    var errorMsg = data.result && data.result.error || $translate.instant('error_uploading_files');
                    self.temp.error = errorMsg;
                });
            };

            self.getQueryParam = function(param) {
                var found;
                window.location.search.substr(1).split('&').forEach(function(item) {
                    if (param ===  item.split('=')[0]) {
                        found = item.split('=')[1];
                        return false;
                    }
                });
                return found;
            };

            init();
        }
    };
}])


.controller('ModalFileManagerCtrl',
    ['$scope', '$rootScope', 'FileNavigator',
function($scope, $rootScope, FileNavigator) {

    $scope.reverse = false;
    $scope.predicate = ['model.type', 'model.name'];
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate[1] === predicate) ? !$scope.reverse : false;
        $scope.predicate[1] = predicate;
    };

    $scope.fileNavigator = new FileNavigator();
    $rootScope.select = function(item, temp) {
        temp.tempModel.path = item.model.fullPath().split('/');
        $('#selector').modal('hide');
    };

    $rootScope.openNavigator = function(item) {
        $scope.fileNavigator.currentPath = item.model.path.slice();
        $scope.fileNavigator.refresh();
        $('#selector').modal('show');
    };

}])


.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFile);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files);
                });
            });
        }
    };
}])

.directive('ngRightClick', ['$parse', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, {$event: event});
            });
        });
    };
}]);
    
