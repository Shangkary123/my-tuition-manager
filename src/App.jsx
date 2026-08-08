import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

const LEVELS = [
  "Preschool",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const SUBJECTS = [
  "Bahasa Melayu",
  "English",
  "Tamil",
  "Maths",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

const TIME_SLOTS = [
  "6:00 PM",
  "7:30 PM",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const START_YEAR = 2026;
const START_MONTH = 7; // August = 7

const createPayment = () => ({
  status: "Pending",
  method: "",
  timestamp: "",
});

const initialStudents = [
  {
    id: 1,
    name: "Sarah Lim",
    parent: "Mrs Lim",
    phone: "012-3456789",
    level: "Year 4",
    subjects: ["Maths", "English"],
    dlp: true,
    days: ["Monday", "Wednesday"],
    timeSlot: "6:00 PM",
    fee: 120,

    payments: {
      "2026-08": createPayment(),
    },
  },

  {
    id: 2,
    name: "Adam Tan",
    parent: "Mr Tan",
    phone: "013-4567890",
    level: "Year 2",
    subjects: ["Bahasa Melayu"],
    dlp: false,
    days: ["Tuesday"],
    timeSlot: "7:30 PM",
    fee: 100,

    payments: {
      "2026-08": createPayment(),
    },
  },
];

const emptyForm = {
  name: "",
  parent: "",
  phone: "",
  level: "",
  subjects: [],
  dlp: false,
  days: [],
  timeSlot: "",
  fee: "",
};

function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem(
      "my-tuition-students"
    );

    if (!saved) {
      return initialStudents;
    }

    try {
      const parsed = JSON.parse(saved);

      return parsed.map((student) => ({
        ...student,
        payments: student.payments || {},
      }));
    } catch {
      return initialStudents;
    }
  });

  const [search, setSearch] = useState("");

  const [showStudentModal, setShowStudentModal] =
    useState(false);

  const [editingStudent, setEditingStudent] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  /* =====================================
     MONTH
  ===================================== */

  const [paymentYear, setPaymentYear] =
    useState(START_YEAR);

  const [paymentMonth, setPaymentMonth] =
    useState(START_MONTH);

  const currentMonthKey = `${paymentYear}-${String(
    paymentMonth + 1
  ).padStart(2, "0")}`;

  const currentMonthName =
    MONTH_NAMES[paymentMonth];

  /* =====================================
     PAYMENT METHOD MODAL
  ===================================== */

  const [paymentStudent, setPaymentStudent] =
    useState(null);

  /* =====================================
     SAVE
  ===================================== */

  useEffect(() => {
    localStorage.setItem(
      "my-tuition-students",
      JSON.stringify(students)
    );
  }, [students]);

  /* =====================================
     STUDENT MODAL
  ===================================== */

  const openAddModal = () => {
    setEditingStudent(null);

    setForm({
      ...emptyForm,
      subjects: [],
      days: [],
    });

    setShowStudentModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);

    setForm({
      name: student.name || "",
      parent: student.parent || "",
      phone: student.phone || "",
      level: student.level || "",
      subjects: student.subjects || [],
      dlp: student.dlp || false,
      days: student.days || [],
      timeSlot: student.timeSlot || "",
      fee: student.fee || "",
    });

    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setEditingStudent(null);

    setForm({
      ...emptyForm,
      subjects: [],
      days: [],
    });
  };

  /* =====================================
     FORM
  ===================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleSubject = (subject) => {
    setForm((current) => {
      const exists =
        current.subjects.includes(subject);

      return {
        ...current,
        subjects: exists
          ? current.subjects.filter(
              (item) => item !== subject
            )
          : [
              ...current.subjects,
              subject,
            ],
      };
    });
  };

  const toggleDay = (day) => {
    setForm((current) => {
      const exists =
        current.days.includes(day);

      return {
        ...current,
        days: exists
          ? current.days.filter(
              (item) => item !== day
            )
          : [...current.days, day],
      };
    });
  };

  /* =====================================
     SAVE STUDENT
  ===================================== */

  const saveStudent = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert(
        "Please enter the student's name."
      );
      return;
    }

    if (!form.level) {
      alert(
        "Please select the student's year."
      );
      return;
    }

    if (form.subjects.length === 0) {
      alert(
        "Please select at least one subject."
      );
      return;
    }

    if (form.days.length === 0) {
      alert(
        "Please select at least one class day."
      );
      return;
    }

    if (!form.timeSlot) {
      alert(
        "Please select a class batch."
      );
      return;
    }

    const studentData = {
      name: form.name.trim(),
      parent: form.parent.trim(),
      phone: form.phone.trim(),
      level: form.level,
      subjects: form.subjects,
      dlp: form.dlp,
      days: form.days,
      timeSlot: form.timeSlot,
      fee: Number(form.fee) || 0,
    };

    if (editingStudent) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                ...studentData,
                payments:
                  student.payments || {},
              }
            : student
        )
      );
    } else {
      setStudents((current) => [
        ...current,
        {
          id: Date.now(),
          ...studentData,
          payments: {},
        },
      ]);
    }

    closeStudentModal();
  };

  /* =====================================
     DELETE
  ===================================== */

  const deleteStudent = (id) => {
    const student = students.find(
      (item) => item.id === id
    );

    if (!student) return;

    const confirmed = window.confirm(
      `Delete ${student.name} from the student list?`
    );

    if (!confirmed) return;

    setStudents((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /* =====================================
     MONTH NAVIGATION
  ===================================== */

  const changeMonth = (direction) => {
    let newMonth = paymentMonth + direction;
    let newYear = paymentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setPaymentMonth(newMonth);
    setPaymentYear(newYear);
  };

  const canGoPrevious =
    paymentYear > START_YEAR ||
    paymentMonth > START_MONTH;

  /* =====================================
     PAYMENT HELPERS
  ===================================== */

  const getPayment = (student) => {
    return (
      student.payments?.[currentMonthKey] ||
      createPayment()
    );
  };

  const openPaymentMethod = (student) => {
    setPaymentStudent(student);
  };

  const closePaymentMethod = () => {
    setPaymentStudent(null);
  };

  const markPayment = (studentId, method) => {
    const timestamp =
      new Date().toISOString();

    setStudents((current) =>
      current.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        return {
          ...student,

          payments: {
            ...(student.payments || {}),

            [currentMonthKey]: {
              status: "Paid",
              method,
              timestamp,
            },
          },
        };
      })
    );

    closePaymentMethod();
  };

  const clearPayment = (studentId) => {
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        const payments = {
          ...(student.payments || {}),
        };

        delete payments[currentMonthKey];

        return {
          ...student,
          payments,
        };
      })
    );
  };

  const handlePaymentCheckbox = (student) => {
    const payment = getPayment(student);

    if (payment.status === "Paid") {
      clearPayment(student.id);
    } else {
      openPaymentMethod(student);
    }
  };

  /* =====================================
     PAYMENT STATS
  ===================================== */

  const paymentStats = useMemo(() => {
    const total = students.reduce(
      (sum, student) =>
        sum + Number(student.fee || 0),
      0
    );

    const paidStudents = students.filter(
      (student) =>
        getPayment(student).status ===
        "Paid"
    );

    const collected =
      paidStudents.reduce(
        (sum, student) =>
          sum + Number(student.fee || 0),
        0
      );

    return {
      total,
      collected,
      outstanding: total - collected,
      paidCount: paidStudents.length,
      pendingCount:
        students.length -
        paidStudents.length,
    };
  }, [
    students,
    currentMonthKey,
  ]);

  /* =====================================
     SEARCH
  ===================================== */

  const filteredStudents =
    students.filter((student) => {
      const query =
        search.toLowerCase();

      return (
        student.name
          .toLowerCase()
          .includes(query) ||
        student.parent
          .toLowerCase()
          .includes(query) ||
        student.level
          .toLowerCase()
          .includes(query) ||
        student.subjects.some((subject) =>
          subject
            .toLowerCase()
            .includes(query)
        )
      );
    });

  /* =====================================
     DASHBOARD
  ===================================== */

  const todayName =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
      }
    );

  const todayClasses =
    students.filter((student) =>
      (student.days || []).includes(
        todayName
      )
    );

  const pendingStudents =
    students.filter(
      (student) =>
        getPayment(student).status !==
        "Paid"
    );

  /* =====================================
     RENDER
  ===================================== */

  return (
    <div className="app">

      {/* DECORATIONS */}

      <div
        className="garden-decor"
        aria-hidden="true"
      >
        <span className="decor teddy teddy-a">
          🧸
        </span>

        <span className="decor teddy teddy-b">
          🧸
        </span>

        <span className="decor flower flower-a">
          🌸
        </span>

        <span className="decor flower flower-b">
          🌷
        </span>

        <span className="decor flower flower-c">
          🌼
        </span>

        <span className="decor flower flower-d">
          🌸
        </span>

        <span className="decor leaf leaf-a">
          🌿
        </span>

        <span className="decor leaf leaf-b">
          🍃
        </span>
      </div>

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            🧸
          </div>

          <div>
            <h2>My Tuition</h2>
            <span>Manager</span>
          </div>

        </div>

        <nav className="navigation">

          {[
            ["Dashboard", "⌂"],
            ["Students", "♙"],
            ["Classes", "▦"],
            ["Payments", "◉"],
            ["Receipts", "▤"],
          ].map(([page, icon]) => (

            <button
              key={page}
              className={`nav-item ${
                activePage === page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(page)
              }
            >
              <span>{icon}</span>
              {page}
            </button>

          ))}

        </nav>

        <div className="sidebar-flower">
          🌷
        </div>

        <div className="sidebar-footer">

          <div className="user-profile">

            <div className="user-avatar">
              A
            </div>

            <div>
              <strong>Amutha</strong>
              <span>
                Tuition Manager
              </span>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        {/* =================================
            DASHBOARD
        ================================== */}

        {activePage === "Dashboard" && (
          <>

            <header className="topbar">

              <div className="greeting-section">

                <p className="section-label">
                  MY TUITION MANAGER
                </p>

                <div className="greeting-row">

                  <div>

                    <h1>
                      Good morning,
                      Amutha! 🌸
                    </h1>

                    <p className="date">
                      Here's what's
                      happening with your
                      tuition classes today.
                    </p>

                  </div>

                  <div className="header-teddy">
                    🧸
                  </div>

                </div>

              </div>

              <button
                className="add-student"
                onClick={openAddModal}
              >
                <span>+</span>
                Add Student
              </button>

            </header>

            {/* STATS */}

            <section className="stats-grid">

              <div className="stat-card sage-card">

                <div className="stat-icon sage-icon">
                  🧸
                </div>

                <div>
                  <p>Total Students</p>
                  <h3>
                    {students.length}
                  </h3>
                </div>

                <span className="card-flower">
                  🌿
                </span>

              </div>

              <div className="stat-card caramel-card">

                <div className="stat-icon caramel-icon">
                  RM
                </div>

                <div>
                  <p>
                    {currentMonthName} Fees
                  </p>

                  <h3>
                    RM{" "}
                    {paymentStats.total.toLocaleString(
                      "en-MY",
                      {
                        minimumFractionDigits: 0,
                      }
                    )}
                  </h3>
                </div>

                <span className="card-flower">
                  🌼
                </span>

              </div>

              <div className="stat-card pink-card">

                <div className="stat-icon pink-icon">
                  !
                </div>

                <div>
                  <p>
                    {currentMonthName} Pending
                  </p>

                  <h3>
                    {paymentStats.pendingCount}
                  </h3>
                </div>

                <span className="card-flower">
                  🌸
                </span>

              </div>

              <div className="stat-card lavender-card">

                <div className="stat-icon lavender-icon">
                  ▦
                </div>

                <div>
                  <p>Today's Classes</p>

                  <h3>
                    {todayClasses.length}
                  </h3>
                </div>

                <span className="card-flower">
                  🌷
                </span>

              </div>

            </section>

            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">

              <div className="panel payment-panel">

                <div className="panel-header">

                  <div>

                    <p className="section-label">
                      {currentMonthName.toUpperCase()}{" "}
                      PAYMENT
                    </p>

                    <h2>
                      Needs attention 🌸
                    </h2>

                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActivePage(
                        "Payments"
                      )
                    }
                  >
                    View payments
                  </button>

                </div>

                <div className="payment-list">

                  {pendingStudents.length ===
                  0 ? (

                    <div className="empty-state">

                      <span>🧸</span>

                      <p>
                        All payments are
                        up to date!
                      </p>

                    </div>

                  ) : (

                    pendingStudents
                      .slice(0, 4)
                      .map((student) => (

                        <div
                          className="payment-row"
                          key={student.id}
                        >

                          <div className="student-avatar">
                            {student.name
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="payment-student">

                            <strong>
                              {student.name}
                            </strong>

                            <span>
                              {student.level}
                            </span>

                          </div>

                          <div className="payment-status">

                            <strong>
                              RM{" "}
                              {Number(
                                student.fee
                              ).toFixed(0)}
                            </strong>

                            <span className="status overdue">
                              Pending
                            </span>

                          </div>

                          <button
                            className="remind-button"
                            onClick={() =>
                              setActivePage(
                                "Payments"
                              )
                            }
                          >
                            View
                          </button>

                        </div>

                      ))

                  )}

                </div>

              </div>

              {/* TODAY */}

              <div className="panel class-panel">

                <div className="panel-header">

                  <div>

                    <p className="section-label">
                      TODAY 🌿
                    </p>

                    <h2>
                      Class schedule
                    </h2>

                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActivePage(
                        "Classes"
                      )
                    }
                  >
                    View calendar
                  </button>

                </div>

                <div className="class-list">

                  {todayClasses.length ===
                  0 ? (

                    <div className="empty-state">

                      <span>🌷</span>

                      <p>
                        No classes scheduled
                        today.
                      </p>

                    </div>

                  ) : (

                    todayClasses.map(
                      (student) => (

                        <div
                          className="class-row"
                          key={student.id}
                        >

                          <div className="class-time">
                            <strong>
                              {student.timeSlot}
                            </strong>
                          </div>

                          <div className="class-dot">
                            🌸
                          </div>

                          <div className="class-info">

                            <strong>
                              {student.name}
                            </strong>

                            <span>
                              {student.subjects.join(
                                " • "
                              )}

                              {student.dlp
                                ? " • DLP"
                                : ""}
                            </span>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            </section>

            <section className="welcome-card">

              <div className="welcome-flower flower-left">
                🌸
              </div>

              <div className="welcome-content">

                <span className="welcome-label">
                  A LITTLE REMINDER 🌿
                </span>

                <h2>
                  Teaching with patience,
                  one student at a time.
                </h2>

                <p>
                  Keep doing what you love,
                  Amutha. The little things
                  make a big difference.
                </p>

              </div>

              <div className="welcome-garden">
                <span>🌷</span>
                <span>🌿</span>
                <span>🧸</span>
                <span>🌸</span>
              </div>

            </section>

          </>
        )}

        {/* =================================
            STUDENTS
        ================================== */}

        {activePage === "Students" && (

          <section className="page-section">

            <div className="page-header">

              <div>

                <p className="section-label">
                  STUDENT DIRECTORY 🧸
                </p>

                <h1>
                  My Students
                </h1>

                <p>
                  Keep track of all your
                  students and their classes.
                </p>

              </div>

              <button
                className="add-student"
                onClick={openAddModal}
              >
                <span>+</span>
                Add Student
              </button>

            </div>

            <div className="student-toolbar">

              <div className="search-box">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search students, parents or subjects..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <div className="student-count">
                {filteredStudents.length}{" "}
                students
              </div>

            </div>

            <div className="students-grid">

              {filteredStudents.length ===
              0 ? (

                <div className="empty-students">

                  <div>🧸</div>

                  <h2>
                    No students found
                  </h2>

                  <p>
                    Try another search or
                    add a new student.
                  </p>

                  <button
                    className="add-student"
                    onClick={openAddModal}
                  >
                    + Add Student
                  </button>

                </div>

              ) : (

                filteredStudents.map(
                  (student) => (

                    <div
                      className="student-card"
                      key={student.id}
                    >

                      <div className="student-card-top">

                        <div className="big-student-avatar">
                          {student.name
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>

                          <h3>
                            {student.name}
                          </h3>

                          <p>
                            {student.parent ||
                              "Parent not added"}
                          </p>

                        </div>

                        <span className="student-flower">
                          🌸
                        </span>

                      </div>

                      <div className="student-level">
                        🎓 {student.level}
                      </div>

                      <div className="student-subjects">

                        {student.subjects.map(
                          (subject) => (

                            <span
                              className="subject-tag"
                              key={subject}
                            >
                              {subject}
                            </span>

                          )
                        )}

                        {student.dlp && (
                          <span className="dlp-tag">
                            DLP
                          </span>
                        )}

                      </div>

                      <div className="student-details">

                        <div>
                          <span>
                            📅 Class days
                          </span>

                          <strong>
                            {student.days.join(
                              " • "
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            ⏰ Batch
                          </span>

                          <strong>
                            {student.timeSlot}
                          </strong>
                        </div>

                        <div>
                          <span>
                            💰 Monthly fee
                          </span>

                          <strong>
                            RM{" "}
                            {Number(
                              student.fee
                            ).toFixed(0)}
                          </strong>
                        </div>

                        <div>
                          <span>
                            📱 Parent phone
                          </span>

                          <strong>
                            {student.phone ||
                              "Not added"}
                          </strong>
                        </div>

                      </div>

                      <div className="student-card-footer">

                        <span className="payment-pill">
                          Monthly billing
                        </span>

                        <div className="student-actions">

                          <button
                            onClick={() =>
                              openEditModal(
                                student
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-action"
                            onClick={() =>
                              deleteStudent(
                                student.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>

        )}

        {/* =================================
            CLASSES / SCHEDULE
        ================================== */}

        {activePage === "Classes" && (

          <section
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0",
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "28px",
                gap: "20px",
              }}
            >

              <div>

                <p className="section-label">
                  WEEKLY SCHEDULE 🌿
                </p>

                <h1
                  style={{
                    margin: "6px 0 8px",
                    fontSize: "38px",
                    lineHeight: "1.15",
                    color: "#3f443d",
                  }}
                >
                  Class Schedule
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#73766f",
                    fontSize: "16px",
                  }}
                >
                  See who is coming, by day
                  and by batch.
                </p>

              </div>

              <div
                style={{
                  fontSize: "42px",
                  lineHeight: 1,
                }}
              >
                🧸
              </div>

            </div>

            {/* SCHEDULE GRID */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: "16px",
                width: "100%",
              }}
            >

              {DAYS.map((day) => {

                const dayStudents =
                  students.filter(
                    (student) =>
                      student.days?.includes(
                        day
                      )
                  );

                const sixPM =
                  dayStudents.filter(
                    (student) =>
                      student.timeSlot ===
                      "6:00 PM"
                  );

                const sevenThirty =
                  dayStudents.filter(
                    (student) =>
                      student.timeSlot ===
                      "7:30 PM"
                  );

                return (

                  <div
                    key={day}
                    style={{
                      minWidth: 0,
                      background:
                        "rgba(255,252,245,0.92)",
                      border:
                        "1px solid rgba(125,135,104,0.17)",
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow:
                        "0 6px 22px rgba(80,70,50,0.06)",
                    }}
                  >

                    {/* DAY HEADER */}

                    <div
                      style={{
                        padding: "18px",
                        background: "#e7edda",
                        borderBottom:
                          "1px solid rgba(125,135,104,0.13)",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                        }}
                      >

                        <div>

                          <h3
                            style={{
                              margin: 0,
                              color:
                                "#454a40",
                              fontSize:
                                "18px",
                            }}
                          >
                            {day}
                          </h3>

                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              color:
                                "#7c806f",
                              fontSize:
                                "12px",
                            }}
                          >
                            {dayStudents.length}{" "}
                            {dayStudents.length ===
                            1
                              ? "student"
                              : "students"}
                          </span>

                        </div>

                        <span
                          style={{
                            fontSize: "20px",
                          }}
                        >
                          🌸
                        </span>

                      </div>

                    </div>

                    {/* 6:00 PM */}

                    <div
                      style={{
                        padding: "16px",
                        borderBottom:
                          "1px dashed rgba(125,135,104,0.16)",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "7px",
                          marginBottom:
                            "12px",
                        }}
                      >

                        <span>⏰</span>

                        <strong
                          style={{
                            color:
                              "#55594f",
                            fontSize:
                              "14px",
                          }}
                        >
                          6:00 PM
                        </strong>

                      </div>

                      {sixPM.length === 0 ? (

                        <div
                          style={{
                            padding:
                              "14px 8px",
                            textAlign:
                              "center",
                            background:
                              "rgba(246,243,235,0.55)",
                            border:
                              "1px dashed rgba(125,135,104,0.18)",
                            borderRadius:
                              "12px",
                            color:
                              "#aaa99f",
                            fontSize:
                              "12px",
                          }}
                        >
                          No class
                        </div>

                      ) : (

                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            gap: "9px",
                          }}
                        >

                          {sixPM.map(
                            (student) => (

                              <div
                                key={
                                  student.id
                                }
                                style={{
                                  padding:
                                    "12px",
                                  background:
                                    "#fffdf8",
                                  border:
                                    "1px solid rgba(125,135,104,0.14)",
                                  borderRadius:
                                    "14px",
                                }}
                              >

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "9px",
                                  }}
                                >

                                  <div
                                    style={{
                                      width:
                                        "34px",
                                      height:
                                        "34px",
                                      minWidth:
                                        "34px",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      borderRadius:
                                        "10px",
                                      background:
                                        "#eadbd2",
                                      color:
                                        "#69584f",
                                      fontSize:
                                        "10px",
                                      fontWeight:
                                        800,
                                    }}
                                  >
                                    {student.name
                                      .slice(
                                        0,
                                        2
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <strong
                                    style={{
                                      color:
                                        "#44473f",
                                      fontSize:
                                        "14px",
                                    }}
                                  >
                                    {
                                      student.name
                                    }
                                  </strong>

                                </div>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    flexWrap:
                                      "wrap",
                                    gap: "5px",
                                    marginTop:
                                      "9px",
                                    paddingLeft:
                                      "43px",
                                  }}
                                >

                                  {student.subjects.map(
                                    (
                                      subject
                                    ) => (

                                      <span
                                        key={
                                          subject
                                        }
                                        style={{
                                          padding:
                                            "4px 7px",
                                          borderRadius:
                                            "7px",
                                          background:
                                            "#f0eee4",
                                          color:
                                            "#666b5c",
                                          fontSize:
                                            "10px",
                                          fontWeight:
                                            600,
                                        }}
                                      >
                                        {subject}
                                      </span>

                                    )
                                  )}

                                  {student.dlp && (
                                    <span
                                      style={{
                                        padding:
                                          "4px 7px",
                                        borderRadius:
                                          "7px",
                                        background:
                                          "#eadff0",
                                        color:
                                          "#74627d",
                                        fontSize:
                                          "10px",
                                        fontWeight:
                                          600,
                                      }}
                                    >
                                      DLP
                                    </span>
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                    {/* 7:30 PM */}

                    <div
                      style={{
                        padding: "16px",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "7px",
                          marginBottom:
                            "12px",
                        }}
                      >

                        <span>⏰</span>

                        <strong
                          style={{
                            color:
                              "#55594f",
                            fontSize:
                              "14px",
                          }}
                        >
                          7:30 PM
                        </strong>

                      </div>

                      {sevenThirty.length ===
                      0 ? (

                        <div
                          style={{
                            padding:
                              "14px 8px",
                            textAlign:
                              "center",
                            background:
                              "rgba(246,243,235,0.55)",
                            border:
                              "1px dashed rgba(125,135,104,0.18)",
                            borderRadius:
                              "12px",
                            color:
                              "#aaa99f",
                            fontSize:
                              "12px",
                          }}
                        >
                          No class
                        </div>

                      ) : (

                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            gap: "9px",
                          }}
                        >

                          {sevenThirty.map(
                            (student) => (

                              <div
                                key={
                                  student.id
                                }
                                style={{
                                  padding:
                                    "12px",
                                  background:
                                    "#fffdf8",
                                  border:
                                    "1px solid rgba(125,135,104,0.14)",
                                  borderRadius:
                                    "14px",
                                }}
                              >

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "9px",
                                  }}
                                >

                                  <div
                                    style={{
                                      width:
                                        "34px",
                                      height:
                                        "34px",
                                      minWidth:
                                        "34px",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      borderRadius:
                                        "10px",
                                      background:
                                        "#eadbd2",
                                      color:
                                        "#69584f",
                                      fontSize:
                                        "10px",
                                      fontWeight:
                                        800,
                                    }}
                                  >
                                    {student.name
                                      .slice(
                                        0,
                                        2
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <strong
                                    style={{
                                      color:
                                        "#44473f",
                                      fontSize:
                                        "14px",
                                    }}
                                  >
                                    {
                                      student.name
                                    }
                                  </strong>

                                </div>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    flexWrap:
                                      "wrap",
                                    gap: "5px",
                                    marginTop:
                                      "9px",
                                    paddingLeft:
                                      "43px",
                                  }}
                                >

                                  {student.subjects.map(
                                    (
                                      subject
                                    ) => (

                                      <span
                                        key={
                                          subject
                                        }
                                        style={{
                                          padding:
                                            "4px 7px",
                                          borderRadius:
                                            "7px",
                                          background:
                                            "#f0eee4",
                                          color:
                                            "#666b5c",
                                          fontSize:
                                            "10px",
                                          fontWeight:
                                            600,
                                        }}
                                      >
                                        {subject}
                                      </span>

                                    )
                                  )}

                                  {student.dlp && (
                                    <span
                                      style={{
                                        padding:
                                          "4px 7px",
                                        borderRadius:
                                          "7px",
                                        background:
                                          "#eadff0",
                                        color:
                                          "#74627d",
                                        fontSize:
                                          "10px",
                                        fontWeight:
                                          600,
                                      }}
                                    >
                                      DLP
                                    </span>
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                );

              })}

            </div>

            {/* LEGEND */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "18px",
                marginTop: "20px",
                color: "#777a71",
                fontSize: "12px",
              }}
            >

              <span>
                🧸 Student
              </span>

              <span>
                ⏰ Class time
              </span>

              <span>
                🌸 Tuition day
              </span>

            </div>

          </section>

        )}

        {/* =================================
            PAYMENTS
        ================================== */}

        {activePage === "Payments" && (

          <section className="page-section payment-page">

            <div className="page-header">

              <div>

                <p className="section-label">
                  PAYMENT TRACKER 💰
                </p>

                <h1>
                  Student Payments
                </h1>

                <p>
                  Track monthly tuition
                  payments without losing
                  the history.
                </p>

              </div>

              <div className="payment-summary">

                <div>
                  <span>
                    Students
                  </span>

                  <strong>
                    {students.length}
                  </strong>
                </div>

                <div>
                  <span>
                    Paid
                  </span>

                  <strong className="paid-number">
                    {paymentStats.paidCount}
                  </strong>
                </div>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong className="pending-number">
                    {paymentStats.pendingCount}
                  </strong>
                </div>

              </div>

            </div>

            {/* MONTH NAVIGATOR */}

            <div className="month-navigator">

              <button
                className="month-arrow"
                disabled={!canGoPrevious}
                onClick={() =>
                  changeMonth(-1)
                }
              >
                ‹
              </button>

              <div className="month-display">

                <span>
                  PAYMENT MONTH
                </span>

                <strong>
                  {currentMonthName}{" "}
                  {paymentYear}
                </strong>

              </div>

              <button
                className="month-arrow"
                onClick={() =>
                  changeMonth(1)
                }
              >
                ›
              </button>

            </div>

            {/* MONTH TOTALS */}

            <div className="monthly-stats">

              <div className="monthly-stat">

                <span>
                  TOTAL EXPECTED
                </span>

                <strong>
                  RM{" "}
                  {paymentStats.total.toFixed(
                    2
                  )}
                </strong>

              </div>

              <div className="monthly-stat collected">

                <span>
                  COLLECTED
                </span>

                <strong>
                  RM{" "}
                  {paymentStats.collected.toFixed(
                    2
                  )}
                </strong>

              </div>

              <div className="monthly-stat outstanding">

                <span>
                  OUTSTANDING
                </span>

                <strong>
                  RM{" "}
                  {paymentStats.outstanding.toFixed(
                    2
                  )}
                </strong>

              </div>

              <div className="monthly-stat">

                <span>
                  COLLECTION
                </span>

                <strong>
                  {paymentStats.total > 0
                    ? Math.round(
                        (paymentStats.collected /
                          paymentStats.total) *
                          100
                      )
                    : 0}
                  %
                </strong>

              </div>

            </div>

            {/* TABLE */}

            <div className="payment-table-card">

              <div className="payment-table-header">

                <div>

                  <h2>
                    {currentMonthName}{" "}
                    {paymentYear}
                  </h2>

                  <p>
                    Tick a student's payment
                    once the monthly fee is
                    received.
                  </p>

                </div>

                <div className="payment-month">
                  🧸 Monthly ledger
                </div>

              </div>

              <div className="payment-table-wrapper">

                <table className="payment-table">

                  <thead>

                    <tr>

                      <th>
                        Student
                      </th>

                      <th>
                        Year
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Method
                      </th>

                      <th>
                        Paid At
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {students.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="table-empty"
                        >

                          <span>
                            🧸
                          </span>

                          <p>
                            No students added
                            yet.
                          </p>

                          <button
                            className="add-student"
                            onClick={
                              openAddModal
                            }
                          >
                            + Add Student
                          </button>

                        </td>

                      </tr>

                    ) : (

                      students.map(
                        (student) => {

                          const payment =
                            getPayment(
                              student
                            );

                          const isPaid =
                            payment.status ===
                            "Paid";

                          return (
                            <tr
                              key={
                                student.id
                              }
                              className={
                                isPaid
                                  ? "payment-completed"
                                  : ""
                              }
                            >

                              <td>

                                <div className="payment-student-cell">

                                  <div className="mini-avatar">
                                    {student.name
                                      .slice(
                                        0,
                                        2
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>

                                    <strong>
                                      {
                                        student.name
                                      }
                                    </strong>

                                    <span>
                                      {
                                        student.parent ||
                                        "Parent not added"
                                      }
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>

                                <span className="year-badge">
                                  {
                                    student.level
                                  }
                                </span>

                              </td>

                              <td>

                                <strong className="payment-amount">
                                  RM{" "}
                                  {Number(
                                    student.fee ||
                                      0
                                  ).toFixed(
                                    2
                                  )}
                                </strong>

                              </td>

                              <td>

                                <label className="payment-check">

                                  <input
                                    type="checkbox"
                                    checked={
                                      isPaid
                                    }
                                    onChange={() =>
                                      handlePaymentCheckbox(
                                        student
                                      )
                                    }
                                  />

                                  <span className="custom-check">
                                    ✓
                                  </span>

                                  <span className="check-label">

                                    {isPaid
                                      ? "Paid"
                                      : "Pending"}

                                  </span>

                                </label>

                              </td>

                              <td>

                                {isPaid ? (

                                  <span
                                    className={`payment-method ${
                                      payment.method ===
                                      "QR"
                                        ? "qr-method"
                                        : "cash-method"
                                    }`}
                                  >

                                    {payment.method ===
                                    "QR"
                                      ? "▣ QR"
                                      : "💵 Cash"}

                                  </span>

                                ) : (

                                  <span className="not-recorded">
                                    —
                                  </span>

                                )}

                              </td>

                              <td>

                                <span className="payment-time">

                                  {payment.timestamp
                                    ? new Date(
                                        payment.timestamp
                                      ).toLocaleString(
                                        "en-MY",
                                        {
                                          day: "2-digit",
                                          month:
                                            "short",
                                          year:
                                            "numeric",
                                          hour:
                                            "2-digit",
                                          minute:
                                            "2-digit",
                                        }
                                      )
                                    : "—"}

                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            <div className="payment-note">

              <span>
                🧸
              </span>

              <div>

                <strong>
                  Every month is saved
                  separately.
                </strong>

                <p>
                  August 2026 payments will
                  stay in August even when
                  September starts. Your
                  payment history won't be
                  overwritten.
                </p>

              </div>

            </div>

          </section>

        )}

        {/* =================================
    RECEIPTS
================================== */}

{activePage === "Receipts" && (

  <section className="page-section receipts-page">

    {/* ================================
        HEADER
    ================================= */}

    <div className="page-header">

      <div>

        <p className="section-label">
          PAYMENT RECEIPTS 🧾
        </p>

        <h1>
          Receipts
        </h1>

        <p>
          View and download PDF receipts
          for completed tuition payments.
        </p>

      </div>

      <div className="receipt-header-icon">
        🧾
      </div>

    </div>


    {/* ================================
        MONTH NAVIGATOR
    ================================= */}

    <div className="month-navigator">

      <button
        className="month-arrow"
        disabled={!canGoPrevious}
        onClick={() =>
          changeMonth(-1)
        }
      >
        ‹
      </button>

      <div className="month-display">

        <span>
          RECEIPTS FOR
        </span>

        <strong>
          {currentMonthName}{" "}
          {paymentYear}
        </strong>

      </div>

      <button
        className="month-arrow"
        onClick={() =>
          changeMonth(1)
        }
      >
        ›
      </button>

    </div>


    {/* ================================
        RECEIPT SUMMARY
    ================================= */}

    <div className="monthly-stats">

      {/* TOTAL RECEIPTS */}

      <div className="monthly-stat">

        <span>
          TOTAL RECEIPTS
        </span>

        <strong>
          {
            students.filter(
              (student) =>
                getPayment(student).status ===
                "Paid"
            ).length
          }
        </strong>

      </div>


      {/* COLLECTED */}

      <div className="monthly-stat collected">

        <span>
          COLLECTED
        </span>

        <strong>
          RM{" "}
          {paymentStats.collected.toFixed(2)}
        </strong>

      </div>


      {/* CASH */}

      <div className="monthly-stat">

        <span>
          CASH
        </span>

        <strong>
          RM{" "}
          {students
            .filter(
              (student) =>
                getPayment(student).status ===
                  "Paid" &&
                getPayment(student).method ===
                  "Cash"
            )
            .reduce(
              (sum, student) =>
                sum +
                Number(student.fee || 0),
              0
            )
            .toFixed(2)}
        </strong>

      </div>


      {/* QR */}

      <div className="monthly-stat">

        <span>
          QR
        </span>

        <strong>
          RM{" "}
          {students
            .filter(
              (student) =>
                getPayment(student).status ===
                  "Paid" &&
                getPayment(student).method ===
                  "QR"
            )
            .reduce(
              (sum, student) =>
                sum +
                Number(student.fee || 0),
              0
            )
            .toFixed(2)}
        </strong>

      </div>

    </div>


    {/* ================================
        RECEIPTS TABLE
    ================================= */}

    <div className="payment-table-card">

      {/* TABLE HEADER */}

      <div className="payment-table-header">

        <div>

          <h2>
            {currentMonthName}{" "}
            {paymentYear} Receipts
          </h2>

          <p>
            Receipts are generated from
            recorded payments.
          </p>

        </div>

        <div className="payment-month">
          🧸 Payment archive
        </div>

      </div>


      {/* TABLE */}

      <div className="payment-table-wrapper">

        <table className="payment-table">

          <thead>

            <tr>

              <th>
                Receipt
              </th>

              <th>
                Student
              </th>

              <th>
                Amount
              </th>

              <th>
                Method
              </th>

              <th>
                Paid At
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {/* ==========================
                NO RECEIPTS
            =========================== */}

            {students.filter(
              (student) =>
                getPayment(student).status ===
                "Paid"
            ).length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="table-empty"
                >

                  <span>
                    🧾
                  </span>

                  <p>
                    No receipts yet for{" "}
                    {currentMonthName}.
                  </p>

                  <button
                    className="add-student"
                    onClick={() =>
                      setActivePage(
                        "Payments"
                      )
                    }
                  >
                    Go to Payments
                  </button>

                </td>

              </tr>

            ) : (

              /* ==========================
                 RECEIPT LIST
              =========================== */

              students
                .filter(
                  (student) =>
                    getPayment(student)
                      .status === "Paid"
                )
                .map(
                  (
                    student,
                    index
                  ) => {

                    const payment =
                      getPayment(student);


                    /* ======================
                       RECEIPT NUMBER
                    ======================= */

                    const receiptNumber =
                      `${paymentYear}${String(
                        paymentMonth + 1
                      ).padStart(
                        2,
                        "0"
                      )}-${String(
                        index + 1
                      ).padStart(
                        3,
                        "0"
                      )}`;


                    /* ======================
                       PAID DATE
                    ======================= */

                    const paidDate =
                      payment.timestamp
                        ? new Date(
                            payment.timestamp
                          ).toLocaleString(
                            "en-MY",
                            {
                              day: "2-digit",
                              month:
                                "short",
                              year:
                                "numeric",
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )
                        : "—";


                    /* ======================
                       AMOUNT
                    ======================= */

                    const amount =
                      Number(
                        student.fee || 0
                      ).toFixed(2);


                    /* ======================
                       PDF GENERATOR
                    ======================= */

                    const generateReceiptPDF =
                      () => {

                        const doc =
                          new jsPDF();


                        /* ==================
                           PDF HEADER
                        =================== */

                        doc.setFont(
                          "helvetica",
                          "bold"
                        );

                        doc.setFontSize(
                          24
                        );

                        doc.text(
                          "TUITION CENTRE",
                          20,
                          25
                        );


                        doc.setFont(
                          "helvetica",
                          "normal"
                        );

                        doc.setFontSize(
                          11
                        );

                        doc.text(
                          "Tuition Payment Receipt",
                          20,
                          33
                        );


                        /* ==================
                           RECEIPT NUMBER
                        =================== */

                        doc.setFontSize(
                          10
                        );

                        doc.text(
                          `Receipt No: #${receiptNumber}`,
                          190,
                          24,
                          {
                            align:
                              "right",
                          }
                        );

                        doc.text(
                          `${currentMonthName} ${paymentYear}`,
                          190,
                          32,
                          {
                            align:
                              "right",
                          }
                        );


                        /* ==================
                           DIVIDER
                        =================== */

                        doc.line(
                          20,
                          42,
                          190,
                          42
                        );


                        /* ==================
                           STUDENT DETAILS
                        =================== */

                        doc.setFont(
                          "helvetica",
                          "bold"
                        );

                        doc.setFontSize(
                          12
                        );

                        doc.text(
                          "STUDENT DETAILS",
                          20,
                          58
                        );


                        doc.setFont(
                          "helvetica",
                          "normal"
                        );

                        doc.setFontSize(
                          11
                        );

                        doc.text(
                          `Student: ${student.name}`,
                          20,
                          69
                        );

                        doc.text(
                          `Parent / Guardian: ${
                            student.parent ||
                            "Not provided"
                          }`,
                          20,
                          77
                        );

                        doc.text(
                          `Year / Level: ${student.level}`,
                          20,
                          85
                        );

                        doc.text(
                          `Subjects: ${student.subjects.join(
                            ", "
                          )}`,
                          20,
                          93
                        );

                        doc.text(
                          `Class Batch: ${
                            student.timeSlot ||
                            "Not specified"
                          }`,
                          20,
                          101
                        );

                        if (
                          student.dlp
                        ) {

                          doc.text(
                            "Programme: DLP",
                            20,
                            109
                          );

                        }


                        /* ==================
                           PAYMENT DETAILS
                        =================== */

                        doc.setFont(
                          "helvetica",
                          "bold"
                        );

                        doc.setFontSize(
                          12
                        );

                        doc.text(
                          "PAYMENT DETAILS",
                          20,
                          126
                        );


                        doc.setFont(
                          "helvetica",
                          "normal"
                        );

                        doc.setFontSize(
                          11
                        );

                        doc.text(
                          `Payment Month: ${currentMonthName} ${paymentYear}`,
                          20,
                          137
                        );

                        doc.text(
                          `Payment Method: ${
                            payment.method ||
                            "Not specified"
                          }`,
                          20,
                          145
                        );

                        doc.text(
                          `Paid At: ${paidDate}`,
                          20,
                          153
                        );


                        /* ==================
                           TOTAL BOX
                        =================== */

                        doc.setFont(
                          "helvetica",
                          "bold"
                        );

                        doc.setFontSize(
                          12
                        );

                        doc.text(
                          "TOTAL PAID",
                          20,
                          177
                        );


                        doc.setFontSize(
                          24
                        );

                        doc.text(
                          `RM ${amount}`,
                          190,
                          177,
                          {
                            align:
                              "right",
                          }
                        );


                        /* ==================
                           DIVIDER
                        =================== */

                        doc.line(
                          20,
                          187,
                          190,
                          187
                        );


                        /* ==================
                           PAYMENT STATUS
                        =================== */

                        doc.setFontSize(
                          12
                        );

                        doc.text(
                          "PAYMENT STATUS: PAID",
                          20,
                          202
                        );


                        /* ==================
                           FOOTER
                        =================== */

                        doc.setFont(
                          "helvetica",
                          "normal"
                        );

                        doc.setFontSize(
                          10
                        );

                        doc.text(
                          "Thank you for your payment.",
                          105,
                          225,
                          {
                            align:
                              "center",
                          }
                        );

                        doc.text(
                          "Have a good day",
                          105,
                          233,
                          {
                            align:
                              "center",
                          }
                        );


                        doc.setFontSize(
                          8
                        );

                        doc.text(
                          "This is a computer-generated receipt.",
                          105,
                          280,
                          {
                            align:
                              "center",
                          }
                        );


                        /* ==================
                           SAVE PDF
                        =================== */

                        doc.save(
                          `Receipt-${receiptNumber}-${student.name.replace(
                            /\s+/g,
                            "-"
                          )}.pdf`
                        );

                      };


                    /* ======================
                       TABLE ROW
                    ======================= */

                    return (

                      <tr
                        key={
                          student.id
                        }
                      >

                        {/* RECEIPT NUMBER */}

                        <td>

                          <span className="year-badge">
                            #
                            {
                              receiptNumber
                            }
                          </span>

                        </td>


                        {/* STUDENT */}

                        <td>

                          <div className="payment-student-cell">

                            <div className="mini-avatar">

                              {student.name
                                .slice(
                                  0,
                                  2
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {
                                  student.name
                                }
                              </strong>

                              <span>
                                {
                                  student.parent ||
                                  "Parent not added"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* AMOUNT */}

                        <td>

                          <strong className="payment-amount">

                            RM{" "}

                            {amount}

                          </strong>

                        </td>


                        {/* METHOD */}

                        <td>

                          <span
                            className={`payment-method ${
                              payment.method ===
                              "QR"
                                ? "qr-method"
                                : "cash-method"
                            }`}
                          >

                            {payment.method ===
                            "QR"
                              ? "▣ QR"
                              : "💵 Cash"}

                          </span>

                        </td>


                        {/* PAID DATE */}

                        <td>

                          <span className="payment-time">

                            {paidDate}

                          </span>

                        </td>


                        {/* PDF ACTION */}

                        <td>

                          <button
                            className="remind-button"
                            onClick={
                              generateReceiptPDF
                            }
                          >
                            📄 PDF
                          </button>

                        </td>

                      </tr>

                    );

                  }
                )

            )}

          </tbody>

        </table>

      </div>

    </div>


    {/* ================================
        RECEIPT NOTE
    ================================= */}

    <div className="payment-note">

      <span>
        🌸
      </span>

      <div>

        <strong>
          Your receipts are safely
          organised.
        </strong>

        <p>
          Every completed payment creates
          a receipt for that month. Click
          the PDF button to generate and
          save a printable receipt.
        </p>

      </div>

    </div>

  </section>

)}
      </main>

      {/* =================================
          ADD / EDIT STUDENT MODAL
      ================================== */}

      {showStudentModal && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              closeStudentModal();
            }

          }}
        >

          <div className="student-modal">

            <div className="modal-header">

              <div>

                <span className="modal-kicker">
                  {editingStudent
                    ? "UPDATE STUDENT"
                    : "NEW STUDENT"}{" "}
                  🌸
                </span>

                <h2>
                  {editingStudent
                    ? "Edit student"
                    : "Add a new student"}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeStudentModal
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                saveStudent
              }
            >

              <div className="form-grid">

                <label>
                  Student name

                  <input
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Sarah Lim"
                  />
                </label>

                <label>
                  Parent / Guardian

                  <input
                    name="parent"
                    value={
                      form.parent
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Mrs Lim"
                  />
                </label>

                <label>
                  Phone number

                  <input
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 012-3456789"
                  />
                </label>

                <label>
                  Year / Level

                  <select
                    name="level"
                    value={
                      form.level
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Select year
                    </option>

                    {LEVELS.map(
                      (level) => (

                        <option
                          value={level}
                          key={level}
                        >
                          {level}
                        </option>

                      )
                    )}

                  </select>

                </label>

                <label>
                  Monthly fee

                  <div className="fee-input">

                    <span>
                      RM
                    </span>

                    <input
                      type="number"
                      name="fee"
                      value={
                        form.fee
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="120"
                      min="0"
                    />

                  </div>

                </label>

              </div>

              {/* SUBJECTS */}

              <div className="subject-section">

                <span className="form-label">
                  Subjects
                </span>

                <div className="subject-options">

                  {SUBJECTS.map(
                    (subject) => (

                      <button
                        type="button"
                        key={subject}
                        className={`subject-option ${
                          form.subjects.includes(
                            subject
                          )
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleSubject(
                            subject
                          )
                        }
                      >

                        {form.subjects.includes(
                          subject
                        )
                          ? "✓ "
                          : ""}

                        {subject}

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* DLP */}

              <div className="dlp-section">

                <div>

                  <span className="form-label">
                    DLP
                  </span>

                  <p>
                    Dual Language Programme
                  </p>

                </div>

                <button
                  type="button"
                  className={`dlp-toggle ${
                    form.dlp
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    setForm(
                      (current) => ({
                        ...current,
                        dlp:
                          !current.dlp,
                      })
                    )
                  }
                >

                  <span className="toggle-circle">
                    {form.dlp
                      ? "✓"
                      : ""}
                  </span>

                  <span>
                    {form.dlp
                      ? "DLP ON"
                      : "DLP OFF"}
                  </span>

                </button>

              </div>

              {/* DAYS */}

              <div className="day-selection">

                <span className="form-label">
                  Class days
                </span>

                <div className="day-options">

                  {DAYS.map(
                    (day) => (

                      <button
                        type="button"
                        key={day}
                        className={`day-option ${
                          form.days.includes(
                            day
                          )
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleDay(day)
                        }
                      >

                        {form.days.includes(
                          day
                        )
                          ? "✓ "
                          : ""}

                        {day.slice(0, 3)}

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* TIME */}

              <div className="time-selection">

                <span className="form-label">
                  Class batch
                </span>

                <div className="time-options">

                  {TIME_SLOTS.map(
                    (slot) => (

                      <button
                        type="button"
                        key={slot}
                        className={`time-option ${
                          form.timeSlot ===
                          slot
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setForm(
                            (current) => ({
                              ...current,
                              timeSlot:
                                slot,
                            })
                          )
                        }
                      >

                        <span>
                          ⏰
                        </span>

                        {slot}

                      </button>

                    )
                  )}

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeStudentModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingStudent
                    ? "Save Changes"
                    : "Add Student"}{" "}
                  🌸
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================
          PAYMENT METHOD MODAL
      ================================== */}

      {paymentStudent && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              closePaymentMethod();
            }

          }}
        >

          <div className="payment-method-modal">

            <div className="payment-modal-icon">
              💰
            </div>

            <span className="modal-kicker">
              PAYMENT RECEIVED
            </span>

            <h2>
              {paymentStudent.name}
            </h2>

            <p className="payment-modal-description">

              Mark{" "}
              <strong>
                RM{" "}
                {Number(
                  paymentStudent.fee ||
                    0
                ).toFixed(2)}
              </strong>{" "}
              as received for{" "}
              <strong>
                {currentMonthName}{" "}
                {paymentYear}
              </strong>
              .

            </p>

            <p className="choose-method">
              How was the payment made?
            </p>

            <div className="payment-method-buttons">

              <button
                className="method-choice cash-choice"
                onClick={() =>
                  markPayment(
                    paymentStudent.id,
                    "Cash"
                  )
                }
              >

                <span>
                  💵
                </span>

                <strong>
                  Cash
                </strong>

                <small>
                  Paid in cash
                </small>

              </button>

              <button
                className="method-choice qr-choice"
                onClick={() =>
                  markPayment(
                    paymentStudent.id,
                    "QR"
                  )
                }
              >

                <span>
                  ▣
                </span>

                <strong>
                  QR
                </strong>

                <small>
                  QR payment
                </small>

              </button>

            </div>

            <button
              className="modal-text-cancel"
              onClick={
                closePaymentMethod
              }
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;