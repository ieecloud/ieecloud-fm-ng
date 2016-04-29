angular.module('ieecloud-fm').service('FileNavigator', [
    '$http', '$q', '$log', 'fileManagerConfig', 'Item', function ($http, $q, $log, fileManagerConfig, Item) {

        var FileNavigator = function () {
            this.requesting = false;
            this.fileList = [];
            this.currentPath = [];
            this.history = [];
            this.error = '';
        };

        FileNavigator.prototype.deferredHandler = function (data, deferred, defaultMsg) {
            $log.info(data);
            if (!data || typeof data !== 'object') {
                this.error = 'Response error, please check the docs';
            }
            if (!this.error && data.result && data.result.error) {
                this.error = data.result.error;
            }
            if (!this.error && data.error) {
                this.error = data.error.message;
            }
            if (!this.error && defaultMsg) {
                this.error = defaultMsg;
            }
            if (this.error) {
                return deferred.reject(data);
            }
            return deferred.resolve(data);
        };

        FileNavigator.prototype.list = function (siteID) {
            var self = this;
            var deferred = $q.defer();

            var path = '';
            angular.forEach(self.currentPath, function(val){
                path =+ val.currentPath ?  val.currentPath + '/' : '';
            });
            var copyCurrentPath = angular.copy(self.currentPath);
            var curPathElement = copyCurrentPath.shift();
            var id = siteID;
            if(curPathElement){
                id = curPathElement.currentID || siteID;
            }
            var data = {
                params: {
                    mode: 'list',
                    onlyFolders: false,
                    path: '/' + path,
                    id: id
                }
            };

            self.requesting = true;
            self.fileList = [];
            self.error = '';

            $http.post(fileManagerConfig.listUrl, data).success(function (data) {
                self.deferredHandler(data, deferred);
            }).error(function (data) {
                self.deferredHandler(data, deferred, 'Unknown error listing, check the response');
            })['finally'](function () {
                self.requesting = false;
            });
            return deferred.promise;
        };


        FileNavigator.prototype.siteList = function () {
            var self = this;
            var deferred = $q.defer();

            self.requesting = true;
            self.error = '';

            $http.get(fileManagerConfig.siteListUrl + '?t='+Date.now()).success(function (data) {
                self.deferredHandler(data, deferred);
            }).error(function (data) {
                self.deferredHandler(data, deferred, 'Unknown error listing, check the response');
            })['finally'](function () {
                self.requesting = false;
            });
            return deferred.promise;
        };


        FileNavigator.prototype.refreshSiteList = function () {
            var self = this;
            return self.siteList().then(function (response) {
                return response.data;
            });
        };



        FileNavigator.prototype.refresh = function (siteID) {
            var self = this;
            var path = '';
            angular.forEach(self.currentPath, function(val){
                path =+ val.currentPath ?  val.currentPath + '/' : '';
            });

            path = path.substr(0, path.length-1);

            return self.list(siteID).then(function (data) {
                self.fileList = (data.result || []).map(function (file) {
                    return new Item(file, self.currentPath);
                });
                self.buildTree(path);
            });
        };

        FileNavigator.prototype.buildTree = function (path) {
            var flatNodes = [], selectedNode = {};

            function recursive(parent, item, path) {
                var absName = path ? (path + '/' + item.model.name) : item.model.name;
                if (parent.name.trim() && path.trim().indexOf(parent.name) !== 0) {
                    parent.nodes = [];
                }
                if (parent.name !== path) {
                    for (var i in parent.nodes) {
                        recursive(parent.nodes[i], item, path);
                    }
                } else {
                    for (var e in parent.nodes) {
                        if (parent.nodes[e].name === absName) {
                            return;
                        }
                    }
                    parent.nodes.push({item: item, name: absName, nodes: []});
                }
                parent.nodes = parent.nodes.sort(function (a, b) {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() === b.name.toLowerCase() ? 0 : 1;
                });
            }

            function flatten(node, array) {
                array.push(node);
                for (var n in node.nodes) {
                    flatten(node.nodes[n], array);
                }
            }

            function findNode(data, path) {
                return data.filter(function (n) {
                    return n.name === path;
                })[0];
            }

            if (this.history.length === 0) {
                this.history.push({name: '', nodes: []});
            }
            flatten(this.history[0], flatNodes);
            selectedNode = findNode(flatNodes, path);
            selectedNode.nodes = [];

            for (var o in this.fileList) {
                var item = this.fileList[o];
                if(item.isFolder()){recursive(this.history[0], item, path);
                }
            }
        };

        FileNavigator.prototype.folderClick = function (item) {
            this.currentPath = [];
            if (item && item.isFolder()) {
                this.currentPath = item.model.currentPath();
            }
            this.refresh();
        };

        FileNavigator.prototype.upDir = function () {
            if (this.currentPath[0]) {
                this.currentPath = this.currentPath.slice(0, -1);
                this.refresh();
            }
        };

        FileNavigator.prototype.goTo = function (index) {
            this.currentPath = this.currentPath.slice(0, index + 1);
            this.refresh();
        };

        FileNavigator.prototype.fileNameExists = function (fileName) {
            for (var item in this.fileList) {
                item = this.fileList[item];
                if (fileName.trim && item.model.name.trim() === fileName.trim()) {
                    return true;
                }
            }
        };

        FileNavigator.prototype.listHasFolders = function () {
            for (var item in this.fileList) {
                if (this.fileList[item].model.type === 'dir') {
                    return true;
                }
            }
        };

        return FileNavigator;
    }]);
