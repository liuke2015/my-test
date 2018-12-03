<template>
  <div id="platformLabelAdd">
    <Crumbs :crumbs="crumbsList"/>
    <div class="user-box">
      <el-form class="demo-ruleForm" label-width="80px" :model="formLabel" :rules="registerRules"
               ref="formLabel">
        <template>
          <div class="user-form">
            <el-form-item label="分类名称" prop="name">
              <el-input placeholder="请输入分类名称" v-model.trim="formLabel.name"></el-input>
            </el-form-item>
            <selectTree from="labelAdd" :formData="formLabel" :parentCode="parentCode" labelName="上级分类"
                        @changeShow="changeShow"></selectTree>
            <el-form-item label="分类描述" prop="description">
              <el-input type="textarea" v-model.trim="formLabel.description" placeholder="请输入内容"></el-input>
            </el-form-item>
            <el-form-item label="分类关联" prop="labelAbout" v-if="labelCode">
              <el-button type="primary" plain @click="labelVisible=true">关联</el-button>
              <ul class="about-list">
                <li v-for="item in formLabel.relateTags">{{item.tagNames}}</li>
              </ul>
            </el-form-item>
            <el-form-item label="是否启用">
              <el-radio-group v-model="formLabel.status">
                <el-radio label="Y">是</el-radio>
                <el-radio label="N">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </template>
        <div class="line"></div>
        <div class="input_box ">
          <el-button v-if="labelCode" type="primary" @click="saveChange('formLabel')" :loading="loading">保存</el-button>
          <!--编辑-->
          <el-button v-else type="primary" @click="labelAdd('formLabel')" :loading="loading">保存</el-button><!--新增-->
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
  import selectTree from '@/Components/common/selectTree.vue';   // 选择下拉树组件
  export default {
    name: 'platform-add',
    data() {
      /*校验--选择上级分类*/
      var parentName = (rule, value, callback) => {
        var _this = this;
        setTimeout(function () {
          if (_this.canRegister && (!_this.formLabel.parentName || _this.formLabel.parentName.length == 0)) {
            callback(new Error('请选择上级分类'));
          } else {
            callback();
          }
        }, 200)
      };
      return {
        crumbsList: [],
        labelCode: this.$store.state.appCurrentId,//从编辑页面跳转过来，labelCode不为空
        parentCode: {
          id: ""
        },//父级code
        platformCode: "",//平台id
        relationData: [],//关联分类一级内容
        secondAboutLabel: [],//关联分类二级分类
        loading: false,//防重复提交
        labelVisible: false,
        aboutLoading: false,//防重复提交
        registerRules: {
          name: [{required: true, min: 1, max: 20, message: '长度在1 到20个字符', trigger: 'blur'}],
          description: [{min: 1, max: 200, message: '长度在1 到200个字符', trigger: 'blur'}],
          parentName: [{required: true, validator: parentName, message: '请选择上级分类', trigger: 'blur'}]
        },
        formLabel: {
          name: "",
          parentName: "",
          description: "",
          status: "Y"
        },
        EditData: [],
        setAboutSecond: false,//是否设置分类关联的二级内容
        canRegister: false//是否可以校验“上级”
      };
    },
    mounted() {
      if (this.isPress) {
        this.crumbsList = [
          {name: '商品分类管理', url: {routerName: 'app', params: {name: 'labelManage'}}},
          {name: this.$store.state.appCurrentId ? "编辑分类" : "新增分类"},
        ];
      } else {//出版云
        this.crumbsList = [
          {name: '平台标签', url: {routerName: 'app', params: {name: 'labelManage'}}},
          {name: this.$store.state.appCurrentId ? "编辑分类" : "新增分类"},
        ];
      }
      this.getRelationData();
      if (this.$store.state.appCurrentObj) {
        this.platformCode = this.$store.state.appCurrentObj.platformCode;
      }
      if (this.labelCode) {
        this.getData();
      }
    },
    methods: {
      /*选择上级分类，是否当前可以校验*/
      changeShow(flag) {
        this.canRegister = flag;
      },
      /*获取关联分类、"上级"一级内容*/
      getRelationData() {
        let url = this.apiUrl + "/originalTag/getTopTree";
        let params = {};
        this.publicFuction.publicRequest('get', url, params, this.relationDataCallback);
      },
      relationDataCallback(response) {
        this.relationData = response.data;
      },
      /*新增分类*/
      labelAdd(formName) {
        this.loading = true;
        let params = {
          name: this.formLabel.name,//分类名称
          platformCode: this.platformCode,//平台id
          parentCode: this.parentCode.id,//父级节点id
          description: this.formLabel.description,//描述
          status: this.formLabel.status,//是否启用
        }

        this.$refs[formName].validate((valid) => {
          if (valid) {
            let _this = this;
            let url = this.apiUrl + '/platformTag/add';
            this.publicFuction.publicRequest('post', url, params, function (data) {
              _this.addCallback(data, formName);
            }, this.addError);
          } else {
            this.loading = false;
            console.log('表单验证错误!');
            return false;
          }
        });
      },
      addCallback(data, formName) {
        this.$message({
          message: '保存成功！',
          type: 'success'
        });
        this.loading = false;
      },
      addError(data) {
        this.$message({
          message: data.msg + '保存失败！',
          type: "error"
        });
        this.loading = false;
      },
      /*从编辑跳转过来，读取该页面详情*/
      getData() {
        let url = this.apiUrl + "/platformTag/getTag";
        let params = {id: this.labelCode};
        this.publicFuction.publicRequest('get', url, params, this.getDataCallback);
      },
      getDataCallback(response) {
        var data = response.data;
        this.EditData = JSON.parse(JSON.stringify(data));
        this.formLabel = JSON.parse(JSON.stringify(data));
        this.parentCode.id = response.data.parentCode;
      },
      /*修改信息*/
      saveChange(formName) {
        this.loading = true;
        let params = {
          id: this.labelCode,//分类id
          name: this.formLabel.name,//分类名称
          platformCode: this.platformCode,//平台id
          parentCode: this.parentCode.id,//父级节点id
          description: this.formLabel.description,//描述
          status: this.formLabel.status,//是否启用
        }

        this.$refs[formName].validate((valid) => {
          if (valid) {
            let _this = this;
            let url = this.apiUrl + '/platformTag/modify';
            this.publicFuction.publicRequest('post', url, params, function (data) {
              _this.saveChangeCallback(data, formName);
            }, this.saveChangeError);
          } else {
            this.loading = false;
            console.log('表单验证错误!');
            return false;
          }
        });
      },
      saveChangeCallback() {
        this.getData();
        this.$message({
          message: "修改信息成功",
          type: "success"
        })
        this.loading = false
      },
      saveChangeError(response) {
        this.$message({
          message: response.msg + " 修改信息失败",
          type: "error"
        })
        this.loading = false
      },
      /*关联弹框---点击确定*/
      confirmLabel() {
      /*  console.log(JSON.stringify(this.$refs.treeAbout.getCheckedKeys()));*/
        this.aboutLoading = true;
        var checkedKeys = this.$refs.treeAbout.getCheckedKeys();
        let params = {
          id: this.labelCode,//分类id
          platformCode: this.platformCode,//平台id
          relateIds: checkedKeys
        };
        let url = this.apiUrl + '/platformTag/relation';
        this.publicFuction.publicRequest('post', url, params, this.confirmCallback, this.confirmError);
      },
      confirmCallback() {
        this.$message({
          message: '关联成功！',
          type: 'success'
        });
        this.getData();
        this.cancelLabel();
      },
      confirmError(response) {
        this.$message({
          message: response.msg + "，关联失败",
          type: "error"
        });
        this.aboutLoading = false;
      },
      /*关联分类--点击取消*/
      cancelLabel() {
        this.labelVisible = false;
        this.aboutLoading = false;
      },
      /*关联弹框--关闭前执行的方法*/
      labelHandleClose(done) {
        this.cancelLabel();
        done();
      },
      /*动态加载关联分类*/
      getAboutLabel(node, resolve) {
        var _this = this;
        if (node.level === 0) {
          return resolve(_this.relationData);
        }
        var hasChild = node.data.haveChildren;
        if (hasChild && !this.setAboutSecond) {
          var params = {
            row: node.data,
            node: node,
            resolve: resolve
          }
          this.getSecondAboutList(params)
        }
        if (!hasChild) {
          resolve([]);
        }
        if (this.setAboutSecond) {
          var data;
          if (hasChild) {
            data = _this.secondAboutLabel;
          } else {
            data = [];
          }
          this.setAboutSecond = false;
          resolve(data);
        }
      },
      /*获取关联二级分类*/
      getSecondAboutList(obj, expandedRows) {
        var row = obj.row;
        if (!row.haveChildren) {
          return;
        }
        var _this = this;
        let url = this.apiUrl + "/originalTag/getChildTree";
        let params = {
          groupCode: row.tagGroup,
          parentCode: row.id
        };
        this.publicFuction.publicRequest('get', url, params, function (data) {
          _this.getSecondAboutCallback(data, obj);
        });
      },
      getSecondAboutCallback(response, params) {
        this.secondAboutLabel = response.data;
        this.setAboutSecond = true;
        this.getAboutLabel(params.node, params.resolve);
      },
      /*跳转页面*/
      changeCurrentView(page) {
        var _this = this;
        this.publicFuction.changeComponent(_this, "changeAppView", "app", page);
      }
    },
    components: {
      selectTree
    }
  };
