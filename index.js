var app = angular.module("myApp",["rzModule"]);
var data;
var angles = [];
var xs = [];
var ys = [];
var minHeight = 0;
var height = [400, 390, 380, 365, 350, 335, 320, 300, 280, 260, 240, 220, 200, 160];
var foldLength = [];
var branchLimits = 7;


app.controller("myCtrl", function($scope,$http){

    $scope.subjects = [];
    $scope.subject = "";
    $scope.domain = "";
    $scope.topic = "";
    $scope.topics = [];
    $.ajax({
        type: "GET",
        url: "http://yotta.xjtushilei.com:8083/domain/getDomainsGroupBySubject",
        data: {},
        dataType: "json",
        success: function(response){
            $scope.subjects = response["data"];
            console.log($scope.subjects);
        },
        error: function(e){
            console.log(e);
        }
    });

    $scope.getTopicsByDomainName = function(){
        // console.log($scope.domain)
        $.ajax({
            type: "GET",
            url: "http://yotta.xjtushilei.com:8083/topic/getTopicsByDomainName?domainName=" + $scope.domain.domainName,
            data: {},
            dataType: "json",
            success: function(response){
                $scope.topics = response["data"];
                // console.log($scope.subjects);
            },
            error: function(e){
                console.log(e);
            }
        });
    }

    $scope.slider = {
        value: 10
    };
    // 画布长宽
    $scope.canvasWidth = 500;
    $scope.canvasHeight = 800;
    // 一级分面宽度
    $scope.firstLayerWidth = 20;
    $scope.firstLayerWidthOptions = {
      floor: 0,
      ceil: $scope.firstLayerWidth*2,
      step: 1,
    };
    // 一级分面间隔
    $scope.firstLayerInterval = 8;
    $scope.firstLayerIntervalOptions = {
        floor: 0,
        ceil: $scope.firstLayerInterval*4,
        step: 1,
      };
    // 一级分面弯曲的初始角度
    $scope.initialAngle = 125;
    $scope.initialAngleOptions = {
        floor: 110,
        ceil: 125,
        step: 1,
      };
    // 一级分面之间角度差
    $scope.deltaAngle = 16;
    $scope.deltaAngleOptions = {
        floor: 0,
        ceil: $scope.deltaAngle*2,
        step: 1,
      };
    // 1:Dust Red 2:Volcano 3:Sunset Orange 4:Calendula Cold 5:Sunrise Yellow 6:Lime 7:Polar Green 8:Cyan 9:Daybreak Blue 10:Geek Blue 11:Golden Purple 12:Magenta
    // $scope.color = ["#D32731","#DA5526","#E18B29","#E7AC2F","#F1DA38","#B1D837","#7FC236","#6EC1C1","#548FFB","#3E55E7","#6431CC","#CB3392"]
    $scope.color = ["#B50010", "#E3A407", "#618FE3", "#E14773", "#547400", "#7C21FF", "#7F572B", "#7CC7C0"];
    // 一级分面数量
    $scope.FirstLayerNum = 0;
    
    $scope.getData = function(){
        data = {};
        $.ajax({
            type: "GET",
            url: "http://yotta.xjtushilei.com:8083/topic/getCompleteTopicByNameAndDomainName?domainName="+$scope.domain.domainName+"&topicName=" + $scope.topic.topicName,
            data: {},
            dataType: "json",
            success: function(response){
                console.log(response.data);
                data = response.data;
                data = processData(data);
                $scope.FirstLayerNum = data.length;
                if(data.length > 7) {
                    minHeight = height[height.length - 2];
                }else{
                    minHeight = height[height.length - 1];
                }               
                $scope.drawTree();
                console.log("angles: " + angles);
                console.log("xs: " + xs);
                console.log("foldLength: " + foldLength);
                console.log("ys: " + ys);
            },
            error: function(e){
                console.log(e);
            }
        });
    };

    // $scope.getData();

    $scope.drawTree = function(){
        $scope.dataset = [];
        angles = [];
        xs = [];
        ys = [];
        foldLength = [];
        // 输入框读入各一级分枝高度
        $scope.data !== undefined && $scope.data.split(",").forEach(element => {
            $scope.dataset.push(parseInt(element));
        });
        d3.selectAll("svg").remove();

        var g = d3.select("div#mysvg").append("svg").attr("width","600px").attr("height","800px").append("g")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            // 计算一级分枝左上角纵坐标
            .attr("y",function(d){
                ys.push($scope.canvasHeight-50-d.h);
                return $scope.canvasHeight-50-d.h;
            })
            // 计算一级分枝左上角横坐标
            .attr("x",function(d,i){
                // 如果一级分枝数量是奇数
                if($scope.FirstLayerNum%2){
                    x = $scope.canvasWidth/2 - $scope.firstLayerWidth/2 - ($scope.firstLayerInterval + $scope.firstLayerWidth)*($scope.FirstLayerNum-1)/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    xs.push(x);
                    return x;
                }
                // 如果一级分枝数量是偶数
                else{
                    x = $scope.canvasWidth/2 + $scope.firstLayerInterval/2 - ($scope.firstLayerWidth + $scope.firstLayerInterval)*$scope.FirstLayerNum/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    xs.push(x);
                    return x;
                }
            })
            .attr("height",function(d){
                return d.h;
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
            .data(data)
            .enter()
            .append("rect")
            .attr("y",function(d){
                return $scope.canvasHeight-50-d.h;
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
                // if($scope.FirstLayerNum%2 && i === ($scope.FirstLayerNum-1)/2){
                //     return d.h/4;
                // }
                foldLength.push(d.h/3);
                return d.h/3;
            })
            .attr("width",$scope.firstLayerWidth)
            .attr("fill",function(d,i){
                return $scope.color[i];
            })
            //旋转
            .attr("transform",function(d,i){
                y = $scope.canvasHeight-50-d.h;
                if($scope.FirstLayerNum%2){
                    x = $scope.canvasWidth/2 - $scope.firstLayerWidth/2 - ($scope.firstLayerInterval + $scope.firstLayerWidth)*($scope.FirstLayerNum-1)/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    if(x === $scope.canvasWidth/2 - $scope.firstLayerWidth/2){
                        angles.push(180);
                        return "rotate(180 " + $scope.canvasWidth/2 + "," + y + ")" ;
                    }
                    else if(x < $scope.canvasWidth/2){
                        angles.push($scope.initialAngle + $scope.deltaAngle*i);
                        return "rotate(" + ($scope.initialAngle + $scope.deltaAngle*i) + " " + (x+$scope.firstLayerWidth) + "," + y + ")" ;
                    }
                    else{
                        angles.push(-$scope.initialAngle - $scope.deltaAngle*($scope.FirstLayerNum - i - 1));
                        return "rotate(" + (-$scope.initialAngle - $scope.deltaAngle*($scope.FirstLayerNum - i - 1)) + " " + x + "," + y + ")" ;
                    }
                }
                else{
                    x = $scope.canvasWidth/2 + $scope.firstLayerInterval/2 - ($scope.firstLayerWidth + $scope.firstLayerInterval)*$scope.FirstLayerNum/2 + ($scope.firstLayerInterval+$scope.firstLayerWidth) * i;
                    if(x < $scope.canvasWidth/2){
                        angles.push($scope.initialAngle + $scope.deltaAngle*i);
                        return "rotate(" + ($scope.initialAngle + $scope.deltaAngle*i) + " " + (x+$scope.firstLayerWidth) + "," + y + ")" ;
                    }
                    else{
                        angles.push(-$scope.initialAngle - $scope.deltaAngle*($scope.FirstLayerNum - i - 1));
                        return "rotate(" + (-$scope.initialAngle - $scope.deltaAngle*($scope.FirstLayerNum - i - 1)) + " " + x + "," + y + ")" ;
                    }
                }
            });
        var texts = d3.select("body").select("svg").append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("font-size", "14px")
            .attr("y", function(d,i){
                return $scope.canvasHeight-50-d.h;
            })
            .attr("x", function(d,i){
                return xs[i];
            })
            .attr("fill", "white");
        for(let i = 0; i < $scope.FirstLayerNum; i++){
            d3.select(texts._groups[0][i])
                .selectAll("tspan")
                .data(data[i].facetName.split(""))
                .enter()
                .append("tspan")
                .attr("x", xs[i] + ($scope.firstLayerWidth - 14) / 2)
                .attr("dy", "1.2em")
                .text(function(d){return d;});
        }

        var circles = d3.select("body").select("svg").append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d,i){
                return xs[i] + $scope.firstLayerWidth/2 + Math.cos(Math.PI*(270-angles[i])/180) * foldLength[i] * 1.8;
            })
            .attr("cy", function(d,i){
                return ys[i] - Math.sin(Math.PI*(270-angles[i])/180) * foldLength[i] * 1.8;
            })
            .attr("r", 20)
            .attr("fill", function(d,i){
                return $scope.color[i];
            });

        // 显示主题名
        var name = d3.select("body").select("svg").append("g")
            .append("text")
            .attr("x", $scope.canvasWidth/2 - 50)
            .attr("y", $scope.canvasHeight - 20)
            .text($scope.topic.topicName);
    }; 
});

