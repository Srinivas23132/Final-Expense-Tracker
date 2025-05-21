import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, Image } from "react-bootstrap";
import "./home.css";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/react-toastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const [cUser, setcUser] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [view, setView] = useState("table");

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const [isDarkMode, setIsDarkMode] = useState(false); // Dark/Light Mode state

  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, amount, description, category, date, transactionType } = values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(addTransaction, {
        title,
        amount,
        description,
        category,
        date,
        transactionType,
        userId: cUser._id,
      });

      if (data.success) {
        toast.success(data.message, toastOptions);
        handleClose();
        setRefresh(!refresh);
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error("Something went wrong", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setType("all");
    setStartDate(new Date());
    setEndDate(new Date());
    setFrequency("7");
  };

  const handleTableClick = () => setView("table");
  const handleChartClick = () => setView("chart");

  const handleDownloadCSV = () => {
    if (!transactions.length) {
      toast.warn("No data available to download.", toastOptions);
      return;
    }

    const headers = Object.keys(transactions[0]).filter(
      (key) => key !== "_id" && key !== "__v"
    );

    const csvContent = [
      headers.join(","),
      ...transactions.map((tx) =>
        headers.map((key) => `"${tx[key] ?? ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    document.body.className = isDarkMode ? "dark-mode" : "light-mode";
  }, [isDarkMode]);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user.isAvatarImageSet || !user.avatarImage) {
          navigate("/setAvatar");
        }

        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };

    avatarFunc();
  }, [navigate]);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      if (!cUser || !cUser._id) return;

      try {
        setLoading(true);
        const { data } = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency,
          startDate,
          endDate,
          type,
        });

        setTransactions(data.transactions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [cUser, refresh, frequency, startDate, endDate, type]);

  return (
    <div
      className={`home-page ${isDarkMode ? "dark" : "light"}`}
      style={{
        position: "relative",
        zIndex: 1,
      }}
    >
      <Header />
      {cUser && (
        <div
          style={{
            position: "fixed",
            top: "15px",
            right: "15px",
            display: "flex",
            alignItems: "center",
            zIndex: 1000,
            backgroundColor: "blue",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "calc(100% - 30px)",
          }}
        >
          <span
            style={{
              color: "white",
              marginRight: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              whiteSpace: "nowrap",
            }}
          >
            {cUser.name}
          </span>
          <Image
            src={cUser.avatarImage}
            alt="avatar"
            roundedCircle
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() => navigate("/profile")}
          />
          <Button
            variant="outline-light"
            style={{
              fontSize: "16px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <Container
          style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}
          className="mt-3"
        >
          <div className="filterRow">
            <div className="text-white">
              <Form.Group className="mb-3" controlId="formSelectFrequency">
                <Form.Label>Select Frequency</Form.Label>
                <Form.Select
                  name="frequency"
                  value={frequency}
                  onChange={handleChangeFrequency}
                >
                  <option value="7">Last Week</option>
                  <option value="30">Last Month</option>
                  <option value="365">Last Year</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="text-white type">
              <Form.Group className="mb-3" controlId="formSelectType">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={type} onChange={handleSetType}>
                  <option value="all">All</option>
                  <option value="expense">Debit</option>
                  <option value="credit">Credit</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="text-white iconBtnBox">
              <FormatListBulletedIcon
                sx={{ cursor: "pointer" }}
                onClick={handleTableClick}
                className={view === "table" ? "iconActive" : "iconDeactive"}
              />
              <BarChartIcon
                sx={{ cursor: "pointer" }}
                onClick={handleChartClick}
                className={view === "chart" ? "iconActive" : "iconDeactive"}
              />
            </div>

            <div>
              <Button onClick={handleShow} className="addNew">
                Add New
              </Button>
              <Button onClick={handleShow} className="mobileBtn">
                +
              </Button>
              <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Add Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3" controlId="formName">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        name="title"
                        type="text"
                        placeholder="Enter Transaction Name"
                        value={values.title}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formAmount">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        name="amount"
                        type="number"
                        placeholder="Enter your Amount"
                        value={values.amount}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formSelect">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                      >
                        <option value="">Choose...</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Rent">Rent</option>
                        <option value="Salary">Salary</option>
                        <option value="Tip">Tip</option>
                        <option value="Food">Food</option>
                        <option value="Medical">Medical</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDescription">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        placeholder="Enter Description"
                        value={values.description}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formSelect1">
                      <Form.Label>Transaction Type</Form.Label>
                      <Form.Select
                        name="transactionType"
                        value={values.transactionType}
                        onChange={handleChange}
                      >
                        <option value="credit">Credit</option>
                        <option value="expense">Debit</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDate">
                      <Form.Label>Date</Form.Label>
                      <DatePicker
                        selected={new Date(values.date)}
                        onChange={(date) =>
                          setValues({ ...values, date: date.toISOString() })
                        }
                        className="form-control"
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>

            <div>
              <button onClick={toggleTheme} className="toggle-theme-btn">
                Toggle Theme
              </button>
            </div>
          </div>
          <div>
            {view === "table" ? (
              <TableData transactions={transactions} />
            ) : (
              <Analytics transactions={transactions} />
            )}
          </div>
        </Container>
      )}
    </div>
  );
};

export default Home;