</script>
<style lang="less">
  #platformLabelAdd {
    min-height: 100%;
    border: 1px solid #d2dae9;
    background: #fff;
    padding: 0 35px;
    .user-title {
      height: 60px;
      line-height: 60px;
      /*border-bottom: 1px solid #eeeeee;*/
      color: #333;
      font-size: 14px;
      em {
        font-style: normal;
        margin: 0 5px;
        color: #aaa;
      }
      span {
        color: #666;
        cursor: pointer;
        &:first-child {
          font-weight: bold;
          color: #333333
        }
        &:last-child {
          cursor: default;
        }
      }
    }
    .input_box {
      margin: 28px 80px
    }
    .el-input__inner {
      color: #999
    }
    .el-form-item__label {
      color: #333
    }
    ul.about-list {
      padding: 15px 0;
      line-height: 23px;
      color: #999;
    }
    p {
      color: #999999
    }
    .el-select {
      width: 100%
    }
    .user-box {
      min-height: calc(~"100vh - 224px");
      .user-form {
        width: 454px;
        margin: 30px 0;
      }
      .line {
        border-bottom: 1px solid #eeeeee;
      }
    }
    .el-input__inner {
      border: 1px solid #dcdfe6;
    }
    textarea {
      height: 160px;
    }
    .el-dialog {
      .el-dialog__header {
        border-bottom: 1px solid #eee;
      }
      .el-dialog__title {
        font-size: 14px;
      }
      .el-dialog__body {
        padding: 12px 20px;
        height: 370px;
        overflow: auto;
      }
      .el-dialog__footer {
        border-top: 1px solid #eee;
      }
      .el-button {
        padding: 8px 15px;
      }
      .el-radio-group {
        line-height: 40px;
      }
      .el-form-item__content {
        margin-top: 4px;
      }
      .el-radio {
        margin-left: 0;
        margin-right: 30px;
      }
      .tree-des {
        width: 300px;
        padding-right: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      ul.tree-tit {
        height: 36px;
        line-height: 36px;
        overflow: hidden;
        margin-bottom: 10px;
        background: #f0f0f0;
        box-sizing: border-box;
        li:first-child {
          float: left;
          padding-left: 20px;
        }
        li:last-child {
          width: 310px;
          float: right;
        }
      }
    }
    .el-table {
      font-size: 12px;
      color: #666;
      thead {
        font-size: 12px;
        line-height: 36px;
        color: #999;
        tr, th {
          background: #f0f0f0;
          padding: 0;
        }
      }
      .cell {
        padding-left: 25px;
      }
      .operation {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
    tr:hover td {
      background-color: #fff !important;
    }
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
    }
  }
</style>

