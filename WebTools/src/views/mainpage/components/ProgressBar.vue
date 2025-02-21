<script setup>
defineProps({
  percentage: Number,
  isActive: Boolean
})
</script>

<template>
  <el-affix :offset="0" class="fixed" v-show="isActive">
    <el-progress :percentage="percentage" :show-text="false" :stroke-width="4" />
  </el-affix>
</template>
