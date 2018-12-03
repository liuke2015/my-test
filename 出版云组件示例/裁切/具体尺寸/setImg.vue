<template>
  <div id="setImgList">
    <el-upload
            class="upload-img"
            :action="deskUrl+'/contentFopImg/uploadImg/'+ platformCode+'/'+pubAppId+'/'+ pageId"
            ref="upload"
            :data="imgBase64"
            :show-file-list="false"
            :on-change="uploadChange"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :before-upload="beforeUpload"
            :auto-upload="false">
      <el-button type="primary" plain>选择图片</el-button>
    </el-upload>
    <!--图片裁切弹窗-组件-->
    <imgCropperWH :cropData="cropData" @submitUpload="submitUpload" ref="crop" v-if="canShowCropper"/>
  </div>
</template>

<script>
  import imgCropperWH from './dialogCropperWH.vue';   // 裁切图片组件（传参包括width/height）
  export default {
    name: "setImgList",
    props: ['imgList', 'requireList'],//requireList-请求接口集合，
    /* imgList:{
               id: "",
               title:"",
               width:0,
               height:0,
              isShow: false
   },*/
    data() {
      return {
        loading: false,
        requireUrl: "",//获取列表的接口
        saveUrl: "",//保存图片接口
        addImg: true,//是否新增
        listData: [],//已添加列表
        cropData: {
          /*  scale: 5 / 3,*///图片裁切比例
          width: 0,//裁切好的图片宽度
          height: 0,//裁切好的图片高度
          cutImgUrl: "",//要裁切的图片url
          result: "",//裁切好的图片url
          uploading: false,//正在上传图片
        },
        imgBase64: {
          data: ""
        },
        formData: {
          objId: "",//页面id
          imgPath: "",//图片路径
          title: "",//图片标题
          imgHref: "",//链接地址
          seq: 1,//序号
          intro: "",//简介（设置底图有）
          fullImgPath: "", //图片全路径
        },//表单内容
        registerRules: {
          imgPath: [{required: true, message: '请选择图片', trigger: 'blur'}],
          title: [
            {required: true, message: '请输入图片名称', trigger: 'blur'},
            {min: 1, max: 10, message: '不超过10字', trigger: 'blur'}
          ],
          imgHref: [/*{required: true, message: '请选择链接地址', trigger: 'blur'}*/],
          intro: [
            {required: true, message: '请输入简介', trigger: 'blur'},
            {min: 1, max: 200, message: '不超过200字', trigger: 'blur'}]
        },
        canShowCropper: false,//裁切组件是否可以加载
        platformCode: "",
        pubAppId: "",
        pageId: "",
        itemId: "",//操作左侧列表项的id
        parentLinkData: {
          href: "",
          hrefType: "",
          isShow:false
        }
      }
    },
    mounted() {
      this.platformCode = this.requireList.platformCode;
      this.pubAppId = this.requireList.pubAppId;
      this.formData.objId = this.pageId = this.requireList.pageId;
      /*给请求列表url赋值*/
      switch (this.requireList.type) {
        case "advance"://广告
          this.requireUrl = "/fo/page/getSetAdImgList";
          this.saveUrl = "/contentFopImg/saveAdImg";
          break;
        case "carousel"://轮播图
          this.requireUrl = "/fo/page/getSetScrollImgList";
          this.saveUrl = "/contentFopImg/saveScrollImg";
          break;
        case "bottom"://底图
          this.requireUrl = "/fo/page/getSetBackImgList";
          this.saveUrl = "/contentFopImg/saveBackImg";
          break;
        case "pageAd"://页面广告
          this.requireUrl = "/fo/page/getSetNavAdImgList";
          this.saveUrl = "/contentFopImg/saveNavAdImg";
          break;
      }
      /*给cropData赋值*/
      this.setCropData();
      this.getList();
    },
    methods: {
      /*给cropData赋值*/
      setCropData() {
        this.cropData.width = this.imgList.width;
        this.cropData.height = this.imgList.height;
        this.canShowCropper = true;
      },
      /*获取列表数据*/
      getList(type = '') {
        let url = this.deskUrl + this.requireUrl;
        let params = null;
        if (this.requireList.type == "pageAd") {//页面广告
          params = {
            objId: this.requireList.pageId
          };
        } else {
          params = {
            pageId: this.requireList.pageId
          };
        }

        let _this = this;
        this.publicFuction.publicRequest('get', url, params, function (response) {
          _this.getListCallback(response, type)
        }, this.getListError);
      },
      getListCallback(response, type) {
        this.listData = response.data;
        if (this.listData.length == 0) {
          this.addImg = true;
        } else {
          /*读取表单信息*/
          if (this.addImg || type == 'delete') {//新增和删除，默认显示第一条数据
            this.itemId = this.listData[0].id;
            this.addImg = false;
          }
          this.getFormData(this.itemId);
        }
      },
      getListError(response) {
        this.$message({
          message: "获取列表数据失败！ " + response.msg,
          type: "error"
        })
      },
      /*读取表单信息*/
      getFormData(id) {
        let url = this.deskUrl + "/contentFopImg/getImg";
        let params = {
          id: id
        };
        this.publicFuction.publicRequest('get', url, params, this.getFormDataCallback, this.getFormDataError);
      },
      getFormDataCallback(response) {
        this.formData = response.data;
        this.parentLinkData.href = response.data.imgHref;
        this.parentLinkData.hrefType = response.data.hrefType;
      },
      getFormDataError(response) {
        this.$message({
          message: "表单信息失败！ " + response.msg,
          type: "error"
        })
      },
      /*点击左侧列表，右侧显示详情*/
      showItem(id) {
        this.addImg = false;
        this.getFormData(id);
      },
      /*添加*/
      addLine() {
        this.formData.imgPath = "";
        this.formData.title = "";
        this.formData.imgHref = "";
        this.formData.seq = 1;
        this.formData.intro = "";
        this.addImg = true;
      },

      /*新增*/
      saveForm(formName) {
        this.loading = true;
        let params = null;
        let url = "";
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.addImg) {//新增
              url = this.deskUrl + this.saveUrl;
              params = {
                objId: this.formData.objId,
                imgPath: this.formData.imgPath,
                imgHref: this.formData.imgHref,
                title: this.formData.title,
                seq: this.formData.seq,
                hrefType: this.formData.hrefType
              };
            } else {//编辑
              this.itemId = this.formData.id;
              url = this.deskUrl + "/contentFopImg/modifyImg";
              params = {
                id: this.formData.id,
                imgPath: this.formData.imgPath,
                imgHref: this.formData.imgHref,
                title: this.formData.title,
                seq: this.formData.seq,
                hrefType: this.formData.hrefType
              };
            }
            if (this.requireList.type == 'bottom') {
              params.intro = this.formData.intro;
            }
            this.publicFuction.publicRequest('post', url, params, this.saveFormCallback, this.saveFormError);
          } else {
            this.loading = false;
            console.log('表单验证错误!');
            return false;
          }
        });
      },
      saveFormCallback(response) {
        this.$message({
          message: '保存成功！',
          type: 'success'
        });
        this.loading = false;
        this.getList();
      },
      saveFormError(data) {
        this.$message({
          message: data.msg + '保存失败！',
          type: "error"
        });
        this.loading = false;
      },
      /*裁切成功后，触发该方法*/
      submitUpload() {
        this.imgBase64.data = this.cropData.result;
        this.$refs.upload.submit();
      },
      /*图书上传封面--成功*/
      uploadSuccess(response, file) {
        var _this = this;
        /*  this.imageUrl = this.cropData.cutImgUrl ? this.cropData.cutImgUrl : this.cropData.result;*/
        if (response.success) {
          this.formData.imgPath = response.data;
        } else {
          this.$message.error(response.msg);
        }
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
        /*  this.formData.title = file.name;*/
        return isLt2M;
      },
      /*图书上传队列改变时--要做的处理-打开裁切窗口*/
      uploadChange(file) {
        if (this.cropData.uploading) return;
        this.cropData.uploading = true;
        this.$refs.crop.showModel();
        this.cropData.cutImgUrl = URL.createObjectURL(file.raw);
      },

    },
    components: {
      imgCropperWH
    }
  }
