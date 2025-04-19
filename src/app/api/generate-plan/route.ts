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
    
    // 确保日期是本地时间
    start.setHours(12, 0, 0, 0);  // 设置为中午12点，避免时区问题
    end.setHours(12, 0, 0, 0);
    
    // 计算天数差（包含开始和结束日期）
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const totalHours = totalDays * dailyHours;
    const hoursPerSubject = Math.floor(totalHours / subjects.length);

    // 生成任务日期列表
    const taskDates = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      // 使用本地时间格式
      taskDates.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
    }

    console.log('Date range:', {
      startDate,
      endDate,
      start: start.toLocaleDateString('zh-CN'),
      end: end.toLocaleDateString('zh-CN'),
      totalDays,
      taskDates
    });

    const prompt = `作为一个学习计划生成器，请生成一个学习任务列表。请确保返回的是一个有效的 JSON 数组，不要包含任何其他文字。

输入信息：
- 科目：${subjects.join('、')}
- 总天数：${totalDays}天
- 每日学习时长：${dailyHours}小时（这个是硬性要求，每天的任务时长加起来必须等于这个数）
- 任务日期列表：${taskDates.join('、')}

生成要求：
1. 每天的任务总时长必须严格等于${dailyHours}小时，不能多也不能少
2. 每个任务的时长必须是0.5的倍数（如0.5、1、1.5、2小时等）
3. 科目要均匀分布在整个学习周期内
4. 每天可以安排一个或多个任务，但所有任务时长之和必须等于${dailyHours}小时
5. 任务描述要具体且符合科目特点，例如：
   - 数学：学习微积分的导数概念和计算
   - 英语：练习雅思听力Section 1
   - 物理：学习力学中的动量守恒
   - 化学：掌握有机物的命名规则
   - 生物：学习细胞的基本结构
   - 历史：复习抗日战争的重要战役
   - 地理：学习气候类型的判断方法
   - 政治：理解价值规律的基本内容

示例：如果每日学习时长是2小时，可以这样安排：
[
  {
    "id": "task-1",
    "subject": "数学",
    "description": "学习微积分：导数的概念和计算",
    "duration": 1.5,
    "date": "${startDate}",
    "completed": false
  },
  {
    "id": "task-2",
    "subject": "英语",
    "description": "练习雅思听力Section 1",
    "duration": 0.5,
    "date": "${startDate}",
    "completed": false
  }
]
注意上面两个任务的时长加起来等于2小时

请按照这个格式返回所有日期的任务，确保每天的任务时长之和等于${dailyHours}小时。`;

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
          max_tokens: 2000,
          response_format: { type: "json_object" }
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
      console.log('Raw content from API:', content);
      
      let tasks;
      try {
        // 尝试解析内容
        const parsed = JSON.parse(content);
        // 检查是否是数组或者包含tasks数组
        if (Array.isArray(parsed)) {
          tasks = parsed;
        } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
          tasks = parsed.tasks;
        } else {
          // 如果是对象但没有tasks数组，尝试转换为数组
          tasks = [parsed];
        }
      } catch (e) {
        console.error('Failed to parse JSON directly:', e);
        // 如果直接解析失败，尝试提取 JSON 部分
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          // 如果没有找到数组，尝试匹配单个对象
          const objectMatch = content.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            try {
              const singleTask = JSON.parse(objectMatch[0]);
              tasks = [singleTask];
            } catch (e2) {
              console.error('Failed to parse single task:', e2);
              throw new Error('No valid JSON found in response');
            }
          } else {
            console.error('Failed to parse response:', content);
            throw new Error('No valid JSON found in response');
          }
        } else {
          try {
            tasks = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.error('Failed to parse JSON array:', e2);
            throw new Error('Invalid JSON array in response');
          }
        }
      }

      if (!Array.isArray(tasks)) {
        console.error('Parsed content is not an array:', tasks);
        throw new Error('Invalid response format: expected an array of tasks');
      }

      if (tasks.length === 0) {
        console.error('No tasks generated');
        throw new Error('No tasks were generated');
      }

      // 确保每个任务都有正确的格式和日期
      const formattedTasks = tasks.map((task, index) => {
        // 确保日期在任务日期列表中
        const taskDate = task.date || startDate;
        if (!taskDates.includes(taskDate)) {
          console.warn(`Task date ${taskDate} not in valid date range, using ${startDate}`);
        }
        
        return {
          id: `task-${index + 1}`,
          subject: task.subject || subjects[0],
          description: task.description || `学习任务 ${index + 1}`,
          duration: parseFloat(task.duration) || 2,
          date: taskDates.includes(taskDate) ? taskDate : startDate,
          completed: false
        };
      });

      // 验证每天的任务时长
      const tasksByDate = taskDates.map(date => ({
        date,
        tasks: formattedTasks.filter(task => task.date === date),
        totalHours: formattedTasks
          .filter(task => task.date === date)
          .reduce((sum, task) => sum + task.duration, 0)
      }));

      const invalidDates = tasksByDate.filter(day => Math.abs(day.totalHours - dailyHours) > 0.01);
      if (invalidDates.length > 0) {
        console.error('Days with incorrect total hours:', 
          invalidDates.map(day => ({
            date: day.date,
            totalHours: day.totalHours,
            expected: dailyHours,
            difference: day.totalHours - dailyHours,
            tasks: day.tasks.map(t => ({
              subject: t.subject,
              duration: t.duration
            }))
          }))
        );
        throw new Error(`Some days have incorrect total hours. Each day must have exactly ${dailyHours} hours of tasks.`);
      }

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