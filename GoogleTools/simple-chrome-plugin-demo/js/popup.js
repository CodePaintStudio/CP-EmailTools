let importBtn = document.getElementById("importExcal");
let resetBtn = document.getElementById("resetPage");
let importFile = document.getElementById("importFile");

importBtn.addEventListener('click', () => {
  console.log('导入');
  importFile.click();
})

resetBtn.addEventListener('click', () => {
  console.log('重置');
})

let toConsole = () => {
  console.log('你好，我是popu2p！');
}

