import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const courseName = formData.get('courseName') as string || '';
    const typesJson = formData.get('types') as string;
    const types = typesJson ? JSON.parse(typesJson) as string[] : [];
    const file = formData.get('file') as File | null;

    // 验证必要参数
    if ((!courseName && !file) || types.length === 0) {
      return NextResponse.json(
        { error: '请提供课程名称或上传文件，并至少选择一种题型' },
        { status: 400 }
      );
    }

    // 处理文件内容
    let fileContent = '';
    if (file) {
      try {
        fileContent = await extractFileContent(file);
      } catch (error) {
        console.error('解析文件失败:', error);
        return NextResponse.json(
          { error: '文件解析失败，请确保文件格式正确' },
          { status: 400 }
        );
      }
    }

    // 构建提示词
    const prompt = buildPrompt(courseName, types, fileContent);

    if (!process.env.MOONSHOT_API_KEY) {
      console.error('Moonshot API key未配置');
      return NextResponse.json(
        { error: 'AI服务未正确配置' },
        { status: 500 }
      );
    }

    // 调用 Moonshot API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: "你是一个专业的题目生成助手，擅长根据课程内容生成各种类型的题目。你熟悉各种编程、计算机科学和IT相关的概念，能够生成高质量的学习题目。请始终返回正确格式的JSON，不要包含任何额外的解释。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Moonshot API请求失败:', response.status, response.statusText);
      return NextResponse.json(
        { error: '生成题目失败，请稍后重试' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 尝试提取JSON
    try {
      // 尝试进行JSON格式修复和解析
      let questions;
      
      // 首先尝试直接解析整个内容
      try {
        const parsed = JSON.parse(content);
        questions = parsed.questions;
      } catch (parseError) {
        console.log('直接解析失败，尝试其他方法:', parseError);
        
        // 尝试查找JSON块
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
        
        if (jsonMatch) {
          try {
            questions = JSON.parse(jsonMatch[1] || jsonMatch[0]).questions;
          } catch (error) {
            console.log('提取JSON块解析失败，尝试修复格式:', error);
            
            // 尝试清理并修复JSON格式
            let fixedContent = content.replace(/```json|```/g, '').trim();
            
            // 尝试清理非标准JSON格式，比如单行注释
            fixedContent = fixedContent.replace(/\/\/.*$/gm, '');
            
            // 尝试修复常见的格式问题
            fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
            fixedContent = fixedContent.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3'); // 为没有引号的键名添加引号
            
            try {
              questions = JSON.parse(fixedContent).questions;
            } catch (fixError) {
              console.error('修复JSON格式失败:', fixError);
              
              // 尝试用正则表达式提取关键信息重建问题数组
              console.log('尝试从非标准格式中提取问题数据');
              const contentRegex = /"content"\s*:\s*"([^"]+)"/g;
              const typeRegex = /"type"\s*:\s*"([^"]+)"/g;
              const answersRegex = /"answer"\s*:\s*(\[[^\]]+\]|"[^"]+")/g;
              const optionsRegex = /"options"\s*:\s*(\[[^\]]+\])/g;
              const analysisRegex = /"analysis"\s*:\s*"([^"]+)"/g;
              
              const contentMatches = [...content.matchAll(contentRegex)];
              const typeMatches = [...content.matchAll(typeRegex)];
              const answerMatches = [...content.matchAll(answersRegex)];
              const optionMatches = [...content.matchAll(optionsRegex)];
              const analysisMatches = [...content.matchAll(analysisRegex)];
              
              if (contentMatches.length > 0) {
                questions = contentMatches.map((match, index) => {
                  const question: any = {
                    id: `extracted-${index + 1}`,
                    content: match[1],
                    subject: courseName || '自定义题库'
                  };
                  
                  if (index < typeMatches.length) {
                    question.type = typeMatches[index][1];
                  }
                  
                  if (index < answerMatches.length) {
                    try {
                      const answerValue = answerMatches[index][1];
                      // 检查是否为数组格式
                      if (answerValue.startsWith('[')) {
                        question.answer = JSON.parse(answerValue);
                      } else {
                        question.answer = answerValue.replace(/^"|"$/g, '');
                      }
                    } catch (e) {
                      question.answer = answerMatches[index][1].replace(/^"|"$/g, '');
                    }
                  }
                  
                  if (index < optionMatches.length) {
                    try {
                      question.options = JSON.parse(optionMatches[index][1]);
                    } catch (e) {
                      question.options = [];
                    }
                  }
                  
                  if (index < analysisMatches.length) {
                    question.analysis = analysisMatches[index][1];
                  }
                  
                  return question;
                });
              }
            }
          }
        }
      }
      
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error('无法从API响应中提取有效题目');
        return NextResponse.json(
          { error: '解析题目失败，请重试' },
          { status: 500 }
        );
      }
      
      console.log(`成功提取 ${questions.length} 道题目`);
      return NextResponse.json({ questions });
      
    } catch (error) {
      console.error('解析AI返回内容失败:', error, content);
      return NextResponse.json(
        { error: '解析生成题目失败，请重试' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('生成题目时出错:', error);
    return NextResponse.json(
      { error: '生成题目时发生错误' },
      { status: 500 }
    );
  }
}

/**
 * 从上传的文件中提取内容
 */
async function extractFileContent(file: File): Promise<string> {
  // 目前简单实现为直接读取文本
  // 实际应用中可以根据文件类型使用不同的解析方法
  // 例如对于PDF、Excel等需要专门的库处理
  
  try {
    const text = await file.text();
    const fileName = file.name;
    const fileType = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType === 'json') {
      try {
        // 如果是JSON文件，尝试解析并格式化
        const jsonData = JSON.parse(text);
        return JSON.stringify(jsonData, null, 2);
      } catch {
        // 解析失败则返回原始文本
        return text;
      }
    }
    
    // 对于其他文件，直接返回文本内容
    // 限制内容长度，避免过大
    return text.substring(0, 50000); 
  } catch (error) {
    console.error('读取文件内容失败:', error);
    throw new Error('文件内容提取失败');
  }
}

/**
 * 构建AI请求提示词
 */
function buildPrompt(courseName: string, types: string[], fileContent: string): string {
  // 将类型映射到中文描述
  const typeMap: Record<string, string> = {
    'choice': '单选题',
    'multiple': '多选题',
    'judge': '判断题',
    'fill': '填空题',
    'essay': '简答题'
  };
  
  // 构建类型描述
  const typeDesc = types.map(t => typeMap[t] || t).join('、');
  
  // 题目数量，根据类型数量决定
  const questionCount = Math.min(types.length * 2, 10); // 每种类型2题，最多10题
  
  let content = '';
  
  // 添加文件内容（如果有）
  if (fileContent) {
    content = `我提供了以下教材/资料内容，请根据这些内容生成题目：
${fileContent.substring(0, 3000)}\n\n`;
  }
  
  // 添加课程名称（如果有）
  if (courseName) {
    content += `针对"${courseName}"课程，`;
  }
  
  // 完整提示词
  return `${content}请生成${questionCount}道高质量的${typeDesc}题目。

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
      "type": "${types[0]}",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "analysis": "详细解析",
      "subject": "${courseName || '自定义题库'}"
    }
  ]
}

返回时要特别注意：
1. 所有字段名必须用双引号包围
2. 所有文本值必须用双引号包围
3. 数组值使用方括号[]，内部元素用逗号分隔
4. 不要在JSON中添加任何注释
5. 返回前请检查JSON格式是否完整有效
6. 直接返回JSON，不需要任何额外的说明文字或代码块标记`;
} 