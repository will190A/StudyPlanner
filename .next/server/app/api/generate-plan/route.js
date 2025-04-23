"use strict";(()=>{var e={};e.id=1790,e.ids=[1790],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},97376:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>h,patchFetch:()=>m,requestAsyncStorage:()=>l,routeModule:()=>p,serverHooks:()=>d,staticGenerationAsyncStorage:()=>c});var r={};o.r(r),o.d(r,{POST:()=>u});var s=o(49303),n=o(88716),a=o(60670),i=o(87070);async function u(e){try{let t;let{subjects:o,startDate:r,endDate:s,dailyHours:n}=await e.json();if(console.log("Received request:",{subjects:o,startDate:r,endDate:s,dailyHours:n}),!o||!r||!s||!n)return i.NextResponse.json({error:"缺少必要参数"},{status:400});if(!process.env.MOONSHOT_API_KEY)return i.NextResponse.json({error:"Moonshot API key未配置"},{status:500});let a=new Date(r);new Date(s).getTime(),a.getTime();let u=`你是一个学习计划生成器。请根据以下信息生成一个学习计划，并以JSON数组格式返回。

输入信息：
- 科目：${o.join("、")}
- 开始日期：${r}
- 结束日期：${s}
- 每日学习时长：${n}小时

要求：
1. 每天的任务总时长必须严格等于${n}小时
2. 每个任务必须包含以下字段：
   - id: 唯一标识符（格式：task-1, task-2等）
   - date: 日期（格式：YYYY-MM-DD）
   - subject: 科目名称
   - description: 任务描述
   - duration: 任务时长（小时，精确到小数点后两位）
   - completed: 是否完成（默认为false）

请直接返回一个JSON数组，不要包含任何其他文字。示例格式：
[
  {
    "id": "task-1",
    "date": "${r}",
    "subject": "${o[0]}",
    "description": "具体的学习任务描述",
    "duration": 1.5,
    "completed": false
  }
]`;console.log("Sending request to Moonshot API...");let p=await fetch("https://api.moonshot.cn/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.MOONSHOT_API_KEY}`},body:JSON.stringify({model:"moonshot-v1-8k",messages:[{role:"system",content:"你是一个学习计划生成器。请严格按照要求返回JSON格式的数据，不要包含任何其他文字。"},{role:"user",content:u}],temperature:.7,stream:!1})});console.log("Moonshot API response status:",p.status);let l=await p.json();if(console.log("Moonshot API response:",l),!p.ok)return console.error("Moonshot API error:",l),i.NextResponse.json({error:"生成计划失败"},{status:500});let c=l.choices[0].message.content;console.log("Raw content from API:",c);let d=c.match(/\[[\s\S]*\]/);if(!d)return console.error("No JSON array found in response"),i.NextResponse.json({error:"API返回格式不正确"},{status:500});try{t=JSON.parse(d[0])}catch(e){return console.error("Error parsing JSON:",e),i.NextResponse.json({error:"解析计划失败"},{status:500})}if(!Array.isArray(t))return i.NextResponse.json({error:"计划格式不正确"},{status:500});for(let e of t)if(!e.id||!e.date||!e.subject||!e.description||"number"!=typeof e.duration||"boolean"!=typeof e.completed)return i.NextResponse.json({error:"任务格式不正确"},{status:500});let h={};for(let[e,o]of(t.forEach(e=>{h[e.date]||(h[e.date]=[]),h[e.date].push(e)}),Object.entries(h))){let t=o.reduce((e,t)=>e+t.duration,0);if(Math.abs(t-n)>.01){console.error(`Date ${e} has incorrect total hours: ${t}, expected: ${n}`);let r=n/t;o.forEach(e=>{e.duration=Number((e.duration*r).toFixed(2))})}}let m=Object.values(h).flat(),f=m.reduce((e,t)=>e+t.duration,0);return console.log("Final total hours:",f),i.NextResponse.json({tasks:m})}catch(e){return console.error("Error in generate-plan:",e),i.NextResponse.json({error:"生成计划时发生错误"},{status:500})}}let p=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/generate-plan/route",pathname:"/api/generate-plan",filename:"route",bundlePath:"app/api/generate-plan/route"},resolvedPagePath:"D:\\武欣宇\\大三下\\计算机设计大赛\\StudyPlanner2\\src\\app\\api\\generate-plan\\route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:l,staticGenerationAsyncStorage:c,serverHooks:d}=p,h="/api/generate-plan/route";function m(){return(0,a.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:c})}}};var t=require("../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[9276,5972],()=>o(97376));module.exports=r})();