</script>
<style lang="less">
  #setImgList {
    .setImgDialog {
      .el-row {
        height: 620px;
        .el-col {
          position: relative;
          height: 100%;
          &:nth-of-type(2) {
            background: #f9f9f9;
          }
        }
        .addBtn {
          position: absolute;
          bottom: 10px;
          left: 50%;
          margin-left: -38px;
          width: 76px;
        }
        .el-form-item__label {
          font-size: 12px;
          color: #666;
          line-height: 20px;
        }
        .el-input__inner {
          height: 35px;
          line-height: 35px;
        }
        .link-input {
          width: 406px;
        }
        .chooseBtn {
          width: 68px;
        }
      }
      .img-list {
        height: 490px;
        overflow: hidden;
        overflow-y: auto;
        li {
          height: 48px;
          line-height: 48px;
          font-size: 12px;
          color: #666;
          overflow: hidden;
          padding-left: 5px;
          border-bottom: 1px solid #f0f0f0;
          h3 {
            float: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 300px;
            cursor: pointer;
          }
          .img-list-right {
            float: right;
            & > * {
              margin-right: 20px;
            }
            i.el-icon-delete {
              font-size: 16px;
              cursor: pointer;
            }
          }
        }
      }
      .img-box {
        position: relative;
        height: 110px;
        border: 1px solid #dcdddd;
        text-align: center;
        margin: 8px 0 15px;
        overflow: hidden;
        img {
          height: 100%;
        }
      }
      .pageAd-img-box {
        height: 56px;
        img {
          width: 100%;
          height: auto;
        }
      }
      .el-dialog__header {
        border-bottom: 1px solid #eee;
        padding-top: 12px;
      }
      span.el-dialog__title {
        font-size: 14px;
      }
      .el-dialog__headerbtn {
        top: 16px;
      }
      .el-dialog__body {
        padding: 10px 15px !important;
        height: 620px
      }
      .el-button {
        padding: 9px 15px;
        font-family: "Microsoft YaHei";
        font-size: 14px;
      }
      .sortInput {
        width: 478px;
      }
      .el-form-item {
        margin-bottom: 15px;
      }
      .el-form-item__label {
        padding-bottom: 5px;
      }
      .padTop {
        padding-top: 15px;
      }
    }

  }
</style>
