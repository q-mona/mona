import t from '@babel/types'
import p from 'path'
import crypto from 'crypto'
import fs from 'fs'
import { fileURLToPath } from 'url'

// 获取当前文件所在目录
const fileURL = fileURLToPath(import.meta.url)
const currentDir = p.dirname(fileURL);

// md5加密
const md5 = function (str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex')
}

// 缓存
const cache = {}
const getCacheKey = (path, buildInfo) => {
  const { fileId } = buildInfo
  const start = path.node.loc.start.line
  const end = path.node.loc.end.line
  return `${fileId}-${start}-${end}`
}
const setCache = (cacheKey, path, buildInfo) => {
  if (cache[cacheKey]) return

  const { filePath } = buildInfo
  const start = path.node.loc.start.line
  const end = path.node.loc.end.line

  cache[cacheKey] = {
    position: {
      start, // 函数开始行
      end, // 函数结束行
    },
    filePath, // 函数所在文件路径
    cacheKey // 函数唯一标识
    // ...其他信息
  }
}

export default function CodeCoverage() {
  return {
    visitor: {
      // 文件访问入口
      Program(path, state) {
        const { opts = {} } = state.file || {}
        const sourceFileName = opts.sourceFileName || opts.filename
        // 排除需要写入的 inject.js 文件
        if (sourceFileName.includes('inject.js')) return

        // 仅在 src/index.tsx 文件中插入 import 语句即可
        if (sourceFileName && sourceFileName.endsWith('src/index.tsx')) {
          // 写入 inject.js 文件
          const sourcePath = p.resolve(currentDir, 'inject.js')
          const injectCode = fs.readFileSync(sourcePath, 'utf-8')
          const destPath = p.resolve(p.dirname(sourceFileName), 'inject.js')
          fs.writeFileSync(destPath, injectCode, 'utf-8')
          // 插入 import 语句
          const importDeclaration = t.importDeclaration([], t.stringLiteral(destPath))
          path.node.body.unshift(importDeclaration)
        }

        const prefix = p.dirname(sourceFileName)
        const relativePath = sourceFileName.replace(prefix, '') // 获取文件的相对路径
        state.buildInfo = {
          filePath: relativePath, 
          fileId: md5(relativePath),
        }
      },
      // 函数访问入口
      FunctionDeclaration(path, state) {
        // 函数可能比所在文件更先访问，所以需要判断是否存在 buildInfo
        if (!state.buildInfo) return

        // 设置缓存，同时避免重复插入inject函数
        const cacheKey = getCacheKey(path, state.buildInfo)
        if (cache[cacheKey]) return
        setCache(cacheKey, path, state.buildInfo)
        // 生成 inject 函数的调用语句
        // 参数只能为string，所以需要将cache转换为字符串，浏览器端会自动解析成对象
        const injectBody = t.ExpressionStatement(
          t.CallExpression(t.identifier('inject'), [t.identifier(JSON.stringify(cache[cacheKey]))])
        )
        // 将 inject 函数的调用语句插入到函数体的开头
        path.node.body.body.unshift(injectBody)
        console.log('injectBody:', cache[cacheKey])
      },
      // 箭头函数访问入口，代码与上面类似
      ArrowFunctionExpression(path, state) {
        if (!state.buildInfo) return
        const cacheKey = getCacheKey(path, state.buildInfo)

        if (cache[cacheKey]) return
        setCache(cacheKey, path, state.buildInfo)
        
        const injectBody = t.ExpressionStatement(
          t.CallExpression(t.identifier('inject'), [t.identifier(JSON.stringify(cache[cacheKey]))])
        )

        path.node.body.body.unshift(injectBody)
        console.log('injectBody:', cache[cacheKey])
      },
    },
  }
}
