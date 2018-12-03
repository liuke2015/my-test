<template>
  <div id="uBookAdd" class="uBook-box pr-35">
    <!--面包屑-->
    <Crumbs :crumbs="crumbsList"/>
    <div class="tab-list">
      <div class="user-box">
        <h3 class="book-tit">
          <span>图书基本信息</span>
          <p>注意：如果关联了图书，对图书信息的修改，会同步到图书中</p>
        </h3>
        <el-form class="demo-ruleForm" label-width="100px" :model="formData" :rules="registerRules" ref="formData">
          <div class="user-form">
            <el-form-item label="" prop="">
              <el-upload
                class="avatar-uploader"
                :action="contentOperationUrl+'/ubook/cover/upload/'+ formData.code"
                ref="upload"
                :data="imgBase64"
                :show-file-list="false"
                :on-change="uploadChange"
                :on-success="uploadSuccess"
                :on-error="uploadError"
                :before-upload="beforeUpload"
                :auto-upload="false">
                <div v-if="imageUrl" class="avatar"
                     :style="{'background-image':'url('+ imageUrl+ ')'}">
                </div>
                <p v-else class="uploader-text">请上传封面</p>
              </el-upload>
            </el-form-item>
            <el-form-item label="图书名称" prop="name">
              <el-input placeholder="请输入图书名称" v-model.trim="formData.name"></el-input>
            </el-form-item>
            <el-form-item label="ISBN" prop="isbn">
              <el-input placeholder="请输入ISBN号" v-model.trim="formData.isbn"></el-input>
              <span class="des-text">样例：978-7-115-16210-6</span>
            </el-form-item>
            <el-form-item label="出版物号" prop="publicationCode">
              <el-input placeholder="请输入出版物号" v-model.trim="formData.publicationCode"></el-input>
            </el-form-item>
            <el-form-item label="分类" prop="tagIds">
              <el-button type="primary" plain @click="showLabel">关联</el-button>
              <ul class="about-list">
                <template v-if="tagIds.nodes.length>0">
                  <li v-for="(item,index) in tagIds.nodes">
                    <el-button type="warning" plain size="small" @click="delLabel(index)">
                      {{item.name}}<i class="el-icon-close el-icon--right"></i>
                    </el-button>
                  </li>
                </template>
                <el-button type="warning" plain size="small" @click="delLabelNewAdd" v-if="tagIds.nodes.length==0 && fromBookInfo.name">
                  {{fromBookInfo.name}}<i class="el-icon-close el-icon--right"></i>
                </el-button>
              </ul>
            </el-form-item>
            <el-form-item label="本书简介" prop="resume">
              <el-input type="textarea" v-model.trim="formData.resume" placeholder="可选填，200字"
                        :autosize="{ minRows: 7, maxRows: 7}"></el-input>
            </el-form-item>
          </div>
          <div class="line"></div>
          <div class="input_box ">
            <el-button type="primary" @click="ubookSave('formData')" :loading="loading">完成</el-button><!--新增-->
          </div>
        </el-form>
      </div>
    </div>
    <!--图片裁切弹窗-组件-->
    <imgCropper :cropData="cropData" @submitUpload="submitUpload" ref="crop"/>
    <!--选择图书弹窗-组件-->
    <selectBooks ref="chi"/>
    <!--关联分类弹窗-组件-->
    <aboutLabel :tagIds="tagIds" ref="aLabel"/>
  </div>
</template>

