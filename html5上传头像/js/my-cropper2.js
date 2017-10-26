var $imgCrop = $("#imgCrop");
var imgCrop = $imgCrop[0];
var $img = $("#cur-img");
var img = $img[0];
var $box=$(".thumbBox");
var width = parseInt($imgCrop.css("width"));
var height = parseInt($imgCrop.css("height"));
var boxWidth = parseInt($box.css("width"));
var boxHeight = parseInt($box.css("height"));

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
    fr.readAsDataURL(file);

    fr.onload = function(){        
        img.onload=function(){
        	 var widthInit = img.width;
             var imgW=img.width,imgH=img.height;
             if(imgW>imgH){ 
             	if(imgW>200){
             		img.width=imgW*(boxHeight/imgH);
                    img.height = boxHeight;   
             	}             	
                 x = (width - img.width)/2;
                 y = (height - img.height)/2;  
             }else{
             	if(imgH>200){
             		img.height=imgH*(boxWidth/imgW);
                    img.width = boxWidth;    
             	}                   
                 x = (width - img.width)/2;
                 y = (height - img.height)/2;    
            
             }
            scale = widthInit/img.width;
             move($img, x, y);
        }
        img.src = fr.result;
    };
    
});

imgCrop.addEventListener("touchstart",function(e){  
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
 
    return;  

}); 
imgCrop.addEventListener("touchmove",function(e){  
    e.preventDefault();  
    e.stopPropagation();  

    var changeX = e.changedTouches[0].pageX - startX + x;
    var changeY = e.changedTouches[0].pageY - startY + y;

    move($img, changeX, changeY);
    return;  
  
}); 
imgCrop.addEventListener("touchend",function(e){   
   var changeX = e.changedTouches[0].pageX - startX + x;
    var changeY = e.changedTouches[0].pageY - startY + y;

    x = x + e.changedTouches[0].pageX - startX;
    y = y + e.changedTouches[0].pageY - startY;

    move($img, changeX, changeY);
    return;  
  
});  
//确定目标图片的样式
function move(ele, x, y){
	ele.css({
        '-webkit-transform' : 'translate3d(' + x + 'px, ' + y + 'px, 0)',
        'transform' : 'translate3d(' + x + 'px, ' + y + 'px, 0)'
    });
    console.log("x:"+x+"y:"+y);
    /*ele.css({
    	'background-position':''+x + 'px ' + y + 'px'
    });*/
}

$("#save").on("click",function(){
    var url = imageData($img);
   /* console.log(url);*/
   $("#imgShow").html("<img src="+url+" />");
});
//裁剪图片
function imageData($img) {
	    var cX=Math.floor(($box[0].offsetLeft-x)*scale),
	        cY=Math.floor(($box[0].offsetTop-y)*scale);
	    console.log("cX:"+cX+" cY:"+cY+" cWidth:"+boxWidth*scale+" cHeight:"+boxHeight*scale);
       /* var canvas = document.createElement('canvas');*/
       var canvas=document.getElementById("canvas1");
        var ctx = canvas.getContext('2d');
        canvas.width = boxWidth ;
        canvas.height = boxHeight;
        ctx.drawImage(img,cX, cY,boxWidth*scale, boxHeight*scale, 0, 0, boxWidth, boxHeight);
        return canvas.toDataURL();
   }