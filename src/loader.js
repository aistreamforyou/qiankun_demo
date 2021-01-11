export async function importHtml(entry) {
//解析html， 生成css和js

    //加载应用入口
    let content = await loaderSource(entry)
    // @todo 解析script
    let scriptRes = await parseScript(content,entry)
    // console.log(scriptRes)
    // @todo 解析css
    const {css, styles} = await parseCss(content, entry)
    //@todo 解析body
    const body = await parseBody(content)
    console.log(content,css,styles,scriptRes,body)
}
//属性正则
const ATTR_RE = /["'=\w\s]*/.source

//解析body
function parseBody(content) {
    const BODY_RE = /<body>([\w\W]*)<\/body>/g
    const SCRIPT_RE = /<script["'=\w\s]>[\s\S]<\/script>/g
    let bodyContent = content.match(BODY_RE)
    console.log(bodyContent)
}

//解析css
function parseCss(content, entry){
    const CSS_LINK_RE = new RegExp('<link' + ATTR_RE + 'href="([^"]+.css[^"]*)"' + ATTR_RE + '>', 'g')
    const STYLE_CONTENT_RE = /<style>([^<]*)<\/style>/g
    const CSS_RE = new RegExp('(?:' + CSS_LINK_RE.source + ')|(?:' + STYLE_CONTENT_RE.source + ')', 'g')
    let match, css = [], styles = []
    while((match = CSS_RE.exec(content))){
        let style
        if(match[1]){
            style = match[1].trim()
            style && css.push(style)
        }else if(match[2]){
            style = match[2].trim()
            style && styles.push(style)
        }
    }
    return {css, styles}
}

//正则可视化网站：https://jex.im/regulex/#!flags=&re=%3Cscript%3E(.%2B)%3C%2Fscript%3E
async function parseScript(content,entry) {
    // 1、远程js用的时候在load
    // 2、parse之后直接load进来，存文本
    const SCRIPT_CONTENT_RE = new RegExp('<script' + ATTR_RE + '>([\\w\\W]*)<\/script>','g')
    const SCRIPT_SRC_RE = new RegExp('<script' + ATTR_RE + 'src="(.+)"', 'g')
    let scripts = []
    let scriptUrls = []
    let match
    while((match = SCRIPT_CONTENT_RE.exec(content))){
        const script = match[1].trim()
        script && scripts.push(script)
    }
    while((match = SCRIPT_SRC_RE.exec(content))){
        const script = match[1].trim()
        script && scriptUrls.push(script)
    }
    //load远程js
    let promiseScripts = await Promise.all(scriptUrls.map(url=>{
        // app.js => http://localhost:9091/app.js
        let u = (url.startsWith('http:')||url.startsWith('https:'))?url:entry  + '/' + url
        return loaderSource(u)
    }))
    return await promiseScripts.concat(scripts)
}
function loaderSource(url) {
    return window.fetch(url).then(res=>res.text())
}
