<template>
  <div id='wrapper'>
    <h1>腾讯云对象存储cos</h1>
    <el-input v-model="secretId" placeholder="请输入腾讯云SecretId" clearable></el-input>
    <el-input v-model="secretKey" placeholder="请输入腾讯云SecretKey" clearable></el-input>
    <el-input v-model="bucket" placeholder="请输入腾讯云Bucket" clearable></el-input>
    <el-select v-model="region" placeholder="请选择地区">
      <el-option
         v-for="item in regions"
         :key="item.value"
         :label="item.label"
         :value="item.value">
      </el-option>
    </el-select>
    <el-input v-model="cacheFolder" placeholder="请选择图片缓存文件夹" :disabled="true"></el-input>
    <el-button style="margin-top: 10px" type="primary" size="mini" round @click="selectFolder">选择缓存文件夹</el-button>
    <el-button type="primary" @click="saveConfig">保存配置</el-button>
  </div>
</template>

<script>
  import Store from 'electron-store'
  var ipc = require('electron').ipcRenderer
  var store = new Store()

  export default {
    name: 'tx-login-page',
    data () {
      return {
        secretId: '',
        secretKey: '',
        bucket: '',
        cacheFolder: '',
        region: '',
        regions: [{
          value: 'ap-beijing-1',
          label: '北京一区（华北）'
        }, {
          value: 'ap-beijing',
          label: '北京'
        }, {
          value: 'ap-shanghai',
          label: '上海（华东）'
        }, {
          value: 'ap-guangzhou',
          label: '广州（华南）'
        }, {
          value: 'ap-chengdu',
          label: '成都（西南）'
        }, {
          value: 'ap-chongqing',
          label: '重庆'
        }, {
          value: 'ap-singapore',
          label: '新加坡'
        }, {
          value: 'ap-hongkong',
          label: '香港'
        }, {
          value: 'na-toronto',
          label: '多伦多'
        }, {
          value: 'eu-frankfurt',
          label: '法兰克福'
        }, {
          value: 'ap-mumbai',
          label: '孟买'
        }, {
          value: 'ap-seoul',
          label: '首尔'
        }, {
          value: 'na-siliconvalley',
          label: '硅谷'
        }, {
          value: 'na-ashburn',
          label: '弗吉尼亚'
        }, {
          value: 'ap-bangkok',
          label: '曼谷'
        }, {
          value: 'eu-moscow',
          label: '莫斯科'
        }, {
          value: 'ap-tokyo',
          label: '东京'
        }]
      }
    },
    created () {
      var that = this
      this.secretId = store.get('secretId', this.secretId)
      this.secretKey = store.get('secretKey', this.secretKey)
      this.bucket = store.get('bucket', this.bucket)
      this.region = store.get('region', this.region)
      this.cacheFolder = store.get('cacheFolder', this.cacheFolder) + ''

      ipc.on('selected-directory', function (event, path) {
        that.cacheFolder = path + ''
      })
    },
    methods: {
      saveConfig () {
        store.set('secretId', this.secretId)
        store.set('secretKey', this.secretKey)
        store.set('bucket', this.bucket)
        store.set('region', this.region)
        store.set('cacheFolder', this.cacheFolder)
        this.$router.push({
          name: 'upload-page'
        })
      },
      selectFolder (path) {
        ipc.send('open-file-dialog')
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

  h1 {
    font-size: 25px;
    color: #409EFF;
  }

  #wrapper {
    position: absolute;
    width: 400px;
    height: 250px;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    align-content: center;
  }

  .el-input {
    padding-top: 10px;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

</style>
