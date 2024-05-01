let importBtn = document.getElementById("importExcal");
let resetBtn = document.getElementById("resetPage");
let importFile = document.getElementById("importFile");

//接收到文件的回调函数
importFile.addEventListener('change', (event) => {
  console.log("接收到的文件", event.target.files);
  //读取文件列表的第一个文件
  const file = event.target.files[0];
  var reader = new FileReader();
	reader.onload = function(e) {
		var data = e.target.result;
		var workbook = XLSX.read(data, {type: 'binary'});
    console.log(workbook.Sheets.Sheet1);
		if(callback) callback(workbook);
	};
	reader.readAsBinaryString(file);
})

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

