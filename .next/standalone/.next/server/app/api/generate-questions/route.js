"use strict";(()=>{var e={};e.id=6178,e.ids=[6178],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9407:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>m,patchFetch:()=>y,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h});var r={};s.r(r),s.d(r,{POST:()=>l});var o=s(49303),n=s(88716),a=s(60670),i=s(87070);async function l(e){try{let t=await e.formData(),s=t.get("courseName")||"",r=t.get("types"),o=r?JSON.parse(r):[],n=t.get("file");if(!s&&!n||0===o.length)return i.NextResponse.json({error:"请提供课程名称或上传文件，并至少选择一种题型"},{status:400});let a="";if(n)try{a=await c(n)}catch(e){return console.error("解析文件失败:",e),i.NextResponse.json({error:"文件解析失败，请确保文件格式正确"},{status:400})}let l=function(e,t,s){let r={choice:"单选题",multiple:"多选题",judge:"判断题",fill:"填空题",essay:"简答题"},o=t.map(e=>r[e]||e).join("、"),n=Math.min(2*t.length,10),a="";return s&&(a=`我提供了以下教材/资料内容，请根据这些内容生成题目：
${s.substring(0,3e3)}

`),e&&(a+=`针对"${e}"课程，`),`${a}请生成${n}道高质量的${o}题目。

每道题目应包含：
1. 题目内容
2. 选项（如果是选择题或多选题）
3. 正确答案
4. 详细解析

要求：
- 如果是单选题或多选题，请提供4个选项，标记为A、B、C、D
- 题目难度要适中，内容要准确
- 答案必须正确，解析要详细
- 选择题的选项要有干扰性，但不能有明显错误
- 简答题的答案要简洁但完整
- 严格按照JSON格式返回，确保所有字段名和值都符合JSON标准

请按以下JSON格式返回结果，不要省略任何必要的标点符号或引号：
{
  "questions": [
    {
      "id": "q1",
      "content": "题目内容",
      "type": "${t[0]}",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "analysis": "详细解析",
      "subject": "${e||"自定义题库"}"
    }
  ]
}

返回时要特别注意：
1. 所有字段名必须用双引号包围
2. 所有文本值必须用双引号包围
3. 数组值使用方括号[]，内部元素用逗号分隔
4. 不要在JSON中添加任何注释
5. 返回前请检查JSON格式是否完整有效
6. 直接返回JSON，不需要任何额外的说明文字或代码块标记`}(s,o,a);if(!process.env.MOONSHOT_API_KEY)return console.error("Moonshot API key未配置"),i.NextResponse.json({error:"AI服务未正确配置"},{status:500});let u=await fetch("https://api.moonshot.cn/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.MOONSHOT_API_KEY}`},body:JSON.stringify({model:"moonshot-v1-8k",messages:[{role:"system",content:"你是一个专业的题目生成助手，擅长根据课程内容生成各种类型的题目。你熟悉各种编程、计算机科学和IT相关的概念，能够生成高质量的学习题目。请始终返回正确格式的JSON，不要包含任何额外的解释。"},{role:"user",content:l}],temperature:.8,max_tokens:4e3})});if(!u.ok)return console.error("Moonshot API请求失败:",u.status,u.statusText),i.NextResponse.json({error:"生成题目失败，请稍后重试"},{status:500});let p=(await u.json()).choices[0].message.content;try{let e;try{e=JSON.parse(p).questions}catch(r){console.log("直接解析失败，尝试其他方法:",r);let t=p.match(/```json\s*([\s\S]*?)\s*```/)||p.match(/\{[\s\S]*"questions"[\s\S]*\}/);if(t)try{e=JSON.parse(t[1]||t[0]).questions}catch(r){console.log("提取JSON块解析失败，尝试修复格式:",r);let t=p.replace(/```json|```/g,"").trim();t=(t=(t=t.replace(/\/\/.*$/gm,"")).replace(/,(\s*[}\]])/g,"$1")).replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g,'$1"$2"$3');try{e=JSON.parse(t).questions}catch(i){console.error("修复JSON格式失败:",i),console.log("尝试从非标准格式中提取问题数据");let t=[...p.matchAll(/"content"\s*:\s*"([^"]+)"/g)],r=[...p.matchAll(/"type"\s*:\s*"([^"]+)"/g)],o=[...p.matchAll(/"answer"\s*:\s*(\[[^\]]+\]|"[^"]+")/g)],n=[...p.matchAll(/"options"\s*:\s*(\[[^\]]+\])/g)],a=[...p.matchAll(/"analysis"\s*:\s*"([^"]+)"/g)];t.length>0&&(e=t.map((e,t)=>{let i={id:`extracted-${t+1}`,content:e[1],subject:s||"自定义题库"};if(t<r.length&&(i.type=r[t][1]),t<o.length)try{let e=o[t][1];e.startsWith("[")?i.answer=JSON.parse(e):i.answer=e.replace(/^"|"$/g,"")}catch(e){i.answer=o[t][1].replace(/^"|"$/g,"")}if(t<n.length)try{i.options=JSON.parse(n[t][1])}catch(e){i.options=[]}return t<a.length&&(i.analysis=a[t][1]),i}))}}}if(!e||!Array.isArray(e)||0===e.length)return console.error("无法从API响应中提取有效题目"),i.NextResponse.json({error:"解析题目失败，请重试"},{status:500});return console.log(`成功提取 ${e.length} 道题目`),i.NextResponse.json({questions:e})}catch(e){return console.error("解析AI返回内容失败:",e,p),i.NextResponse.json({error:"解析生成题目失败，请重试"},{status:500})}}catch(e){return console.error("生成题目时出错:",e),i.NextResponse.json({error:"生成题目时发生错误"},{status:500})}}async function c(e){try{let t=await e.text(),s=e.name,r=s.split(".").pop()?.toLowerCase();if("json"===r)try{let e=JSON.parse(t);return JSON.stringify(e,null,2)}catch{return t}return t.substring(0,5e4)}catch(e){throw console.error("读取文件内容失败:",e),Error("文件内容提取失败")}}let u=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/generate-questions/route",pathname:"/api/generate-questions",filename:"route",bundlePath:"app/api/generate-questions/route"},resolvedPagePath:"D:\\武欣宇\\大三下\\计算机设计大赛\\StudyPlanner2\\src\\app\\api\\generate-questions\\route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:h,serverHooks:g}=u,m="/api/generate-questions/route";function y(){return(0,a.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[9276,5972],()=>s(9407));module.exports=r})();