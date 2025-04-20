import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function Daily() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">每日一练</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">连续打卡</p>
                <p className="text-xl font-bold">7 天</p>
              </div>
              <Button>开始练习</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>今日推荐</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">二叉树遍历</h3>
                      <span className="text-sm text-gray-500">数据结构</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">根据你的错题记录推荐</p>
                    <Button variant="outline" size="sm" className="w-full">
                      开始练习
                    </Button>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">动态规划</h3>
                      <span className="text-sm text-gray-500">算法分析</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">根据你的薄弱点推荐</p>
                    <Button variant="outline" size="sm" className="w-full">
                      开始练习
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>打卡记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-green-100 flex items-center justify-center"
                    >
                      <span className="text-green-600">✓</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>学习画像</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">擅长领域</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">排序算法</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">链表操作</span>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">待加强</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">动态规划</span>
                      <span className="text-sm font-medium text-red-500">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">图论</span>
                      <span className="text-sm font-medium text-red-500">52%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-medium mb-2">学习习惯</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">最佳学习时段</span>
                      <span className="text-sm font-medium">14:00-16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">平均专注时长</span>
                      <span className="text-sm font-medium">45分钟</span>
                    </div>
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