import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

dotenv.config();

const app = express();

// 🔗 Middlewares
app.use(cors());
app.use(express.json());

// 🔗 log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 🔗 handle invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Invalid JSON body');
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next();
});

// 🚀 Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🚀 Judge0 setup
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions/?base64_encoded=false&wait=true';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

const langMap = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63
};

// ✅ Registration
app.post('/api/register', async (req, res) => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      console.error(authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;
    if (!userId) return res.status(500).json({ error: 'Failed to create user in auth' });

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: userId, full_name, role }]);

    if (profileError) {
      console.error(profileError);
      return res.status(500).json({ error: profileError.message });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return res.status(401).json({ error: 'Please confirm your email before logging in.' });
    }
    console.error(error);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error(profileError);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }

  res.json({ user: { id: data.user.id, email: data.user.email, role: profile.role } });
});

// ✅ Get a contest by ID (with questions)
app.get('/api/student/contest/:id', async (req, res) => {
  const contestId = req.params.id;

  try {
    // Fetch the contest
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contestId)
      .single();

    if (contestError || !contest) {
      console.error(contestError);
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Fetch the questions for this contest
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, title, description')
      .eq('contest_id', contestId);

    if (questionsError) {
      console.error(questionsError);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.json({
      contest,
      questions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get a specific question
app.get('/api/student/question/:id', async (req, res) => {
  const questionId = req.params.id;

  try {
    const { data: question, error } = await supabase
      .from('questions')
      .select('id, title, description, difficulty, points, sample_input, sample_output, starter_code')
      .eq('id', questionId)
      .single();

    if (error || !question) {
      console.error(error);
      return res.status(404).json({ error: 'Question not found' });
    }

    // Map DB fields to frontend expectations
    res.json({
      id: question.id,
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      points: question.points,
      sampleInput: question.sample_input,
      sampleOutput: question.sample_output,
      starterCode: question.starter_code
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// ✅ Create contest
app.post('/api/contests', async (req, res) => {
  const { title, description, teacher_id, start_time, end_time } = req.body;

  if (!title || !description || !teacher_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data: teacher, error: teacherError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', teacher_id)
    .single();

  if (teacherError || !teacher || teacher.role !== 'teacher') {
    console.error(teacherError);
    return res.status(403).json({ error: 'Not authorized: not a teacher' });
  }

  const { data, error } = await supabase
    .from('contests')
    .insert([{ title, description, created_by: teacher_id, start_time, end_time }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create contest' });
  }

  res.status(201).json(data);
});

// ✅ Get contests
app.get('/api/contests', async (req, res) => {
  const { data, error } = await supabase
    .from('contests')
    .select(`id,title,description,start_time,end_time,created_by,created_at`)
    .order('start_time', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch contests' });
  }

  res.json(data);
});

// ✅ Create question
app.post('/api/questions', async (req, res) => {
  const { contest_id, title, description, sample_input, sample_output, hidden_input, hidden_output } = req.body;

  if (!contest_id || !title || !description || !sample_input || !sample_output) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('questions')
    .insert([{ contest_id, title, description, sample_input, sample_output, hidden_input, hidden_output }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create question' });
  }

  res.status(201).json(data);
});

// ✅ Delete question
app.delete('/api/questions/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from('questions').delete().eq('id', id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete question' });
  }

  res.json({ message: 'Question deleted successfully' });
});

// ✅ Add testcase
app.post('/api/testcases', async (req, res) => {
  const { question_id, input, output, is_hidden } = req.body;

  if (!question_id || !input || !output) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('testcases')
    .insert([{ question_id, input, output, is_hidden: is_hidden || false }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to add testcase' });
  }

  res.status(201).json(data);
});

// ✅ Submit code
app.post('/api/submissions', async (req, res) => {
  const { student_id, contest_id, question_id, code, language, input, expected_output } = req.body;

  if (!student_id || !contest_id || !question_id || !code || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const language_id = langMap[language];
    if (!language_id) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    const judgeRes = await axios.post(
      JUDGE0_API_URL,
      {
        source_code: code,
        language_id,
        stdin: input || '',
        expected_output: expected_output || ''
      },
      { headers: JUDGE0_HEADERS }
    );

    const judgeResult = judgeRes.data;

    console.log('✅ Judge0 response:', judgeResult);

    const statusDesc = judgeResult?.status?.description || 'Failed';
    const isSolved = statusDesc === 'Accepted';

    const { error: dbError } = await supabase
      .from('submissions')
      .insert([{
        student_id,
        contest_id,
        question_id,
        code,
        language,
        status: isSolved ? 'solved' : 'failed',
        score: isSolved ? 100 : 0
      }]);

    if (dbError) {
      console.error(dbError);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    res.json({ judge0_result: judgeResult, verdict: statusDesc });

  } catch (err) {
    console.error('❌ Judge0 error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to submit to Judge0',
      details: err.response?.data || err.message
    });
  }
});

// ✅ Leaderboard
app.get('/api/leaderboard/:contestId', async (req, res) => {
  const contestId = req.params.contestId;

  const { data, error } = await supabase
    .from('submissions')
    .select(`student_id, score`)
    .eq('contest_id', contestId);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }

  const leaderboard = {};
  data.forEach(sub => {
    if (!leaderboard[sub.student_id]) leaderboard[sub.student_id] = 0;
    leaderboard[sub.student_id] += sub.score;
  });

  const result = Object.entries(leaderboard)
    .map(([student_id, total_score]) => ({ student_id, total_score }))
    .sort((a, b) => b.total_score - a.total_score);

  res.json(result);
});


// ✅ Healthcheck
app.get('/', (req, res) => {
  res.send('🚀 CodeClash Backend is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
