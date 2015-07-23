/*
Handle setup of app, load in Angular dependencies, routing, etc.
*/

(function() {
  'use strict';
  angular.module('crouton', [
      // Angular libraries
      'ui.router',
      //markdown parser
      'mdParserDirective',
      //select for search
      'ui.select',
      'ngSanitize',
      //localStorage
      'LocalStorageModule',
      //shared
      'navbarController',
      //components
      'homeController',
      'signupController',
      'postController',
      'postFactory',
      'userController',
      'authFactory',
      'userController',
      'authFactory',
      'searchFactory',
      'searchController',
      'tagController',
      'tagFactory',
      'faqController',
      //shared directives
      'searchbarDirective',
      'homeSubnavDirective',
      'postSubnavDirective'
    ])
    .config(config)
    .run(run);

  config.$inject = ['$stateProvider', '$urlRouterProvider'];

  function config($stateProvider, $urlRouterProvider) {
    // console.log(localStorageServiceProvider);
    // //prefix local storage variables for safety and profit
    // localStorageServiceProvider
    // .setPrefix('crouton');



    // Default to the index view if the URL loaded is not found
    $urlRouterProvider.otherwise('/');
    //TODO: html5mode?
    $stateProvider
      .state('home', {
        url: '/',
        authenticate: false,
        views: {
          nav: {
            templateUrl: 'app/shared/navbar/navbar.html',
            controller: 'navbarController'
          },
          content: {
            templateUrl: 'app/components/home/home.html',
            controller: 'homeController'
          },
          subnav: {
            templateUrl: 'app/shared/subnavs/homeSubnav.html',
            controller: 'homeController'
          }
        },
        resolve: {
          /* If a user is not authenticated in the client, check to see if user is authenticated in the session.  If user is authenticated in the session, save that user's encoded id in localStorage. */
          authUser: function($stateParams, $location, authFactory) {
            if (!localStorage.jwtToken) {
              authFactory.checkAuth()
                .then(function(res) {
                  console.log(res);
                  if (!!res.data) {
                    localStorage.jwtToken = res.data;
                  }
                });
            }
          }
        }
      })
      .state('post', {
        url: '/post/{id:int}',
        authenticate: false,
        views: {
          nav: {
            templateUrl: 'app/shared/navbar/navbar.html',
            controller: 'navbarController'
          },
          content: {
            templateUrl: 'app/components/post/post.html',
            controller: 'postController'
          },
          subnav: {
            templateUrl: 'app/shared/subnavs/postSubnav.html'
          }
        }
      })
      .state('signup', {
        authenticate: false,
        url: '/signup',
        views: {
          content: {
            templateUrl: 'app/components/signup/signup.html',
            controller: 'signupController'
          }
        }
      })
      .state('account', {
        authenticate: true,
        url: '/account',
        views: {
          nav: {
            templateUrl: 'app/shared/navbar/navbar.html',
            controller: 'navbarController'
          },
          content: {
            templateUrl: 'app/components/account/account.html',
            controller: 'userController'
          }
        }
      })
      .state('searchResults', {
        authenticate: false,
        url: '/searchresults',
        views: {
          nav: {
            templateUrl: 'app/shared/navbar/navbar.html',
            controller: 'navbarController'
          },
          content: {
            templateUrl: 'app/components/search/searchresults.html',
            controller: 'searchController'
          }
        },
        resolve: {
          searchResults: function(searchFactory, $rootScope) {
            return searchFactory.searchPosts($rootScope.searchQuery, $rootScope.searchType);
          }
        }
      })
      .state('faq', {
        authenticate: false,
        url: '/faq',
        views: {
          nav: {
            templateUrl: 'app/shared/navbar/navbar.html',
            controller: 'navbarController'
          },
          content: {
            templateUrl: 'app/components/faq/faq.html',
            controller: 'faqController'
          }
        }
      });
    // .state('tag', {
    //   authenticate: true,
    //   url: '/tags',
    //   views: {
    //     nav: {
    //       templateUrl: 'app/shared/navbar/navbar.html',
    //       controller: 'navbarController'
    //     },
    //     content: {
    //       templateUrl: 'app/components/tag/tag.html',
    //       controller: 'tagController'
    //     }
    //   }
    // });

  }

  function run($rootScope, $state, authFactory) {
    // Enable FastClick to remove the 300ms click delay on touch devices
    FastClick.attach(document.body);
    $rootScope.currentUser = {};


    /* Event listener for state change, and checks for authentication via authFactory
    Redirects is false returned  */
    $rootScope.$on("$stateChangeStart",
      function(event, toState, toParams, fromState, fromParams) {

        //let the client know at the root scope whether user is actually logged in.
        //This will allow certain elements to hide and show based on user status
        $rootScope.loggedIn = authFactory.loggedIn();

        //redirect to signup if state destination needs auth and if user is not logged in.
        if (toState.authenticate && !authFactory.loggedIn()) {
          $state.go("signup");
          event.preventDefault();
        }
      });
  }
})();
