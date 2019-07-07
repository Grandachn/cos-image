<template>
  <div id="wrapper">
    <el-upload
      class="avatar-uploader"
      action=""
      :http-request="handUpload"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :auto-upload="true"
      :before-upload="beforeAvatarUpload"
      >
      <el-button size="primary" type="primary" :loading="uploading">上传文件图片</el-button>
    </el-upload>
    <br>
    <el-button type="primary" @click="upLoad" :loading="uploading">上传粘贴板图片</el-button>
    <el-switch
      v-model="autoUpload"
      @change="changeAutoUpload"
      active-text="开启自动上传"
      inactive-text="关闭自动上传"
    />
    <br><br>
    <el-button type="success" @click="changeConfig">修改配置</el-button>
    <el-switch
      v-model="isCache"
      active-text="本地保留图片"
      inactive-text="删除本地图片"
    />
    <br><br>
    url：
    <el-button type="primary" @click="copy" size="mini" round >复制</el-button>
    自动复制：
    <el-switch
      v-model="autoCopyUrl"
      @change="changeAutoCopyUrl"
    />
    <br><br>
    <el-input
      type="textarea"
      :rows="2"
      v-model="url">
    </el-input>
    <br><br><br>
    markdown：
    <el-button type="primary" @click="copymd" size="mini" round >复制</el-button>
    自动复制：
    <el-switch
      v-model="autoCopyMdUrl"
      @change="changeAutoCopyMdUrl"
    />
    <br><br>
    <el-input
      type="textarea"
      :rows="2"
      v-model="mdurl">
    </el-input>
    <br>
    <img v-if="url!=null" style="width:300px;height:200px;object-fit:contain;":src="url"/>
  </div>
</template>

