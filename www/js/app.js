// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
fazeapp = angular.module('faze', ['ionic', 'faze.controllers', 'auth0', 'angular-storage', 'angular-jwt'])

.run(function($ionicPlatform, $rootScope, auth, store, jwtHelper, $state, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && Keyboard) {
      Keyboard.hideFormAccessoryBar(true);
      Keyboard.disableScrollingInShrinkView(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.overlaysWebView(true);
      StatusBar.styleLightContent();
      if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#0644cf");
      }
    }
    if (window.ThreeDeeTouch) {
      ThreeDeeTouch.isAvailable(function (avail) {
        if (avail) {
          ThreeDeeTouch.configureQuickActions([
        {
          type: 'checkin', // optional, but can be used in the onHomeIconPressed callback
          title: 'Check in', // mandatory
          subtitle: 'Quickly check in', // optional
          iconType: 'Compose' // optional
        },
        {
          type: 'share',
          title: 'Share',
          subtitle: 'Share like you care',
          iconType: 'Share'
        },
        {
          type: 'search',
          title: 'Search',
          iconType: 'Search'
        },
        {
          title: 'Show favorites',
          iconTemplate: 'HeartTemplate' // from Assets catalog
        }
      ]);
      document.addEventListener('deviceready', function () {
      ThreeDeeTouch.onHomeIconPressed = function (payload) {
        console.log("Icon pressed. Type: " + payload.type + ". Title: " + payload.title + ".");
        if (payload.type == 'checkin') {
          document.location = 'checkin.html';
        } else if (payload.type == 'share') {
          document.location = 'share.html';
        } else {
          // hook up any other icons you may have and do something awesome (e.g. launch the Camera UI, then share the image to Twitter)
          console.log(JSON.stringify(payload));
        }
      }
    }, false);
        }
    });
    }
  });
  //This hooks all auth avents
  auth.hookEvents();
  //This event gets triggered on URL change
  var refreshingToken = null;
  $rootScope.$on('$stateChangeStart', function() {
    var token = store.get('token');
    var refreshToken = store.get('refreshToken');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        if (refreshToken) {
          if (refreshingToken === null) {
            refreshingToken = auth.refreshIdToken(refreshToken).then(function(idToken) {
              store.set('token', idToken);
              auth.authenticate(store.get('profile'), idToken);
            }).finally(function() {
              refreshingToken = null;
            });
          }
          return refreshingToken;
        } else {
          $ionicPopup.alert({
            title: 'Error',
            template: 'Not Logged In'
          }).then(function(res) {
            $state.go('app.login');
          });
        }
      }
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, authProvider, $httpProvider, jwtInterceptorProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html'
          //controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html'
        //controller: 'PlaylistsCtrl'
      }
    }
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');

  authProvider.init({
    domain: 'faze.auth0.com',
    clientID: 'Vv36Rvrbhm6oQuARTu0lUfCzJF0eTpOY',
    loginState: 'login' // This is the name of the state where you'll show the login, which is defined above...
  });

  jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    var idToken = store.get('token');
    var refreshToken = store.get('refreshToken');
    // If no token return null
    if (!idToken || !refreshToken) {
      return null;
    }
    // If token is expired, get a new one
    if (jwtHelper.isTokenExpired(idToken)) {
      return auth.refreshIdToken(refreshToken).then(function(idToken) {
        store.set('token', idToken);
        return idToken;
      });
    } else {
      return idToken;
    }
  }

  $httpProvider.interceptors.push('jwtInterceptor');

});
