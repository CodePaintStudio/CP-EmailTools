<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { Delete } from '@element-plus/icons-vue'
import { sendEmailService } from '@/api/postEmail'
import { getTemplateDownload } from '@/api/gettemplate'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import Tiptap from '@/components/Tiptap.vue'
import IntroDialog from '@/components/IntroDialog.vue'

const UserStore = useUserStore()

const isClick = ref(false)
const upload = ref(null) // 上传组件实例
const excelData = ref([{ email: '', state: 1 }]) // Excel数据
const emailContent = ref('') // 邮件内容
const loading = ref(false) // 加载状态
const dialogVisible = ref(false) // 对话框显示状态
const sendProcess = ref(0)
const emailData = ref({
  email: '',
  password: ''
})
const isLogin = ref(UserStore.hasToken())
const isDrawer = ref(false) //默认首次不弹出
const receiverItemsArray = ref([])
const subject = ref('')
const acceptedEmail = ref([])
const MAX_ROWS = 100 // 最大允许上传 100 行

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

onMounted(() => {
  if (UserStore.hasToken()) isDrawer.value = false
  emailData.value = {
    email: UserStore.email,
    password: UserStore.password
  }
})

// 导入Excel数据
let debounceTimer = null
const FileChange = async (file) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer) // 清除之前的计时器
  }
  debounceTimer = setTimeout(async () => {
    loading.value = true
    const reader = new FileReader()
    const readFile = (file) => {
      return new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (error) => reject(error)
        reader.readAsBinaryString(file.raw)
      })
    }

    try {
      const data = await readFile(file)
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 2 })

      // 检查行数是否超过限制
      if (jsonData.length > MAX_ROWS) {
        ElMessage.error(`Excel 文件行数超过限制，最多允许 ${MAX_ROWS} 行`)
        excelData.value = [{ email: '', state: 1 }]
        return
      }

      jsonData = jsonData.map((entry) => ({ ...entry, state: 1 }))
      const initialEmptyRow = excelData.value.find((row) => !row.email) // 查找第一个 email 为空的行的索引
      if (initialEmptyRow) {
        const emptyRowIndex = excelData.value.indexOf(initialEmptyRow) // 获取空行的索引
        excelData.value.splice(emptyRowIndex, 1, ...jsonData) // 替换空行数据
      } else {
        // 如果没有空行，追加数据
        excelData.value = [...excelData.value, ...jsonData]
      }
    } finally {
      loading.value = false
    }
  }, 100)
}

// 清空数据
const deleteData = () => {
  loading.value = true
  excelData.value = [{ email: '', state: 1 }]
  emailContent.value = ''
  subject.value = ''
  emailData.value = {
    email: '',
    password: ''
  }
  receiverItemsArray.value = []
  isClick.value = false
  sendProcess.value = 0
  loading.value = false
  ElMessage.success('数据已清空')
}

