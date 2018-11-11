var app = angular.module('myApp',['rzModule']);
var data;
app.controller('myCtrl', function($scope){

    $scope.slider = {
        value: 10
    };
    // 画布长宽
    $scope.canvasWidth = 500;
    $scope.canvasHeight = 800;
    // 一级分面宽度
    $scope.firstLayerWidth = 14;
    $scope.firstLayerWidthOptions = {
      floor: 0,
      ceil: $scope.firstLayerWidth*2,
      step: 1,
    };
    // 一级分面间隔
    $scope.firstLayerInterval = 4;
    $scope.firstLayerIntervalOptions = {
        floor: 0,
        ceil: $scope.firstLayerInterval*4,
        step: 1,
      };
    // 一级分面弯曲的初始角度
    $scope.initialAngle = 125;
    $scope.initialAngleOptions = {
        floor: 0,
        ceil: $scope.initialAngle,
        step: 1,
      };
    // 一级分面之间角度差
    $scope.deltaAngle = 15;
    $scope.deltaAngleOptions = {
        floor: 0,
        ceil: $scope.deltaAngle*2,
        step: 1,
      };
    // 1:Dust Red 2:Volcano 3:Sunset Orange 4:Calendula Cold 5:Sunrise Yellow 6:Lime 7:Polar Green 8:Cyan 9:Daybreak Blue 10:Geek Blue 11:Golden Purple 12:Magenta
    $scope.color = ['#D32731','#DA5526','#E18B29','#E7AC2F','#F1DA38','#B1D837','#7FC236','#6EC1C1','#548FFB','#3E55E7','#6431CC','#CB3392']
        
    $scope.dataset = [300,350,400,450,400,350,300,260];
    // 一级分面数量
    $scope.FirstLayerNum = $scope.dataset.length;
    
    $scope.drawTree = function(){
        data = {};
        $.ajax({
            type: "GET",
            url: "./tree(data_structure).json",
            data: {},
            dataType: "json",
            success: function(response){
                console.log(response.data);
                data = response.data;
                console.log(processData(data));
            },
            error: function(e){
                console.log(e);
            }
        });
        $scope.dataset = [];
        // 输入框读入各一级分枝高度
        $scope.data !== undefined && $scope.data.split(',').forEach(element => {
            $scope.dataset.push(parseInt(element));
        });
        d3.selectAll("svg").remove();

        var g = d3.select("div#mysvg").append("svg").attr("width","600px").attr("height","800px").append("g")
            .selectAll("rect")
            .data($scope.dataset)
            .enter()
            .append("rect")
            // 计算一级分枝左上角纵坐标
            .attr("y",function(d){
                return $scope.canvasHeight-50-d;
            })
            // 计算一级分枝左上角横坐标
            .attr("x",function(d,i){
                // 如果一级分枝数量是奇数
                if($scope.FirstLayerNum%2){
                    return $scope.canvasWidth/2 - $scope.firstLayerWidth/2 - ($scope.firstLayerInterval + $scope.firstLayerWidth)*($scope.FirstLayerNum-1)/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                }
                // 如果一级分枝数量是偶数
                else{
                    return $scope.canvasWidth/2 + $scope.firstLayerInterval/2 - ($scope.firstLayerWidth + $scope.firstLayerInterval)*$scope.FirstLayerNum/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                }
            })
            .attr("height",function(d){
                return d;
            })
            .attr("width",$scope.firstLayerWidth)
            // 各分枝颜色
            .attr("fill",function(d,i){
                return $scope.color[i];
            });
            // .attr("transform",function(d,i){
            //     return "translate("+i*30+",150)";
            // })
            //旋转
            // .attr("transform",function(d,i){
            //     return "rotate(-45 "+i*30+",150)"
            // })
        // 画一级分枝弯折部分
        var g1 = d3.select("body").select("svg").append("g")
            .selectAll("rect")
            .data($scope.dataset)
            .enter()
            .append("rect")
            .attr("y",function(d){
                return $scope.canvasHeight-50-d;
            })
            .attr("x",function(d,i){
                // return i*30;
                if($scope.FirstLayerNum%2){
                    x = $scope.canvasWidth/2 - $scope.firstLayerWidth/2 - ($scope.firstLayerInterval + $scope.firstLayerWidth)*($scope.FirstLayerNum-1)/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    if(x === $scope.canvasWidth/2 - $scope.firstLayerWidth/2){
                        return x;
                    }
                    else if(x < $scope.canvasWidth/2){
                        return x + $scope.firstLayerWidth;
                    }
                    else{
                        return x - $scope.firstLayerWidth;
                    } 
                }
                else{
                    x = $scope.canvasWidth/2 + $scope.firstLayerInterval/2 - ($scope.firstLayerWidth + $scope.firstLayerInterval)*$scope.FirstLayerNum/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    if(x < $scope.canvasWidth/2){
                        return x + $scope.firstLayerWidth;
                    }
                    else{
                        return x - $scope.firstLayerWidth;
                    }
                }
            })
            .attr("height",function(d,i){
                if($scope.FirstLayerNum%2 && i === ($scope.FirstLayerNum-1)/2){
                    return d/8;
                }
                return d/4;
            })
            .attr("width",$scope.firstLayerWidth)
            .attr("fill",function(d,i){
                return $scope.color[i];
            })
            //旋转
            .attr("transform",function(d,i){
                y = $scope.canvasHeight-50-d;
                if($scope.FirstLayerNum%2){
                    x = $scope.canvasWidth/2 - $scope.firstLayerWidth/2 - ($scope.firstLayerInterval + $scope.firstLayerWidth)*($scope.FirstLayerNum-1)/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    if(x === $scope.canvasWidth/2 - $scope.firstLayerWidth/2){
                        return "rotate(180 " + $scope.canvasWidth/2 + "," + y + ")" ;
                    }
                    else if(x < $scope.canvasWidth/2){
                        return "rotate(" + ($scope.initialAngle + $scope.deltaAngle*i) + " " + (x+$scope.firstLayerWidth) + "," + y + ")" ;
                    }
                    else{
                        return "rotate(" + (-$scope.initialAngle - $scope.deltaAngle*($scope.FirstLayerNum - i - 1)) + " " + x + "," + y + ")" ;
                    }
                }
                else{
                    x = $scope.canvasWidth/2 + $scope.firstLayerInterval/2 - ($scope.firstLayerWidth + $scope.firstLayerInterval)*$scope.FirstLayerNum/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    if(x < $scope.canvasWidth/2){
                        return "rotate(" + ($scope.initialAngle + $scope.deltaAngle*i) + " " + (x+$scope.firstLayerWidth) + "," + y + ")" ;
                    }
                    else{
                        return "rotate(" + (-$scope.initialAngle - $scope.deltaAngle*($scope.FirstLayerNum - i - 1)) + " " + x + "," + y + ")" ;
                    }
                }
            });
    }; 
    $scope.drawTree();   
});

processData = function(arr){
    var branchWithSecondLayer = [];
    var branchWithoutSecondLayer = [];
    arr.children.forEach(element => {
       if(element.children[0].type === 'branch'){
           branchWithSecondLayer.push(element);
       } else{
           branchWithoutSecondLayer.push(element);
       }
    });
    branchWithoutSecondLayer.sort(sortBranch);
    branchWithSecondLayer.sort(sortBranch);
    return branchWithSecondLayer.concat(branchWithoutSecondLayer);
};

sortBranch = function(a, b){
    return b.children.length - a.children.length;
};
