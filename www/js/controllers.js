angular.module('faze.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicPopup, $state, store) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  //$scope.loginData = {};

  /*// Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };*/

  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  if (!store.get('token') || !store.get('refreshToken') || !store.get('profile')) {
    $ionicPopup.alert({
      title: 'Not Logged In',
      template: 'You are not logged in!'
    });
  }

  $scope.$watch(function () {
    return $ionicSideMenuDelegate.isOpenLeft();
  },
    function (open) {
    if (open){
      StatusBar.styleDefault();
      console.log("Opened");
    } else {
      StatusBar.styleLightContent();
      console.log("Closed");
    }
  });
})

.controller('PlaylistsCtrl', function($scope, $state, $rootScope, $scope, $stateParams, $timeout) {
  $scope.currentview = "None";
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (toState.name === "app.single") {
      $timeout(function() {
        $scope.$apply(function () {
          $scope.currentview = $scope.playlists[toParams.playlistId-1].title;
        });
      });
    }
  });
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('LoginCtrl', function(store, $scope, $location, auth, $ionicPopup, $state) {
  $scope.login = function() {
    auth.signin({
      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      }
    }, function(profile, token, accessToken, state, refreshToken) {
      // Success callback
      store.set('profile', profile);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      $ionicPopup.alert({
        title: 'Logged In',
        template: 'Success'
      });
      $location.path('/');
    }, function() {
      $ionicPopup.alert({
        title: 'Error Logging In',
        template: 'We seem to have had a problem logging you in'
      });
    });
  }
  $scope.logout = function() {
    console.log("Logging Out...");
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $ionicPopup.alert({
      title: 'Logged Out',
      template: 'Success'
    });
  }
});
