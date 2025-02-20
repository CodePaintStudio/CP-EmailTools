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
import { useRouter } from 'vue-router'
const router = useRouter()
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

const userEemil = ref('')

onMounted(() => {
  if (UserStore.hasToken()) isDrawer.value = false
  emailData.value = {
    email: UserStore.email,
    password: UserStore.password
  }
  userEemil.value = UserStore.email
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

// 退出登录
const LoginOut = () => {
  UserStore.clearToken()
  isLogin.value = UserStore.hasToken()
  isDrawer.value = !UserStore.hasToken()
  router.replace({ name: 'Login' })
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
    <!--  -->
    <div class="banner">
      <!-- 头部 -->
      <div class="header">
        <!-- 左侧logo和title -->
        <div class="left">
          <div class="logo">
            <img src="@/assets/logo.png" alt="" />
          </div>
          <div class="text">
            <h2>CP-EmailTools</h2>
            <p>
              Excel转邮件群发工具 |
              <span>请务必将Excel表格第一列设置为邮箱地址</span>
            </p>
          </div>
        </div>
        <!-- 右侧登录和退出 -->
        <div class="right">
          <el-icon color="#000"><Message /></el-icon>
          <span>{{ userEemil }}</span>
          <!-- 下拉组件 -->
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="menu-button">
                <el-button
                  class="delete_bt"
                  style="margin-left: 10px"
                  v-if="isLogin"
                  type="warning"
                  @click="LoginOut"
                  >退出登录</el-button
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 上传和清空 -->
      <div class="main">
        <div class="left-buttons">
          <el-upload
            ref="upload"
            :limit="1"
            :show-file-list="false"
            accept=".xlsx, .xls"
            :on-change="FileChange"
          >
            <el-button type="primary" color="#3370FF" class="upload_bt"
              ><el-icon style="margin-right: 6px"><UploadFilled /></el-icon>上传Excel</el-button
            >
          </el-upload>
          <el-button class="delete_bt" style="margin-left: 10px" @click="deleteData"
            >清空数据</el-button
          >
        </div>

        <div class="right-buttons">
          <el-button
            type="primary"
            size="large"
            class="send_bt"
            color="#3370FF"
            @click="sendEmails"
            :disabled="excelData.length == 0 || isClick"
            ><el-icon style="margin-right: 6px"><Promotion /></el-icon>一键发送</el-button
          >
          <el-button @click="downloadTemplate" class="delete_bt" style="margin-left: 10px">
            下载模板
          </el-button>
        </div>
        <!-- <el-button
          @click="downloadTemplate"
          class="delete_bt"
          style="margin-left: 10px"
          type="success"
        >
          下载模板
        </el-button>
        <el-button @click="showTips" class="delete_bt" style="margin-left: 10px" type="info"
          >使用说明</el-button
        > -->
      </div>
      <!-- 登录 -->

      <!-- 输入主题 -->
      <div class="input">
        <p class="label">主题：</p>
        <el-input class="subject" v-model="subject" placeholder="请输入邮件主题" />
      </div>

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

      <div class="explain">
        <el-button plain @click="showTips" class="delete_bt explain_button" type="info"
          >?</el-button
        >
      </div>
    </div>
  </div>
  <div class="footer" style="margin-top: 10px; margin-bottom: 0px">
    <p>
      Copyright © 2024 EmailTools.Designed by
      <a href="https://github.com/CodePaintStudio">CodePaint</a>
    </p>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  box-shadow: none;
}
</style>
