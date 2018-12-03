<template>
  <div id="upload">
    <el-upload
      class="upload-demo"
      drag
      multiple
      :limit="limitNum"
      :action="uploadUrl"
      :data="upParams"
      :on-success="handleAvatarSuccess"
      :on-error="errorFunction"
      :before-upload="beforeUpload">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <dl class="el-upload__tip" slot="tip" v-if="fromPage == 'onlineUploadRes'"><!--在线资源，支持格式-->
        <dd>图片格式：png、jpg、bmp</dd>
        <dd>音频格式：aac、MP3</dd>
        <dd>
          视频格式：3GP、ASF、AVI、DAT、DVD、F4V、FLV、M2TS、M4V、MKV、MOV、MP4、MPE、MPEG、MPG、MTS、OGM、QT、RM、RMVB、SWF、TP、TS、VOB、WEBM、WMV
        </dd>
        <dd>文件大小：小于{{fileSizeLimit}}M</dd>
        <dd>文件名称：长度小于{{maxLength}}</dd>
        <dd class="red" v-show="showFormat">上传文件格式不符合要求</dd>
        <dd class="red" v-show="showSize">上传：“{{fileName}}”文件过大</dd>
        <dd class="red" v-show="showNameSize">上传文件：“{{fileName}}”名称过长</dd>
      </dl>
      <dl class="el-upload__tip" slot="tip" v-else>
        <dd>图片格式：.png，.jpg，.jpeg，.gif，.bmp，.tif，.psd，.cdr</dd>
        <dd>文档格式：.doc，.docx，.xls，.xlsx，.pdf，.ppt，.pptx，.txt</dd>
        <dd>音视频格式：,mp4，.avi，.mp3，,rmvb，.flv，.rm，.wmv，.swf</dd>
        <dd>其它格式：.rar，.zip，.exe，.html，分卷压缩(.001~.020)</dd>
        <dd>文件大小：小于{{fileSizeLimit}}M</dd>
        <dd>文件名称：长度小于{{maxLength}}</dd>
        <dd class="red" v-show="showFormat">上传文件格式不符合要求</dd>
        <dd class="red" v-show="showSize">上传：“{{fileName}}”文件过大</dd>
        <dd class="red" v-show="showNameSize">上传文件：“{{fileName}}”名称过长</dd>
      </dl>
    </el-upload>
    <!-- :on-progress="progressFun" -->
  </div>
