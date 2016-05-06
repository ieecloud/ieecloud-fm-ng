angular.module( 'ieecloud-fm', [
  'ngMaterial',
  'ieecloud-fm.config',
  'templates-app',
  'templates-common',
  'ieecloud-fm.home',
  'ui.router'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider , fileManagerConfigProvider, $mdThemingProvider, $httpProvider) {
  $mdThemingProvider.theme('default');
  $urlRouterProvider.otherwise( '/home' );


  $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
  $httpProvider.defaults.withCredentials = true;

  var defaults = fileManagerConfigProvider.$get();
  fileManagerConfigProvider.set({
    appName: 'ieecloud-fm',
    allowedActions: angular.extend(defaults.allowedActions, {
      remove: true
    }),
    listUrl: 'https://store-grf.ieecloud.com/api/jsonws/fm/listUrl',
    siteListUrl: 'https://store-grf.ieecloud.com/api/jsonws/site/list',
    cssClasses: {
      iconsPanelClass: 'icons-panel-class',
      sideBarPanelClass: 'side-bar'
    }
  });


  //$httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
  //$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
  //$httpProvider.defaults.withCredentials = true;

})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {

});




