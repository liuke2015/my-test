<template>
    <div id="selectTree">
      <el-form-item :label="labelName" prop="parentName">
        <el-input placeholder="请选择" v-model.trim="formData.parentName" id="selectLabel"
                  @focus="showLabel"></el-input>
        <!--上级分类-->
        <div class="el-select-dropdown el-popper"
             style="min-width:100%; transform-origin: center top 0px; z-index: 2013; position: absolute; top: 38px; left: 0px;"
             x-placement="bottom-start" v-if="showDropDown">
          <div class="el-scrollbar" style="">
            <div class="el-select-dropdown__wrap el-scrollbar__wrap" style="margin-bottom: -17px; margin-right: -17px;">
              <ul class="el-scrollbar__view el-select-dropdown__list" style="position: relative;"><!---->
                <el-tree :load="getSuperiorLabel" :props="defaultProps" node-key="id" lazy @node-click="handleNodeClick"
                         :expand-on-click-node="false"  ></el-tree>
                <div class="resize-triggers">
                  <div class="expand-trigger">
                    <div style="width: 373px; height: 81px;"></div>
                  </div>
                  <div class="contract-trigger"></div>
                </div>
              </ul>
            </div>
            <div class="el-scrollbar__bar is-horizontal">
              <div class="el-scrollbar__thumb" style="transform: translateX(0%);"></div>
            </div>
            <div class="el-scrollbar__bar is-vertical">
              <div class="el-scrollbar__thumb" style="transform: translateY(0%);"></div>
            </div>
          </div><!---->
          <div x-arrow="" class="popper__arrow" style="left: 35px;"></div>
        </div>
      </el-form-item>
    </div>
</template>

