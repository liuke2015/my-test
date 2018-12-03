<template>
  <div id="dialogCropper">
    <el-dialog title="裁切图片" :visible.sync="pictureCutShow" width="600px" :before-close="closeUpload">
      <div>
        <div class="img-container">
          <img id="image" :src="cropData.cutImgUrl" alt="Picture">
        </div>
        <div class="img-preview preview-lg"></div>
        <div class="size-des">图片尺寸：{{cropData.width}} * {{cropData.height}}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitUpload">原图</el-button>
        <el-button type="primary" @click="cropImg">裁切</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import '@static/cropperjs/cropper.css'
  import '@static/cropperjs/cropper.js'

  export default {
    name: "dialog-cropper",
    props: ["cropData"], /* 说明- cropData: {
                                       width:0,//裁切好的图片宽度
                                       height:0,//裁切好的图片高度
                                      cutImgUrl: "",//要裁切的图片url
                                      result: "",//裁切好的图片url
                                      uploading: false,//正在上传图片
                                    },*/
    data() {
      return {
        pictureCutShow: false,//裁切图片弹窗
      }
    },
    mounted() {
     /* console.log("cropper-cropData:", this.cropData);*/
    },
    methods: {
      /*显示弹窗*/
      showModel() {
        this.pictureCutShow = true;
        this.$nextTick(function () {
          var $image = $('#image');
          let _this=this;
          $image.cropper({
            aspectRatio: _this.cropData.width / _this.cropData.height,
            viewMode: 1,
            preview: '.img-preview',
            dragMode:_this.cropData.dragMode?_this.cropData.dragMode:'crop',
          });
          $image.cropper('setAspectRatio', _this.cropData.width / _this.cropData.height);//更新图片裁剪比例
          $image.cropper('replace', this.cropData.cutImgUrl);//更新图片裁剪地址
        });
      },
      /*关闭，清空原始数据*/
      closeUpload() {
        this.cropData.cutImgUrl = "";
        this.pictureCutShow = false;
        this.cropData.uploading = false;
      },
      /*裁切图片--原图，执行触发上传的操作，此时上传的是未经裁切的原图*/
      submitUpload() {
        this.pictureCutShow = false;
        this.cropData.result = "";
        this.$emit("submitUpload");
      },
      /*裁切图片--确定*/
      cropImg() {
        this.pictureCutShow = false;
        var $image = $('#image');
        var croppedCanvas/*,
          width = this.canvasHeight * this.cropData.scale,
          height = this.canvasHeight*/;
          let _this=this;
        croppedCanvas = $image.cropper('getCroppedCanvas', {
          width: _this.cropData.width ,
          height: _this.cropData.height
        });
        this.cropData.result = croppedCanvas.toDataURL();
        this.cropData.cutImgUrl = "";
        this.pictureCutShow = false;
        this.$emit("submitUpload");
      },
    }
  }
</script>

<style lang="less">
  /*裁切图片样式*/
  .img-container {
    margin-bottom: 1rem;
    height: 300px;
    overflow: hidden;
  }

  .img-preview {
    border: 1px solid #ccc;
    margin: 20px auto;
    overflow: hidden;
  }

  .img-preview > img {
    max-width: 100%;
  }

  .preview-lg {
    height: 200px;
  }
  .size-des{
    text-align: center;
  }
</style>