</template>
<script>
  export default {
    name: 'upload',
    props: ["parentParams", "limitNum", "requireUrl", "fromPage"],//"limitNum"限制上传个数,"requireUrl"请求上传的地址,"fromPage"-来自哪个页面
    /*  parentParams:{
          "projectId":"",//项目id
          "resourceId":"",//父级目录id; 项目id和目录id必须有一个不为空
          "fileName":""//文件名称,获取上传路径用
        }
    * */
    data() {
      return {
        msg: '',
        upParams: {},
        showFormat: false,//显示格式不符合要求
        showSize: false,//显示大小不符合要求
        showNameSize: false,//显示有名称过长
        fileName: "",//文件名称
        maxLength: 200,//文件名称最大长度
      }
    },
    created: function () {
      // this.getdata();
    },
    mounted() {
    },
    methods: {
      /*变量复位*/
      reset() {
        this.showFormat = false;
        this.showSize = false;
        this.showNameSize = false;
      },
      // 上传成功
      handleAvatarSuccess(res, file) {
        if (this.fromPage == "onlineUploadRes" || this.fromPage == "onlineUploadCourse") {//来自在线资源，上传资源
          this.parentParams.ossPath = this.upParams.key;
          this.parentParams.size = this.size;
        } else {
          this.parentParams.key = this.upParams.key;
          this.parentParams.size = this.size;
        }
        this.$emit("setCanUse");
      },
      errorFunction(err) {
        this.$message.error('上传失败');
      },
      getToken() {
        let that = this;
        return new Promise((resolve, reject) => {
          /* resolve(that.$http.post(that.publicUrl+'/oss/getData'))*/
          if (this.fromPage == "onlineUploadRes") {//来自在线资源，上传资源
            that.parentParams.name = that.parentParams.originalFilename = that.fileName;
            let params = {
              ubookId: that.parentParams.ubookId,//ubookId
              code: that.parentParams.code,//项目code
              originalFilename: that.fileName,//文件名
            }
            resolve(that.$http.get(that.contentOperationUrl + that.requireUrl, {params: params}));
          } else if (this.fromPage == "onlineUploadCourse") {//来自在线资源，上传资源
            that.parentParams.name = that.parentParams.originalFilename = that.fileName;
            let params = {
              code: that.parentParams.code,//code
              originalFilename: that.fileName,//文件名
            }
            resolve(that.$http.get(that.contentOperationUrl + that.requireUrl, {params: params}));
          } else {
            that.parentParams.fileName = that.fileName;
            resolve(that.$http.get(that.contentOperationUrl + that.requireUrl, {params: that.parentParams}));
          }
        })
      },
      /*校验上传文件格式、大小*/
      checkReg(re) {
        let regImg = /\.(png|jpg|jpeg|gif|bmp|tif|psd|cdr)$/i;
        let regDoc = /\.(doc|docx|xls|xlsx|pdf|ppt|pptx|txt)$/i;
        let regMui = /\.(mp4|avi|mp3|rmvb|flv|rm|wmv|swf)$/i;
        let regOther = /\.(rar|zip|exe|html|001|002)$/i;
        this.fileName = re.name;
        let name = re.name, size = re.size, flag = false;//flag为true，符合格式要求
        /*校验格式*/
        if (!flag && regImg.test(name)) {
          flag = true;
        }
        if (!flag && regDoc.test(name)) {
          flag = true;
        }
        if (!flag && regMui.test(name)) {
          flag = true;
        }
        if (!flag && regOther.test(name)) {
          flag = true;
        }
        if (!flag) {
          this.showFormat = true;
          return "false";
        }
        /*大于500M*/
        if (size / 1024 / 1024 > this.fileSizeLimit) {
          this.showSize = true;
          return "false";
        }
        /*判断文件名称是否过长*/
        if (re.name.length > this.maxLength) {
          this.showNameSize = true;
          return "false";
        }
        return "true";
      },
      /*在线资源的校验*/
      onLineResCheck(re) {
        let regImg = /\.(png|jpg|bmp)$/i;
        let regMui = /\.(aac|MP3|3GP|ASF|AVI|DAT|DVD|F4V|FLV|M2TS|M4V|MKV|MOV|MP4|MPE|MPEG|MPG|MTS|OGM|QT|RM|RMVB|SWF|TP|TS|VOB|WEBM|WMV)$/i;
        this.fileName = re.name;
        let name = re.name, size = re.size, flag = false;//flag为true，符合格式要求
        /*校验格式*/
        if (!flag && regImg.test(name)) {
          flag = true;
        }
        if (!flag && regMui.test(name)) {
          flag = true;
        }
        if (!flag) {
          this.showFormat = true;
          return "false";
        }
        /*大于500M*/
        if (size / 1024 / 1024 > this.fileSizeLimit) {
          this.showSize = true;
          return "false";
        }
        /*判断文件名称是否过长*/
        if (re.name.length > this.maxLength) {
          this.showNameSize = true;
          return "false";
        }
        return "true";
      },
      beforeUpload(re) {
        if (this.showFormat || this.showSize || this.showNameSize) {
          this.reset();
        }
        this.fileName = re.name;
        this.size = re.size;
        let _self = this;
        /*此处需要校验*/
        let reg = this.fromPage == 'onlineUploadRes' ? this.onLineResCheck(re) : this.checkReg(re);
        if (reg == "false") {
          return false;
        }
        return new Promise((resolve, reject) => {
          _self.getToken().then(result => {
            /* console.log('re:', re, result);*/
            let response = result.data.data;
            // _self.url = `http://${response.bucketName}.${response.endpoint}`;
            _self.upParams.policy = response.policy;
            _self.upParams.Signature = response.signature;
            _self.upParams.callback = response.callback;
            _self.upParams.key = response.key;
            _self.upParams.OSSAccessKeyId = response.oSSAccessKeyId;
            _self.upParams.x_oss_object_acl = response.x_oss_object_acl;
            return response;
          })
            .then((response) => {
              /* console.log(1111, _self.upParams);*/
              resolve(true);
            })
            .catch(err => {
              console.log(err)
              reject(false)
            });
        });
      }
    }
  }
</script>
<style lang="less">
  #upload {
    .red {
      color: #f00;
    }
    .el-upload__tip {
      dd {
        line-height: 24px;
      }
    }
  }
</style>
