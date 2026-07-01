import QuizAnswer from "../models/QuizAnswer.js";
import Quiz from "../models/Quiz.js";
import Employee from "../models/Employee.js";


// Submit Answer
export const submitAnswer = async (req, res) => {
  try {
    const { employeeId, questionId, selectedAnswer } = req.body;

    // Check employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check question
    const question = await Quiz.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Prevent duplicate submission
    const alreadyAnswered = await QuizAnswer.findOne({
      employee: employeeId,
      question: questionId,
    });

    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        message: "You already answered this question",
      });
    }

    // Check correctness
    const isCorrect =
      Number(selectedAnswer) === Number(question.correctAnswer);

    const earnedPoints = isCorrect ? question.points : 0;

    // Save answer
    await QuizAnswer.create({
      employee: employeeId,
      question: questionId,
      selectedAnswer,
      isCorrect,
      points: earnedPoints,
    });

    // Update employee points
    employee.points += earnedPoints;
    await employee.save();

    res.json({
      success: true,
      message: isCorrect ? "Correct Answer!" : "Wrong Answer",
      isCorrect,
      earnedPoints,
      totalPoints: employee.points,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const resetQuizAnswers = async (req, res) => {
  try {
    await QuizAnswer.deleteMany({});

    res.json({
      success: true,
      message: "All quiz answers cleared successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};