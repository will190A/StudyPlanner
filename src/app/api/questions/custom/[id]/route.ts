import { NextResponse } from 'next/server';
import Question from '@/models/Question';
import { connectToDatabase } from '@/lib/db';

// 删除特定自定义题库
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 连接到数据库
    await connectToDatabase();
    
    const libraryId = params.id;
    
    if (!libraryId) {
      return NextResponse.json(
        { error: '缺少题库ID' },
        { status: 400 }
      );
    }
    
    // 从请求中获取题库名称
    const { searchParams } = new URL(request.url);
    const libraryName = searchParams.get('name');
    
    // 如果没有直接提供题库名称，则从GET调用中查找
    let libName = libraryName;
    if (!libName) {
      // 使用ID的前缀匹配查找题库
      const allLibraries = await fetchAllLibraries();
      const library = allLibraries.find(lib => lib.id.startsWith(libraryId));
      
      if (!library) {
        return NextResponse.json(
          { error: '找不到指定ID的题库' },
          { status: 404 }
        );
      }
      
      libName = library.name;
    }
    
    // 删除该题库下的所有题目
    const result = await Question.deleteMany({ 
      tags: libName 
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

// 辅助函数：获取所有题库
async function fetchAllLibraries() {
  const questions = await Question.find({ 
    tags: { $regex: /^自定义/ }
  });
  
  // 获取所有不同的题库名称
  const libraryMap = new Map();
  
  questions.forEach(question => {
    const libraryTag = question.tags.find((tag: string) => 
      tag !== '自定义' && question.tags.includes('自定义')
    );
    
    if (libraryTag) {
      if (!libraryMap.has(libraryTag)) {
        libraryMap.set(libraryTag, {
          id: Math.random().toString(36).substring(2, 10), // 生成临时ID
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
      }
    }
  });
  
  return Array.from(libraryMap.values());
} 