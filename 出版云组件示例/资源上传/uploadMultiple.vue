<template>
  <div id="upload">
    <el-upload
      class="upload-demo"
      drag
      multiple
      :action="uploadUrl"
      ref="upload"
      :data="upParams"
      :on-success="handleAvatarSuccess"
      :on-remove="handleRemove"
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
        <!--   <dd class="red" v-show="showFormat">上传文件 : {{formatName}} 格式不符合要求</dd>
           <dd class="red" v-show="showSize">上传文件 : {{sizeName}} 过大</dd>
           <dd class="red" v-show="showRepeat">上传文件 : {{repeatName}} 名称重复</dd>-->
      </dl>
    </el-upload>
    <!-- :on-progress="progressFun" -->
  </div>
</template>
<script>
  export default {
    name: 'upload',
    props: ["parentParams", "requireUrl", "fromPage"],//"requireUrl"请求上传的地址,"fromPage"-来自哪个页面
    /*  parentParams:{
          "ubookId": this.commonObj.bookId,//u书id
          "code":this.commonObj.code,//项目code
          "projectId": this.commonObj.projectId,//项目id
          "folderId": this.commonObj.parentId,//所在文件夹id，根目录为"root"
          resources:[]
        }
    * */
    data() {
      return {
        msg: '多文件上传',
        upParams: {},
        showFormat: false,//显示格式不符合要求
        formatName: "",//格式不符合要求的文件名称
        showSize: false,//显示大小不符合要求
        sizeName: "",//显示大小不符合要求的文件名称
        showRepeat: false,//显示有重复名称
        repeatName: "",//显示有重复名称的文件名称
        tokenFileList: [],//token上传成功文件列表
        sucFileList: [],//最终上传文件列表
        reSuccess: false,//是否上传成功
        showCheckError: false,//是否已经弹出提示语
        alertStr: "",//校验错误，弹出的提示语
        showNameSize: false,//显示有名称过长
        longName: "",//显示名称过长的文件名称
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
        this.formatName = "";
        this.showSize = false;
        this.sizeName = "";
        this.showRepeat = false;
        this.repeatName = "";
        this.alertStr = "";
        this.showNameSize = false;//显示有名称过长
        this.longName = "";//显示名称过长的文件名称
      },
      /*上传失败*/
      errorFunction(err) {
        this.$message.error('上传失败');
      },
      getToken() {
        let that = this;
        return new Promise((resolve, reject) => {
          /* resolve(that.$http.post(that.publicUrl+'/oss/getData'))*/
          if (this.fromPage == "onlineUploadRes") {//来自在线资源，上传资源
            let params = {
              ubookId: that.parentParams.ubookId,//ubookId
              code: that.parentParams.code,//项目code
              originalFilename: that.fileName,//文件名
            };
            resolve(that.$http.get(that.contentOperationUrl + that.requireUrl, {params: params}));
          }
        })
      },
      /*在线资源校验上传文件格式、大小*/
      onLineResCheck(re) {
        let regImg = /\.(png|jpg|bmp)$/i;
        let regMui = /\.(aac|MP3|3GP|ASF|AVI|DAT|DVD|F4V|FLV|M2TS|M4V|MKV|MOV|MP4|MPE|MPEG|MPG|MTS|OGM|QT|RM|RMVB|SWF|TP|TS|VOB|WEBM|WMV)$/i;
        let name = re.name, size = re.size, flag = false, nameFloag = false;//flag为true，符合格式要求,nameFloag-名称重复
        if (!flag && regImg.test(name)) {
          flag = true;
        }
        if (!flag && regMui.test(name)) {
          flag = true;
        }
        if (!flag) {
          this.showFormat = true;
          if (this.formatName) {
            this.formatName += ", " + re.name;
          } else {
            this.formatName += re.name;
          }
          return "false";
        }
        /*大于1000M*/
        if (size / 1024 / 1024 > this.fileSizeLimit) {
          this.showSize = true;
          if (this.sizeName) {
            this.sizeName += ", " + re.name;
          } else {
            this.sizeName += re.name;
          }
          return "false";
        }
        /*判断重复*/
        if (this.parentParams.resources.length > 0) {
          for (let item of this.parentParams.resources) {
            if (re.name === item.name && !nameFloag) {
              nameFloag = true;
            }
          }
        }
        if (nameFloag) {
          this.showRepeat = true;
          if (this.repeatName) {
            this.repeatName += ", " + re.name;
          } else {
            this.repeatName += re.name;
          }
          return "false";
        }
        /*判断文件名称是否过长*/
        if (re.name.length > this.maxLength) {
          this.showNameSize = true;//显示有名称过长
          if (this.longName) {
            this.longName += ", " + re.name;
          } else {
            this.longName += re.name;
          }
          return "false";
        }
        return true;
      },
      /*上传之前*/
      beforeUpload(re, fileList) {
        /*此处需要校验*/
        let reg = this.onLineResCheck(re);//在线资源文件格式校验，如果是别的格式要求，需要写另外的方法
        if (reg == "false") {
          return false;
        }
        this.reSuccess = false;
        this.fileName = re.name;
        this.size = re.size;
        let _self = this;
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

            let obj = {
              name: re.name,
              ossPath: _self.upParams.key,
              originalFilename: re.name,
              size: (re.size / 1024).toFixed(2),
              uid: re.uid
            };
            this.tokenFileList.push(obj);
            return response;
          })
            .then((response) => {
              resolve(true);
            })
            .catch(err => {
              console.log(err)
              reject(false)
            });
        });
      },
      /*移除成功*/
      handleRemove(file, fileList) {
        this.$emit("setCanNotUse");
        //显示校验提示语-校验失败时执行
        if ((this.showFormat || this.showSize || this.showRepeat ||this.showNameSize)) {
          let _this = this;
          setTimeout(function () {
            if (!_this.showCheckError) {
              if (_this.showFormat) {
                _this.alertStr += "<p>上传文件 : " + _this.formatName + " 格式不符合要求</p>"
              }
              if (_this.showSize) {
                _this.alertStr += "<p>上传文件 : " + _this.sizeName + " 过大</p>"
              }
              if (_this.showRepeat) {
                _this.alertStr += "<p>上传文件 : " + _this.repeatName + " 名称重复</p>"
              }
              if (_this.showNameSize) {
                _this.alertStr += "<p>上传文件 : " + _this.longName + " 文件名称过长</p>"
              }
              _this.$message({
                showClose: true,
                dangerouslyUseHTMLString: true,
                duration: 0,//设置0为不会被自动关闭
                message: _this.alertStr,
                type: "error"
              });
              _this.reset();
              _this.showCheckError = true;
              setTimeout(function(){
                _this.showCheckError = false;
              },100);
            }
          }, 200);
        }
        //手动删除列表时执行
        let delIndex = -1;
        this.parentParams.resources.forEach(function (item, index) {
          if (file.uid === item.uid) {
            delIndex = index;
          }
        });
        if (delIndex >= 0) {
          this.parentParams.resources.splice(delIndex, 1);
        }
        this.$emit("setCanUse");
      },
      /*上传成功*/
      handleAvatarSuccess(res, file, fileList) {
        let _this = this;
        if (!this.reSuccess) {
          this.tokenFileList.forEach(function (item, index) {
            for (let cur of fileList) {
              if (item.name === cur.name) {
                _this.sucFileList.push(item);
              }
            }
          });
          this.parentParams.resources = this.parentParams.resources.concat([...this.sucFileList]);
          this.tokenFileList = [];
          this.sucFileList = [];
        }
        this.reSuccess = true;
        this.$emit("setCanUse");
      },
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

  .el-message--error.is-closable {
    p {
      line-height: 20px;
      margin-bottom: 5px;
    }
  }
</style>
