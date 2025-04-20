import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function Practice() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">题库练习</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>练习模式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    顺序刷题
                  </Button>
                  <Button className="w-full" variant="outline">
                    随机练习
                  </Button>
                  <Button className="w-full" variant="outline">
                    专项练习
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>题目分类</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    数据结构
                  </Button>
                  <Button className="w-full" variant="outline">
                    算法分析
                  </Button>
                  <Button className="w-full" variant="outline">
                    计算机网络
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>最近练习</CardTitle>
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