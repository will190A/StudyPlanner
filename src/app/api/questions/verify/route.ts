import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connect from '@/lib/db';
import Question from '@/models/Question';
import Mistake from '@/models/Mistake';

export async function POST(request: Request) {
  try {
    let userId;
    const data = await request.json();
    const { questionId, userAnswer, userId: requestUserId } = data;
    
    // 检查请求中是否包含userId
    if (requestUserId) {
      userId = requestUserId;
    } else {
      // 如果没有提供userId，则检查用户是否已登录
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }
    
    if (!questionId || userAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await connect();
    
    // 获取题目
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    // 记录调试信息
    console.log('问题ID:', questionId);
    console.log('问题类型:', question.type);
    console.log('正确答案:', question.answer);
    console.log('用户答案:', userAnswer);
    console.log('正确答案类型:', typeof question.answer);
    console.log('用户答案类型:', typeof userAnswer);
    
    // 检查答案是否正确
    let isCorrect = false;
    
    if (Array.isArray(question.answer)) {
      // 多选题
      console.log('多选题答案验证');
      if (Array.isArray(userAnswer)) {
        // 排序两个数组，确保顺序不同但内容相同的答案也能被判定为正确
        const sortedCorrectAnswer = [...question.answer].sort();
        const sortedUserAnswer = [...userAnswer].sort();
        
        console.log('排序后正确答案:', sortedCorrectAnswer);
        console.log('排序后用户答案:', sortedUserAnswer);
        
        // 检查长度是否相同
        if (sortedCorrectAnswer.length === sortedUserAnswer.length) {
          // 检查每个元素是否相同
          isCorrect = sortedCorrectAnswer.every((ans, index) => ans === sortedUserAnswer[index]);
          console.log('数组长度相同，逐个比较结果:', isCorrect);
        }
      }
    } else {
      // 单选题、判断题、填空题或编程题
      console.log('单选/判断/填空题答案验证');
      isCorrect = question.answer === userAnswer;
      console.log('严格比较结果:', isCorrect);
      
      // 如果不相等，尝试更宽松的比较
      if (!isCorrect) {
        console.log('严格比较不相等，尝试更宽松比较');
        const trimmedCorrect = String(question.answer).trim();
        const trimmedUser = String(userAnswer).trim();
        console.log('修剪后正确答案:', trimmedCorrect);
        console.log('修剪后用户答案:', trimmedUser);
        isCorrect = trimmedCorrect === trimmedUser;
        console.log('宽松比较结果:', isCorrect);
        
        // 如果空格比较仍不相等，尝试不区分大小写的比较
        if (!isCorrect) {
          console.log('宽松比较不相等，尝试不区分大小写比较');
          const lowerCorrect = trimmedCorrect.toLowerCase();
          const lowerUser = trimmedUser.toLowerCase();
          console.log('小写后正确答案:', lowerCorrect);
          console.log('小写后用户答案:', lowerUser);
          isCorrect = lowerCorrect === lowerUser;
          console.log('不区分大小写比较结果:', isCorrect);
          
          // 对单选题进行特殊处理：检查用户提交的是否是选项标签（如A、B、C、D）
          if (!isCorrect && question.type === 'choice' && question.options && question.options.length > 0) {
            console.log('单选题，检查选项标签');
            // 假设用户提交的是选项标签（比如"A"、"B"、"C"）
            const selectedOption = question.options.find((opt: { label: string; text: string }) => opt.label === trimmedUser);
            
            if (selectedOption) {
              console.log('找到匹配的选项:', selectedOption);
              // 检查选项文本是否与正确答案匹配
              isCorrect = selectedOption.text === question.answer || 
                          selectedOption.text.trim() === trimmedCorrect || 
                          selectedOption.text.trim().toLowerCase() === lowerCorrect;
              console.log('选项文本比较结果:', isCorrect);
              
              // 如果该选项即为正确答案，则直接标记为正确
              if (isCorrect) {
                console.log('用户选择的选项是正确答案');
              }
            } else {
              console.log('未找到匹配的选项标签');
              
              // 反向检查：用户提交的可能是答案文本，而正确答案存储的是选项标签
              const correctOption = question.options.find((opt: { label: string; text: string }) => 
                opt.text === question.answer || 
                opt.text.trim() === trimmedCorrect || 
                opt.text.trim().toLowerCase() === lowerCorrect
              );
              
              if (correctOption && correctOption.label === trimmedUser) {
                console.log('用户提交的标签与正确答案对应的选项标签匹配');
                isCorrect = true;
              }
            }
          }
          
          // 对于填空题和判断题，进一步增强比较机制
          if (!isCorrect && (question.type === 'fill' || question.type === 'judge')) {
            // 尝试移除所有空格和标点符号后比较
            console.log('进一步宽松比较，移除标点和空格');
            const cleanCorrect = lowerCorrect.replace(/[.,;:'"!?，。；：''""！？\s]/g, '');
            const cleanUser = lowerUser.replace(/[.,;:'"!?，。；：''""！？\s]/g, '');
            console.log('清理后正确答案:', cleanCorrect);
            console.log('清理后用户答案:', cleanUser);
            isCorrect = cleanCorrect === cleanUser;
            console.log('清理后比较结果:', isCorrect);
            
            // 对判断题特殊处理
            if (!isCorrect && question.type === 'judge') {
              // 处理"正确/错误"和"对/错"等不同表达方式
              const judgeMap: {[key: string]: boolean} = {
                'true': true, '正确': true, '对': true, 't': true, '是': true, 'yes': true, 'y': true, '1': true,
                'false': false, '错误': false, '错': false, 'f': false, '否': false, 'no': false, 'n': false, '0': false
              };
              
              const correctBool = judgeMap[cleanCorrect];
              const userBool = judgeMap[cleanUser];
              
              if (correctBool !== undefined && userBool !== undefined) {
                isCorrect = correctBool === userBool;
                console.log('判断题映射比较结果:', isCorrect);
              }
            }
          }
        }
      }
    }
    
    console.log('最终是否正确:', isCorrect);
    
    // 如果答案不正确，记录错题
    if (!isCorrect) {
      const existingMistake = await Mistake.findOne({ 
        userId, 
        questionId: question._id 
      });
      
      if (existingMistake) {
        // 更新已有错题记录
        existingMistake.wrongCount += 1;
        existingMistake.lastWrongDate = new Date();
        existingMistake.wrongAnswer = userAnswer;
        existingMistake.status = 'unresolved';
        await existingMistake.save();
      } else {
        // 创建新的错题记录
        const mistake = new Mistake({
          userId,
          questionId: question._id,
          category: question.category,
          wrongAnswer: userAnswer,
          status: 'unresolved'
        });
        await mistake.save();
      }
    }
    
    return NextResponse.json({
      isCorrect,
      correctAnswer: isCorrect ? null : question.answer,
      explanation: question.explanation // 无论正确与否都返回解释
    });
  } catch (error) {
    console.error('Error verifying answer:', error);
    return NextResponse.json({ error: 'Failed to verify answer' }, { status: 500 });
  }
} 