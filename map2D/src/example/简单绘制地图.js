import JsonUtil from "../utils/JsonUtil";
import MapUtil from "../utils/MapUtil";

let app=document.querySelector("#app")

let canvas=document.createElement("canvas")
canvas.width=app.clientWidth
canvas.height=app.clientHeight
let ctx=canvas.getContext("2d")


async function draw(){
  let data=await JsonUtil.loadJson("geoJson/100000.json")
  let dataList=MapUtil.build(data,"Mercator")
  //墨卡托投影处理后的坐标
  console.log(dataList)
  
  //遍历计算投影后坐标的最小最大值
  let minX=null,maxX=null,minY=null,maxY=null
  for (let feature of dataList){
    let box=feature.geometry.box
    minX=minX===null?box[0]:Math.min(minX,box[0])
    minY=minY===null?box[1]:Math.min(minY,box[1])
    maxX=maxX===null?box[2]:Math.max(maxX,box[2])
    maxY=maxY===null?box[3]:Math.max(maxY,box[3])
  }
  console.log(minX,minY,maxX,maxY)
  
  let mapWidth=maxX-minX
  let mapHeight=maxY-minY
  
  ctx.translate(minX+mapWidth/2,minY+mapHeight/2)
  ctx.scale(canvas.width/(maxX-minX),canvas.height/(maxY-minY))
  ctx.translate(-minX-mapWidth/2,-minY-mapHeight/2)
  
  let strokePath=new Path2D()
  let fillPath=new Path2D()
  
  for (let feature of dataList){
    switch (feature.geometry.type) {
      case "polygon": {
        for (let j = 0, k = feature.geometry.polygon.length; j < k; j++) {
          let points = feature.geometry.polygon[j]
          let first = true
          for (let n = 0, m = points.length; n < m; n++) {
            let p = points[n]
            if (first) {
              
              fillPath.moveTo(p[0], p[1])
              strokePath.moveTo(p[0], p[1])
              first = false
            } else {
              fillPath.lineTo(p[0], p[1])
              strokePath.lineTo(p[0], p[1])
            }
          }
        }
        break
      }
      case "polygons": {
        for (let j = 0, k = feature.geometry.polygons.length; j < k; j++) {
          let points = feature.geometry.polygons[j]
          for (let n = 0, m = points.length; n < m; n++) {
            let first = true
            let ps = points[n]
            for (let x = 0, y = ps.length; x < y; x++) {
              let p = ps[x]
              if (first) {
                fillPath.moveTo(p[0], p[1])
                strokePath.moveTo(p[0], p[1])
                first = false
              } else {
                fillPath.lineTo(p[0], p[1])
                strokePath.lineTo(p[0], p[1])
              }
            }
          }
        }
        break
      }
      case "line": {
        let first = true
        for (let j = 0, k = feature.geometry.line.length; j < k; j++) {
          let p = feature.geometry.line[j]
          if (first) {
            strokePath.moveTo(p[0], p[1])
            first = false
          } else {
            strokePath.lineTo(p[0], p[1])
          }
          
        }
        break
      }
      case "lines": {
        for (let j = 0, k = feature.geometry.line.length; j < k; j++) {
          let ps = feature.geometry.line[j]
          let first = true
          for (let p of ps) {
            if (first) {
              strokePath.moveTo(p[0], p[1])
              first = false
            } else {
              strokePath.lineTo(p[0], p[1])
            }
          }
        }
        break
      }
    }
  }
  
  ctx.strokeStyle="#fff"
  ctx.fillStyle="#ff0"
  
  ctx.stroke(strokePath)
  ctx.fill(fillPath)
}



draw()