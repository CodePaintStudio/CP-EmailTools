<script setup>
import { ref, watch } from 'vue'

// 组件props定义
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true // 默认每次进入都显示
  }
})

// 组件事件定义
const emit = defineEmits(['update:modelValue'])

// 本地状态
const hideForever = ref(localStorage.getItem('hideIntro') === 'true') // 从本地存储初始化状态
const visible = ref(props.modelValue) // 内部状态，用于控制弹窗显示

// 监听 props.modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
  }
)

// 关闭处理
const handleClose = () => {
  if (hideForever.value) {
    localStorage.setItem('hideIntro', 'true') // 如果勾选"不再显示"，则存储状态
  } else {
    localStorage.removeItem('hideIntro') // 如果取消勾选，则移除状态
  }
  visible.value = false // 关闭弹窗
  emit('update:modelValue', false) // 通知父组件更新状态
}

// 监听 hideForever 的变化
watch(hideForever, (newVal) => {
  if (newVal) {
    localStorage.setItem('hideIntro', 'true') // 如果勾选"不再显示"，则存储状态
  } else {
    localStorage.removeItem('hideIntro') // 如果取消勾选，则移除状态
  }
})
</script>

<template>
  <el-drawer
    v-model="visible"
    title="📧 欢迎使用 CP-EmailTools"
    size="100%"
    direction="ttb"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div class="intro-content">
      <h2>使用指南</h2>

      <!-- 准备工作 -->
      <div class="section">
        <el-icon><InfoFilled /></el-icon>
        <h3>准备工作</h3>
        <ul>
          <li>
            确保已准备好Excel文件，第一列为邮箱地址，其他列可用于邮件内容变量替换。
          </li>
          <li>
            需要发送邮件的邮箱需开启SMTP服务并获取授权码（以QQ邮箱为例）：
            <ol>
              <li>登录邮箱 → 设置 → 账户</li>
              <li>开启POP3/SMTP服务</li>
              <li>生成授权码（16位字符串）</li>
            </ol>
          </li>
        </ul>
      </div>

      <!-- 操作步骤 -->
      <div class="section">
        <el-icon><Guide /></el-icon>
        <h3>操作步骤</h3>
        <el-timeline>
          <el-timeline-item>
            <strong>步骤一：下载模板</strong>
            <p>
              点击“下载模板”按钮，下载Excel模板文件。模板文件的第一列为邮箱地址，其他列可用于邮件内容中的变量替换（如姓名、公司等）。
            </p>
          </el-timeline-item>
          <el-timeline-item>
            <strong>步骤二：登录邮箱</strong>
            <p>
              点击“登录”按钮，输入您的邮箱地址和授权码。授权码是开启SMTP服务后生成的16位字符串，用于验证发送邮件的权限。
            </p>
          </el-timeline-item>
          <el-timeline-item>
            <strong>步骤三：上传Excel</strong>
            <p>
              点击“上传Excel”按钮，选择您准备好的Excel文件。文件格式支持.xlsx和.xls，最多可上传100条数据。上传后，数据将显示在表格中。
            </p>
          </el-timeline-item>
          <el-timeline-item>
            <strong>步骤四：撰写邮件</strong>
            <p>
              在“邮件主题”输入框中填写邮件主题，在富文本编辑器中撰写邮件内容。您可以使用Excel中的其他列作为变量，动态替换邮件内容（例如：`{{
                姓名
              }}`）。
            </p>
          </el-timeline-item>
          <el-timeline-item>
            <strong>步骤五：群发邮件</strong>
            <p>
              点击“一键发送”按钮，系统将开始发送邮件。发送过程中，进度条会实时显示发送进度，表格中的“状态”列会更新每封邮件的发送状态（成功、失败或未发送）。
            </p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 注意事项 -->
      <div class="section warning">
        <el-icon><Warning /></el-icon>
        <h3>注意事项</h3>
        <ul>
          <li>请勿频繁发送邮件，避免被识别为垃圾邮件。</li>
          <li>单次发送建议不超过100封邮件，以确保发送成功率。</li>
          <li>测试阶段建议使用测试邮箱验证功能，避免影响正式邮箱。</li>
          <li>授权码请妥善保管，切勿泄露。</li>
          <li>如果发送失败，请检查邮箱授权码是否正确，或尝试重新登录。</li>
          <li>
            支持动态变量替换，例如在邮件内容中使用`{{
              列名
            }}`，系统会自动替换为Excel中对应列的值。
          </li>
        </ul>
      </div>
    </div>

    <!-- 弹窗底部 -->
    <template #footer>
      <div class="dialog-footer">
        <el-checkbox v-model="hideForever" style="margin-right: 20px"
          >不再显示</el-checkbox
        >
        <el-button type="primary" @click="handleClose" class="button_use"
          >开始使用</el-button
        >
      </div>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.intro-dialog {
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  width: 100%;
  max-width: 600px; // 桌面端最大宽度
  margin: 0 auto;
}

.intro-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section h3 {
  color: #34495e;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
}

.section ul {
  padding-left: 1.5rem;
  line-height: 1.8;
  color: #4a5568;
}

.section li {
  margin: 0.8rem 0;
}

/* 红色醒目提示 */
.warning {
  border-left: 4px solid #f56c6c; // 左侧红色边框
  background: #fff5f5; // 浅红色背景
}

.warning h3 {
  color: #f56c6c; // 标题颜色改为红色
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px;
  margin-top: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .intro-dialog {
    width: 100% !important;
    border-radius: 8px; // 圆角减小
  }

  .intro-content {
    max-height: 70vh; // 内容区域高度减小
    padding: 0 2px; // 内边距减小
    // margin: 0 auto;
  }

  h2 {
    font-size: 1.5rem; // 标题字体减小
    margin-bottom: 1rem; // 标题下边距减小
  }

  .section {
    margin: 1rem 0; // 区块外边距减小
    padding: 1rem; // 区块内边距减小
  }

  .section h3 {
    font-size: 1.1rem; // 子标题字体减小
  }

  .section ul {
    padding-left: 1rem; // 列表内边距减小
    line-height: 1.6; // 行高减小
  }

  .section li {
    margin: 0.5rem 0; // 列表项间距减小
  }

  .dialog-footer {
    flex-direction: column; // 底部按钮垂直排列
    gap: 10px; // 按钮间距
    padding: 10px; // 内边距减小
    .button_use {
      height: 50px;
    }
  }
}
</style>
