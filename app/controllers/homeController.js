app.controller('HomeController', function($scope, $rootScope, $http, $cookies, $location) {

    init();

    function init() {
        $scope.welcomeMessage = "欢迎使用微旋基因图谱";
    }

});