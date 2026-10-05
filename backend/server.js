import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// 1. Root diagnostic route (To test http://localhost:5000 in your browser)
app.get('/', (req, res) => {
  res.send('Don\'t Block Me API is up and running!');
});

// 2. POST route: Save quiz and questions
app.post('/api/quizzes', async (req, res) => {
  console.log("📥 Incoming Request Body:", req.body);

  const { creatorName, email, questions } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ MySQL Connected Successfully");

    await connection.beginTransaction();

    const [quizResult] = await connection.execute(
      'INSERT INTO quizzes (creator_name, email) VALUES (?, ?)',
      [creatorName, email]
    );

    const quizId = quizResult.insertId;
    console.log(`📌 Quiz inserted with ID: ${quizId}`);

    for (const q of questions) {
      await connection.execute(
        'INSERT INTO questions (quiz_id, question, option_a, option_b, correct_answer) VALUES (?, ?, ?, ?, ?)',
        [quizId, q.question, q.optionA, q.optionB, q.correctAnswer]
      );
    }

    await connection.commit();
    console.log("🎉 Transaction Committed Successfully!");

    res.status(201).json({ success: true, quizId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ SQL Error encountered:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 3. GET route: Fetch quiz by ID (For friends taking the quiz)
app.get('/api/quizzes/:id', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const quizId = req.params.id;

    const [quizRows] = await connection.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const [questionRows] = await connection.execute(
      'SELECT question, option_a as optionA, option_b as optionB, correct_answer as correctAnswer FROM questions WHERE quiz_id = ?',
      [quizId]
    );

    res.json({
      success: true,
      quiz: {
        id: quizRows[0].id,
        creatorName: quizRows[0].creator_name,
        email: quizRows[0].email,
        questions: questionRows
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// ALWAYS KEEP app.listen() AT THE VERY BOTTOM
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});