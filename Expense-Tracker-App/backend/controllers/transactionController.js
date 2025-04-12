import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";

// Helper: Normalize transaction type to either "expense" or "credit"
// If the input (after trimming and lowercasing) equals "expense", then return "expense".
// Otherwise, return "credit".
const normalizeType = (type) => {
  if (!type) return "credit"; // default to credit if not provided
  const val = type.trim().toLowerCase();
  return val === "expense" ? "expense" : "credit";
};

export const addTransactionController = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
    } = req.body;

    // Validate required fields
    if (!title || !amount || !description || !date || !category || !transactionType) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Normalize the transaction type
    const correctedType = normalizeType(transactionType);

    // Create the new transaction with the normalized type
    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType: correctedType,
    });

    // Add the new transaction to the user's transactions array and save
    user.transactions.push(newTransaction);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction added successfully",
      transaction: newTransaction,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // Build the query with the user condition
    const query = { user: userId };

    // If a specific type is provided (other than "all"), normalize it
    if (type && type !== "all") {
      query.transactionType = normalizeType(type);
    }

    // Apply date filters based on frequency or custom range
    if (frequency !== "custom") {
      query.date = {
        $gt: moment().subtract(Number(frequency), "days").toDate(),
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate(),
      };
    }

    const transactions = await Transaction.find(query);
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const transactionElement = await Transaction.findByIdAndDelete(transactionId);
    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Remove the deleted transaction from the user's transactions array
    user.transactions = user.transactions.filter(
      (transaction) => transaction.toString() !== transactionId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, description, date, category, transactionType } = req.body;

    const transactionElement = await Transaction.findById(transactionId);
    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (title) transactionElement.title = title;
    if (description) transactionElement.description = description;
    if (amount) transactionElement.amount = amount;
    if (category) transactionElement.category = category;
    if (transactionType) {
      transactionElement.transactionType = normalizeType(transactionType);
    }
    if (date) transactionElement.date = date;

    await transactionElement.save();

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction: transactionElement,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
