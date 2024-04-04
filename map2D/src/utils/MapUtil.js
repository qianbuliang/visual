import Polygon from "../entries/polygon";

function build(feature, projection="Mercator", result = []) {
    if (!feature) return []
    const type = feature.type || "Feature"
    switch (type) {
        case "GeometryCollection":
            for (const i = 0, l = feature.geometries.length; i < l; i++) {
                result.push({
                    type: "feature",
                    // properties:feature.properties,
                    geometry: buildGeometry(feature.geometries[i], projection)
                })
            }
            break
        case "FeatureCollection":
            for (let i = 0, l = feature.features.length; i < l; i++) {
                build(feature.features[i], projection, result)
            }
            break;
        case "Feature":
            result.push({
                type: "feature",
                properties: feature.properties,
                geometry: buildGeometry(feature.geometry, projection)
            })
    }
    return result
}

function buildGeometry(geometry, projection) {
    switch (geometry.type) {
        case 'MultiPolygon': {
            const box = [null, null, null, null]
            let polygons = {
                type: 'polygons',
                polygons: [],
                box
            }
            for (let i = 0, l = geometry.coordinates.length; i < l; i++) {
                let coordinates = geometry.coordinates[i]
                const polygon = buildPolygon(coordinates, projection)
                box[0] = min(box[0], polygon.box[0])
                box[1] = min(box[1], polygon.box[1])
                box[2] = max(box[2], polygon.box[2])
                box[3] = max(box[3], polygon.box[3])
                polygons.polygons.push(polygon)
            }
            return polygons
        }
        case 'Polygon': {
            let polygon = buildPolygon(geometry.coordinates, projection)
            return {
                type: 'polygon',
                polygon: polygon,
                box: polygon.box
            }
        }
        case 'MultiLineString': {
            const box = [null, null, null, null]
            let lines = {
                type: 'lines',
                lines: [],
                box
            }
            for (let i = 0, l = geometry.coordinates.length; i < l; i++) {
                let coordinates = geometry.coordinates[i]
                const polygon = buildLine(coordinates, projection)
                box[0] = min(box[0], polygon.box[0])
                box[1] = min(box[1], polygon.box[1])
                box[2] = max(box[2], polygon.box[2])
                box[3] = max(box[3], polygon.box[3])
                lines.lines.push(polygon)
            }
            return lines
        }
        case 'LineString': {
            let line = buildLine(geometry.coordinates, projection)
            return {
                type: 'line',
                line: line,
                box: line.box
            }
        }
    }
}

//处理多边形,返回的pointsList是一个三维数组,第一层一般长度为1,大于1代表有挖洞[[[xx,xx],[xx,xx],[xx,xx]]],box代表矩形包围盒
function buildPolygon(pointsList, projection) {
    const result = []
    let minX = null, minY = null, maxX = null, maxY = null
    for (let i = 0, l = pointsList.length; i < l; i++) {
        const res = []
        const points = pointsList[i]
        for (let j = 0, k = points.length; j < k; j++) {
            let p = convert(points[j], projection)
            minX = min(minX, p[0])
            maxX = max(maxX, p[0])
            minY = min(minY, p[1])
            maxY = max(maxY, p[1])
            res.push(p)
        }
        result.push(res)
    }
    return new Polygon([minX, minY, maxX, maxY],result)
}

function buildLine(pointsList, projection) {
    const result = []
    let minX = null, minY = null, maxX = null, maxY = null
    for (let i = 0, l = pointsList.length; i < l; i++) {
        let p = convert(pointsList[i], projection)
        minX = min(minX, p[0])
        maxX = max(maxX, p[0])
        minY = min(minY, p[1])
        maxY = max(maxY, p[1])
        result.push(p)
    }
    return {
        type:"line",
        pointsList: result,
        box: [minX, minY, maxX, maxY]
    }
}


//经纬度坐标转换为平面坐标
function convert([lng, lat], projection = "Mercator") {
    lng-=0
    lat-=0
    switch (projection) {
        case "WGS84": {
            return [lng, lat]
        }
        default:
        case "Mercator": {
            return [(180 + lng) / 360,(
                -90 == lat ? 1 : 90 == lat ? 0 : (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) / 360
            )]
        }
    }
}

//将投影后的坐标逆变换为经纬度
function inverse([x, y], projection = "Mercator") {
    switch (projection) {
        case "WGS84": {
            return [x, y]
        }
        default:
        case "Mercator": {
            return [360 * x - 180,(
                360 / Math.PI * Math.atan(Math.exp((180 - 360 * y) * Math.PI / 180)) - 90
            )]
        }
    }
}

function min(x1, x2) {
    if (x1 === null || x1 === undefined) return x2
    if (x2 === null || x2 === undefined) return x1
    return Math.min(x1, x2)
}

function max(x1, x2) {
    if (x1 === null || x1 === undefined) return x2
    if (x2 === null || x2 === undefined) return x1
    return Math.max(x1, x2)
}


const MapUtil = {build, convert,inverse}
export default MapUtil