// 每个函数调用时触发
window.inject = (info) => {
  console.log('inject', info)
  // 这里可以发送请求到服务器，记录函数调用信息
  // fetch...
}
