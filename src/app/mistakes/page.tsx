import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function Mistakes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">错题本</h1>
            <div className="flex gap-4">
              <Button variant="outline">按知识点</Button>
              <Button variant="outline">按题型</Button>
              <Button>再次练习</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>数据结构</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">二叉树遍历</h3>
                      <span className="text-sm text-red-500">错误次数: 3</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">最近错误: 2小时前</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">查看解析</Button>
                      <Button variant="outline" size="sm">添加笔记</Button>
                      <Button variant="outline" size="sm">标记已掌握</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>算法分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">快速排序</h3>
                      <span className="text-sm text-red-500">错误次数: 2</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">最近错误: 昨天</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">查看解析</Button>
                      <Button variant="outline" size="sm">添加笔记</Button>
                      <Button variant="outline" size="sm">标记已掌握</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>错题统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">总错题数</h3>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">已掌握</h3>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">待复习</h3>
                  <p className="text-2xl font-bold">7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 