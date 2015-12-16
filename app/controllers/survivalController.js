app.controller('SurvivalController', [function ($scope) {

    init();

    function init() {
        createSurvival();
    }

    function createSurvival() {

        var cx1 = new CanvasXpress("survivalCanvas",
            {
                "y": {
                    "vars": ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20"],
                    "smps": ["Time", "Censored-1", "Censored-2"],
                    "data": [[1, 0, 1], [2, 0, 1], [3, 0, 1], [3, 0, 1], [1, 1, 1], [2, 1, 1], [2, 1, 2], [3, 1, 1], [3, 1, 1], [4, 0, 0], [5, 0, 0], [6, 0, 0], [6, 0, 0], [7, 1, 0], [8, 0, 1], [9, 0, 0], [9, 0], [9, 0], [10, 1], [11, 1]]
                }
            },
            {
                "graphType": "Scatter2D",
                "showDecorations": true,
                "showLegend": false,
                "title": "Kaplan-Meyer Plot"
            }
        );
        cx1.addKaplanMeyerCurve('Time', 'Censored-1', 'Data 1 Population', 'rgb(0,0,255)');
        cx1.addKaplanMeyerCurve('Time', 'Censored-2', 'Data 2 Population', 'rgb(255,0,0)');
    }

}]);