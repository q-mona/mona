import babel from '@babel/core';
import crypto from 'crypto'
import { createCanvas } from 'canvas';
import fs from 'fs';

const md5 = function (str) {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex')
}

// 需要高亮的未使用数据行
const hightlightRange = {
    start: 0,
    end: 0,
}

// 模拟数据库数据
const dataBase = {
    // test1的埋点信息
    "3add80cd429bd798dec47dd6bf1b4862-1-3": {
        filePath: "/tool.ts",
        position: { start: 1, end: 3 }
    },
    // test2的埋点信息
    "3add80cd429bd798dec47dd6bf1b4862-5-7": {
        filePath: "/tool.ts",
        position: { start: 5, end: 7 }
    }
}

// 获取函数的唯一标识，和codeCoverage.js的getCacheKey函数相同
const getCacheKey = (path, buildInfo) => {
    const { fileId } = buildInfo
    const start = path.node.loc.start.line
    const end = path.node.loc.end.line
    return `${fileId}-${start}-${end}`
}

// 获取未使用的行数(即test3函数)插件
function getHightlightRange() {
    return {
        visitor: {
            Program(path, state) {
                state.buildInfo = {
                    filePath: '/tool.ts',
                    fileId: md5('/tool.ts'),
                }
            },
            FunctionDeclaration(path, state) {
                const cacheKey = getCacheKey(path, state.buildInfo)
                // 如果没有埋点信息，说明是未使用的函数
                if (!dataBase[cacheKey]) {
                    hightlightRange.start = path.node.loc.start.line,
                    hightlightRange.end = path.node.loc.end.line
                }
            },
        },
    }
}

// tool.ts文件内容
const code = `export const test1 = () => {
    console.log('test1')
}   

export function test2() {
    console.log('test2')
}

export function test3() {
    console.log('test3')
}`

// 使用 Babel 转译代码
babel.transformSync(code, {
    plugins: [getHightlightRange], // 获取未使用的行数
    sourceType: 'module', // 指定代码类型为 ES 模块
});

// 创建一个新的Canvas对象
const canvas = createCanvas(360, 320);
const ctx = canvas.getContext('2d');
ctx.scale(2, 2)
// 设置背景为白色
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
// 设置字体样式
ctx.fillStyle = 'black';
// 起始绘制位置
let x = 10; // 左边距
let y = 15; // 顶部边距
// 写入文字到Canvas上
code.split('\n').forEach((line, index) => {
    const space = ' '.repeat(index < 10 ? 5 : 4); // 根据行数调整空格数量
    // 高亮未使用的行
    if(index >= hightlightRange.start - 1 && index <= hightlightRange.end - 1) {
        ctx.fillStyle = 'red';
    }
    ctx.fillText(`${index + 1}${space}${line}`, x, y);
    y += 12; // 每行向下移动 12 像素
});
// 将Canvas保存为图片文件
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('output.png', buffer);