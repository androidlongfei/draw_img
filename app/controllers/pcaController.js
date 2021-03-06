app.controller('PcaController',[function($scope){

    init();

    function init() {
        createPca();
    }

    function createPca() {

        var cx1 = new CanvasXpress("pcaCanvas",
            {
                "y": {
                    "vars": ["Variable1", "Variable2", "Variable3", "Variable4", "Variable5", "Variable6", "Variable7", "Variable8", "Variable9", "Variable10", "Variable11", "Variable12", "Variable13", "Variable14", "Variable15", "Variable16", "Variable17", "Variable18", "Variable19", "Variable20", "Variable21", "Variable22", "Variable23", "Variable24", "Variable25", "Variable26", "Variable27", "Variable28", "Variable29", "Variable30", "Variable31", "Variable32", "Variable33", "Variable34", "Variable35", "Variable36", "Variable37", "Variable38", "Variable39", "Variable40", "Variable41", "Variable42", "Variable43", "Variable44", "Variable45", "Variable46", "Variable47", "Variable48", "Variable49", "Variable50", "Variable51", "Variable52", "Variable53", "Variable54", "Variable55", "Variable56", "Variable57", "Variable58", "Variable59", "Variable60", "Variable61", "Variable62", "Variable63", "Variable64", "Variable65", "Variable66", "Variable67", "Variable68", "Variable69", "Variable70", "Variable71", "Variable72", "Variable73", "Variable74", "Variable75", "Variable76", "Variable77", "Variable78", "Variable79", "Variable80", "Variable81"],
                    "smps": ["Sample1", "Sample2", "Sample3"],
                    "data": [[-5, 5, 5], [-5, 15, 15], [-5, 25, 25], [-5, 35, 35], [-5, 45, 45], [-5, 35, 55], [-5, 25, 65], [-5, 15, 75], [-5, 5, 85], [-15, 15, 5], [-15, 25, 15], [-15, 35, 25], [-15, 45, 35], [-15, 55, 45], [-15, 45, 55], [-15, 35, 65], [-15, 25, 75], [-15, 15, 85], [-25, 25, 5], [-25, 35, 15], [-25, 45, 25], [-25, 55, 35], [-25, 65, 45], [-25, 55, 55], [-25, 45, 65], [-25, 35, 75], [-25, 25, 85], [-35, 35, 5], [-35, 45, 15], [-35, 55, 25], [-35, 65, 35], [-35, 75, 45], [-35, 65, 55], [-35, 55, 65], [-35, 45, 75], [-35, 35, 85], [-45, 45, 5], [-45, 55, 15], [-45, 65, 25], [-45, 75, 35], [-45, 85, 45], [-45, 75, 55], [-45, 65, 65], [-45, 55, 75], [-45, 45, 85], [-55, 35, 5], [-55, 45, 15], [-55, 55, 25], [-55, 65, 35], [-55, 75, 45], [-55, 65, 55], [-55, 55, 65], [-55, 45, 75], [-55, 35, 85], [-65, 25, 5], [-65, 35, 15], [-65, 45, 25], [-65, 55, 35], [-65, 65, 45], [-65, 55, 55], [-65, 45, 65], [-65, 35, 75], [-65, 25, 85], [-75, 15, 5], [-75, 25, 15], [-75, 35, 25], [-75, 45, 35], [-75, 55, 45], [-75, 45, 55], [-75, 35, 65], [-75, 25, 75], [-75, 15, 85], [-85, 5, 5], [-85, 15, 15], [-85, 25, 25], [-85, 35, 35], [-85, 45, 45], [-85, 35, 55], [-85, 25, 65], [-85, 15, 75], [-85, 5, 85]]
                }
            },
            {
                "graphType": "Scatter3D",
                "xAxis": ["Sample1"],
                "yAxis": ["Sample2"],
                "zAxis": ["Sample3"]
            }
        );
    }
}]);
