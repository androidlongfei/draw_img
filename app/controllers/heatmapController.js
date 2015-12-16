app.controller('HeatmapController',[function($scope){

    init();

    function init() {
        createHeatmap();
        //1.热图 聚类
        //生存期曲线
    }

    function createHeatmap() {

        var cx1 = new CanvasXpress("heatmapCanvas",
            {
                "z": {
                    "Annt1": ["Desc:1", "Desc:2", "Desc:3", "Desc:4"],
                    "Annt2": ["Desc:A", "Desc:B", "Desc:A", "Desc:B"],
                    "Annt3": ["Desc:X", "Desc:X", "Desc:Y", "Desc:Y"],
                    "Annt4": [5, 10, 15, 20],
                    "Annt5": [8, 16, 24, 32],
                    "Annt6": [10, 20, 30, 40]
                },
                "x": {
                    "Factor1": ["Lev:1", "Lev:2", "Lev:3", "Lev:1", "Lev:2", "Lev:3"],
                    "Factor2": ["Lev:A", "Lev:B", "Lev:A", "Lev:B", "Lev:A", "Lev:B"],
                    "Factor3": ["Lev:X", "Lev:X", "Lev:Y", "Lev:Y", "Lev:Z", "Lev:Z"],
                    "Factor4": [5, 10, 15, 20, 25, 30],
                    "Factor5": [8, 16, 24, 32, 40, 48],
                    "Factor6": [10, 20, 30, 40, 50, 60]
                },
                "y": {
                    "vars": ["Variable1", "Variable2", "Variable3", "Variable4"],
                    "smps": ["Sample1", "Sample2", "Sample3", "Sample4", "Sample5", "Sample6"],
                    "data": [[5, 10, 25, 40, 45, 50], [95, 80, 75, 70, 55, 40], [25, 30, 45, 60, 65, 70], [55, 40, 35, 30, 15, 1]],
                    "desc": ["Magnitude1", "Magnitude2"]
                },
                "a": {
                    "xAxis": ["Variable1", "Variable2"],
                    "xAxis2": ["Variable3", "Variable4"]
                },
                "t": {
                    "vars": "(((Variable1,Variable3),Variable4),Variable2)",
                    "smps": "(((((Sample1,Sample2),Sample3),Sample4),Sample5),Sample6)"
                }
            },
            {
                "graphType": "Heatmap",
                "highlightSmp": ["Sample1", "Sample2"],
                "highlightVar": ["Variable2", "Variable4"],
                "smpOverlayProperties": {
                    "Factor4": {"thickness": 50, "position": "right", "type": "Bar"},
                    "Factor6": {"type": "Dotplot"},
                    "Factor5": {"position": "right", "type": "BarLine"}
                },
                "smpOverlays": ["Factor1", "Factor2", "Factor4", "Factor5", "Factor6"],
                "varOverlayProperties": {
                    "Annt4": {"thickness": 50, "type": "Stacked"},
                    "Annt6": {"type": "Stacked"},
                    "Annt1": {"position": "top"},
                    "Annt5": {"type": "Stacked"}
                },
                "varOverlays": ["Annt1", "Annt4", "Annt5", "Annt6"]
            }
        );
        cx1.clusterSamples();
        cx1.clusterVariables();
    }

}]);




