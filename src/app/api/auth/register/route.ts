import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }

    console.log('正在连接数据库...');
    try {
      await connectDB();
      console.log('数据库连接成功');
    } catch (dbError) {
      console.error('数据库连接错误:', dbError);
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }
    
    try {
      // 检查用户是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: '用户已存在' },
          { status: 400 }
        );
      }
    } catch (findError) {
      console.error('检查用户存在时出错:', findError);
      return NextResponse.json(
        { error: '检查用户是否存在时出错' },
        { status: 500 }
      );
    }
    
    // 加密密码
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('密码加密错误:', hashError);
      return NextResponse.json(
        { error: '密码处理出错' },
        { status: 500 }
      );
    }
    
    // 创建新用户
    try {
      // 确保数据库模型已正确初始化
      if (mongoose.connection.readyState === 1) {
        const collections = await mongoose.connection.db.collections();
        const usersCollection = collections.find(c => c.collectionName === 'users');
        if (usersCollection) {
          await usersCollection.dropIndexes();
        }
      }

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      
      return NextResponse.json(
        { 
          id: user._id,
          name: user.name,
          email: user.email,
        },
        { status: 201 }
      );
    } catch (createError) {
      console.error('创建用户时出错:', createError);
      if (createError.code === 11000) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: '创建用户时出错' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('注册过程中出现意外错误:', error);
    return NextResponse.json(
      { error: '注册过程中出现意外错误' },
      { status: 500 }
    );
  }
} 