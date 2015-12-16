var app = angular.module('mhApp',  ['ngRoute', 'ngCookies'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
                when('/home', {templateUrl: 'app/partials/home.html',   controller: 'HomeController'}).
                when('/heatmap', {templateUrl: 'app/partials/heatmap.html',   controller: 'HeatmapController'}).
                when('/pca', {templateUrl: 'app/partials/pca.html',   controller: 'PcaController'}).
                when('/survival', {templateUrl: 'app/partials/survival.html',   controller: 'SurvivalController'}).
                otherwise({redirectTo: '/home'});
}]);
