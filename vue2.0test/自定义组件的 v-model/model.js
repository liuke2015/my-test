Vue.component('my-checkbox',{
	template:"#model-template",
	data:function(){
		return {}
	},
	props:['value'],
	computed:{
		curName:{
			get:function(){
				return this.value;
			},
			set:function(val){
				this.$emit('input',val);
			}
		}
	}	
})
var vm=new Vue({
	el:"#box",
	data:{
		dataList:{
			name:"大勇",
			age:20,
			sex:"男"
		}
	},
	methods:{
		showValue:function(){
			console.log("dataList:"+JSON.stringify(this.dataList));
		}
	}
})
