import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 配置代理（如果需要）
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 增加超时时间到 60 秒
  maxRetries: 3,
  httpAgent: agent, // 添加代理支持
});

async function generatePlanWithRetry(prompt: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to generate plan...`);
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
      });
      return completion;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      // 增加重试间隔时间
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

export async function POST(req: Request) {
  try {
    console.log('Received request to generate plan');
    
    const { subjects, startDate, endDate, dailyHours } = await req.json();
    console.log('Request data:', { subjects, startDate, endDate, dailyHours });

    if (!subjects || !startDate || !endDate || !dailyHours) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // 计算总天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * dailyHours;
    const hoursPerSubject = Math.floor(totalHours / subjects.length);

    const prompt = `请为以下学习计划生成任务列表：
科目：${subjects.join('、')}
总天数：${totalDays}天
每日学习时长：${dailyHours}小时
每科目总时长：${hoursPerSubject}小时

请生成${subjects.length * 3}个任务，每个任务2小时。
返回格式：
[
  {
    "id": "任务1",
    "subject": "科目",
    "description": "学习内容",
    "duration": 2,
    "date": "YYYY-MM-DD",
    "completed": false
  }
]`;

    console.log('Sending request to OpenAI...');
    try {
      const completion = await generatePlanWithRetry(prompt);
      console.log('Received response from OpenAI');
      
      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      console.log('Parsing response...');
      const tasks = JSON.parse(content);

      if (!Array.isArray(tasks)) {
        throw new Error('Invalid response format from OpenAI');
      }

      // 确保每个任务都有正确的格式
      const formattedTasks = tasks.map((task, index) => ({
        id: `task-${index + 1}`,
        subject: task.subject || subjects[0],
        description: task.description || `学习任务 ${index + 1}`,
        duration: task.duration || 2,
        date: task.date || startDate,
        completed: false
      }));

      console.log('Successfully generated tasks:', formattedTasks.length);
      return NextResponse.json({ tasks: formattedTasks });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      if (openaiError instanceof Error) {
        return NextResponse.json(
          { error: `OpenAI API error: ${openaiError.message}` },
          { status: 500 }
        );
      }
      throw openaiError;
    }
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 