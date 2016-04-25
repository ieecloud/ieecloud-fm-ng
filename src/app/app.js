angular.module( 'ieecloud-fm', [
  'ngMaterial',
  'ieecloud-fm.config',
  'templates-app',
  'templates-common',
  'ieecloud-fm.home',
  'ui.router'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider , fileManagerConfigProvider, $mdThemingProvider) {
  $mdThemingProvider.theme('default');
  $urlRouterProvider.otherwise( '/home' );

  var defaults = fileManagerConfigProvider.$get();
  fileManagerConfigProvider.set({
    appName: 'ieecloud-fm',
    allowedActions: angular.extend(defaults.allowedActions, {
      remove: true
    })
  });


  //$httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
  //$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
  //$httpProvider.defaults.withCredentials = true;

})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {

});



