'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { CheckCircle2, Target, BookOpen, History, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Practice() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">题库练习</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 每日一练卡片 */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    每日一练
                  </CardTitle>
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">今日推荐题目已就绪</p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push('/daily')}
                  >
                    开始今日练习
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 错题本卡片 */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-red-600" />
                  错题本
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">待复习错题</p>
                    <span className="text-lg font-semibold text-red-600">12</span>
                  </div>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => router.push('/mistakes')}
                  >
                    复习错题
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 专项训练卡片 */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  专项训练
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    开始训练
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 题目分类区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  题目分类
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    数据结构
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    算法分析
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    计算机网络
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    操作系统
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 学习进度卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  学习进度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <h3 className="font-medium">本周完成题目</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">70%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <h3 className="font-medium">正确率</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近练习记录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                最近练习
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h3 className="font-medium">二叉树遍历</h3>
                    <p className="text-sm text-gray-500">数据结构 - 树</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">正确率: 80%</p>
                    <p className="text-sm text-gray-500">上次练习: 2小时前</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h3 className="font-medium">排序算法</h3>
                    <p className="text-sm text-gray-500">算法分析 - 排序</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">正确率: 65%</p>
                    <p className="text-sm text-gray-500">上次练习: 昨天</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 