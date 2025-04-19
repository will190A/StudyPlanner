import { NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 配置代理（如果需要）
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

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

    if (!process.env.MOONSHOT_API_KEY) {
      console.error('Moonshot API key is not configured');
      return NextResponse.json(
        { error: 'Moonshot API key is not configured' },
        { status: 500 }
      );
    }

    // 计算总天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * dailyHours;
    const hoursPerSubject = Math.floor(totalHours / subjects.length);

    const prompt = `你是一个学习计划生成器。请根据以下信息生成学习任务列表，并只返回一个有效的 JSON 数组，不要包含任何其他文字说明。

输入信息：
- 科目：${subjects.join('、')}
- 总天数：${totalDays}天
- 每日学习时长：${dailyHours}小时
- 每科目总时长：${hoursPerSubject}小时

要求：
1. 生成${subjects.length * 3}个任务
2. 每个任务时长为2小时
3. 任务日期从${startDate}开始，每天一个任务
4. 返回格式必须是严格的 JSON 数组

返回格式示例：
[
  {
    "id": "task-1",
    "subject": "数学",
    "description": "学习内容",
    "duration": 2,
    "date": "2024-03-20",
    "completed": false
  }
]

请直接返回 JSON 数组，不要包含任何其他文字。`;

    console.log('Sending request to Moonshot API...');
    try {
      const response = await fetch(MOONSHOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
        agent,
      });

      console.log('Moonshot API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Moonshot API error response:', errorData);
        throw new Error(errorData.error?.message || `Moonshot API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Moonshot API response data:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Moonshot API');
      }

      const content = data.choices[0].message.content;
      console.log('Parsing content:', content);
      
      // 尝试提取 JSON 部分
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const tasks = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(tasks)) {
        throw new Error('Invalid response format from Moonshot API: expected an array of tasks');
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
    } catch (error) {
      console.error('Moonshot API error:', error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `Moonshot API error: ${error.message}` },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 