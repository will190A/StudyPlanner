import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Question {
  id: string;
  content: string;
  options?: string[];
  answer: string;
  analysis: string;
  type: string;
  subject: string;
}

const questionTypes = [
  { id: 'single_choice', label: '单选题' },
  { id: 'multiple_choice', label: '多选题' },
  { id: 'fill_blank', label: '填空题' },
  { id: 'short_answer', label: '简答题' },
];

export function SmartQuestionGenerator() {
  const [courseName, setCourseName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerate = async () => {
    if (!courseName || selectedTypes.length === 0) {
      toast({
        title: "错误",
        description: "请填写课程名称并选择至少一种题型",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('courseName', courseName);
      formData.append('types', JSON.stringify(selectedTypes));
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('生成题目失败');
      }

      const data = await response.json();
      setGeneratedQuestions(data.questions);
      
      toast({
        title: "成功",
        description: "题目生成成功",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "生成题目时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToBank = async (question: Question) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error('添加到题库失败');
      }

      toast({
        title: "成功",
        description: "题目已添加到题库",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "添加到题库时发生错误",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>智能导题</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="courseName">课程名称</Label>
            <Input
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="例如：操作系统、数据结构"
            />
          </div>

          <div>
            <Label>上传教材或题库文件</Label>
            <Input
              type="file"
              accept=".pdf,.txt,.xlsx,.json"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <Label>选择题型</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {questionTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeChange(type.id)}
                  />
                  <Label htmlFor={type.id}>{type.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '生成中...' : '生成题目'}
          </Button>

          {generatedQuestions.length > 0 && (
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold">生成的题目</h3>
              {generatedQuestions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="font-medium">{question.content}</p>
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, index) => (
                            <p key={index}>{option}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        答案：{question.answer}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        解析：{question.analysis}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleAddToBank(question)}
                      >
                        添加到题库
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 