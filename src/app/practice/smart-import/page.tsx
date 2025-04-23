'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, BookText, File, Plus, Save, FileText, Copy, LibraryBig } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

const questionTypes = [
  { id: 'choice', label: '单选题' },
  { id: 'multiple', label: '多选题' },
  { id: 'judge', label: '判断题' },
  { id: 'fill', label: '填空题' },
  { id: 'essay', label: '简答题' },
];

export default function SmartImport() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [activeTab, setActiveTab] = useState('courseName');
  const [courseName, setCourseName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionTypeSelection, setQuestionTypeSelection] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [libraryName, setLibraryName] = useState('');
  
  // 处理题型选择
  const handleTypeChange = (type: string) => {
    setQuestionTypeSelection(prevSelection =>
      prevSelection.includes(type)
        ? prevSelection.filter(t => t !== type)
        : [...prevSelection, type]
    );
  };
  
  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // 生成题目
  const handleGenerateQuestions = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      setGeneratedQuestions([]);
      
      if (questionTypeSelection.length === 0) {
        setError('请至少选择一种题型');
        setIsLoading(false);
        return;
      }
      
      if (activeTab === 'courseName' && !courseName) {
        setError('请输入课程名称');
        setIsLoading(false);
        return;
      }
      
      if (activeTab === 'file' && !file) {
        setError('请上传文件');
        setIsLoading(false);
        return;
      }
      
      if (activeTab === 'text' && !textContent) {
        setError('请输入课本内容');
        setIsLoading(false);
        return;
      }
      
      const formData = new FormData();
      
      if (activeTab === 'courseName') {
        formData.append('courseName', courseName);
      }
      
      if (activeTab === 'file' && file) {
        formData.append('file', file);
      }
      
      if (activeTab === 'text') {
        // 将文本内容转换为文件对象
        // @ts-ignore
        const textFile = new File([textContent], "content.txt", { type: "text/plain" });
        formData.append('file', textFile);
        
        // 如果有课程名称也一并提交
        if (courseName) {
          formData.append('courseName', courseName);
        }
      }
      
      // 添加选择的题型
      formData.append('types', JSON.stringify(questionTypeSelection));
      
      // 显示生成中的信息
      setSuccess('正在使用AI生成题目，可能需要20-30秒，请耐心等待...');
      
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '生成题目失败');
      }
      
      if (data.questions && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setSuccess(`成功生成 ${data.questions.length} 道题目`);
        
        // 自动设置题库名称（如果未设置）
        if (!libraryName) {
          setLibraryName(courseName ? `${courseName}题库` : `自定义题库-${new Date().toLocaleDateString()}`);
        }
      } else {
        throw new Error('返回数据格式错误');
      }
    } catch (error: any) {
      console.error('生成题目错误:', error);
      setError(error.message || '生成题目失败，请重试');
      // 清除之前的成功消息
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 保存到题库
  const handleSaveToLibrary = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (generatedQuestions.length === 0) {
        setError('没有题目可以保存');
        setIsLoading(false);
        return;
      }
      
      if (!libraryName) {
        setError('请输入题库名称');
        setIsLoading(false);
        return;
      }
      
      // 获取当前用户ID
      const userId = session?.user && 'id' in session.user 
        ? session.user.id as string 
        : '6804c5d6112eb76d7c0ec957'; // 默认ID
      
      // 准备要保存的数据
      const saveData = {
        libraryName,
        questions: generatedQuestions,
        userId
      };
      
      const response = await fetch('/api/questions/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });
      
      if (!response.ok) {
        throw new Error('保存到题库失败');
      }
      
      setSuccess('题目已成功保存到题库');
      // 重置生成的题目
      setGeneratedQuestions([]);
      setLibraryName('');
      
      // 3秒后跳转到题库练习页面
      setTimeout(() => {
        router.push('/practice');
      }, 3000);
      
    } catch (error: any) {
      console.error('保存题目错误:', error);
      setError(error.message || '保存题目失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">智能导题</h1>
          
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/practice/custom-libraries')}
              className="flex items-center"
            >
              <LibraryBig className="w-4 h-4 mr-2" />
              查看我的题库
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>导入方式</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="courseName">
                        <BookText className="mr-2 h-4 w-4" />
                        课程名称
                      </TabsTrigger>
                      <TabsTrigger value="text">
                        <Copy className="mr-2 h-4 w-4" />
                        粘贴内容
                      </TabsTrigger>
                      <TabsTrigger value="file">
                        <Upload className="mr-2 h-4 w-4" />
                        上传文件
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="courseName" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="courseName">课程名称</Label>
                          <Input
                            id="courseName"
                            placeholder="例如: 操作系统、数据结构"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label htmlFor="textContent">课本内容</Label>
                            <Label htmlFor="courseName-text" className="text-xs text-gray-500">课程名称（选填）</Label>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <Input
                              id="courseName-text"
                              placeholder="课程名称（选填）"
                              className="w-1/3"
                              value={courseName}
                              onChange={(e) => setCourseName(e.target.value)}
                            />
                          </div>
                          <Textarea
                            id="textContent"
                            placeholder="粘贴课本章节内容、学习笔记或相关资料..."
                            className="min-h-[200px]"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="file" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label htmlFor="file">上传教材或题库</Label>
                            <Label htmlFor="courseName-file" className="text-xs text-gray-500">课程名称（选填）</Label>
                          </div>
                          <Input
                            id="courseName-file"
                            placeholder="课程名称（选填）"
                            className="mb-2"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                          />
                          <div className="mt-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="space-y-2 text-center">
                              <FileText className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer text-blue-600 hover:text-blue-500">
                                  <span>点击上传文件</span>
                                  <Input
                                    id="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.json"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">或拖放文件到此处</p>
                              </div>
                              <p className="text-xs text-gray-500">支持 PDF, TXT, DOC, DOCX, XLS, XLSX, JSON</p>
                            </div>
                          </div>
                          {file && (
                            <p className="mt-2 text-sm text-gray-500">已选择文件: {file.name}</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">选择题型（可多选）</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      {questionTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type.id}`}
                            checked={questionTypeSelection.includes(type.id)}
                            onCheckedChange={() => handleTypeChange(type.id)}
                          />
                          <Label htmlFor={`type-${type.id}`}>{type.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-6"
                    onClick={handleGenerateQuestions}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在生成...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        生成题目
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>预览生成的题目</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <BookText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">还没有生成题目</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        选择导入方式，然后点击"生成题目"按钮开始生成
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="libraryName">题库名称</Label>
                        <Input
                          id="libraryName"
                          placeholder="输入题库名称"
                          className="mt-1"
                          value={libraryName}
                          onChange={(e) => setLibraryName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {generatedQuestions.map((question, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-white">
                            <h3 className="font-medium mb-2">题目 {index + 1}: {question.type === 'choice' ? '选择题' : 
                                                                                question.type === 'multiple' ? '多选题' : 
                                                                                question.type === 'judge' ? '判断题' : 
                                                                                question.type === 'fill' ? '填空题' : '简答题'}</h3>
                            <p className="mb-2">{question.content}</p>
                            
                            {['choice', 'multiple'].includes(question.type) && question.options && (
                              <div className="ml-4 mb-4">
                                {question.options.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="flex items-start space-x-2 mb-1">
                                    <span>{String.fromCharCode(65 + optIndex)}.</span>
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="font-medium">答案：{Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}</p>
                              <p className="text-sm text-gray-600 mt-1">{question.analysis}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleSaveToLibrary}
                        disabled={isLoading || !libraryName}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            正在保存...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            添加到题库
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 