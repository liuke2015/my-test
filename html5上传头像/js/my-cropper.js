var $imgCrop = $("#imgCrop");
var $img = $imgCrop.find("img");
var img = $img[0];
var width = parseInt($imgCrop.css("width"));
var height = parseInt($imgCrop.css("height"));
var startX,startY,scale = 1;
var x = 0,y = 0;
$("input").on("change",function(){
    var fr = new FileReader();
    var file = this.files[0]
    //console.log(file);
    if(!/image\/\w+/.test(file.type)){
        alert(file.name + "不是图片文件！");
        return;
    }
    console.log(file);
    $img.removeAttr("height width");
    fr.readAsDataURL(file);

    fr.onload = function(){
        img.src = fr.result;
        var widthInit = img.width;
        if(img.width>img.height){
            img.height = height;
            x = (width - img.width)/2;
            y = 0;
        }else{
            img.width = width;
            x = 0;
            y = (height - img.height)/2;
        }
        scale = widthInit/img.width;
        move($img, x, y);
        
    };
    
});

img.addEventListener("touchstart",function(e){  
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
 
    return;  

}); 
img.addEventListener("touchmove",function(e){  
    e.preventDefault();  
    e.stopPropagation();  

    var changeX = e.changedTouches[0].pageX - startX + x;
    var changeY = e.changedTouches[0].pageY - startY + y;

    move($(this), changeX, changeY);
    return;  
  
}); 
img.addEventListener("touchend",function(e){   
   var changeX = e.changedTouches[0].pageX - startX + x;
    var changeY = e.changedTouches[0].pageY - startY + y;

    x = x + e.changedTouches[0].pageX - startX;
    y = y + e.changedTouches[0].pageY - startY;

    move($(this), changeX, changeY);
    return;  
  
});  
//确定目标图片的样式
function move(ele, x, y){
    ele.css({
        '-webkit-transform' : 'translate3d(' + x + 'px, ' + y + 'px, 0)',
        'transform' : 'translate3d(' + x + 'px, ' + y + 'px, 0)'
    });
}

$("#save").on("click",function(){
    var url = imageData($img);
    console.log(url);

    $("#imgShow").html("<img src="+url+" />");;
});
//裁剪图片
function imageData($img) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = width ;
        canvas.height = height;
        ctx.drawImage(img, -x*scale, -y*scale, width*scale, height*scale, 0, 0, width, height);
        return canvas.toDataURL();
    }