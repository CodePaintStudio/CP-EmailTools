<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import {
  Delete
} from '@element-plus/icons-vue'


const upload = ref(null)
const excelData = ref([])

const beforeUpload = (file) => {
  const types = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
  const isExcel = types.includes(file.type)
  if (!isExcel) {
    alert("只能上传Excel文件")
    return false
  }
  if (excelData.value.length > 0) {
    deleteData()
  }
  return true;
}

const FileChange = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    excelData.value = XLSX.utils.sheet_to_json(worksheet, { header: 2 });
    console.log(excelData.value);
  };
  reader.readAsBinaryString(file.raw);
};

const deleteData = () => {
  excelData.value = []
};
const columns = computed(() => {
  const cols = new Set()
  excelData.value.forEach(row => {
    Object.keys(row).forEach(key => {
      cols.add(key)
    })
  })
  return Array.from(cols)
})
const deleteRow = (index) => {
  excelData.value.splice(index, 1)
}
</script>
<template>
  <div class="banner">
    <!-- 头部 -->
    <h1>EmailTools</h1>
    <p>Excel转邮件群发工具：<span>
        姓名 - 邮箱 - 电话
      </span></p>
    <!-- 上传和清空 -->
    <div class="main">
      <el-upload ref="upload" :limit="1" :before-upload="beforeUpload" :on-change="FileChange">
        <el-button type="primary">上传Excel</el-button>
      </el-upload>
      <el-button style="margin-left: 10px;" type="danger" @click="deleteData">清空</el-button>
    </div>
    <!-- 编辑和预览 -->
    <div class="show">
      <QuillEditor theme="snow"  />
    </div>
    <!-- 数据展示 -->
    <el-table class="table" border :data="excelData" height="500">
      <el-table-column label="状态" width="80" v-if="excelData.length > 0">
        <el-button type="success" size="small" plain>展示</el-button>
      </el-table-column>
      <el-table-column v-for="key in columns" :key="key" :prop="key" :label="key" min-width="200">
        <template v-slot="scope">
          <el-input v-model="scope.row[key]"></el-input>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="70" v-if="excelData.length > 0">
        <template #default="scope">
          <el-button type="danger" size="small" circle :icon="Delete" plain @click.prevent="deleteRow(scope.$index)">
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>
  </div>
</template>
<style scoped lang="scss">
* {
  box-sizing: border-box;
  font-family: 'KaiTi';
}

.banner {
  width: 60%;
  min-width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border: 2px solid rgb(52, 137, 235);

  h1 {
    color: rgb(52, 137, 235);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    font-size: 30px;
  }

  span {
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    color: #999;
  }

  .main {
    width: 100%;
    display: flex;
    justify-content: start;
  }

  .show {
    width: 100%;
    height: 500px;
    margin: 10px;
    border: 2px solid rgb(52, 137, 235);
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .table {
    border-radius: 15px;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    border: 2px solid rgb(52, 137, 235);
  }
  :deep(.el-table thead) {
    color: rgb(52, 137, 235);
  }
}
</style>