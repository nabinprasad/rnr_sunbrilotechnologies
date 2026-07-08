import QuizAnswer from "../models/QuizAnswer.js";
import Quiz from "../models/Quiz.js";
import Employee from "../models/Employee.js";


// Submit Answer
export const submitAnswer = async (req, res) => {
  try {
    const { employeeId, questionId, selectedAnswer, timeTaken } = req.body;

    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required",
      });
    }

    if (selectedAnswer === null || selectedAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: "Selected answer is required",
      });
    }

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

    // Calculate speed bonus (faster answer = more points)
    // If answered in less than half the time, get bonus
    let speedBonus = 0;
    const timeLimit = question.timer || 30;
    if (isCorrect && timeTaken < timeLimit / 2) {
      speedBonus = Math.ceil(earnedPoints * 0.5);
    }

    const totalPoints = earnedPoints + speedBonus;

    // Save answer
    await QuizAnswer.create({
      employee: employeeId,
      question: questionId,
      selectedAnswer,
      isCorrect,
      points: totalPoints,
      timeTaken: timeTaken || 0,
    });

    // Update employee points
    employee.points += totalPoints;
    await employee.save();

    res.json({
      success: true,
      message: isCorrect ? "Correct Answer!" : "Wrong Answer",
      isCorrect,
      earnedPoints: totalPoints,
      speedBonus,
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

// Reset specific employee's answers (allow re-participation)
export const resetEmployeeAnswers = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get all answers from this employee
    const answers = await QuizAnswer.find({ employee: employeeId });

    // Subtract points back from employee
    const totalPoints = answers.reduce((sum, ans) => sum + ans.points, 0);
    employee.points = Math.max(0, employee.points - totalPoints);
    await employee.save();

    // Delete all answers from this employee
    await QuizAnswer.deleteMany({ employee: employeeId });

    res.json({
      success: true,
      message: `${employee.name} can now participate again. Points reset.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all quiz answers
export const getQuizAnswers = async (req, res) => {
  try {
    const answers = await QuizAnswer.find();
    res.json({ success: true, answers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};