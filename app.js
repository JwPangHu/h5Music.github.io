
const express = require('express')
// const app = express()
const puppeteer = require('puppeteer-core')
const fs = require('fs')


let jsonDataList = []

getMusicJosn()
async function getMusicJosn() {
    
    const brower = await puppeteer.launch({
        executablePath: 'C:/Users/ponovo/AppData/Local/Google/Chrome/Application/chrome',
        headless: false
    })
    const page = await brower.newPage();
    await page.goto('http://music.wandhi.com/?name=%E5%91%A8%E6%9D%B0%E4%BC%A6&type=netease')

    // 根据网站规则，监听页面ajax请求，截获请求数据
    page.on('response', async (res) => {
        const url = res.url()
        console.log('喜喜喜喜喜喜',url)
        if(url === 'http://music.wandhi.com/') {
            const data = await res.json()
            const list = data.data
            jsonDataList.push(...list)
            console.log(jsonDataList.length)

            function writeData() {
                // console.log('oooooooo')
                let list = jsonDataList.map(item => {
                    const lrcJson = JSON.stringify({lrc: item.lrc}, null, 4)
                    console.log(lrcJson)
                    fs.writeFile(`./musicLrc/${item.songid}.json`, lrcJson, (e, result) => {
                        if (e) {
                            console.error(e)
                        }
                    })
                    // 剔除歌词
                    delete item.lrc
                    return item
                })

                // 写入歌曲列表
                fs.writeFile('musicList.json', JSON.stringify(list, null, 4), (e, result) => {
                    console.log(result)
                    if (e) {
                        console.error(e)
                    }
                })
            }

            // 判断列表长度自动翻页
            if (list.length >= 10) {
                console.log('下一页')
                // 此处需要延迟执行 300s 最为合适
                setTimeout(async () => {
                    console.log('大于10条')
                    await page.click('.aplayer-more').catch(e => {
                        writeData()
                    })
                    // writeData()
                    
                }, 300)
            } else {
                writeData()
            }
        }
    })
}


// app.listen('3000', () => {
//     console.log('app running ....')
// })