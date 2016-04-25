angular.module( 'ieecloud-fm.home', [
  'ui.router'
])
.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})



.controller( 'HomeCtrl', function HomeController( $scope , $log) {

  $scope.selectFile = function(item){
     $log.info(item);
  };
});



