import { NextResponse } from 'next/server';
import Question from '@/models/Question';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// 获取自定义题库列表
export async function GET(request: Request) {
  try {
    // 连接到数据库
    await connectToDatabase();
    
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }
    
    // 查找该用户的自定义题库
    // 使用聚合查询来获取每个题库中的题目数量
    const questions = await Question.find({ 
      tags: { $regex: /^自定义/ }  // 查找带有"自定义"标签的题目
    });
    
    // 获取所有不同的题库名称（从tags中提取）
    const libraryMap = new Map();
    
    questions.forEach(question => {
      // 从tags中找到以"自定义"开头的标签，通常是第二个标签
      const libraryTag = question.tags.find((tag: string) => 
        tag !== '自定义' && question.tags.includes('自定义')
      );
      
      if (libraryTag) {
        if (!libraryMap.has(libraryTag)) {
          libraryMap.set(libraryTag, {
            id: uuidv4().substring(0, 8), // 生成临时ID
            name: libraryTag,
            questionCount: 1,
            categories: [question.category],
            createdAt: question.createdAt
          });
        } else {
          const library = libraryMap.get(libraryTag);
          library.questionCount += 1;
          if (!library.categories.includes(question.category)) {
            library.categories.push(question.category);
          }
          // 更新创建时间为最早的时间
          if (new Date(question.createdAt) < new Date(library.createdAt)) {
            library.createdAt = question.createdAt;
          }
        }
      }
    });
    
    // 转换为数组并按创建时间排序
    const libraries = Array.from(libraryMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ libraries });
    
  } catch (error) {
    console.error('获取自定义题库失败:', error);
    return NextResponse.json(
      { error: '获取题库失败' },
      { status: 500 }
    );
  }
}

// 添加自定义题库
export async function POST(request: Request) {
  try {
    // 连接到数据库
    await connectToDatabase();
    
    // 解析请求体
    const { libraryName, questions, userId } = await request.json();
    
    // 验证必要参数
    if (!libraryName || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: '参数错误：缺少题库名称或题目' },
        { status: 400 }
      );
    }
    
    // 标准化题目数据并添加标识符
    const processedQuestions = questions.map(question => {
      // 类型映射
      let questionType = 'choice';
      if (question.type === 'multiple') questionType = 'multiple';
      else if (question.type === 'judge') questionType = 'judge';
      else if (question.type === 'fill') questionType = 'fill';
      else if (question.type === 'essay') questionType = 'code'; // 简答题映射到code类型
      
      // 处理选项格式
      let options = [];
      if (questionType === 'choice' || questionType === 'multiple') {
        options = Array.isArray(question.options) ? 
          question.options.map((text: string, index: number) => ({
            label: String.fromCharCode(65 + index), // A, B, C...
            text
          })) : [];
      }
      
      // 构建最终题目对象
      return {
        title: `${libraryName} - 题目 ${uuidv4().substring(0, 8)}`,
        content: question.content || '',
        type: questionType,
        category: question.subject || libraryName,
        difficulty: 'medium', // 默认难度
        options: options,
        answer: question.answer || '',
        explanation: question.analysis || '',
        tags: ['自定义', libraryName],
      };
    });
    
    // 将题目保存到数据库
    const savedQuestions = await Question.insertMany(processedQuestions);
    
    // 返回成功结果
    return NextResponse.json({
      success: true,
      message: '题目保存成功',
      count: savedQuestions.length,
      libraryName
    });
    
  } catch (error) {
    console.error('保存自定义题目时出错:', error);
    return NextResponse.json(
      { error: '保存题目失败' },
      { status: 500 }
    );
  }
}

// 删除自定义题库
export async function DELETE(request: Request) {
  try {
    // 连接到数据库
    await connectToDatabase();
    
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const libraryName = searchParams.get('name');
    
    if (!libraryName) {
      return NextResponse.json(
        { error: '缺少题库名称参数' },
        { status: 400 }
      );
    }
    
    // 删除该题库下的所有题目
    const result = await Question.deleteMany({ 
      tags: libraryName 
    });
    
    return NextResponse.json({
      success: true,
      message: '题库删除成功',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('删除自定义题库失败:', error);
    return NextResponse.json(
      { error: '删除题库失败' },
      { status: 500 }
    );
  }
} 