// 删除行信息
const deleteRow = (index) => {
  if (excelData.value.length === 1) {
    ElMessage.error('表格至少保留一行数据')
    return
  }
  // dialogVisible.value = true
  ElMessageBox.confirm('确定要删除该行吗？')
    .then(() => {
      excelData.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}

// 发送前的校验
const checkBeforeSend = () => {
  if (excelData.value.length === 0) {
    ElMessage.warning('请先导入Excel数据')
    return false
  }
  if (emailContent.value === '') {
    ElMessage.warning('请先输入邮件内容')
    return false
  }
  if (subject.value === '') {
    ElMessage.warning('请先输入邮件主题')
    return false
  }
  return true
}

// 更新状态
const updateState = () => {
  excelData.value.forEach((item) => {
    item.state = 0
  })
  // 更新匹配的邮箱状态为 2
  for (let i = 0; i < excelData.value.length; i++) {
    const data = excelData.value[i] // data 是一个完整的对象
    const keys = Object.keys(data) // 获取对象中所有键，返回一个数组
    const email = data[keys[0]] // 获取第一个键对应的值，即邮箱地址
    if (acceptedEmail.value.includes(email)) {
      excelData.value[i].state = 2
    }
  }
  receiverItemsArray.value = []
}
// 邮件发送服务
const sendEmails = async () => {
  if (!checkBeforeSend()) return
  isClick.value = true
  for (let i = 0; i < excelData.value.length; i++) {
    sendProcess.value = ((i + 1) / excelData.value.length) * 100
    const data = excelData.value[i] // data 是一个完整的对象
    const keys = Object.keys(data) // 获取对象中所有键，返回一个数组
    const email = data[keys[0]] // 获取第一个键对应的值，即邮箱地址
    const Item = Array(email, new Date().toLocaleString())
    receiverItemsArray.value.push(Item)
  }
  try {
    const res = await sendEmailService({
      email: emailData.value.email,
      password: emailData.value.password,
      subject: subject.value,
      receiverItemsArray: receiverItemsArray.value,
      content: emailContent.value
    })
    console.log(res.value)
    acceptedEmail.value = res.data.data.successList
    updateState()
    ElMessage.success('邮件发送完成')
  } finally {
    isClick.value = false
  }
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
  ElMessage.success('登录成功')
  UserStore.generateToken()
  UserStore.setEmail(emailData.value.email)
  UserStore.setPassword(emailData.value.password)
}

// 登录按钮
const Loginwaring = () => {
  if (UserStore.hasToken() === true) {
    ElMessage.warning('您已经登录，请勿重复登录')
    return
  }
}

// 退出登录
const LoginOut = () => {
  UserStore.clearToken()
  isLogin.value = UserStore.hasToken()
  isDrawer.value = !UserStore.hasToken()
  ElMessage.success('退出登录成功')
}

// 增加表格
const addNewRow = () => {
  if (excelData.value.length < 100) {
    excelData.value.push({ email: '', state: 1 })
  } else {
    ElMessage.warning('最多只能添加100行')
  }
}
// 控制弹窗显示
const showIntro = ref(localStorage.getItem('hideIntro') !== 'true')

// 显示提示
const showTips = () => {
  showIntro.value = true
}

// 下载模板
const downloadTemplate = async () => {
  try {
    const response = await getTemplateDownload()

    // 创建 Blob 对象
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 触发下载
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // 兼容 IE 和 Edge
      window.navigator.msSaveOrOpenBlob(blob, 'template.xlsx')
    } else {
      // 兼容现代浏览器
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'template.xlsx' // 设置下载文件名
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  } catch (error) {
    ElMessage.warning('下载失败，请稍后重试或联系管理员')
  }
}
</script>
<template>
  <div class="box">
    <IntroDialog v-model="showIntro" />
    <!-- 进度条 -->
    <el-affix :offset="0" class="fixed" v-show="isClick">
      <el-progress :percentage="sendProcess" :show-text="false" :stroke-width="4" />
    </el-affix>
    <div class="banner">
      <!-- 头部 -->
      <h1>CP-EmailTools</h1>
      <p>Excel转邮件群发工具 | <span>请务必将Excel表格第一列设置为邮箱地址</span></p>
      <!-- 上传和清空 -->
      <div class="main">
        <el-upload
          ref="upload"
          :limit="1"
          :show-file-list="false"
          accept=".xlsx, .xls"
          :on-change="FileChange"
        >
          <el-button type="primary" class="upload_bt">上传Excel</el-button>
        </el-upload>
        <el-button class="delete_bt" style="margin-left: 10px" type="danger" @click="deleteData"
          >清空数据</el-button
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
          @click="Loginwaring"
          >已登录</el-button
        >
        <el-button
          class="delete_bt"
          style="margin-left: 10px"
          v-if="isLogin"
          type="warning"
          @click="LoginOut"
          >退出登录</el-button
        >
        <el-button
          @click="downloadTemplate"
          class="delete_bt"
          style="margin-left: 10px"
          type="success"
        >
          下载模板
        </el-button>
        <el-button @click="showTips" class="delete_bt" style="margin-left: 10px" type="info"
          >使用说明</el-button
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
          <el-form class="el-form" :model="emailData" label-width="auto" :rules="rules">
            <el-form-item prop="email" label="邮箱地址:" class="el-form-item">
              <el-input
                v-model="emailData.email"
                autocomplete="off"
                placeholder="请输入邮箱地址"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password" label="邮箱授权码:" class="el-form-item">
              <el-input
                type="password"
                v-model="emailData.password"
                placeholder="请输入邮箱授权码"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <div class="bt">
            <el-button type="primary" @click="checkEmail" class="inner_bt">确认</el-button>
            <el-button type="danger" @click="isDrawer = false" class="inner_bt">关闭</el-button>
          </div>
        </div>
      </el-drawer>
      <!-- 输入主题 -->
      <el-input
        class="subject"
        v-model="subject"
        style="width: 240px"
        placeholder="请输入邮件主题"
      />
      <!-- 编辑和预览 -->
      <div class="show">
        <Tiptap v-model="emailContent"></Tiptap>
      </div>
      <!-- 数据展示 -->
      <el-table class="table" v-loading="loading" border :data="excelData" height="500">
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
              <el-button v-else type="success" disabled class="state_bt" size="small"
                >成功</el-button
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="key in columns.filter((col) => col !== 'state')"
          :key="key"
          :prop="key"
          :label="key"
          min-width="200"
        >
          <template v-slot="scope">
            <el-input v-model="scope.row[key]"></el-input>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100" v-if="excelData.length > 0">
          <template #default="scope">
            <div class="operation">
              <el-button
                type="danger"
                size="normal"
                circle
                :icon="Delete"
                plain
                @click.prevent="deleteRow(scope.$index)"
              >
              </el-button>
              <el-button type="primary" size="normal" circle class="add-row-btn" @click="addNewRow"
                >+</el-button
              >
            </div>
          </template>
        </el-table-column>
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
          <a href="https://github.com/CodePaintStudio/CP-EmailTools/">CodePaint</a>
        </p>
      </div>
    </div>
  </div>
</template>
