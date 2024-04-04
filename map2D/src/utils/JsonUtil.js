const JsonUtil = {
  loadJson(url) {
    return new Promise((resolve, reject) => {
      let requestURL = url;
      let request = new XMLHttpRequest();
      request.open('GET', requestURL);
      request.responseType = 'text';
      request.send();
      
      //处理来自服务器的数据
      request.onload = function () {
        if (request.readyState === 4 && request.status === 200) {
          try {
            resolve(JSON.parse(request.response))
          } catch (e) {
            console.error("json转换失败:" + url)
            reject("json转换失败:" + url)
          }
        } else {
          reject("request failed:" + url)
        }
      }
    })
  }
}

export default JsonUtil