<script>
    export default {
        name: "select-tree",
        props:["from","formData","parentCode","labelName","registerRules"],//from-来自哪个页面，根据页面选择调用接口;formData-表单对象,parentCode-选中下拉列表项的id,label-表单label
        data(){
          return {
            oneName : '',//顶级名字，setRules时候不能选
            showDropDown: false,//是否显示上级目录列表
            labelData: [],//"上级"一级内容
            secondLabel: [],//二级分类
            setSecond: false,//是否设置上级的二级内容
            defaultProps: {
              label: 'name',
              children: 'children'
            },//默认显示格式
            request:{//不同页面的请求参数和请求地址
              catalogAdd:{/*内容管理-U书-新增目录*/
                topRes(_this){//请求顶层数据
                  let url = _this.contentOperationUrl + "/ubookCatalog/getTopCatalog";
                  let params = {ubookId: _this.$route.query.id};
                  _this.publicFuction.publicRequest('get', url, params, _this.labelDataCallback);
                },
                secondRes(_this,row,obj){//请求二级数据
                   let url = _this.contentOperationUrl + "/ubookCatalog/getChildTree";
                   let params = {
                     ubookId: _this.$route.query.id,
                     parentId:row.id//父级目录id
                  };
                  _this.publicFuction.publicRequest('get', url, params, function (data) {
                    _this.getSecondCallback(data, obj);
                  });
                }
              },
              labelAdd:{/*平台管理-分类管理-新增分类*/
                topRes(_this){//请求顶层数据
                  let url = _this.apiUrl + "/platformTag/getTopTree";
                  let params = {};
                  _this.publicFuction.publicRequest('get', url, params, _this.labelDataCallback);
                },
                secondRes(_this,row,obj){//请求二级数据
                  let url = _this.apiUrl + "/platformTag/getChildTree";
                  let params = {
                    platformCode: row.platformCode,
                    parentCode: row.id
                  };
                  _this.publicFuction.publicRequest('get', url, params, function (data) {
                    _this.getSecondCallback(data, obj);
                  });
                }
              },
              setRules:{/*平台管理-分类管理-新增分类*/
                topRes(_this){//请求顶层数据
                  let url = _this.apiUrl + "/sysUserPolicyCondition/getTopTree";
                  let params = {
                    platformCode: _this.formData.applyPlatformCode,//row.platformCode
                    parentCode: ''
                  };
                  _this.publicFuction.publicRequest('get', url, params, _this.labelDataCallback);
                },
                secondRes(_this,row,obj){//请求二级数据
                  let url = _this.apiUrl + "/sysUserPolicyCondition/getChildTree";
                  let params = {
                    platformCode: _this.formData.applyPlatformCode,//row.platformCode
                    parentCode: row.id
                  };
                  _this.publicFuction.publicRequest('get', url, params, function (data) {
                    _this.getSecondCallback(data, obj);
                  });
                }
              },
              courseCatalogAdd:{
                  topRes(_this){//请求顶层数据
                      var dataList = [];
                      let params = {"id":_this.$route.query.id};
                      let url = _this.contentOperationUrl +"/onlineProject/getById";
                      this.publicFuction.publicRequest('get',url,params,function(data){
                            dataList.push(data);
                            this.getCourseCatalogRoot(dataList);
                      });


                  },
                  secondRes(_this,row,obj){//请求二级数据
                      let url = _this.contentOperationUrl + "/onlineProject/getById";
                      let params = {
                          ubookId: _this.$route.query.id,
                          parentId:row.id//父级目录id
                      };
                      _this.publicFuction.publicRequest('get', url, params, function (data) {
                          _this.getSecondCallback(data, obj);
                      });
                  }
              },
              deskOperation:{/*内容管理-前台运营-新增规则*/
                topRes(_this){//请求顶层数据
                  let url = _this.apiUrl + "/platformTag/getTopTree";
                  let params = {};
                  _this.publicFuction.publicRequest('get', url, params, _this.labelDataCallback);
                },
                secondRes(_this,row,obj){//请求二级数据
                  let url = _this.apiUrl + "/platformTag/getChildTree";
                  let params = {
                    platformCode: row.platformCode,
                    parentCode: row.id
                  };
                  _this.publicFuction.publicRequest('get', url, params, function (data) {
                    _this.getSecondCallback(data, obj);
                  });
                }
              },
            },
          }
        },
      mounted(){
        this.hideSelect();
        this.getlabelData();
      },
      methods:{
          getCourseCatalogRoot(datas){//获取课程专栏根目录
              var _this = this;
              let rootUrl = this.contentOperationUrl + "/onlineFolder/getByParentId";
              let rootParams = {
                  projectId:this.$route.query.id, //项目id
                  parentId:'root'//父级目录id
              };;
              _this.publicFuction.publicRequest('get', url, params,function(response){
                  var ary = [];
                  ary[0] = response.data;
                  if(ary[0]){
                      datas[0].children = ary[0];
                      this.labelData = datas;
                      if(ary[0].length>0){
                          this.labelData[0].haveChildren = true;
                      }else{
                          this.labelData[0].haveChildren = false;
                      }
                  }else{
                      this.labelData[0].haveChildren = false;
                  }
              });
            },
        /*事件委托收起上级下拉框*/
        hideSelect() {
          var _this = this;
          document.body.onclick = function (e) {
            e = e || window.event;
            var curEle = e.target || e.srcElement;
            if (curEle.id === "selectLabel" || curEle.className.includes("el-icon-caret-right")) {

            } else {
              _this.showDropDown = false;
              _this.$emit("changeShow",true);
            }
          }
        },
        /*显示下拉框*/
        showLabel() {
          this.showDropDown = true;
          this.$emit("changeShow",false);
        },
        /*获取"上级目录"一级内容*/
        getlabelData() {
          /*根据来自哪个页面，读取对应的参数、请求地址*/
          this.request[this.from].topRes(this);
        },
        labelDataCallback(response) {
          var ary = [];
          ary[0] = response.data;
          this.labelData = ary;
        },
        /*动态加载上级目录分类*/
        getSuperiorLabel(node, resolve) {
          $("#selectLabel").focus();
          var _this = this;
          if (node.level === 0) {
            _this.oneName = _this.labelData[0].name
            return resolve(_this.labelData);
          }
          var hasChild = node.data.haveChildren;
          if (hasChild && !this.setSecond) {
            var params = {
              row: node.data,
              node: node,
              resolve: resolve
            }
            this.getSecondList(params)
          }
          if (!hasChild) {
            resolve([]);
          }
          if (this.setSecond) {
            var data;
            if (hasChild) {
              data = _this.secondLabel;
            } else {
              data = [];
            }
            this.setSecond = false;
            resolve(data);
          }
        },
        /*获取上级目录二级分类*/
        getSecondList(obj, expandedRows) {
          var row = obj.row;
          if (!row.haveChildren) {
            return;
          }

          this.request[this.from].secondRes(this,row,obj);
        },
        getSecondCallback(response, params) {

          this.secondLabel = response.data;
          this.setSecond = true;
          this.getSuperiorLabel(params.node, params.resolve);
        },
        /*关联弹框--关闭前执行的方法*/
        labelHandleClose(done) {
          done();
        },
        handleNodeClick(data) {
          this.formData.parentName = data.name;//name

          if(this.from=="setRules"){//如果来源是setrules,id赋给tagid
            if(data.name==this.oneName){//如果选择的名字是第一级的名字，就不让选择
              this.formData.parentName = null;
              this.parentCode.id = null;
              this.$emit("changeShow",true);
            }else{
              this.formData.tagId = data.id;
              this.showDropDown = false;
              this.$emit("changeShow",true);
            }
          }else if(this.from=="deskOperation" && data.name==this.oneName){//来自“内容管理”,且选择顶层分类
            this.formData.parentName = null;
            this.parentCode.id = null;
            this.$message('请不要选择顶层分类！');
          }else{
            this.parentCode.id = data.id//id
          }
          this.showDropDown = false;
          this.$emit("changeShow",true);

        },
      }
    }
</script>

<style scoped>

</style>
