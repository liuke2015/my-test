Vue.component('my-checkbox',{
	template:"#model-template",
	data:function(){
		return {}
	},
	model:{
		prop:'checked',
		event:"change"
	},
	props:['value','checked'],
	computed:{
		curCheck:{
			get:function(){
				return this.checked;
			},
			set:function(val){
				this.$emit('change',val);
			}
		}
	}
})
var vm=new Vue({
	el:"#box",
	data:{
		dataList:[{"check":true,"hobby":"游泳"},{"check":false,"hobby":"跑步"},{"check":false,"hobby":"瑜伽"}]
	},
	methods:{
		showValue:function(){
			console.log("dataList:"+JSON.stringify(this.dataList));
		}
	},
	watch:{		
	}
})
