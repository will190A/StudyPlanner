import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StudyPlan from '@/models/StudyPlan';

export async function POST(req: Request) {
  try {
    const { userId, subjects, startDate, endDate, dailyHours, tasks } = await req.json();
    
    await connectDB();
    
    const plan = await StudyPlan.create({
      userId,
      subjects,
      startDate,
      endDate,
      dailyHours,
      tasks,
    });
    
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating study plan' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    await connectDB();
    
    const plans = await StudyPlan.find({ userId });
    
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching study plans' },
      { status: 500 }
    );
  }
} 