<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { Delete } from '@element-plus/icons-vue'

//
const isClick = ref(false)
const upload = ref(null) // 上传组件实例
const excelData = ref([]) // Excel数据
const emailContent = ref('') // 邮件内容
const loading = ref(false) // 加载状态
const dialogVisible = ref(false) // 对话框显示状态
const sendProcess = ref(0)
const emailData = ref({
  email: '',
  password: ''
})
const isDrawer = ref(true)
const isLogin = ref(false)

const columns = computed(() => {
  const cols = new Set()
  excelData.value.forEach((row) => {
    Object.keys(row).forEach((key) => {
      cols.add(key)
    })
  })
  return Array.from(cols)
})

// 校验规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    }
  ],
  password: [
    { required: true, message: '请输入邮箱授权码', trigger: 'blur' },
    { min: 6, message: '授权码至少为6个字符', trigger: 'blur' },
    { max: 16, message: '授权码不能超过16个字符', trigger: 'blur' }
  ]
}

// 导入Excel数据
const FileChange = (file) => {
  loading.value = true
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = e.target.result
    const workbook = XLSX.read(data, { type: 'binary' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 2 })
    jsonData = jsonData.map((entry) => ({ ...entry, state: 1 }))
    setTimeout(() => {
      excelData.value = jsonData
      loading.value = false
    }, 1000)
    console.log(excelData.value)
  }
  reader.readAsBinaryString(file.raw)
}

// 清空数据
const deleteData = () => {
  if (excelData.value.length === 0) {
    ElMessage({
      message: '请先导入数据再清空',
      grouping: true,
      type: 'warning'
    })
    emailContent.value = ''
    return
  }
  loading.value = true
  setTimeout(() => {
    excelData.value = []
    emailContent.value = ''
    loading.value = false
    ElMessage.success('数据已清空')
  }, 500)
}

// 删除行信息
const deleteRow = (index) => {
  dialogVisible.value = true
  ElMessageBox.confirm('确定要删除该行吗？')
    .then(() => {
      excelData.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}

// 邮件发送服务
const sendEmails = async () => {
  if (excelData.value.length === 0) {
    ElMessage.warning('请先导入Excel数据')
    return
  }
  if (isLogin.value === false) {
    ElMessage.warning('请先登录邮箱')
    return
  }
  if (emailContent.value === '') {
    ElMessage.warning('请先输入邮件内容')
    return
  }
  isClick.value = true
  // 由于邮箱服务不可用，这里模拟一下
  for (let i = 0; i < excelData.value.length; i++) {
    sendProcess.value = ((i + 1) / excelData.value.length) * 100
    const data = excelData.value[i] // data 是一个完整的对象
    const keys = Object.keys(data) // 获取对象中所有键，返回一个数组
    const email = data[keys[0]] // 获取第一个键对应的值，即邮箱地址
    try {
      // 使用setTimeout来模拟异步操作
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(excelData)
          const isSuccess = Math.random() > 0.3 // 根据随机数决定成功或失败
          if (isSuccess) {
            // 如果发送成功
            excelData.value[i].state = 2 // 更新状态为发送成功
            console.log(`给 ${email} 的邮件发送成功`)
            resolve()
          } else {
            // 如果发送失败
            excelData.value[i].state = 0 // 更新状态为失败
            reject(new Error(`给 ${email} 的邮件发送失败`))
          }
        }, 500) // 假设每封邮件发送需要1秒的时间
      })
    } catch (error) {
      console.error(error)
    }
  }
  isClick.value = false
  ElMessage.success('邮件发送完成')
}

