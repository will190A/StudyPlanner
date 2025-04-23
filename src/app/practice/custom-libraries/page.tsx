'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LibraryBig, Search, Loader2, BrainCircuit, Edit, Trash2, Play, BookOpen } from 'lucide-react';

export default function CustomLibraries() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // 获取用户ID
  const getUserId = () => {
    if (session?.user && 'id' in session.user) {
      return session.user.id as string;
    }
    return '6804c5d6112eb76d7c0ec957'; // 默认ID
  };
  
  // 加载用户的自定义题库
  useEffect(() => {
    fetchLibraries();
  }, [session]);
  
  const fetchLibraries = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = getUserId();
      const response = await fetch(`/api/questions/custom?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('获取题库失败');
      }
      
      const data = await response.json();
      setLibraries(data.libraries || []);
      
    } catch (error: any) {
      console.error('获取题库错误:', error);
      setError(error.message || '获取题库失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 创建练习
  const createPractice = async (libraryId: string, libraryName: string) => {
    try {
      setLoading(true);
      
      const userId = getUserId();
      
      const response = await fetch('/api/practices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'custom',
          libraryName,
          title: `${libraryName} 练习`,
          count: 0, // 使用题库中的所有题目
          userId
        })
      });
      
      if (!response.ok) {
        throw new Error('创建练习失败');
      }
      
      const data = await response.json();
      router.push(`/practice/${data.practice._id}`);
      
    } catch (error) {
      console.error('创建练习错误:', error);
      setError('创建练习失败，请重试');
      setLoading(false);
    }
  };
  
  // 删除题库
  const deleteLibrary = async () => {
    if (!selectedLibrary) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/questions/custom/${selectedLibrary.id}?name=${encodeURIComponent(selectedLibrary.name)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('删除题库失败');
      }
      
      // 关闭对话框
      setDeleteConfirmOpen(false);
      // 重新加载题库列表
      await fetchLibraries();
      
    } catch (error: any) {
      console.error('删除题库错误:', error);
      setError(error.message || '删除题库失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 过滤题库
  const filteredLibraries = libraries.filter(lib => 
    lib.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">自定义题库</h1>
              <p className="text-gray-600 mt-1">管理您通过智能导题创建的自定义题库</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索题库..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                className="ml-2 bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push('/practice/smart-import')}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                创建题库
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">正在加载题库...</span>
            </div>
          ) : filteredLibraries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLibraries.map((library) => (
                <Card key={library.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{library.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {library.questionCount || 0} 道题目 · {new Date(library.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <LibraryBig className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {library.description || `包含${library.categories?.join('、') || '多个类型'}的题目`}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedLibrary(library);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createPractice(library.id, library.name)}
                      disabled={loading}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      开始练习
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {searchTerm ? '没有找到匹配的题库' : '还没有创建自定义题库'}
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm ? '尝试使用其他关键词搜索' : '使用智能导题功能创建您的第一个自定义题库'}
              </p>
              {!searchTerm && (
                <Button
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/practice/smart-import')}
                >
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  开始创建题库
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除题库</DialogTitle>
            <DialogDescription>
              您确定要删除题库 "{selectedLibrary?.name}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={deleteLibrary} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 