<script>
  import imgCropper from '@/Components/common/dialogCropper.vue';   // 裁切图片组件
  import aboutLabel from '@/Components/Cms/ubookManage/comResource/dialogAboutLabel.vue';   // 分类关联组件
  import selectBooks from '@/Components/Cms/bookManage/selectBooks';   // 图书选择组件
  export default {
    name: "u-book-add",
    data() {
      return {
        crumbsList: [   //  面包屑
          {name: 'U书', url: {routerName: 'cms', params: {name: 'uBookManage', com: 'uBook', second: 'grid'}}},
          {name: '新建', url: {routerName: 'cms', params: {name: 'uBookManage', com: 'uBookAdd'}}},
        ],
        activeName: "chooseBook",
        currentView: "chooseBook",
        imageUrl: '',//图书封面地址
        cropData: {
          scale: 4 / 5,//图片裁切比例
          cutImgUrl: "",//要裁切的图片url
          result: "",//裁切好的图片url
          uploading: false,//正在上传图片
        },
        imgBase64: {
          data: ""
        },
        tagIds: {
          keys: [],
          nodes: []
        },
        fromBookInfo: {
          name: "",
          objectId: ""
        },//来自哪本书下面的信息，通过面包屑接口获取
        formData: {
          name: "",//书名
          isbn: "",//ISBN码
          publicationCode: "",//出版物号
          resume: "",//简介
          logoUrl: "",//封面图
          tagIds: [],//List :分类id
          code: ""
        },//表单内容
        loading: false,//防重复提交
        registerRules: {
          name: [{required: true, min: 1, max: 150, message: '长度在1 到150个字符', trigger: 'blur'}],
          isbn: [{min: 1, max: 20, message: '长度在1 到20个字符', trigger: 'blur'}],
          publicationCode: [{min: 1, max: 20, message: '长度在1 到20个字符', trigger: 'blur'}],
          resume: [{min: 1, max: 200, message: '长度在1 到200个字符', trigger: 'blur'}],
          tagIds: {required: true, message: '请选择关联分类', trigger: 'blur'}
        },
      }
    },
    mounted() {
      /*获取code*/
      this.getCode();
      /*获取来自哪本书下面的信息*/
      if (this.$route.query.id) {
        this.getFromBookInfo();
      }
    },
    methods: {
      /*获取code*/
      getCode() {
        let url = this.contentOperationUrl + "/ubook/getUbookCode";
        let params = {};
        this.publicFuction.publicRequest('get', url, params, this.getCodeCallback, this.getCodeError);
      },
      getCodeCallback(response) {
        this.formData.code = response.data;
      },
      getCodeError(response) {
        console.log("获取code失败！" + response.msg);
      },
      changeTab(tab, event) {
        this.currentView = tab.paneName;
      },
      /*获取来自哪本书下面的信息,通过面包屑接口获取*/
      getFromBookInfo() {
        let url = this.contentOperationUrl + "/ubook/getRootLink";
        let params = {
          type: "uBook",
          objectId: this.$route.query.id
        };
        this.publicFuction.publicRequest('get', url, params, this.getFromBookCallback, this.getFromBookError);
      },
      getFromBookCallback(response) {
        let index = response.data.length - 1;
        this.fromBookInfo = response.data[index];
        this.formData.tagIds = [this.fromBookInfo.objectId];
        //给关联弹窗赋默认选中值
        this.$refs.aLabel.getDefaultChecked(this.formData.tagIds);
      },
      getFromBookError(response) {
        console.log("获取tagIds失败！" + response.msg);
      },
      /*裁切成功后，触发该方法*/
      submitUpload() {
        this.imgBase64.data = this.cropData.result;
        this.$refs.upload.submit();
      },
      /*图书上传封面--成功*/
      uploadSuccess(response, file) {
        var _this = this;
        this.imageUrl = this.cropData.cutImgUrl ? this.cropData.cutImgUrl : this.cropData.result;
        if (response.success) {
          this.formData.logoUrl = response.data;
          /*  console.log(`logoUrl:${response.data}`);*/
        } else {
          this.$message.error(response.msg);
        }
        /* this.formData.logoUrl = this.cropData.cutImgUrl ? this.cropData.cutImgUrl : this.cropData.result;*/
        this.$message({
          message: "操作成功",
          type: "success"
        });
        setTimeout(function () {
          _this.cropData.uploading = false;
        }, 100);
      },
      /*图书上传封面--失败*/
      uploadError(err, file, fileList) {
        var _this = this;
        this.$message({
          message: "操作失败",
          type: "error"
        });
        setTimeout(function () {
          _this.cropData.uploading = false;
        }, 100);
      },
      /*图书上传封面--之前要做的处理*/
      beforeUpload(file) {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!');
          this.cropData.uploading = false;
        }
        return isLt2M;
      },
      /*图书上传队列改变时--要做的处理-打开裁切窗口*/
      uploadChange(file) {
        if (this.cropData.uploading) return;
        this.cropData.uploading = true;
        this.$refs.crop.showModel();
        this.cropData.cutImgUrl = URL.createObjectURL(file.raw);
      },
      /*保存-完成*/
      ubookSave(formName) {
        this.loading = true;
        let params = this.formData;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let _this = this;
            let url = this.contentOperationUrl + '/ubook/add';
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
        this.$router.go(-1);
      },
      addError(data) {
        this.$message({
          message: data.msg + '保存失败！',
          type: "error"
        });
        this.loading = false;
      },
      /*删除分类*/
      delLabel(index) {
        this.tagIds.keys.splice(index, 1);
        this.tagIds.nodes.splice(index, 1);
      },
      /*删除新建时，页面带过来的分类*/
      delLabelNewAdd() {
        this.formData.tagIds = [];
        this.fromBookInfo={};
      },
      /*弹出选择图书*/
      showModel() {
        this.$refs.chi.chilFn('我是父元素传过来的')
      },
      /*显示关联分类弹窗*/
      showLabel() {
        this.$refs.aLabel.showModel();
      }
    },
    watch: {
      'tagIds.keys': {
        handler(newVal, oldVal) {
        /*  console.log("tagIds", this.tagIds);*/
          this.formData.tagIds = newVal;
          //给关联弹窗赋默认选中值
          this.$refs.aLabel.getDefaultChecked(this.formData.tagIds);
        },
        deep: true
      }
    },
    components: {
      imgCropper,//图片裁切
      selectBooks,//图书选择
      aboutLabel //分类关联
    }
  }
</script>

<style lang="less">
  #uBookAdd {
    .el-tabs {
      .el-tabs__nav-wrap::after {
        height: 1px;
      }
    }
    .user-box {
      min-height: calc(~"100vh - 224px");
      /*图书上传封面*/
      .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
      }
      .uploader-text {
        font-size: 14px;
        color: #999;
        width: 160px;
        height: 200px;
        line-height: 200px;
        text-align: center;
      }
      .el-upload,
      .avatar-uploader,
      .avatar,
      .choose-avatar {
        width: 160px;
        height: 200px;
      }
      .avatar {
        display: block;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      .choose-avatar {
        margin-bottom: 15px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        overflow: hidden;
      }
      .book-tit {
        padding-top: 30px;
        font-size: 14px;
        span {
          float: left;
          margin-right: 15px;
          color: #333;
        }
        p {
          color: #999;
        }

      }
      .about-list {
        overflow: hidden;
        margin-right: -20px;
        padding-top: 8px;
        li {
          float: left;
          margin-right: 10px;
          margin-bottom:10px;
        }
      }
      .user-form {
        width: 440px;
        margin: 30px 0;
        .el-form-item__content {
          line-height: 1;
        }
        .des-text {
          position: absolute;
          line-height: 20px;
          right: -180px;
          top: 9px;
          color: #999;
        }
      }
      .el-input__inner,
      .el-textarea__inner {
        border-color: #dcdfe6 !important;
      }
    }
    .page {
      padding: 25px 0;
    }
  }
</style>
