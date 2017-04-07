var checkArea=document.getElementById("check-area");
var checkList=checkArea.getElementsByTagName("input");
Array.prototype.forEach.call(checkList,function(item,index){
	item.addEventListener("click",function(){
		var ary=[],obj=null;
		Array.prototype.forEach.call(checkList,function(cur,i){
			if(cur.checked){
				obj={id:cur.id,name:cur.name}
				ary.push(obj);
			}
		},false)
		console.log("选中项为："+JSON.stringify(ary));
	},false)
})