<script>
  import { clipboard, desktopCapturer, screen } from 'electron'
  import COS from 'cos-nodejs-sdk-v5'
  import fs from 'fs'
  import UUID from 'uuid'
  import crypto from 'crypto'
  import Store from 'electron-store'
  var store = new Store()

  export default {
    name: 'upload-page',
    data () {
      return {
        url: null,
        mdurl: '',
        uploading: false,
        md5Image: '',
        autoUpload: false,
        autoCopyUrl: false,
        autoCopyMdUrl: false,
        autoInterval: '',
        uploadStatus: true,
        fileName: '',
        isCache: true
      }
    },
    created () {
      // var that = this
      // this.captureScreen()
      // this.autoInterval = window.setInterval(function () {
      //   that.upLoad()
      // }, 1000)
    },
    methods: {
      // handUpload (content) {
      // console.log(content.file.path)
      // },
      changeConfig () {
        this.$router.push({
          name: 'tx-login-page'
        })
      },
      handleAvatarSuccess (res, file) {
        this.imageUrl = URL.createObjectURL(file.raw)
      },
      beforeAvatarUpload (file) {
        console.log(file)
        const isJPEG = file.type === 'image/jpeg'
        const isJPG = file.type === 'image/jpg'
        const isPNG = file.type === 'image/png'
        const isLt8M = file.size / 1024 / 1024 < 8

        if (!(isJPEG || isJPG || isPNG)) {
          this.$message.error('上传图片只能是 JPG或者PNG 格式!')
        }
        if (!isLt8M) {
          this.$message.error('上传图片大小不能超过 8MB!')
        }
        return (isJPG || isPNG || isJPEG) && isLt8M
      },
      changeAutoCopyUrl () {
        if (this.autoCopyUrl) {
          this.autoCopyMdUrl = false
        }
      },
      changeAutoCopyMdUrl () {
        if (this.autoCopyMdUrl) {
          this.autoCopyUrl = false
        }
      },
      changeAutoUpload () {
        let that = this
        if (this.autoUpload) {
          this.autoInterval = setInterval(function () {
            that.upLoad()
          }, 1000)
        } else {
          clearInterval(this.autoInterval)
        }
      },
      copy () {
        clipboard.writeText(this.url)
        this.$message.success('URL已经复制到粘贴板')
      },
      copymd () {
        clipboard.writeText(this.mdurl)
        this.$message.success('markdowm格式化URL已经复制到粘贴板')
      },
      captureScreen () {
        const screenSize = screen.getPrimaryDisplay().workAreaSize
        const maxDimension = Math.max(screenSize.width, screenSize.height)
        let thumbSize = {
          width: maxDimension * window.devicePixelRatio * 3,
          height: maxDimension * window.devicePixelRatio
        }
        console.log(thumbSize.width + ':' + thumbSize.height)
        let options = { types: ['screen'], thumbnailSize: thumbSize }
        window.setInterval(function () {
          desktopCapturer.getSources(options, function (error, sources) {
            if (error) return console.log(error)
            sources.forEach(function (source) {
              console.log('capture...')
              let ID = UUID.v1()
              let fileName = ID + '.png'
              let fileLocal = '/home/granda/picTmp/' + fileName
              if (source.name === 'Entire screen' || source.name === 'Screen 1') {
                fs.writeFile(fileLocal, source.thumbnail.toPNG(), function (error) {
                  if (error) return console.log(error)
                })
              }
            })
          })
        }, 3000)
      },
      handUpload (content) {
        var that = this
        let ID = UUID.v1()
        let fileLocal = content.file.path
        let index1 = fileLocal.lastIndexOf('.')
        let index2 = fileLocal.length
        let suffix = fileLocal.substring(index1, index2)
        let fileName = ID + suffix

        // console.log(image.toPNG())
        let cos = new COS({
          SecretId: store.get('secretId'),
          SecretKey: store.get('secretKey')
        })
        let tengxunCos = {
          Bucket: store.get('bucket'),
          Region: store.get('region')
        }
        // 腾讯云 文件上传
        let params = {
          Bucket: tengxunCos.Bucket,
          Region: tengxunCos.Region,
          Key: fileName,
          FilePath: fileLocal
        }
        that.uploading = true
        cos.sliceUploadFile(params, function (err, data) {
          that.uploading = false
          if (err) {
            that.$message.error('上传失败,请检查网络和配置文件')
          } else {
            var imageSrc = 'https://' + tengxunCos.Bucket + '.cos.' + tengxunCos.Region + '.myqcloud.com/' + data.Key

            that.url = imageSrc // res.end(JSON.stringify({status:'100',msg:'上传成功',imageUrl:imageSrc}));
            that.mdurl = '![text](' + that.url + ')'
            let resultNotication
            if (that.autoCopyUrl) {
              clipboard.writeText(that.url)
              that.$message.success('上传成功，URL已经复制到粘贴板')
              resultNotication = new window.Notification('上传成功，URL已经复制到粘贴板')
            } else if (that.autoCopyMdUrl) {
              clipboard.writeText(that.mdurl)
              that.$message.success('上传成功，markdowm格式化URL已经复制到粘贴板')
              resultNotication = new window.Notification('上传成功，markdowm格式化URL已经复制到粘贴板')
            } else {
              that.$message.success('上传成功')
              resultNotication = new window.Notification('上传成功')
            }
            console.log(resultNotication)
          }
        })
      },
      upLoad () {
        var that = this
        let ID = UUID.v1()
        const image = clipboard.readImage()
        let fileName
        if (that.uploadStatus) {
          fileName = ID + '.png'
          that.fileName = fileName
        } else {
          fileName = that.fileName
        }

        let fileLocal = store.get('cacheFolder') + '/' + fileName
        let cos = new COS({
          SecretId: store.get('secretId'),
          SecretKey: store.get('secretKey')
        })
        let tengxunCos = {
          Bucket: store.get('bucket'),
          Region: store.get('region')
        }
        // 腾讯云 文件上传
        let params = {
          Bucket: tengxunCos.Bucket,
          Region: tengxunCos.Region,
          Key: fileName,
          FilePath: fileLocal
        }
        let md5 = crypto.createHash('md5')
        if (image.isEmpty()) {
          if (!that.autoUpload) {
            that.$message.error('粘贴板不是图片')
          }
        } else if (that.md5Image === md5.update(image.toPNG()).digest('hex') && that.uploadStatus) {
          if (!that.autoUpload) {
            that.$message.error('重复图片')
          }
        } else {
          let md5T = crypto.createHash('md5')
          that.md5Image = md5T.update(image.toPNG()).digest('hex')
          fs.writeFile(fileLocal, image.toPNG(), function (err) {
            if (err) console.log('写文件操作失败', err)
            else {
              // console.log('写文件操作成功')
              that.uploading = true
              cos.sliceUploadFile(params, function (err, data) {
                that.uploading = false
                if (!that.isCache) {
                  fs.unlinkSync(fileLocal)
                }
                if (err) {
                  that.$message.error('上传失败,请检查网络和配置文件')
                  that.uploadStatus = false
                } else {
                  that.uploadStatus = true
                  var imageSrc = 'https://' + tengxunCos.Bucket + '.cos.' + tengxunCos.Region + '.myqcloud.com/' + data.Key

                  that.url = imageSrc
                  that.mdurl = '![在这里插入图片描述](' + that.url + ')'
                  let resultNotication
                  if (that.autoCopyUrl) {
                    clipboard.writeText(that.url)
                    that.$message.success('上传成功，URL已经复制到粘贴板')
                    resultNotication = new window.Notification('上传成功，URL已经复制到粘贴板')
                  } else if (that.autoCopyMdUrl) {
                    clipboard.writeText(that.mdurl)
                    that.$message.success('上传成功，markdowm格式化URL已经复制到粘贴板')
                    resultNotication = new window.Notification('上传成功，markdowm格式化URL已经复制到粘贴板')
                  } else {
                    that.$message.success('上传成功')
                    resultNotication = new window.Notification('上传成功')
                  }
                  console.log(resultNotication)
                }
              })
            }
          })
        }
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #wrapper {
    position: absolute;
    width: 400px;
    margin: 0 auto;
    left: 0;
    right: 0;
    margin-top: 100px;
    align-content: center;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

</style>