processData = function(arr){
    var branchWithSecondLayer = [];
    var branchWithoutSecondLayer = [];
    
    // 按有无二级分面对一级分面进行筛选
    arr.children.forEach((element,index) => {
        if(element.containChildrenFacet === true){
            branchWithSecondLayer.push(element);
        } else{
            branchWithoutSecondLayer.push(element);
        }
    });
    // 没有二级分面的一级分面按二级分面下的碎片数量降序
    branchWithoutSecondLayer.sort(sortBranch);
    // 有二级分面的一级分面按二级分面数量降序
    branchWithSecondLayer.sort(sortBranch);
    // 对排序后的一级分面进行拼接
    let sortedBranch = branchWithSecondLayer.concat(branchWithoutSecondLayer);
    console.log(sortedBranch);
    // 将降序的数组重排，权重大的在中间
    let resultBranch = [];
    if(sortedBranch.length < branchLimits + 1){
        for(let i = 0; i < sortedBranch.length; i += 2){
            if(i < sortedBranch.length){
                sortedBranch[i].h = height[height.length + i - sortedBranch.length];  
                resultBranch.unshift(sortedBranch[i]);
            }
            else{
                return resultBranch;
            }
            if(i + 1 < sortedBranch.length){
                sortedBranch[i + 1].h = height[height.length + i - sortedBranch.length + 1];
                resultBranch.push(sortedBranch[i + 1]);
            }
            else{
                return resultBranch;
            }
        }
    }
    else {
        let combinedBranch = {
            children: [],
            containChildrenFacet: true,
            facetId: -1,
            facetName: "其他分面",
            h: height[height.length - 1],
            parentFacetId: null,
            topicId: null,
            type: "branch"
        };
        for(let i = 0; i < branchLimits; i += 2){
            if(i < branchLimits){
                sortedBranch[i].h = height[height.length + i - branchLimits - 1];  
                resultBranch.unshift(sortedBranch[i]);
            }
            else{
                break;
            }
            if(i + 1 < branchLimits){
                sortedBranch[i + 1].h = height[height.length + i - branchLimits];
                resultBranch.push(sortedBranch[i + 1]);
            }
            else{
                break;
            }
        }
        for(let i = branchLimits; i < sortedBranch.length; i++){
            combinedBranch.children.push(sortedBranch[i]);
        }
        resultBranch.push(combinedBranch);
    }
    return resultBranch;
};

sortBranch = function(a, b){
    return b.children.length - a.children.length;
};
