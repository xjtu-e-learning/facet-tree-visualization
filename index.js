// 画布长宽
var canvasWidth = 500;
var canvasHeight = 800;
// 一级分面宽度
var firstLayerWidth = 14;
// 一级分面间隔
var firstLayerInterval = 4;
// 一级分面弯曲的初始角度
var initialAngle = 125;
// 一级分面之间角度差
var deltaAngle = 15;
$(document).ready(function(){
    // data = {};
    // $.ajax({
    //     type: "GET",
    //     url: "./tree(data_structure).json",
    //     data: {},
    //     dataType: "json",
    //     success: function(response){
    //         // console.log(response.data);
    //         data = response.data;
    //     },
    //     error: function(e){
    //         console.log(e);
    //     }
    // });
    
    var dataset = [300,350,400,450,400,350,300,260];
    var dataset1 = dataset.map(data => data/2);
    // 一级分面数量
    var FirstLayerNum = dataset.length;

    // 1:Dust Red 2:Volcano 3:Sunset Orange 4:Calendula Cold 5:Sunrise Yellow 6:Lime 7:Polar Green 8:Cyan 9:Daybreak Blue 10:Geek Blue 11:Golden Purple 12:Magenta
    var color = ['#D32731','#DA5526','#E18B29','#E7AC2F','#F1DA38','#B1D837','#7FC236','#6EC1C1','#548FFB','#3E55E7','#6431CC','#CB3392']
    var g = d3.select("body").select("svg").append("g")
        // .attr("transform","translate(60,60)")
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("y",function(d){
            return canvasHeight-50-d;
        })
        .attr("x",function(d,i){
            // return i*30;
            if(FirstLayerNum%2){
                return canvasWidth/2 - firstLayerWidth/2 - (firstLayerInterval + firstLayerWidth)*(FirstLayerNum-1)/2 + (firstLayerInterval+firstLayerWidth) * i;
            }
            else{
                return canvasWidth/2 + firstLayerInterval/2 - (firstLayerWidth + firstLayerInterval)*FirstLayerNum/2 + (firstLayerInterval+firstLayerWidth) * i;
            }
        })
        .attr("height",function(d){
            return d;
        })
        .attr("width",firstLayerWidth)
        .attr("fill",function(d,i){
            return color[i];
        })
        // .attr("transform",function(d,i){
        //     return "translate("+i*30+",150)";
        // })
        //旋转
        // .attr("transform",function(d,i){
        //     return "rotate(-45 "+i*30+",150)"
        // })
    var g1 = d3.select("body").select("svg").append("g")
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("y",function(d){
            return canvasHeight-50-d;
        })
        .attr("x",function(d,i){
            // return i*30;
            if(FirstLayerNum%2){
                x = canvasWidth/2 - firstLayerWidth/2 - (firstLayerInterval + firstLayerWidth)*(FirstLayerNum-1)/2 + (firstLayerInterval+firstLayerWidth) * i;
                if(x === canvasWidth/2 - firstLayerWidth/2){
                    return x;
                }
                else if(x < canvasWidth/2){
                    return x + firstLayerWidth;
                }
                else{
                    return x - firstLayerWidth;
                } 
            }
            else{
                x = canvasWidth/2 + firstLayerInterval/2 - (firstLayerWidth + firstLayerInterval)*FirstLayerNum/2 + (firstLayerInterval+firstLayerWidth) * i;
                if(x < canvasWidth/2){
                    return x + firstLayerWidth;
                }
                else{
                    return x - firstLayerWidth;
                }
            }
        })
        .attr("height",function(d,i){
            if(FirstLayerNum%2 && i === (FirstLayerNum-1)/2){
                return d/8;
            }
            return d/4;
        })
        .attr("width",firstLayerWidth)
        .attr("fill",function(d,i){
            return color[i];
        })
        //旋转
        .attr("transform",function(d,i){
            y = canvasHeight-50-d;
            if(FirstLayerNum%2){
                x = canvasWidth/2 - firstLayerWidth/2 - (firstLayerInterval + firstLayerWidth)*(FirstLayerNum-1)/2 + (firstLayerInterval+firstLayerWidth) * i;
                if(x === canvasWidth/2 - firstLayerWidth/2){
                    return "rotate(180 " + canvasWidth/2 + "," + y + ")" ;
                }
                else if(x < canvasWidth/2){
                    return "rotate(" + (initialAngle + deltaAngle*i) + " " + (x+firstLayerWidth) + "," + y + ")" ;
                }
                else{
                    return "rotate(" + (-initialAngle - deltaAngle*(FirstLayerNum - i - 1)) + " " + x + "," + y + ")" ;
                }
            }
            else{
                x = canvasWidth/2 + firstLayerInterval/2 - (firstLayerWidth + firstLayerInterval)*FirstLayerNum/2 + (firstLayerInterval+firstLayerWidth) * i;
                if(x < canvasWidth/2){
                    return "rotate(" + (initialAngle + deltaAngle*i) + " " + (x+firstLayerWidth) + "," + y + ")" ;
                }
                else{
                    return "rotate(" + (-initialAngle - deltaAngle*(FirstLayerNum - i - 1)) + " " + x + "," + y + ")" ;
                }
            }
        })
});