// 关闭抽屉前验证
const checkEmail = () => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(emailData.value.email) || emailData.value.email === '') {
    ElMessage.error('请输入正确的邮箱地址')
    return false
  }
  if (emailData.value.password === '') {
    ElMessage.error('请输入邮箱授权码')
    return false
  }
  isLogin.value = true
  isDrawer.value = false
}
</script>
<template>
  <div class="box">
    <!-- 进度条 -->
    <el-affix :offset="0" class="fixed" v-show="isClick">
      <el-progress
        :percentage="sendProcess"
        :show-text="false"
        :stroke-width="4"
      />
    </el-affix>
    <div class="banner">
      <!-- 头部 -->
      <h1>CP-EmailTools</h1>
      <p>
        Excel转邮件群发工具 | <span>请务必将Excel表格第一列设置为邮箱地址</span>
      </p>
      <!-- 上传和清空 -->
      <div class="main">
        <el-upload
          ref="upload"
          :limit="1"
          show-file-list="false"
          accept=".xlsx, .xls"
          :on-change="FileChange"
        >
          <el-button type="primary" class="upload_bt">上传Excel</el-button>
        </el-upload>
        <el-button
          class="delete_bt"
          style="margin-left: 10px"
          type="danger"
          @click="deleteData"
          >清空</el-button
        >
        <el-button
          v-if="!isLogin"
          class="delete_bt"
          style="margin-left: 10px"
          type="danger"
          @click="isDrawer = true"
          >未登录</el-button
        >
        <el-button
          v-else
          class="delete_bt"
          style="margin-left: 10px"
          type="success"
          @click="isDrawer = true"
          >已登录</el-button
        >
      </div>
      <!-- 登录 -->
      <el-drawer
        direction="ttb"
        v-model="isDrawer"
        size="30%"
        title="请输入邮箱地址和授权码："
        :before-close="checkEmail"
        :show-close="false"
      >
        <div class="login">
          <el-form
            class="el-form"
            :model="emailData"
            label-width="auto"
            :rules="rules"
          >
            <el-form-item prop="email" label="邮箱地址:" class="el-form-item">
              <el-input
                v-model="emailData.email"
                autocomplete="off"
                placeholder="请输入邮箱地址"
              ></el-input>
            </el-form-item>
            <el-form-item
              prop="password"
              label="邮箱授权码:"
              class="el-form-item"
            >
              <el-input
                type="password"
                v-model="emailData.password"
                placeholder="请输入邮箱授权码"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <div class="bt">
            <el-button type="primary" @click="checkEmail" class="inner_bt"
              >确认</el-button
            >
            <el-button type="danger" @click="isDrawer = false" class="inner_bt"
              >关闭</el-button
            >
          </div>
        </div>
      </el-drawer>
      <!-- 编辑和预览 -->
      <div class="show">
        <QuillEditor
          theme="snow"
          v-model:content="emailContent"
          content-type="html"
        />
      </div>
      <!-- 数据展示 -->
      <el-table
        class="table"
        v-loading="loading"
        border
        :data="excelData"
        height="500"
      >
        <el-dialog v-model="dialogVisible" width="500"> </el-dialog>
        <el-table-column label="状态" width="80" v-if="excelData.length > 0">
          <template v-slot:default="scope">
            <div>
              <el-button
                v-if="scope.row.state == 0"
                type="danger"
                size="small"
                disabled
                class="state_bt"
                >失败</el-button
              >
              <el-button
                v-else-if="scope.row.state == 1"
                type="warning"
                size="small"
                class="state_bt"
                disabled
                >未发送</el-button
              >
              <el-button
                v-else
                type="success"
                disabled
                class="state_bt"
                size="small"
                >成功</el-button
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="key in columns"
          :key="key"
          :prop="key"
          :label="key"
          min-width="200"
        >
          <template v-slot="scope">
            <el-input v-model="scope.row[key]"></el-input>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="70"
          v-if="excelData.length > 0"
        >
          <template #default="scope">
            <el-button
              type="danger"
              size="normal"
              circle
              :icon="Delete"
              plain
              @click.prevent="deleteRow(scope.$index)"
            >
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据">
            <el-upload
              ref="upload"
              :limit="1"
              show-file-list="false"
              accept=".xlsx, .xls"
              :on-change="FileChange"
            >
              <el-button type="primary" class="upload_bt">上传Excel</el-button>
            </el-upload>
          </el-empty>
        </template>
      </el-table>

      <el-button
        type="primary"
        size="large"
        class="send_bt"
        @click="sendEmails"
        :disabled="excelData.length == 0 || isClick"
        >一键发送</el-button
      >
      <div class="footer" style="margin-top: 10px; margin-bottom: 0px">
        <p>
          Copyright © 2024 EmailTools.Designed by
          <a href="https://github.com/CodePaintStudio/CP-EmailTools/"
            >CodePaint</a
          >
        </p>
      </div>
    </div>
  </div>
</template>