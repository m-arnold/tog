angular.module('userController', ['userFactory'])

.controller('userController', function ($scope, userFactory) {

  /* passes in local user id to determine which profile to look at */
  userFactory.getUser()
    .then(function (user) {
      console.log(user);
      $scope.user = user;
    });


  /* removes user from DB */
  $scope.removeUser = function () {
    userFactory.removeUser()
      .then(function (user) {
      });
  };

});
