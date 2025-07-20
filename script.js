// Helper function to extract student number from ID
function getStudentNumberFromId(id) {
    if (id.startsWith("ST")) {
        return parseInt(id.substring(2));
    }
    return parseInt(id);
}

// Student data for Class 3/1 (initial - will be overwritten by Firebase data)
// Removed hardcoded initialStudents array as per user request.
// Data will now be loaded solely from Firebase.
let studentsData = []; // Initialize as an empty array

// Student scores data for Class 3/1 (will be overwritten by Firebase data)
const studentScores = {}; // This will now store monthly totals (if needed) or can be removed
const months = ["พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม"];
const numWeeksInMonth = 5; // Assuming max 5 weeks for any month's weekly scores

// *** Firebase Configuration ***
const firebaseConfig = {
    apiKey: "AIzaSyBPLPEig2DuVmPBnp654vtLved2x373o64",
    authDomain: "tester-5ead2.firebaseapp.com",
    projectId: "tester-5ead2",
    storageBucket: "tester-5ead2.firebasestorage.app",
    messagingSenderId: "352436666156",
    appId: "1:352436666156:web:13f7aa528c42bcbaf13689",
    measurementId: "G-H32613VB65"
};

// Initialize Firebase Apps
let db;
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} else {
    db = firebase.app().firestore();
}


const studentsCollection = db.collection('students3_1');
const weeklyScoresCollection = db.collection('studentWeeklyScores');
const saveHistoryCollection = db.collection('saveHistory');
const appSettingsCollection = db.collection('settings');
const newsCollection = db.collection('news');
const appSettingsDocRef = appSettingsCollection.doc('appSettings');
const paymentRequirementsDocRef = appSettingsCollection.doc('paymentRequirements');

// Admin password (for demonstration, use Firebase Security Rules in production)
const ADMIN_PASSWORD = "1230166";

let currentStudentId = null; // Store the ID of the student whose details or scores are currently open
let currentAllStudentsWeeklyScoresMonth = null; // Store the currently selected month for all students' scores
let currentStudentToDelete = null; // New: Store student ID for deletion confirmation
let activePage = 'home'; // To track the current active page/view
let activeClassSection = 'studentList'; // To track active section within class page

// CAPTCHA variables
let captchaAnswer = 0;
let captchaNum1, captchaNum2; // Declare globally for CAPTCHA calculation

// Payment Requirements
let currentPaymentRequirements = {}; // Stores the fetched payment requirements

// Punishment Summary Month Navigation
let currentPunishmentMonthIndex; // Will store the index of the month currently displayed in punishment summary

// DOM Elements (Declared here, will be assigned inside DOMContentLoaded)
let loader;
let studentListTableBody;
let scoreTableBody;
let studentDetailModal;
let addNewModal;
let closeButton;
let modalOverlay;

let modalStudentName;
let modalStudentNumber;
let modalStudentId;
let modalStudentPrefix; // Added for prefix
let modalStudentFirstName; // Added for first name
let modalStudentLastName; // Added for last name
let modalStudentGrade;
let modalStudentClass;
let modalStudentStatus;
let modalStudentDob;
let modalStudentPhone;

let studentDetailsView;
let studentDetailsEdit;
let editStudentInfoBtn;
let saveStudentInfoBtn;
let cancelStudentInfoBtn;

let editStudentNumber;
let editStudentId;
let editPrefix;
let editName;
let editLastName; // Added for last name
let editGrade;
let editClass;
let editStatus;
let editDob;
let editPhone;

let adminPasswordInput;
let passwordErrorMessage;
let adminPasswordSection;

let showStudentListBtn;
let showStudentScoresBtn;
let showStudentScoresBtnAll;
let showStudentFeeSummaryBtn;
let ScoresHistoryBtn;
let showPunishmentSummaryBtn; // New: Punishment Summary Button
let SettingBtn; // Now refers to navSettingBtn

// Page Containers
let homePlaceholderContainer;
let classPageContainer;
let settingsContainer;
let contactAdminContainer;

// Content Section Containers within Class Page
let studentListTableContainer;
let homeTableContainer;
let newTableContainer;
let scoreTableContainer;
let studentFeeSummaryTableContainer;
let studentFeeSummaryTableBody;
let feeSummaryTableHeader;
let feeSummaryTableFooter;
let feeSummaryTitle;
let saveHistoryTableContainer;
let saveHistoryTableBody;
let punishmentSummarySection;
let punishmentSummaryTableContainer; // New: Punishment Summary Table Container
let punishmentSummaryTable; // New: Punishment Summary Table
let punishmentSummaryTableHeader; // New: Punishment Summary Table Header
let punishmentSummaryTableBody; // New: Punishment Summary Table Body
let punishmentSummaryTitle; // New: Punishment Summary Table Title
let allStudentsWeeklyScoresMainContainer;


let clearHistoryBtn;
let setMonthlyFeesBtn; // New: Button to open monthly fees modal

// DOM elements for settings
let historyCountDisplay;
let autoDeleteToggle;
let historyLimitInput;
let editHistoryLimitBtn;
let saveHistoryLimitBtn;
let cancelHistoryLimitBtn;
let historyLimitEditActions;
let historyLimitErrorMessage;

// NEW: DOM elements for news settings
let newsCountDisplay;
let autoDeleteNewsToggle;
let newsLimitInput;
let editNewsLimitBtn;
let saveNewsLimitBtn;
let cancelNewsLimitBtn;
let newsLimitEditActions;
let newsLimitErrorMessage;

let monthlySelectionModal;
let closeMonthlySelectionModalBtn;
let monthlySelectionModalStudentName;
let monthButtonsGrid;
let cancelMonthlySelectionBtn;

let weeklyScoresModal;
let closeWeeklyScoresModalBtn;
let weeklyModalStudentName;
let weeklyModalMonthName;
let weeklyScoresGrid;
let weeklyAdminPasswordInput;
let weeklyPasswordErrorMessage;
let saveWeeklyScoresBtn;
let cancelWeeklyScoresBtn;
let weeklyAdminPasswordSection;

let allStudentsMonthSelectionModal;
let closeAllStudentsMonthSelectionModalBtn;
let allStudentsMonthSelectionModalTitle;
let allStudentsMonthTableBody;
let cancelAllStudentsMonthSelectionBtn;


let allStudentsWeeklyModalMonthName;
let allStudentsWeeklyScoresTableBody;
let allStudentsWeeklyAdminPasswordSectionAll;
let allStudentsWeeklyAdminPasswordInputAll;
let allStudentsWeeklyPasswordErrorMessageAll;
let saveAllStudentsWeeklyScoresBtn;
let cancelAllStudentsWeeklyScoresBtn;
let addMultipleWeeklyFeesBtn; // Button to trigger the multiple fees modal

let adminClearHistoryModal;
let closeAdminClearHistoryModalBtn;
let confirmClearHistoryBtn;
let cancelClearHistoryBtn;

// New: Admin password modal for Settings entry
let settingsAdminPasswordModal;
let closeSettingsAdminPasswordModalBtn;
let settingsAdminPasswordInput;
let settingsAdminPasswordErrorMessage;
let confirmSettingsAdminPasswordBtn;
let cancelSettingsAdminPasswordBtn;

// New DOM elements for navigation links
let navHomeBtn;
let navClassBtn;
let navContactBtn;
let navSettingBtn;

// New: Student Add/Delete buttons
let studentActions;
let addStudentBtn;
let deleteStudentBtn;

// New: Add Student Modal elements
let addStudentModal;
let closeAddStudentModalBtn;
let addStudentNumber;
let addStudentId;
let addPrefix;
let addName;
let addLastName; // Added for last name
let addGrade;
let addClass;
let addStatus;
let addDob;
let addPhone;
let addStudentPasswordSection;
let addStudentPasswordInput;
let addStudentErrorMessage;
let saveNewStudentBtn;
let cancelAddStudentBtn;

// New: Delete Student Selection Modal elements
let deleteStudentSelectionModal;
let closeDeleteStudentSelectionModalBtn;
let deleteStudentList;
let cancelDeleteSelectionBtn;

// New: Confirm Delete Student Modal elements
let confirmDeleteStudentModal;
let closeConfirmDeleteStudentModalBtn;
let studentToDeleteName;
let studentToDeleteId;
let deleteConfirmationPasswordSection;
let deleteConfirmationPasswordInput;
let deleteConfirmationErrorMessage;
let confirmDeleteStudentFinalBtn;
let cancelDeleteStudentFinalBtn;

// New: Add Multiple Weekly Fees Modal elements
let addMultipleWeeklyFeesModal;
let closeAddMultipleWeeklyFeesModalBtn;
let addMultipleWeeklyFeesModalTitle;
let multipleFeeAmountInput;
let multipleWeeklyFeesTableBody;
let selectAllStudentsCheckbox;
let saveMultipleWeeklyFeesBtn;
let cancelMultipleWeeklyFeesBtn;
let addMultipleFeesPasswordSection;
let addMultipleWeeklyFeesAdminPasswordInput;
let addMultipleWeeklyFeesErrorMessage;
let initialMultipleFeesActions;
let confirmSaveMultipleFeesBtn;
let cancelSaveMultipleFeesBtn;


let currentWeeklyScores; // Declare at a scope accessible by loadWeeklyScoresFromFirebase and renderWeeklyScores

// Map to store student names and numbers for quick lookup in history table
const studentInfoMap = new Map();

// New: Monthly Fees Modal elements
let setMonthlyFeesModal;
let closeSetMonthlyFeesModalBtn;
let monthlyFeesGrid;
let saveMonthlyFeesBtn;
let cancelSetMonthlyFeesBtn;

// New: Punishment Summary Navigation elements
let punishmentNav;
let prevMonthPunishmentBtn;
let nextMonthPunishmentBtn;
let currentPunishmentMonthDisplay;

// New: Contact Admin Form elements (globally accessible after DOMContentLoaded)
let contactAdminForm;
let contactSubmitBtn;
let captchaQuestion;
let captchaInput;
let captchaError;

// --- News System DOM Elements ---
let newsContainer;
let addNewsBtn;
let deleteNewsBtn;
let addNewsModal;
let closeAddNewsModalBtn;
let newsTitleInput;
let newsContentInput;
let newsImageUrlInput;
let pinNewsToggle;
let addNewsAdminPasswordInput;
let addNewsErrorMessage;
let saveNewsBtn;
let cancelAddNewsBtn;
let deleteNewsModal;
let closeDeleteNewsModalBtn;
let deleteNewsList;
let cancelDeleteNewsSelectionBtn;
// New: Confirm Delete News Modal elements
let confirmDeleteNewsModal;
let closeConfirmDeleteNewsModalBtn;
let newsToDeleteTitle;
let deleteNewsPasswordInput;
let deleteNewsErrorMessage;
let confirmDeleteNewsFinalBtn;
let cancelDeleteNewsFinalBtn;
let currentNewsToDeleteId = null;
// New: Image Modal elements
let imageModal;
let closeImageModalBtn;
let modalImageContent;
let newsImagePreview;
// New: News Detail Modal elements
let newsDetailModal;
let closeNewsDetailModalBtn;
let modalNewsTitle;
let modalNewsImage;
let modalNewsContent;
let modalNewsTimestamp;


async function loadStudentsFromFirebase() {
    try {
        const snapshot = await studentsCollection.get(); // Use students3_1 collection
        studentsData.length = 0; // Clear the existing hardcoded data
        studentInfoMap.clear(); // Clear existing map

        snapshot.forEach(doc => {
            const data = doc.data();
            const student = { ...data,
                id: doc.id,
                studentNumber: data.studentNumber || getStudentNumberFromId(data.id)
            };
            studentsData.push(student);
            // Populate map with name, number, and phone
            studentInfoMap.set(student.id, {
                name: `${student.prefix} ${student.name} ${student.lastName}`, // Use full name
                studentNumber: student.studentNumber,
                phone: student.phone
            });
        });
        console.log("All student details loaded from Firebase.");
        // Sort studentsData by studentNumber for consistent display
        studentsData.sort((a, b) => a.studentNumber - b.studentNumber);
    } catch (e) {
        console.error("Error loading student details from Firebase:", e);
        // If error, you might want to handle it, e.g., display a message to the user
    }
}


// --- Student List Table Functions ---

// Function to render the student list table
async function renderStudentList() {
    const snapshot = await studentsCollection.orderBy('studentNumber').get();
    const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    studentListTableBody.innerHTML = ''; // Clear existing rows
    students.forEach(student => {
        const row = studentListTableBody.insertRow();
        row.innerHTML = `
            <td>${student.studentNumber || '-'}</td>
            <td>${student.id}</td>
            <td>${student.prefix}</td>
            <td>${student.name} ${student.lastName}</td>
            <td>${student.status}</td>
            <td><button class="details-btn" data-student-id="${student.id}">ดูรายละเอียด</button></td>
        `;
    });

    // Attach event listeners to "ดูรายละเอียด" buttons
    document.querySelectorAll('#studentListTableBody .details-btn').forEach(button => {
        button.onclick = (event) => openStudentDetailModal(event.target.dataset.studentId);
    });
}

// --- Student Score Table Functions ---

// Function to render the student scores table (now shows a button to view monthly scores)
async function renderStudentScores() {
    const studentsSnapshot = await studentsCollection.orderBy('studentNumber').get();
    const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    scoreTableBody.innerHTML = ''; // Clear existing rows

    students.forEach(student => {
        const row = scoreTableBody.insertRow();
        row.innerHTML = `
            <td>${student.studentNumber || '-'}</td>
            <td>${student.id}</td>
            <td>${student.prefix} ${student.name} ${student.lastName}</td>
            <td><button class="edit-score-btn" data-student-id="${student.id}">ดูค่าห้องรายเดือน</button></td>
        `;
    });

    // Attach event listeners to new "ดูค่าห้องรายเดือน" buttons
    document.querySelectorAll('#scoreTableBody .edit-score-btn').forEach(button => {
        button.onclick = (event) => openMonthlySelectionModal(event.target.dataset.studentId);
    });
}

// --- Student Detail Modal Functions (for general student info) ---

// Function to open the student detail modal (only for general info now)
async function openStudentDetailModal(studentId) {
    currentStudentId = studentId; // Set the current student ID

    const studentDoc = await studentsCollection.doc(studentId).get();
    const student = studentDoc.data();

    if (student) {
        modalStudentName.textContent = `ข้อมูลนักเรียน: ${student.prefix} ${student.name} ${student.lastName}`;
        modalStudentNumber.textContent = student.studentNumber || '-';
        modalStudentId.textContent = student.id;
        modalStudentPrefix.textContent = student.prefix;
        modalStudentFirstName.textContent = student.name;
        modalStudentLastName.textContent = student.lastName;
        modalStudentGrade.textContent = student.grade;
        modalStudentClass.textContent = student.class;
        modalStudentStatus.textContent = student.status;
        modalStudentDob.textContent = student.dob;
        modalStudentPhone.textContent = student.phone;

        // Populate edit fields
        editStudentNumber.value = student.studentNumber || '';
        editStudentId.value = student.id;
        editPrefix.value = student.prefix;
        editName.value = student.name;
        editLastName.value = student.lastName;
        editGrade.value = student.grade;
        editClass.value = student.class;
        editStatus.value = student.status;
        editDob.value = student.dob;
        editPhone.value = student.phone;

        // Always start in view mode for student details
        toggleEditMode(false);

        // Clear password input and error message for this modal
        adminPasswordInput.value = '';
        passwordErrorMessage.textContent = '';

        studentDetailModal.style.display = 'flex'; // Show the modal
    } else {
        console.error("Student not found:", studentId);
    }
}

// Function to close the student detail modal
function closeStudentDetailModal() {
    studentDetailModal.style.display = 'none'; // Hide the modal
    currentStudentId = null; // Clear current student ID
}

// Function to toggle between view and edit mode for student info
function toggleEditMode(isEditMode) {
    const modalContent = studentDetailModal.querySelector('.modal-content');
    if (isEditMode) {
        studentDetailsView.style.display = 'none';
        studentDetailsEdit.style.display = 'grid'; // Use grid for edit form
        editStudentInfoBtn.style.display = 'none';
        saveStudentInfoBtn.style.display = 'inline-block';
        cancelStudentInfoBtn.style.display = 'inline-block';
        modalContent.classList.add('expanded-edit-mode'); // Expand modal for editing
        adminPasswordSection.style.display = 'flex'; // Show password section
    } else {
        studentDetailsView.style.display = 'block';
        studentDetailsEdit.style.display = 'none';
        editStudentInfoBtn.style.display = 'inline-block';
        saveStudentInfoBtn.style.display = 'none';
        cancelStudentInfoBtn.style.display = 'none';
        modalContent.classList.remove('expanded-edit-mode'); // Shrink modal back
        adminPasswordSection.style.display = 'none'; // Hide password section
    }
}

// Function to save student information (admin access required)
async function saveStudentInfo() {
    const password = adminPasswordInput.value;
    if (password !== ADMIN_PASSWORD) {
        passwordErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        passwordErrorMessage.style.color = "red";
        return;
    }
    passwordErrorMessage.textContent = ""; // Clear error message

    if (!currentStudentId) {
        console.error("No student selected for saving info.");
        return;
    }

    const oldStudentId = currentStudentId;
    const newStudentId = editStudentId.value.trim();
    const newStudentNumber = parseInt(editStudentNumber.value);
    const newPrefix = editPrefix.value;
    const newName = editName.value.trim();
    const newLastName = editLastName.value.trim(); // Get last name
    const newPhone = editPhone.value.trim();
    const newFullName = `${newPrefix} ${newName} ${newLastName}`; // Use full name for check

    if (isNaN(newStudentNumber) || newStudentNumber <= 0) {
        passwordErrorMessage.textContent = "เลขที่นักเรียนต้องเป็นตัวเลขและมากกว่า 0";
        passwordErrorMessage.style.color = "red";
        return;
    }

    // Perform duplicate checks against ALL students, excluding the current student being edited
    const isIdTaken = studentsData.some(s => s.id === newStudentId && s.id !== oldStudentId);
    if (isIdTaken) {
        passwordErrorMessage.textContent = "รหัสนักเรียนนี้มีอยู่แล้ว! โปรดใช้รหัสอื่น";
        passwordErrorMessage.style.color = "red";
        return;
    }

    const isStudentNumberTaken = studentsData.some(s => s.studentNumber === newStudentNumber && s.id !== oldStudentId);
    if (isStudentNumberTaken) {
        passwordErrorMessage.textContent = "เลขที่นักเรียนนี้มีอยู่แล้ว! โปรดใช้เลขที่อื่น";
        passwordErrorMessage.style.color = "red";
        return;
    }

    const isFullNameTaken = studentsData.some(s => `${s.prefix} ${s.name} ${s.lastName}` === newFullName && s.id !== oldStudentId);
    if (isFullNameTaken) {
        passwordErrorMessage.textContent = "ชื่อ-นามสกุลนี้มีอยู่แล้ว! โปรดแก้ไข";
        passwordErrorMessage.style.color = "red";
        return;
    }

    const isPhoneTaken = studentsData.some(s => s.phone === newPhone && s.id !== oldStudentId && newPhone !== '-');
    if (isPhoneTaken) {
        passwordErrorMessage.textContent = "เบอร์โทรศัพท์นี้มีอยู่แล้ว! โปรดแก้ไข";
        passwordErrorMessage.style.color = "red";
        return;
    }


    const updatedStudentDetails = {
        id: newStudentId,
        studentNumber: newStudentNumber,
        prefix: newPrefix,
        name: newName,
        lastName: newLastName, // Include last name
        grade: editGrade.value,
        class: editClass.value,
        status: editStatus.value,
        dob: editDob.value,
        phone: newPhone
    };

    try {
        // Fetch current student details to compare for changes
        const oldStudentDoc = await studentsCollection.doc(oldStudentId).get();
        const oldStudentDetails = oldStudentDoc.exists ? oldStudentDoc.data() : {};

        let detailsChanged = false;
        // Simple comparison for changes in general info
        for (const key in updatedStudentDetails) {
            if (updatedStudentDetails[key] !== oldStudentDetails[key]) {
                detailsChanged = true;
                break;
            }
        }

        // Handle ID change: delete old doc, create new doc
        if (oldStudentId !== newStudentId) {
            await studentsCollection.doc(oldStudentId).delete();
            console.log(`Old student detail document ${oldStudentId} deleted from Firebase.`);
            // Also move weekly scores if ID changes
            await moveFirebaseCollection(weeklyScoresCollection.doc(oldStudentId).collection('months'), weeklyScoresCollection.doc(newStudentId).collection('months'));
            detailsChanged = true; // ID change is also a change in details
        }

        // Only save if there were actual changes
        if (detailsChanged) {
            await studentsCollection.doc(newStudentId).set(updatedStudentDetails);
            console.log(`Student details for ${newStudentId} saved/updated in Firebase.`);

            // Update local studentsData array and map
            await loadStudentsFromFirebase(); // Re-load all students to ensure local data is fresh

            currentStudentId = newStudentId; // Update current ID if it changed

            passwordErrorMessage.textContent = "บันทึกข้อมูลนักเรียนเรียบร้อยแล้ว!";
            passwordErrorMessage.style.color = "green";

            renderStudentList(); // Re-render main student list
            renderStudentScores(); // Re-render main score table
            toggleEditMode(false);
            setTimeout(() => {
                passwordErrorMessage.textContent = "";
                passwordErrorMessage.style.color = "red";
            }, 2000);

        } else {
            passwordErrorMessage.textContent = "ไม่มีการเปลี่ยนแปลงข้อมูลนักเรียน";
            passwordErrorMessage.style.color = "orange";
            setTimeout(() => {
                passwordErrorMessage.textContent = "";
                passwordErrorMessage.style.color = "red";
            }, 2000);
        }

    } catch (error) {
        console.error("Error saving student info to Firebase:", error);
        passwordErrorMessage.textContent = `เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเรียน: ${error.message}`;
        passwordErrorMessage.style.color = "red";
    }
}

// Helper function to move an entire subcollection in Firebase
async function moveFirebaseCollection(oldCollectionRef, newCollectionRef) {
    const snapshot = await oldCollectionRef.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.set(newCollectionRef.doc(doc.id), doc.data());
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Subcollection moved from ${oldCollectionRef.path} to ${newCollectionRef.path}.`);
}


// --- NEW Monthly Selection Modal Functions (for individual student scores) ---

async function openMonthlySelectionModal(studentId) {
    currentStudentId = studentId; // Set the current student ID for monthly selection

    const studentDoc = await studentsCollection.doc(studentId).get();
    const student = studentDoc.data();

    if (student) {
        monthlySelectionModalStudentName.textContent = `ค่าห้องรายเดือนของ: ${student.prefix} ${student.name} ${student.lastName}`;
        monthButtonsGrid.innerHTML = ''; // Clear existing buttons

        months.forEach(month => {
            const monthItem = document.createElement('div');
            monthItem.classList.add('month-button-item');
            const button = document.createElement('button');
            button.classList.add('month-button');
            button.textContent = month;
            button.dataset.month = month;
            button.onclick = () => {
                closeMonthlySelectionModal(); // Close month selection modal
                openWeeklyScoresModal(studentId, month); // Open weekly scores modal for selected month
            };
            monthItem.appendChild(button);
            monthButtonsGrid.appendChild(monthItem);
        });

        monthlySelectionModal.style.display = 'flex'; // Show the modal
    } else {
        console.error("Student not found for monthly selection:", studentId);
    }
}

function closeMonthlySelectionModal() {
    monthlySelectionModal.style.display = 'none';
}


// --- Weekly Scores Modal Functions (for individual student scores) ---

let currentWeeklyStudentId = null;
let currentWeeklyMonth = null;

// Function to open the weekly scores modal
async function openWeeklyScoresModal(studentId, month) {
    currentWeeklyStudentId = studentId;
    currentWeeklyMonth = month;

    // Update modal title
    const studentDoc = await studentsCollection.doc(studentId).get();
    const studentName = studentDoc.exists ? `${studentDoc.data().prefix} ${studentDoc.data().name} ${studentDoc.data().lastName}` : 'นักเรียนไม่พบ';
    weeklyModalStudentName.textContent = studentName;
    weeklyModalMonthName.textContent = month;

    // Load weekly scores for the selected student and month
    await loadWeeklyScoresFromFirebase(studentId, month);
    renderWeeklyScores(currentWeeklyScores);

    // Reset password and error
    weeklyAdminPasswordInput.value = '';
    weeklyPasswordErrorMessage.textContent = '';
    weeklyAdminPasswordSection.style.display = 'flex'; // Show password section for weekly scores

    weeklyScoresModal.style.display = 'flex'; // Show the modal
}

// Function to render weekly score inputs
function renderWeeklyScores(weeklyScores) {
    weeklyScoresGrid.innerHTML = ''; // Clear existing inputs
    const numWeeks = 5; // Assuming max 5 weeks per month

    const monthRequirements = currentPaymentRequirements[currentWeeklyMonth] || {
        weeklyFees: {}
    };
    const weeklyFeesRequired = monthRequirements.weeklyFees || {};

    for (let i = 1; i <= numWeeks; i++) {
        const weekKey = `week${i}`;
        const score = weeklyScores[weekKey] !== undefined ? weeklyScores[weekKey] : 0;
        const requiredFee = weeklyFeesRequired[weekKey] !== undefined ? weeklyFeesRequired[weekKey] : 0;


        const scoreItem = document.createElement('div');
        scoreItem.classList.add('score-input-item');
        scoreItem.innerHTML = `
            <label for="weeklyScore${i}">สัปดาห์ที่ ${i} (${requiredFee} บาท)</label>
            <input type="number" id="weeklyScore${i}" min="0" value="${score}">
        `;
        const inputElement = scoreItem.querySelector(`#weeklyScore${i}`);

        // Apply color based on payment status
        if (requiredFee > 0) {
            if (score === 0) {
                inputElement.classList.add('payment-status-red');
            } else if (score < requiredFee) {
                inputElement.classList.add('payment-status-yellow');
            }
        }
        weeklyScoresGrid.appendChild(scoreItem);
    }
}

// Function to load weekly scores from Firebase
async function loadWeeklyScoresFromFirebase(studentId, month) {
    try {
        const docRef = weeklyScoresCollection.doc(studentId).collection('months').doc(month);
        const doc = await docRef.get();
        currentWeeklyScores = doc.exists ? doc.data() : {}; // Ensure currentWeeklyScores is an object
    } catch (error) {
        console.error("Error loading weekly scores:", error);
        currentWeeklyScores = {}; // Fallback to empty object on error
    }
}

// Function to save weekly scores (admin access required)
async function saveWeeklyScores() {
    const password = weeklyAdminPasswordInput.value;
    if (password !== ADMIN_PASSWORD) {
        weeklyPasswordErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        return;
    }
    weeklyPasswordErrorMessage.textContent = ""; // Clear error message

    if (!currentWeeklyStudentId || !currentWeeklyMonth) {
        console.error("No student or month selected for saving weekly scores.");
        return;
    }

    const scoresToSave = {};
    let newMonthlyTotal = 0; // Calculate new total for logging
    const numWeeks = 5; // Max 5 weeks
    for (let i = 1; i <= numWeeks; i++) {
        const scoreInput = document.getElementById(`weeklyScore${i}`);
        if (scoreInput) {
            const score = parseInt(scoreInput.value) || 0;
            scoresToSave[`week${i}`] = score;
            newMonthlyTotal += score;
        }
    }

    try {
        // Fetch old scores to calculate change
        const oldScoresDoc = await weeklyScoresCollection.doc(currentWeeklyStudentId)
            .collection('months')
            .doc(currentWeeklyMonth)
            .get();
        const oldScores = oldScoresDoc.exists ? oldScoresDoc.data() : {};
        let oldMonthlyTotal = 0;
        let detailedWeeklyChanges = []; // Array to store detailed changes like {week: "สัปดาห์ที่ 1", old: 50, new: 60, change: 10}

        for (let i = 1; i <= numWeeks; i++) {
            const weekKey = `week${i}`;
            const oldScore = oldScores[weekKey] !== undefined ? oldScores[weekKey] : 0;
            const newScore = scoresToSave[weekKey] !== undefined ? scoresToSave[weekKey] : 0;

            if (newScore !== oldScore) {
                detailedWeeklyChanges.push({
                    week: `สัปดาห์ที่ ${i}`,
                    oldScore: oldScore,
                    newScore: newScore,
                    change: newScore - oldScore
                });
            }
            oldMonthlyTotal += oldScore;
        }

        // Only save and log if scores have changed
        if (detailedWeeklyChanges.length > 0) {
            await weeklyScoresCollection.doc(currentWeeklyStudentId)
                .collection('months')
                .doc(currentWeeklyMonth)
                .set(scoresToSave, {
                    merge: true
                });
            weeklyScoresModal.style.display = 'none'; // Hide modal
            weeklyAdminPasswordSection.style.display = 'none'; // Hide password section

            const studentInfo = studentInfoMap.get(currentWeeklyStudentId) || {
                name: 'ไม่พบชื่อนักเรียน',
                studentNumber: null
            };
            const studentName = studentInfo.name;
            const studentNumber = studentInfo.studentNumber;

            const amountChange = newMonthlyTotal - oldMonthlyTotal;
            await logSaveAction(currentWeeklyStudentId, studentName, `บันทึกค่าห้องเดือน${currentWeeklyMonth}`, amountChange, detailedWeeklyChanges, studentNumber); // Pass detailedWeeklyChanges
            await checkAndTrimHistory(); // Check and trim history after save
        } else {
            weeklyScoresModal.style.display = 'none'; // Hide modal
            weeklyAdminPasswordSection.style.display = 'none'; // Hide password section
        }

    } catch (error) {
        console.error("Error saving weekly scores:", error);
    }
}


// --- NEW All Students Scores Functions (now in a modal) ---

async function openAllStudentsMonthSelectionModal() {
    // Show the all students month selection modal
    allStudentsMonthSelectionModal.style.display = 'flex';
    allStudentsMonthSelectionModalTitle.textContent = 'เลือกเดือนเพื่อดูค่าห้องของนักเรียนทั้งหมด';

    allStudentsMonthTableBody.innerHTML = ''; // Clear existing month rows
    months.forEach(month => {
        const row = allStudentsMonthTableBody.insertRow(); // Create a new table row
        const monthCell = row.insertCell(); // Cell for the month name
        monthCell.textContent = month;

        const actionCell = row.insertCell(); // Cell for the button
        const button = document.createElement('button');
        button.classList.add('details-btn');
        button.textContent = 'ดูข้อมูล';
        button.dataset.month = month;
        button.onclick = () => {
            closeAllStudentsMonthSelectionModal(); // Close month selection modal
            switchContentSection('allStudentsWeeklyScores', month);
        };
        actionCell.appendChild(button);
    });

    // Clear password and error messages
    allStudentsWeeklyAdminPasswordInputAll.value = '';
    allStudentsWeeklyPasswordErrorMessageAll.textContent = '';
    allStudentsWeeklyAdminPasswordSectionAll.style.display = 'none'; // Hide password section
}

// Function to close the all students month selection modal
function closeAllStudentsMonthSelectionModal() {
    allStudentsMonthSelectionModal.style.display = 'none';
}

// Function to display all students' weekly scores in the main table area
async function displayAllStudentsWeeklyScoresInMain(month) {
    currentAllStudentsWeeklyScoresMonth = month;
    allStudentsWeeklyModalMonthName.textContent = month;
    
    allStudentsWeeklyScoresTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">กำลังโหลด...</td></tr>'; // Show loading state

    // Fetch all student details
    const studentsSnapshot = await studentsCollection.orderBy('studentNumber').get();
    const allStudents = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Fetch all weekly scores for the selected month across all students concurrently
    const weeklyScoresPromises = allStudents.map(student =>
        weeklyScoresCollection.doc(student.id).collection('months').doc(month).get()
    );
    const weeklyScoresDocs = await Promise.all(weeklyScoresPromises);

    // Create a map for quick lookup of scores by student ID
    const studentScoresMap = new Map();
    weeklyScoresDocs.forEach(doc => {
        if (doc.exists) {
            // doc.ref.parent.parent.id gives the studentId from the path 'studentWeeklyScores/{studentId}/months/{month}'
            studentScoresMap.set(doc.ref.parent.parent.id, doc.data());
        }

    });

    // Update the weekly fee headers
    const monthRequirements = currentPaymentRequirements[month] || {
        weeklyFees: {}
    };
    const weeklyFees = monthRequirements.weeklyFees || {};

    document.getElementById('weeklyFeeHeader-week1').textContent = weeklyFees.week1 !== undefined ? `${weeklyFees.week1} บาท` : '-';
    document.getElementById('weeklyFeeHeader-week2').textContent = weeklyFees.week2 !== undefined ? `${weeklyFees.week2} บาท` : '-';
    document.getElementById('weeklyFeeHeader-week3').textContent = weeklyFees.week3 !== undefined ? `${weeklyFees.week3} บาท` : '-';
    document.getElementById('weeklyFeeHeader-week4').textContent = weeklyFees.week4 !== undefined ? `${weeklyFees.week4} บาท` : '-';
    document.getElementById('weeklyFeeHeader-week5').textContent = weeklyFees.week5 !== undefined ? `${weeklyFees.week5} บาท` : '-';
    document.getElementById('weeklyFeeHeader-weekall').textContent = weeklyFees.week5 !== undefined ? `${(weeklyFees.week1 || 0) + (weeklyFees.week2 || 0) + (weeklyFees.week3 || 0) + (weeklyFees.week4 || 0) + (weeklyFees.week5 || 0)} บาท` : '-';

    allStudentsWeeklyScoresTableBody.innerHTML = ''; // Clear loading state

    for (const student of allStudents) {
        const row = allStudentsWeeklyScoresTableBody.insertRow();
        row.dataset.studentId = student.id; // Store student ID on the row

        const studentNumberCell = document.createElement('td');
        studentNumberCell.textContent = student.studentNumber || '-';

        const studentIdCell = document.createElement('td');
        studentIdCell.textContent = student.id;

        const studentNameCell = document.createElement('td');
        studentNameCell.textContent = `${student.prefix} ${student.name} ${student.lastName}`;

        row.appendChild(studentNumberCell);
        row.appendChild(studentIdCell);
        row.appendChild(studentNameCell);

        // Get scores from the map
        const studentWeeklyScores = studentScoresMap.get(student.id) || {};
        let totalPaidForStudent = 0; // To calculate total for this student for this month

        for (let i = 1; i <= numWeeksInMonth; i++) {
            const weekKey = `week${i}`;
            const score = studentWeeklyScores[weekKey] !== undefined ? studentWeeklyScores[weekKey] : 0;
            const requiredWeeklyFee = weeklyFees[weekKey] !== undefined ? weeklyFees[weekKey] : 0;

            const scoreCell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = score;
            input.dataset.week = weekKey; // Store week key on the input

            // Apply color based on payment status
            if (requiredWeeklyFee > 0) {
                if (score === 0) {
                    input.classList.add('payment-status-red');
                } else if (score < requiredWeeklyFee) {
                    input.classList.add('payment-status-yellow');
                }
            }
            totalPaidForStudent += score; // Add to total for this student

            scoreCell.appendChild(input);
            row.appendChild(scoreCell);
        }
        // Add total column for the student
        const totalCell = document.createElement('td');
        totalCell.textContent = totalPaidForStudent;
        totalCell.style.fontWeight = 'bold';
        row.appendChild(totalCell);
    }

    // Show password section when table is displayed
    allStudentsWeeklyAdminPasswordSectionAll.style.display = 'flex';
}

async function saveAllStudentsWeeklyScores() {
    const password = allStudentsWeeklyAdminPasswordInputAll.value;
    if (password !== ADMIN_PASSWORD) {
        allStudentsWeeklyPasswordErrorMessageAll.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        return;
    }
    allStudentsWeeklyPasswordErrorMessageAll.textContent = ""; // Clear error message

    if (!currentAllStudentsWeeklyScoresMonth) {
        console.error("No month selected for saving all students' weekly scores.");
        return;
    }

    const batch = db.batch();
    const rows = allStudentsWeeklyScoresTableBody.querySelectorAll('tr');
    const savePromises = []; // To hold promises for logging individual student saves

    // Re-fetch current scores to compare against, as the map might be from initial load
    const studentsSnapshot = await studentsCollection.orderBy('studentNumber').get();
    const allStudents = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    const weeklyScoresPromises = allStudents.map(student =>
        weeklyScoresCollection.doc(student.id).collection('months').doc(currentAllStudentsWeeklyScoresMonth).get()
    );
    const weeklyScoresDocs = await Promise.all(weeklyScoresPromises);
    const originalStudentScoresMap = new Map();
    weeklyScoresDocs.forEach(doc => {
        if (doc.exists) {
            originalStudentScoresMap.set(doc.ref.parent.parent.id, doc.data());
        }
    });

    let changesMade = false; // Flag to track if any changes were actually saved

    for (const row of rows) {
        const studentId = row.dataset.studentId;
        const scoresToSave = {};
        const inputs = row.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            scoresToSave[input.dataset.week] = parseInt(input.value) || 0;
        });

        const originalScores = originalStudentScoresMap.get(studentId) || {};
        let detailedWeeklyChangesForStudent = []; // Detailed info for this specific student
        let newMonthlyTotalForLog = 0;
        let oldMonthlyTotalForLog = 0;

        for (let i = 1; i <= numWeeksInMonth; i++) {
            const weekKey = `week${i}`;
            const oldScore = originalScores[weekKey] !== undefined ? originalScores[weekKey] : 0;
            const newScore = scoresToSave[weekKey] !== undefined ? scoresToSave[weekKey] : 0;

            if (newScore !== oldScore) {
                detailedWeeklyChangesForStudent.push({
                    week: `สัปดาห์ที่ ${i}`,
                    oldScore: oldScore,
                    newScore: newScore,
                    change: newScore - oldScore
                });
            }
            newMonthlyTotalForLog += newScore;
            oldMonthlyTotalForLog += oldScore;
        }

        // Only proceed if scores have actually changed for this student
        if (detailedWeeklyChangesForStudent.length > 0) {
            const docRef = weeklyScoresCollection.doc(studentId).collection('months').doc(currentAllStudentsWeeklyScoresMonth);
            batch.set(docRef, scoresToSave, {
                merge: true
            });
            changesMade = true; // Set flag to true if any change is detected

            const studentInfo = studentInfoMap.get(studentId) || {
                name: 'ไม่พบชื่อนักเรียน',
                studentNumber: null
            };
            const studentName = studentInfo.name;
            const studentNumber = studentInfo.studentNumber;

            const amountChange = newMonthlyTotalForLog - oldMonthlyTotalForLog;
            savePromises.push(logSaveAction(studentId, studentName, `บันทึกค่าห้องทั้งหมดเดือน${currentAllStudentsWeeklyScoresMonth}`, amountChange, detailedWeeklyChangesForStudent, studentNumber)); // Pass detailedWeeklyChangesForStudent
        }
    }

    try {
        if (changesMade) {
            await batch.commit();
            // Wait for all individual log entries to complete
            await Promise.all(savePromises);
            await checkAndTrimHistory(); // Check and trim history after save
        }

        // After saving (or if no changes), go back to the default student list view
        switchContentSection('studentList');

    } catch (error) {
        console.error("Error saving all students' weekly scores:", error);
    }
}

// --- NEW Student Fee Summary Functions ---
async function renderStudentFeeSummary() {
    studentFeeSummaryTableBody.innerHTML = '<tr><td colspan="15" style="text-align:center;">กำลังโหลด...</td></tr>';
    
    // Clear existing table content
    feeSummaryTableFooter.innerHTML = ''; // Clear footer too

    // Re-render table header for months
    feeSummaryTableHeader.innerHTML = `
        <th>เลขที่</th>
        <th>รหัสนักเรียน</th>
        <th>ชื่อ - นามสกุล</th>
    `;
    months.forEach(month => {
        const th = document.createElement('th');
        th.textContent = month;
        feeSummaryTableHeader.appendChild(th);
    });
    const totalTh = document.createElement('th');
    totalTh.textContent = 'รวมทั้งหมด';
    feeSummaryTableHeader.appendChild(totalTh);


    // Fetch all student details
    const studentsSnapshot = await studentsCollection.orderBy('studentNumber').get();
    const allStudents = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Use a collection group query to get all 'months' subcollection documents
    const monthsCollectionGroup = db.collectionGroup('months');
    const allMonthlyScoresSnapshot = await monthsCollectionGroup.get();

    // Organize scores by studentId and month for easy lookup
    const allStudentsMonthlyScores = {};
    allMonthlyScoresSnapshot.forEach(doc => {
        // doc.ref.parent.parent.id gives the studentId
        // doc.id gives the month name
        const studentId = doc.ref.parent.parent.id;
        const monthName = doc.id;
        if (!allStudentsMonthlyScores[studentId]) {
            allStudentsMonthlyScores[studentId] = {};
        }
        allStudentsMonthlyScores[studentId][monthName] = doc.data();
    });

    // Load payment requirements
    await loadPaymentRequirements(); // Ensure currentPaymentRequirements is up-to-date

    studentFeeSummaryTableBody.innerHTML = ''; // Clear loading state
    let grandTotalForAllStudents = 0; // Initialize grand total

    for (const student of allStudents) {
        const row = studentFeeSummaryTableBody.insertRow();
        let studentNameCell = document.createElement('td'); // Create cell for student name
        studentNameCell.textContent = `${student.prefix} ${student.name} ${student.lastName}`;

        row.innerHTML = `
            <td>${student.studentNumber || '-'}</td>
            <td>${student.id}</td>
        `;
        row.appendChild(studentNameCell); // Append the created cell
        let overallTotalForStudent = 0; // Total for current student across all months

        for (const month of months) {
            const studentWeeklyScores = (allStudentsMonthlyScores[student.id] && allStudentsMonthlyScores[student.id][month]) || {};

            let monthlyTotal = 0;
            for (let i = 1; i <= numWeeksInMonth; i++) {
                const weekKey = `week${i}`;
                monthlyTotal += (studentWeeklyScores[weekKey] !== undefined ? studentWeeklyScores[weekKey] : 0);
            }
            overallTotalForStudent += monthlyTotal; // Add to student's total

            const monthCell = document.createElement('td');
            monthCell.textContent = monthlyTotal;

            // Apply conditional styling based on payment status
            const requiredMonthlyFee = (currentPaymentRequirements[month] && currentPaymentRequirements[month].monthlyFee) || 0;
            if (requiredMonthlyFee > 0) { // Only apply styling if a fee is set for the month
                if (monthlyTotal === 0) {
                    monthCell.classList.add('payment-status-red'); // Not paid at all
                } else if (monthlyTotal < requiredMonthlyFee) {
                    monthCell.classList.add('payment-status-yellow'); // Partially paid
                }
            }
            row.appendChild(monthCell);
        }
        const overallTotalCell = document.createElement('td');
        overallTotalCell.textContent = overallTotalForStudent;
        overallTotalCell.style.fontWeight = 'bold'; // Make student's total stand out
        row.appendChild(overallTotalCell);

        grandTotalForAllStudents += overallTotalForStudent; // Add student's total to grand total
    }

    // Add a footer row for the grand total
    const totalRow = feeSummaryTableFooter.insertRow();
    const emptyCell1 = document.createElement('td');
    emptyCell1.colSpan = 2; // Span across "เลขที่" and "รหัสนักเรียน"
    totalRow.appendChild(emptyCell1);

    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = 'รวมทั้งหมดของทุกคน';
    totalRow.appendChild(totalLabelCell);

    // Add empty cells for each month column to align the grand total correctly
    for (let i = 0; i < months.length; i++) {
        const emptyMonthCell = document.createElement('td');
        totalRow.appendChild(emptyMonthCell);
    }

    const grandTotalCell = document.createElement('td');
    grandTotalCell.textContent = grandTotalForAllStudents;
    grandTotalCell.style.fontWeight = 'bold';
    grandTotalCell.style.fontSize = '1.2em'; // Make it larger
    totalRow.appendChild(grandTotalCell);

    // Update the title to include the grand total
    feeSummaryTitle.textContent = `สรุปค่าห้องของนักเรียน ห้อง 3/1 (ต่อเดือน) - รวมทั้งหมด: ${grandTotalForAllStudents} บาท`;
}

// --- NEW Save History Functions ---
async function logSaveAction(studentId, studentName, details, amountChange = null, weeklyChangesDetails = null, studentNumber = null) {
    try {
        await saveHistoryCollection.add({
            studentId: studentId,
            studentName: studentName, // Add student name
            details: details,
            amountChange: amountChange, // Store amountChange
            weeklyChangesDetails: weeklyChangesDetails, // Store detailed weekly changes
            studentNumber: studentNumber, // Store student number
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp
        });
        console.log("Save action logged successfully.");
    } catch (error) {
        console.error("Error logging save action:", error);
    }
}

async function renderSaveHistory() {
    saveHistoryTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">กำลังโหลด...</td></tr>';

    try {
        const snapshot = await saveHistoryCollection.orderBy('timestamp', 'desc').get();
        saveHistoryTableBody.innerHTML = ''; // Clear loading state

        // Update history count display in settings
        if (historyCountDisplay) { // Check if element exists before updating
            historyCountDisplay.textContent = `จำนวนประวัติการบันทึก: ${snapshot.size}`;
        }

        if (snapshot.empty) {
            const row = saveHistoryTableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6; // Adjusted colspan for new columns
            cell.textContent = "ไม่มีประวัติการบันทึก";
            cell.style.textAlign = "center";
            cell.style.fontStyle = "italic";
            return;
        }

        snapshot.forEach(doc => {
            const history = doc.data();
            const row = saveHistoryTableBody.insertRow();
            const timestamp = history.timestamp ? new Date(history.timestamp.toDate()).toLocaleString('th-TH') : 'N/A';
            let amountChangeDisplay = 'N/A';
            if (history.amountChange !== null) {
                amountChangeDisplay = `${history.amountChange >= 0 ? '+' : ''}${history.amountChange} บาท`;
            }
            // Check for detailed weekly changes first
            if (history.weeklyChangesDetails && history.weeklyChangesDetails.length > 0) {
                const weeklyDetails = history.weeklyChangesDetails.map(change => {
                    const sign = change.change >= 0 ? '+' : '';
                    return `${change.week} (${sign}${change.change})`;
                }).join(', ');
                amountChangeDisplay += ` (${weeklyDetails})`;
            } 

            row.innerHTML = `
                <td>${history.studentNumber || '-'}</td>
                <td>${history.studentId || '-'}</td>
                <td>${history.studentName || '-'}</td>
                <td>${history.details || '-'}</td>
                <td>${amountChangeDisplay}</td>
                <td>${timestamp}</td>
            `;
        });
    } catch (error) {
        console.error("Error rendering save history:", error);
        saveHistoryTableBody.innerHTML = '';
        const row = saveHistoryTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6; // Adjusted colspan for new columns
        cell.textContent = `เกิดข้อผิดพลาดในการโหลดประวัติ: ${error.message}`;
        cell.style.color = "red";
        cell.style.textAlign = "center";
    }
}

// Helper function to get the academic month index from the real-world month index
function getAcademicMonthIndex(realMonthIndex) {
    if (realMonthIndex >= 4) { // May (4) to Dec (11)
        return realMonthIndex - 4;
    } else if (realMonthIndex >= 0 && realMonthIndex <= 2) { // Jan (0) to March (2)
        return realMonthIndex + 8;
    }
    return -1; // Month not in academic year (e.g., April)
}

// --- NEW: Punishment Summary Functions ---
async function renderPunishmentSummary(displayMonthIndex) {
    punishmentSummaryTableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">กำลังโหลด...</td></tr>';
    
    const currentDate = new Date();
    const currentRealMonthIndex = currentDate.getMonth(); // 0-11
    const currentAcademicMonthIndex = getAcademicMonthIndex(currentRealMonthIndex);

    if (displayMonthIndex === undefined || displayMonthIndex === null) {
        currentPunishmentMonthIndex = currentAcademicMonthIndex;
    } else {
        currentPunishmentMonthIndex = displayMonthIndex;
    }

    if (currentPunishmentMonthIndex < 0) currentPunishmentMonthIndex = 0;
    if (currentPunishmentMonthIndex >= months.length) currentPunishmentMonthIndex = months.length - 1;

    currentPunishmentMonthDisplay.textContent = months[currentPunishmentMonthIndex];
    prevMonthPunishmentBtn.disabled = (currentPunishmentMonthIndex === 0);
    nextMonthPunishmentBtn.disabled = (currentPunishmentMonthIndex >= currentAcademicMonthIndex);


    punishmentSummaryTableHeader.innerHTML = `
        <tr>
            <th>เลขที่</th>
            <th>รหัสนักเรียน</th>
            <th>ชื่อ - นามสกุล</th>
            <th>สัปดาห์ที่ 1</th>
            <th>สัปดาห์ที่ 2</th>
            <th>สัปดาห์ที่ 3</th>
            <th>สัปดาห์ที่ 4</th>
            <th>สัปดาห์ที่ 5</th>
            <th>รวม</th>
            <th>สถานะบทลงโทษ</th>
        </tr>
        <tr id="punishmentWeeklyFeesHeader">
            <th colspan="3">ค่าห้องที่ต้องจ่ายต่อสัปดาห์:</th>
            <th class="weekly-fee-header" id="punishmentWeeklyFeeHeader-week1"></th>
            <th class="weekly-fee-header" id="punishmentWeeklyFeeHeader-week2"></th>
            <th class="weekly-fee-header" id="punishmentWeeklyFeeHeader-week3"></th>
            <th class="weekly-fee-header" id="punishmentWeeklyFeeHeader-week4"></th>
            <th class="weekly-fee-header" id="punishmentWeeklyFeeHeader-week5"></th>
            <th class="weekly-fee-header" id="punishmentWeeklyFeeHeader-weekall"></th>
            <th></th> <!-- Empty header for Punishment Status column -->
        </tr>
    `;

    const studentsSnapshot = await studentsCollection.orderBy('studentNumber').get();
    const allStudents = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    const selectedMonthName = months[currentPunishmentMonthIndex];
    const weeklyScoresPromises = allStudents.map(student =>
        weeklyScoresCollection.doc(student.id).collection('months').doc(selectedMonthName).get()
    );
    const weeklyScoresDocs = await Promise.all(weeklyScoresPromises);

    const studentScoresMap = new Map();
    weeklyScoresDocs.forEach(doc => {
        if (doc.exists) {
            studentScoresMap.set(doc.ref.parent.parent.id, doc.data());
        }
    });

    await loadPaymentRequirements();

    const monthRequirements = currentPaymentRequirements[selectedMonthName] || {
        monthlyFee: 0,
        weeklyFees: {}
    };
    const requiredWeeklyFees = monthRequirements.weeklyFees || {};
    const requiredMonthlyFee = monthRequirements.monthlyFee || 0;

    document.getElementById('punishmentWeeklyFeeHeader-week1').textContent = requiredWeeklyFees.week1 !== undefined ? `${requiredWeeklyFees.week1} บาท` : '-';
    document.getElementById('punishmentWeeklyFeeHeader-week2').textContent = requiredWeeklyFees.week2 !== undefined ? `${requiredWeeklyFees.week2} บาท` : '-';
    document.getElementById('punishmentWeeklyFeeHeader-week3').textContent = requiredWeeklyFees.week3 !== undefined ? `${requiredWeeklyFees.week3} บาท` : '-';
    document.getElementById('punishmentWeeklyFeeHeader-week4').textContent = requiredWeeklyFees.week4 !== undefined ? `${requiredWeeklyFees.week4} บาท` : '-';
    document.getElementById('punishmentWeeklyFeeHeader-week5').textContent = requiredWeeklyFees.week5 !== undefined ? `${requiredWeeklyFees.week5} บาท` : '-';
    document.getElementById('punishmentWeeklyFeeHeader-weekall').textContent = requiredWeeklyFees.week5 !== undefined ? `${(requiredWeeklyFees.week1 || 0) + (requiredWeeklyFees.week2 || 0) + (requiredWeeklyFees.week3 || 0) + (requiredWeeklyFees.week4 || 0) + (requiredWeeklyFees.week5 || 0)} บาท` : '-';


    const studentsToDisplay = [];

    for (const student of allStudents) {
        const studentWeeklyScores = studentScoresMap.get(student.id) || {};
        let monthlyTotalPaid = 0;
        const studentWeeklyPaymentStatus = {};

        for (let i = 1; i <= numWeeksInMonth; i++) {
            const weekKey = `week${i}`;
            const paidAmount = studentWeeklyScores[weekKey] !== undefined ? studentWeeklyScores[weekKey] : 0;
            monthlyTotalPaid += paidAmount;
            studentWeeklyPaymentStatus[weekKey] = paidAmount;
        }

        if (requiredMonthlyFee > 0 && monthlyTotalPaid < requiredMonthlyFee) {
            studentsToDisplay.push({
                student: student,
                weeklyPaymentStatus: studentWeeklyPaymentStatus,
                monthlyTotalPaid: monthlyTotalPaid,
                requiredMonthlyFee: requiredMonthlyFee
            });
        }
    }
    
    punishmentSummaryTableBody.innerHTML = '';

    if (studentsToDisplay.length === 0) {
        const row = punishmentSummaryTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 10;
        cell.textContent = `ไม่มีนักเรียนคนใดค้างชำระค่าห้องในเดือน ${selectedMonthName}`;
        cell.style.textAlign = "center";
        cell.style.fontStyle = "italic";
        return;
    }

    for (const studentData of studentsToDisplay) {
        const student = studentData.student;
        const weeklyPaymentStatus = studentData.weeklyPaymentStatus;
        const row = punishmentSummaryTableBody.insertRow();
        row.innerHTML = `
            <td>${student.studentNumber || '-'}</td>
            <td>${student.id}</td>
            <td>${student.prefix} ${student.name} ${student.lastName}</td>
        `;

        for (let i = 1; i <= numWeeksInMonth; i++) {
            const weekKey = `week${i}`;
            const paidAmount = weeklyPaymentStatus[weekKey];
            const requiredAmount = requiredWeeklyFees[weekKey] !== undefined ? requiredWeeklyFees[weekKey] : 0;

            const weekCell = document.createElement('td');
            weekCell.textContent = paidAmount;

            if (requiredAmount > 0) {
                if (paidAmount === 0) {
                    weekCell.classList.add('payment-status-red');
                } else if (paidAmount < requiredAmount) {
                    weekCell.classList.add('payment-status-yellow');
                }
            }
            row.appendChild(weekCell);
        }
        const totalPaidCell = document.createElement('td');
        totalPaidCell.textContent = studentData.monthlyTotalPaid;
        totalPaidCell.style.fontWeight = 'bold';
        row.appendChild(totalPaidCell);

        const punishmentStatusCell = document.createElement('td');
        if (studentData.monthlyTotalPaid < studentData.requiredMonthlyFee) {
            punishmentStatusCell.textContent = 'โดนบทลงโทษ';
            punishmentStatusCell.classList.add('payment-status-red');
        } else {
            punishmentStatusCell.textContent = 'ไม่มีบทลงโทษ';
        }
        row.appendChild(punishmentStatusCell);
    }
}


// --- App Settings Functions ---
async function loadAppSettings() {
    try {
        const doc = await appSettingsDocRef.get();
        if (doc.exists) {
            const settings = doc.data();
            // History settings
            autoDeleteToggle.checked = settings.autoDeleteEnabled || false;
            historyLimitInput.value = settings.historyLimit || 100;
            // News settings
            autoDeleteNewsToggle.checked = settings.autoDeleteNewsEnabled || false;
            newsLimitInput.value = settings.newsLimit || 10;
        } else {
            // Set default settings if document doesn't exist
            const defaultSettings = {
                autoDeleteEnabled: false,
                historyLimit: 100,
                autoDeleteNewsEnabled: false,
                newsLimit: 10
            };
            await appSettingsDocRef.set(defaultSettings);
            autoDeleteToggle.checked = defaultSettings.autoDeleteEnabled;
            historyLimitInput.value = defaultSettings.historyLimit;
            autoDeleteNewsToggle.checked = defaultSettings.autoDeleteNewsEnabled;
            newsLimitInput.value = defaultSettings.newsLimit;
        }
    } catch (error) {
        console.error("Error loading app settings:", error);
    }
}

async function saveAppSettings(newSettings) {
    try {
        await appSettingsDocRef.set(newSettings, {
            merge: true
        });
        console.log("App settings saved successfully.");
        return true;
    } catch (error) {
        console.error("Error saving app settings:", error);
        return false;
    }
}

// --- History Settings ---
function toggleHistoryLimitEditMode(isEditMode) {
    if (isEditMode) {
        historyLimitInput.removeAttribute('readonly');
        editHistoryLimitBtn.style.display = 'none';
        historyLimitEditActions.style.display = 'flex';
    } else {
        historyLimitInput.setAttribute('readonly', true);
        editHistoryLimitBtn.style.display = 'inline-block';
        historyLimitEditActions.style.display = 'none';
        historyLimitErrorMessage.textContent = ''; // Clear error
        loadAppSettings(); // Reload to revert to saved value if cancelled
    }
}

async function handleSaveHistoryLimit() {
    historyLimitErrorMessage.textContent = "";

    const newLimit = parseInt(historyLimitInput.value);
    if (isNaN(newLimit) || newLimit <= 0) {
        historyLimitErrorMessage.textContent = "ขีดจำกัดต้องเป็นตัวเลขและมากกว่า 0";
        return;
    }

    const currentSettings = (await appSettingsDocRef.get()).data() || {};
    const updatedSettings = { ...currentSettings,
        historyLimit: newLimit
    };

    const success = await saveAppSettings(updatedSettings);
    if (success) {
        toggleHistoryLimitEditMode(false);
        await checkAndTrimHistory(); // Run trim immediately after limit change
    } else {
        historyLimitErrorMessage.textContent = "เกิดข้อผิดพลาดในการบันทึกขีดจำกัด";
    }
}

async function checkAndTrimHistory() {
    try {
        const settingsDoc = await appSettingsDocRef.get();
        if (!settingsDoc.exists) return;

        const settings = settingsDoc.data();

        const snapshot = await saveHistoryCollection.orderBy('timestamp', 'desc').get();
        const currentCount = snapshot.size;

        if (historyCountDisplay) {
            historyCountDisplay.textContent = `จำนวนประวัติการบันทึก: ${currentCount}`;
        }

        if (!settings.autoDeleteEnabled) {
            return;
        }

        const limit = settings.historyLimit || 100;

        if (currentCount > limit) {
            const recordsToDelete = snapshot.docs.slice(limit);
            const batch = db.batch();
            recordsToDelete.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Deleted ${recordsToDelete.length} old history records.`);
            if (historyCountDisplay) {
                historyCountDisplay.textContent = `จำนวนประวัติการบันทึก: ${limit}`;
            }
            if (saveHistoryTableContainer.classList.contains('active')) {
                renderSaveHistory();
            }
        }
    } catch (error) {
        console.error("Error checking and trimming history:", error);
    }
}


// --- Admin Clear History Modal Functions ---
function openAdminClearHistoryModal() {
    adminClearHistoryModal.style.display = 'flex';
}

function closeAdminClearHistoryModal() {
    adminClearHistoryModal.style.display = 'none';
}

async function clearSaveHistoryFromFirebase() {
    try {
        const snapshot = await saveHistoryCollection.get();
        if (snapshot.empty) {
            closeAdminClearHistoryModal();
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        closeAdminClearHistoryModal();
        switchContentSection('studentList');

    } catch (error) {
        console.error("Error clearing save history:", error);
    }
}

// --- Settings Admin Password Modal Functions ---
function openSettingsAdminPasswordModal() {
    settingsAdminPasswordModal.style.display = 'flex';
    settingsAdminPasswordInput.value = '';
    settingsAdminPasswordErrorMessage.textContent = '';
    settingsAdminPasswordInput.focus();
}

function closeSettingsAdminPasswordModal() {
    settingsAdminPasswordModal.style.display = 'none';
}

async function handleSettingsAdminPasswordConfirm() {
    const password = settingsAdminPasswordInput.value;
    if (password !== ADMIN_PASSWORD) {
        settingsAdminPasswordErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        return;
    }
    settingsAdminPasswordErrorMessage.textContent = "";
    closeSettingsAdminPasswordModal();
    switchPage('settings');
}

// --- Add Student Functions ---
function openAddStudentModal() {
    addStudentModal.style.display = 'flex';
    addStudentNumber.value = '';
    addStudentId.value = '';
    addPrefix.value = 'เด็กชาย';
    addName.value = '';
    addLastName.value = '';
    addGrade.value = 'มัธยมศึกษาปีที่ 3';
    addClass.value = '3/1';
    addStatus.value = 'นักเรียน';
    addDob.value = '-';
    addPhone.value = '-';
    addStudentErrorMessage.textContent = '';
    addStudentNumber.focus();
}

async function addNewStudent() {
    const newStudentId = addStudentId.value.trim();
    const newStudentNumber = parseInt(addStudentNumber.value);
    const newPrefix = addPrefix.value;
    const newName = addName.value.trim();
    const newLastName = addLastName.value.trim();
    const newPhone = addPhone.value.trim();
    const newFullName = `${newPrefix} ${newName} ${newLastName}`;

    if (!newStudentId || isNaN(newStudentNumber) || newStudentNumber <= 0 || !newName || !newLastName) {
        addStudentErrorMessage.textContent = "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รหัสนักเรียน, เลขที่, ชื่อ, นามสกุล)";
        addStudentErrorMessage.style.color = "red";
        return;
    }

    const isIdTaken = studentsData.some(s => s.id === newStudentId);
    if (isIdTaken) {
        addStudentErrorMessage.textContent = "รหัสนักเรียนนี้มีอยู่แล้ว! โปรดใช้รหัสอื่น";
        addStudentErrorMessage.style.color = "red";
        return;
    }

    const isStudentNumberTaken = studentsData.some(s => s.studentNumber === newStudentNumber);
    if (isStudentNumberTaken) {
        addStudentErrorMessage.textContent = "เลขที่นักเรียนนี้มีอยู่แล้ว! โปรดใช้เลขที่อื่น";
        addStudentErrorMessage.style.color = "red";
        return;
    }

    const isFullNameTaken = studentsData.some(s => `${s.prefix} ${s.name} ${s.lastName}` === newFullName);
    if (isFullNameTaken) {
        addStudentErrorMessage.textContent = "ชื่อ-นามสกุลนี้มีอยู่แล้ว! โปรดแก้ไข";
        addStudentErrorMessage.style.color = "red";
        return;
    }

    const isPhoneTaken = studentsData.some(s => s.phone === newPhone && newPhone !== '-');
    if (isPhoneTaken) {
        addStudentErrorMessage.textContent = "เบอร์โทรศัพท์นี้มีอยู่แล้ว! โปรดแก้ไข";
        addStudentErrorMessage.style.color = "red";
        return;
    }

    const newStudentData = {
        id: newStudentId,
        studentNumber: newStudentNumber,
        prefix: newPrefix,
        name: newName,
        lastName: newLastName,
        grade: addGrade.value,
        class: addClass.value,
        status: addStatus.value,
        dob: addDob.value,
        phone: newPhone
    };

    try {
        await studentsCollection.doc(newStudentId).set(newStudentData);
        console.log(`Student ${newStudentId} added successfully.`);
        addStudentErrorMessage.textContent = "เพิ่มนักเรียนเรียบร้อยแล้ว!";
        addStudentErrorMessage.style.color = "green";

        await loadStudentsFromFirebase();
        renderStudentList();
        renderStudentScores();

        await logSaveAction(newStudentId, `${newStudentData.prefix} ${newStudentData.name} ${newStudentData.lastName}`, "เพิ่มนักเรียนใหม่", null, null, newStudentData.studentNumber);
        await checkAndTrimHistory();

        setTimeout(() => {
            addStudentModal.style.display = 'none';
        }, 1500);

    } catch (error) {
        console.error("Error adding new student:", error);
        addStudentErrorMessage.textContent = `เกิดข้อผิดพลาดในการเพิ่มนักเรียน: ${error.message}`;
        addStudentErrorMessage.style.color = "red";
    }
}

function closeAddStudentModal() {
    addStudentModal.style.display = 'none';
}

// --- Delete Student Functions ---
async function openDeleteStudentSelectionModal() {
    deleteStudentSelectionModal.style.display = 'flex';
    deleteStudentList.innerHTML = '';

    const sortedStudents = [...studentsData].sort((a, b) => a.studentNumber - b.studentNumber);

    if (sortedStudents.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = "ไม่มีนักเรียนในระบบ";
        listItem.style.textAlign = "center";
        listItem.style.fontStyle = "italic";
        deleteStudentList.appendChild(listItem);
        return;
    }

    sortedStudents.forEach(student => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>เลขที่ ${student.studentNumber} - ${student.prefix} ${student.name} ${student.lastName} (${student.id})</span>
            <button class="select-delete-btn" data-student-id="${student.id}" data-student-name="${student.prefix} ${student.name} ${student.lastName}">ลบ</button>
        `;
        deleteStudentList.appendChild(listItem);
    });

    document.querySelectorAll('#deleteStudentList .select-delete-btn').forEach(button => {
        button.onclick = (event) => {
            const studentId = event.target.dataset.studentId;
            const studentName = event.target.dataset.studentName;
            closeDeleteStudentSelectionModal();
            openConfirmDeleteStudentModal(studentId, studentName);
        };
    });
}

function closeDeleteStudentSelectionModal() {
    deleteStudentSelectionModal.style.display = 'none';
}

function openConfirmDeleteStudentModal(studentId, studentName) {
    currentStudentToDelete = studentId;
    studentToDeleteName.textContent = studentName;
    studentToDeleteId.textContent = studentId;
    deleteConfirmationErrorMessage.textContent = '';
    confirmDeleteStudentModal.style.display = 'flex';
}

function closeConfirmDeleteStudentModal() {
    confirmDeleteStudentModal.style.display = 'none';
    currentStudentToDelete = null;
}

async function deleteStudentConfirmed() {
    if (!currentStudentToDelete) {
        console.error("No student selected for deletion.");
        return;
    }

    const studentId = currentStudentToDelete;
    const studentInfo = studentInfoMap.get(studentId) || {
        name: 'ไม่พบชื่อนักเรียน',
        studentNumber: null
    };
    const studentName = studentInfo.name;
    const studentNumber = studentInfo.studentNumber;

    try {
        await studentsCollection.doc(studentId).delete();
        console.log(`Student details for ${studentId} deleted.`);

        const weeklyMonthsSnapshot = await weeklyScoresCollection.doc(studentId).collection('months').get();
        const batch = db.batch();
        weeklyMonthsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Weekly scores for ${studentId} deleted.`);

        await logSaveAction(studentId, studentName, "ลบนักเรียน", null, null, studentNumber);
        await checkAndTrimHistory();

        await loadStudentsFromFirebase();
        renderStudentList();
        renderStudentScores();
        closeConfirmDeleteStudentModal();
        switchPage('class');

    } catch (error) {
        console.error("Error deleting student:", error);
        deleteConfirmationErrorMessage.textContent = `เกิดข้อผิดพลาดในการลบนักเรียน: ${error.message}`;
        deleteConfirmationErrorMessage.style.color = "red";
    }
}


// --- Page and Content Switching Logic ---
function switchPage(pageName) {
    activePage = pageName;
    document.querySelectorAll('#app-container > .page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));

    switch (pageName) {
        case 'home':
            homePlaceholderContainer.classList.add('active');
            navHomeBtn.classList.add('active');
            renderNews(); // Render news when switching to home
            break;
        case 'class':
            classPageContainer.classList.add('active');
            navClassBtn.classList.add('active');
            switchContentSection(activeClassSection || 'studentList');
            break;
        case 'contact':
            contactAdminContainer.classList.add('active');
            navContactBtn.classList.add('active');
            generateCaptcha();
            break;
        case 'settings':
            settingsContainer.classList.add('active');
            navSettingBtn.classList.add('active');
            loadAppSettings();
            checkAndTrimHistory();
            checkAndTrimNews(); // Also check news count when visiting settings
            break;
    }
}

async function switchContentSection(sectionName, month) {
    activeClassSection = sectionName;
    document.querySelectorAll('#classPageContainer .content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.toggle-buttons .toggle-btn').forEach(btn => btn.classList.remove('active'));
    
    let btnId;
    switch(sectionName) {
        case 'studentList': btnId = 'showStudentListBtn'; break;
        case 'studentScores': btnId = 'showStudentScoresBtn'; break;
        case 'studentScoresAll': btnId = 'showStudentScoresBtnAll'; break;
        case 'studentFeeSummary': btnId = 'showStudentFeeSummaryBtn'; break;
        case 'punishmentSummary': btnId = 'showPunishmentSummaryBtn'; break;
        case 'saveHistory': btnId = 'ScoresHistoryBtn'; break;
        case 'allStudentsWeeklyScores': btnId = 'showStudentScoresBtnAll'; break;
    }
    if(btnId) document.getElementById(btnId).classList.add('active');


    switch (sectionName) {
        case 'studentList':
            studentListTableContainer.classList.add('active');
            await renderStudentList();
            break;
        case 'studentScores':
            scoreTableContainer.classList.add('active');
            await renderStudentScores();
            break;
        case 'studentScoresAll':
            openAllStudentsMonthSelectionModal();
            document.querySelector(`#classPageContainer .content-section.active`)?.classList.remove('active');
            studentListTableContainer.classList.add('active'); // Fallback to a visible section
            break;
        case 'allStudentsWeeklyScores':
             allStudentsWeeklyScoresMainContainer.classList.add('active');
             await displayAllStudentsWeeklyScoresInMain(month);
             break;
        case 'studentFeeSummary':
            studentFeeSummaryTableContainer.classList.add('active');
            await renderStudentFeeSummary();
            break;
        case 'punishmentSummary':
            punishmentSummarySection.classList.add('active');
            await renderPunishmentSummary();
            break;
        case 'saveHistory':
            saveHistoryTableContainer.classList.add('active');
            await renderSaveHistory();
            break;
    }
}


// --- Payment Requirements Functions ---
async function loadPaymentRequirements() {
    try {
        const doc = await paymentRequirementsDocRef.get();
        if (doc.exists) {
            currentPaymentRequirements = doc.data();
        } else {
            const defaultRequirements = {};
            months.forEach(month => {
                defaultRequirements[month] = {
                    monthlyFee: 100,
                    weeklyFees: {
                        week1: 20,
                        week2: 20,
                        week3: 20,
                        week4: 20,
                        week5: 20
                    }
                };
            });
            await paymentRequirementsDocRef.set(defaultRequirements);
            currentPaymentRequirements = defaultRequirements;
        }
        console.log("Payment requirements loaded:", currentPaymentRequirements);
    }
    catch (error) {
        console.error("Error loading payment requirements:", error);
        currentPaymentRequirements = {};
    }
}

function openSetMonthlyFeesModal() {
    setMonthlyFeesModal.style.display = 'flex';
    monthlyFeesGrid.innerHTML = '';

    months.forEach(month => {
        const monthData = currentPaymentRequirements[month] || {
            monthlyFee: 0,
            weeklyFees: {}
        };
        const monthlyFee = monthData.monthlyFee || 0;
        const weeklyFees = monthData.weeklyFees || {};

        const monthItem = document.createElement('div');
        monthItem.classList.add('month-fee-item');
        monthItem.innerHTML = `
            <h4>${month}</h4>
            <div>
                <label for="monthlyFee-${month}">ค่าห้องต่อเดือน:</label>
                <input type="number" id="monthlyFee-${month}" min="0" value="${monthlyFee}" data-month="${month}" data-type="monthly">
            </div>
            <div class="weekly-fees-inputs">
                <div><label for="weeklyFee-${month}-week1">สัปดาห์ที่ 1:</label><input type="number" id="weeklyFee-${month}-week1" min="0" value="${weeklyFees.week1 || 0}" data-month="${month}" data-week="week1" data-type="weekly"></div>
                <div><label for="weeklyFee-${month}-week2">สัปดาห์ที่ 2:</label><input type="number" id="weeklyFee-${month}-week2" min="0" value="${weeklyFees.week2 || 0}" data-month="${month}" data-week="week2" data-type="weekly"></div>
                <div><label for="weeklyFee-${month}-week3">สัปดาห์ที่ 3:</label><input type="number" id="weeklyFee-${month}-week3" min="0" value="${weeklyFees.week3 || 0}" data-month="${month}" data-week="week3" data-type="weekly"></div>
                <div><label for="weeklyFee-${month}-week4">สัปดาห์ที่ 4:</label><input type="number" id="weeklyFee-${month}-week4" min="0" value="${weeklyFees.week4 || 0}" data-month="${month}" data-week="week4" data-type="weekly"></div>
                <div><label for="weeklyFee-${month}-week5">สัปดาห์ที่ 5:</label><input type="number" id="weeklyFee-${month}-week5" min="0" value="${weeklyFees.week5 || 0}" data-month="${month}" data-week="week5" data-type="weekly"></div>
            </div>
        `;
        monthlyFeesGrid.appendChild(monthItem);

        const weeklyInputs = monthItem.querySelectorAll('.weekly-fees-inputs input');
        weeklyInputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const currentMonth = event.target.dataset.month;
                let sumOfWeeks = 0;
                monthItem.querySelectorAll('.weekly-fees-inputs input').forEach(weeklyInput => {
                    sumOfWeeks += parseInt(weeklyInput.value) || 0;
                });
                document.getElementById(`monthlyFee-${currentMonth}`).value = sumOfWeeks;
            });
        });
    });

    monthlyFeesGrid.querySelectorAll('.month-fee-item').forEach(monthItem => {
        const currentMonth = monthItem.querySelector('[data-type="monthly"]').dataset.month;
        let sumOfWeeks = 0;
        monthItem.querySelectorAll('.weekly-fees-inputs input').forEach(weeklyInput => {
            sumOfWeeks += parseInt(weeklyInput.value) || 0;
        });
        document.getElementById(`monthlyFee-${currentMonth}`).value = sumOfWeeks;
    });
}

function closeSetMonthlyFeesModal() {
    setMonthlyFeesModal.style.display = 'none';
}

async function saveMonthlyFees() {
    const newPaymentRequirements = {};
    let changesMade = false;

    months.forEach(month => {
        const monthlyFeeInput = document.getElementById(`monthlyFee-${month}`);
        const newMonthlyFee = parseInt(monthlyFeeInput.value) || 0;

        const newWeeklyFees = {};
        for (let i = 1; i <= numWeeksInMonth; i++) {
            const weeklyFeeInput = document.getElementById(`weeklyFee-${month}-week${i}`);
            newWeeklyFees[`week${i}`] = parseInt(weeklyFeeInput.value) || 0;
        }

        const oldMonthlyFee = (currentPaymentRequirements[month] && currentPaymentRequirements[month].monthlyFee) || 0;
        const oldWeeklyFees = (currentPaymentRequirements[month] && currentPaymentRequirements[month].weeklyFees) || {};

        if (newMonthlyFee !== oldMonthlyFee || JSON.stringify(newWeeklyFees) !== JSON.stringify(oldWeeklyFees)) {
            changesMade = true;
        }

        newPaymentRequirements[month] = {
            monthlyFee: newMonthlyFee,
            weeklyFees: newWeeklyFees
        };
    });

    if (changesMade) {
        try {
            await paymentRequirementsDocRef.set(newPaymentRequirements);
            currentPaymentRequirements = newPaymentRequirements;
            console.log("Monthly fees saved successfully.");

            if (studentFeeSummaryTableContainer.classList.contains('active')) {
                renderStudentFeeSummary();
            }

            closeSetMonthlyFeesModal();
        } catch (error) {
            console.error("Error saving monthly fees:", error);
        }
    } else {
        closeSetMonthlyFeesModal();
    }
}

// --- Add Multiple Weekly Fees Modal Functions ---
function openAddMultipleWeeklyFeesModal() {
    if (!currentAllStudentsWeeklyScoresMonth) {
        alert("กรุณาเลือกเดือนก่อนที่จะเพิ่มค่าห้องหลายคน");
        return;
    }

    addMultipleWeeklyFeesModalTitle.textContent = `ตั้งค่าห้องรายสัปดาห์หลายคนสำหรับเดือน ${currentAllStudentsWeeklyScoresMonth}`;
    multipleWeeklyFeesTableBody.innerHTML = '';

    const sortedStudents = [...studentsData].sort((a, b) => a.studentNumber - b.studentNumber);

    sortedStudents.forEach(student => {
        const row = multipleWeeklyFeesTableBody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" class="student-select-checkbox" data-student-id="${student.id}"></td>
            <td>${student.studentNumber}</td>
            <td>${student.prefix} ${student.name} ${student.lastName}</td>
            <td><input type="checkbox" class="week-select-checkbox" data-week="week1"></td>
            <td><input type="checkbox" class="week-select-checkbox" data-week="week2"></td>
            <td><input type="checkbox" class="week-select-checkbox" data-week="week3"></td>
            <td><input type="checkbox" class="week-select-checkbox" data-week="week4"></td>
            <td><input type="checkbox" class="week-select-checkbox" data-week="week5"></td>
        `;
    });

    multipleFeeAmountInput.value = "20";
    selectAllStudentsCheckbox.checked = false;
    document.querySelectorAll('.select-all-week-checkbox').forEach(cb => cb.checked = false);
    addMultipleWeeklyFeesAdminPasswordInput.value = '';
    addMultipleWeeklyFeesErrorMessage.textContent = '';
    
    initialMultipleFeesActions.style.display = 'block';
    addMultipleFeesPasswordSection.style.display = 'none';

    addMultipleWeeklyFeesModal.style.display = 'flex';
}

function closeAddMultipleWeeklyFeesModal() {
    addMultipleWeeklyFeesModal.style.display = 'none';
}

async function confirmAndSaveMultipleFees() {
    const password = addMultipleWeeklyFeesAdminPasswordInput.value;
    if (password !== ADMIN_PASSWORD) {
        addMultipleWeeklyFeesErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        return;
    }
    addMultipleWeeklyFeesErrorMessage.textContent = "";

    const month = currentAllStudentsWeeklyScoresMonth;
    if (!month) {
        console.error("Month not selected.");
        return;
    }
    
    const amountToSet = parseInt(multipleFeeAmountInput.value);
    if (isNaN(amountToSet) || amountToSet < 0) {
        addMultipleWeeklyFeesErrorMessage.textContent = "กรุณาใส่จำนวนเงินเป็นตัวเลขที่ไม่ติดลบ";
        return;
    }

    const batch = db.batch();
    const rows = multipleWeeklyFeesTableBody.querySelectorAll('tr');
    const logPromises = [];

    const studentIds = Array.from(rows).map(row => row.querySelector('.student-select-checkbox').dataset.studentId);
    const scoreDocs = await Promise.all(
        studentIds.map(id => weeklyScoresCollection.doc(id).collection('months').doc(month).get())
    );
    const currentScoresMap = new Map();
    scoreDocs.forEach((doc, index) => {
        currentScoresMap.set(studentIds[index], doc.exists ? doc.data() : {});
    });

    let changesMade = false;

    rows.forEach(row => {
        const studentCheckbox = row.querySelector('.student-select-checkbox');
        if (studentCheckbox.checked) {
            const studentId = studentCheckbox.dataset.studentId;
            const weekCheckboxes = row.querySelectorAll('.week-select-checkbox');
            const updatedScores = { ...(currentScoresMap.get(studentId) || {}) };
            let studentHasChanges = false;
            let detailedWeeklyChangesForStudent = [];
            
            weekCheckboxes.forEach(weekCheckbox => {
                if (weekCheckbox.checked) {
                    const weekKey = weekCheckbox.dataset.week;
                    const oldScore = updatedScores[weekKey] || 0;
                    const newScore = amountToSet;
                    
                    if (newScore !== oldScore) {
                         detailedWeeklyChangesForStudent.push({
                            week: `สัปดาห์ที่ ${parseInt(weekKey.replace('week', ''))}`,
                            oldScore: oldScore,
                            newScore: newScore,
                            change: newScore - oldScore
                        });
                        updatedScores[weekKey] = newScore;
                        studentHasChanges = true;
                        changesMade = true;
                    }
                }
            });

            if (studentHasChanges) {
                const docRef = weeklyScoresCollection.doc(studentId).collection('months').doc(month);
                batch.set(docRef, updatedScores, { merge: true });

                const studentInfo = studentInfoMap.get(studentId);
                const totalChange = detailedWeeklyChangesForStudent.reduce((sum, change) => sum + change.change, 0);
                logPromises.push(
                    logSaveAction(studentId, studentInfo.name, `ตั้งค่าห้องหลายคนเดือน${month}`, totalChange, detailedWeeklyChangesForStudent, studentInfo.studentNumber)
                );
            }
        }
    });

    if (!changesMade) {
        addMultipleWeeklyFeesErrorMessage.textContent = "ไม่มีการเลือกนักเรียนหรือสัปดาห์";
        return;
    }

    try {
        await batch.commit();
        await Promise.all(logPromises);
        await checkAndTrimHistory();
        
        closeAddMultipleWeeklyFeesModal();
        await displayAllStudentsWeeklyScoresInMain(month);

    } catch (error) {
        console.error("Error saving multiple weekly fees:", error);
        addMultipleWeeklyFeesErrorMessage.textContent = "เกิดข้อผิดพลาดในการบันทึก";
    }
}

// --- CAPTCHA Functions ---
function generateCaptcha() {
    captchaNum1 = Math.floor(Math.random() * 10) + 1;
    captchaNum2 = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = captchaNum1 + captchaNum2;
    captchaQuestion.textContent = `คุณไม่ใช่บอทใช่ไหม? ${captchaNum1} + ${captchaNum2} = ?`;
    captchaInput.value = '';
    captchaError.textContent = '';
    contactSubmitBtn.disabled = true;
}

function validateCaptcha() {
    const userAnswer = parseInt(captchaInput.value);
    if (userAnswer === captchaAnswer) {
        captchaError.textContent = 'ยืนยันสำเร็จ!';
        captchaError.style.color = 'var(--success-color)';
        contactSubmitBtn.disabled = false;
    } else {
        captchaError.textContent = '';
        contactSubmitBtn.disabled = true;
    }
}

async function handleContactFormSubmit(event) {
    event.preventDefault();

    if (contactSubmitBtn.disabled) {
        captchaError.textContent = 'กรุณากรอกคำตอบให้ถูกต้อง';
        return;
    }

    const statusDiv = document.getElementById('contactStatus');
    statusDiv.textContent = 'กำลังส่งข้อความ...';
    statusDiv.style.color = 'var(--primary-color)';

    const serviceID = 'service_93p3p1u';
    const templateID = 'template_lx9nl0c';

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            statusDiv.textContent = 'ส่งข้อความเรียบร้อยแล้ว!';
            statusDiv.style.color = 'var(--success-color)';
            contactAdminForm.reset();
            generateCaptcha();
        }, (error) => {
            console.error('การส่งข้อความล้มเหลว:', error);
            statusDiv.textContent = 'การส่งข้อความล้มเหลว กรุณาลองใหม่อีกครั้ง';
            statusDiv.style.color = 'var(--danger-color)';
            generateCaptcha();
        });
}

// --- NEWS SYSTEM FUNCTIONS ---

// Function to render news cards from Firebase
async function renderNews() {
    newsContainer.innerHTML = ''; // Clear existing news
    try {
        const snapshot = await newsCollection.get();
        
        if (newsCountDisplay) {
            newsCountDisplay.textContent = `จำนวนข่าวสารปัจจุบัน: ${snapshot.size}`;
        }

        if (snapshot.empty) {
            newsContainer.innerHTML = '<p>ยังไม่มีข่าวสารหรือประกาศในขณะนี้</p>';
            return;
        }

        // Sort documents in JavaScript: pinned first, then by timestamp
        const sortedDocs = snapshot.docs.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();
            const aIsPinned = aData.isPinned || false;
            const bIsPinned = bData.isPinned || false;

            if (aIsPinned !== bIsPinned) {
                return aIsPinned ? -1 : 1;
            }
            return bData.timestamp.toMillis() - aData.timestamp.toMillis();
        });

        sortedDocs.forEach(doc => {
            const news = doc.data();
            const newsId = doc.id;
            const card = document.createElement('div');
            card.className = 'news-card';
            if (news.isPinned) {
                card.classList.add('pinned');
            }
            card.dataset.id = newsId;
             card.onclick = (event) => {
                if (event.target.tagName.toLowerCase() !== 'img') { 
                    openNewsDetailModal(news);
                }
            };

            const imageUrl = news.imageUrl;
            const timestamp = news.timestamp ? new Date(news.timestamp.toDate()).toLocaleString('th-TH') : 'ไม่ระบุเวลา';

            const imageHtml = imageUrl 
                ? `<img src="${imageUrl}" alt="News Image" onerror="this.style.display='none';" onclick="event.stopPropagation(); openImageModal('${imageUrl}')">`
                : '';
            
            card.innerHTML = `
                ${imageHtml}
                <div class="news-card-content">
                    <h3>${news.title}</h3>
                    <p>${news.content}</p>
                    <div class="news-card-timestamp">
                        <span>โพสต์เมื่อ: ${timestamp}</span>
                    </div>
                </div>
            `;
            newsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error rendering news:", error);
        newsContainer.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข่าวสาร</p>';
    }
}

// Function to open the add news modal
function openAddNewsModal() {
    newsTitleInput.value = '';
    newsContentInput.value = '';
    newsImageUrlInput.value = '';
    pinNewsToggle.checked = false;
    newsImagePreview.style.display = 'none';
    newsImagePreview.src = '';
    addNewsErrorMessage.textContent = '';
    addNewsModal.style.display = 'flex';
}

// Function to close the add news modal
function closeAddNewsModal() {
    addNewsModal.style.display = 'none';
}

// Function to save a new announcement
async function saveNews() {
    const title = newsTitleInput.value.trim();
    const content = newsContentInput.value.trim();
    const imageUrl = newsImageUrlInput.value.trim();
    const isPinned = pinNewsToggle.checked;

    if (!title || !content) {
        addNewsErrorMessage.textContent = "กรุณากรอกหัวข้อและเนื้อหาข่าว";
        return;
    }

    addNewsErrorMessage.textContent = '';

    try {
        await newsCollection.add({
            title: title,
            content: content,
            imageUrl: imageUrl,
            isPinned: isPinned,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeAddNewsModal();
        await checkAndTrimNews(); // Check if old news needs to be deleted
        renderNews(); // Re-render news list
    } catch (error) {
        console.error("Error saving news:", error);
        addNewsErrorMessage.textContent = "เกิดข้อผิดพลาดในการบันทึกข่าวสาร";
    }
}

// Function to open the delete news modal
async function openDeleteNewsModal() {
    deleteNewsList.innerHTML = '<li>กำลังโหลด...</li>';
    deleteNewsModal.style.display = 'flex';

    try {
        const snapshot = await newsCollection.get();
        
        const sortedDocs = snapshot.docs.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();
            const aIsPinned = aData.isPinned || false;
            const bIsPinned = bData.isPinned || false;
            if (aIsPinned !== bIsPinned) return aIsPinned ? -1 : 1;
            return bData.timestamp.toMillis() - aData.timestamp.toMillis();
        });

        deleteNewsList.innerHTML = '';
        if (sortedDocs.length === 0) {
            deleteNewsList.innerHTML = '<li>ไม่มีข่าวสารให้จัดการ</li>';
            return;
        }

        sortedDocs.forEach(doc => {
            const news = doc.data();
            const newsId = doc.id;
            const timestamp = news.timestamp ? new Date(news.timestamp.toDate()).toLocaleString('th-TH') : 'ไม่ระบุเวลา';
            const listItem = document.createElement('li');
            
            const pinButtonText = news.isPinned ? 'ยกเลิกปักหมุด' : 'ปักหมุด';
            const pinButtonClass = news.isPinned ? 'unpin-news-item-btn' : 'pin-news-item-btn';

            listItem.innerHTML = `
                <div class="delete-news-info">
                    <span class="delete-news-title">${news.isPinned ? '📌 ' : ''}${news.title}</span>
                    <span class="delete-news-timestamp">โพสต์เมื่อ: ${timestamp}</span>
                </div>
                <div class="delete-news-actions">
                    <button class="${pinButtonClass}" data-id="${newsId}" data-pinned="${news.isPinned || false}">${pinButtonText}</button>
                    ${!news.isPinned ? `<button class="delete-news-item-btn" data-id="${newsId}" data-title="${news.title}">ลบ</button>` : ''}
                </div>
            `;
            deleteNewsList.appendChild(listItem);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.delete-news-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const idToDelete = e.currentTarget.dataset.id;
                const titleToDelete = e.currentTarget.dataset.title;
                openConfirmDeleteNewsModal(idToDelete, titleToDelete);
            });
        });
        document.querySelectorAll('.pin-news-item-btn, .unpin-news-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const idToToggle = e.currentTarget.dataset.id;
                const isPinned = e.currentTarget.dataset.pinned === 'true';
                togglePinStatus(idToToggle, isPinned);
            });
        });

    } catch (error) {
        console.error("Error populating delete news list:", error);
        deleteNewsList.innerHTML = '<li>เกิดข้อผิดพลาดในการโหลดรายการ</li>';
    }
}

// Function to close the delete news modal
function closeDeleteNewsModal() {
    deleteNewsModal.style.display = 'none';
}

// Function to open the confirm delete news modal
function openConfirmDeleteNewsModal(newsId, title) {
    currentNewsToDeleteId = newsId;
    newsToDeleteTitle.textContent = title;
    deleteNewsErrorMessage.textContent = '';
    confirmDeleteNewsModal.style.display = 'flex';
}

// Function to close the confirm delete news modal
function closeConfirmDeleteNewsModal() {
    confirmDeleteNewsModal.style.display = 'none';
    currentNewsToDeleteId = null;
}

// Function to delete a specific news item after password confirmation
async function deleteNewsItemConfirmed() {
    if (!currentNewsToDeleteId) {
        console.error("No news item ID to delete.");
        return;
    }

    try {
        await newsCollection.doc(currentNewsToDeleteId).delete();
        console.log(`News item ${currentNewsToDeleteId} deleted.`);
        closeConfirmDeleteNewsModal();
        renderNews(); // Refresh the news on the home page
        openDeleteNewsModal(); // Refresh the list in the modal
    } catch (error) {
        console.error("Error deleting news item:", error);
        deleteNewsErrorMessage.textContent = 'เกิดข้อผิดพลาดในการลบข่าวสาร';
    }
}

// NEW: Function to toggle the pinned status of a news item
async function togglePinStatus(newsId, isCurrentlyPinned) {
    try {
        await newsCollection.doc(newsId).update({
            isPinned: !isCurrentlyPinned
        });
        await renderNews();
        await openDeleteNewsModal(); // Refresh the modal to show the updated status
    } catch (error) {
        console.error("Error toggling pin status:", error);
        alert("เกิดข้อผิดพลาดในการปักหมุดข่าวสาร");
    }
}


// --- News Settings ---
async function checkAndTrimNews() {
    try {
        const settingsDoc = await appSettingsDocRef.get();
        if (!settingsDoc.exists) return;

        const settings = settingsDoc.data();
        
        // This query now only gets UNPINNED news for trimming
        const query = newsCollection.where('isPinned', '==', false).orderBy('timestamp', 'desc');
        const snapshot = await query.get();
        
        // Update total news count separately
        const totalSnapshot = await newsCollection.get();
        if (newsCountDisplay) {
            newsCountDisplay.textContent = `จำนวนข่าวสารปัจจุบัน: ${totalSnapshot.size}`;
        }

        if (!settings.autoDeleteNewsEnabled) {
            return;
        }

        const limit = settings.newsLimit || 10;
        const totalNewsCount = totalSnapshot.size;
        const unpinnedCount = snapshot.size;

        if (totalNewsCount > limit) {
            const amountToDelete = totalNewsCount - limit;
            // We only delete from the oldest UNPINNED news
            const recordsToDelete = snapshot.docs.slice(unpinnedCount - amountToDelete);
            
            if (recordsToDelete.length > 0) {
                const batch = db.batch();
                recordsToDelete.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Deleted ${recordsToDelete.length} old, unpinned news items.`);
                
                if (newsCountDisplay) {
                    newsCountDisplay.textContent = `จำนวนข่าวสารปัจจุบัน: ${totalNewsCount - recordsToDelete.length}`;
                }
                if (activePage === 'home') {
                    renderNews(); // Re-render if on home page
                }
            }
        }
    } catch (error) {
        console.error("Error checking and trimming news:", error);
    }
}

function toggleNewsLimitEditMode(isEditMode) {
    if (isEditMode) {
        newsLimitInput.removeAttribute('readonly');
        editNewsLimitBtn.style.display = 'none';
        newsLimitEditActions.style.display = 'flex';
    } else {
        newsLimitInput.setAttribute('readonly', true);
        editNewsLimitBtn.style.display = 'inline-block';
        newsLimitEditActions.style.display = 'none';
        newsLimitErrorMessage.textContent = '';
        loadAppSettings(); // Revert to saved value
    }
}

async function handleSaveNewsLimit() {
    newsLimitErrorMessage.textContent = "";
    const newLimit = parseInt(newsLimitInput.value);
    if (isNaN(newLimit) || newLimit <= 0) {
        newsLimitErrorMessage.textContent = "ขีดจำกัดต้องเป็นตัวเลขและมากกว่า 0";
        return;
    }

    const currentSettings = (await appSettingsDocRef.get()).data() || {};
    const updatedSettings = { ...currentSettings, newsLimit: newLimit };

    const success = await saveAppSettings(updatedSettings);
    if (success) {
        toggleNewsLimitEditMode(false);
        await checkAndTrimNews();
    } else {
        newsLimitErrorMessage.textContent = "เกิดข้อผิดพลาดในการบันทึก";
    }
}

// --- Image Modal Functions ---
function openImageModal(imageUrl) {
    modalImageContent.src = imageUrl;
    imageModal.style.display = 'flex';
}

function closeImageModal() {
    imageModal.style.display = 'none';
    modalImageContent.src = ''; // Clear src to prevent showing old image briefly
}

// --- News Detail Modal Functions ---
function openNewsDetailModal(newsData) {
    modalNewsTitle.textContent = newsData.title;
    modalNewsContent.textContent = newsData.content;
    
    if (newsData.imageUrl) {
        modalNewsImage.src = newsData.imageUrl;
        modalNewsImage.style.display = 'block';
    } else {
        modalNewsImage.style.display = 'none';
    }

    modalNewsTimestamp.textContent = `โพสต์เมื่อ: ${newsData.timestamp ? new Date(newsData.timestamp.toDate()).toLocaleString('th-TH') : 'ไม่ระบุเวลา'}`;
    
    newsDetailModal.style.display = 'flex';
}

function closeNewsDetailModal() {
    newsDetailModal.style.display = 'none';
}


// --- Event Listeners and Initial Load ---

document.addEventListener('DOMContentLoaded', async () => {
    // Assign DOM elements inside DOMContentLoaded
    loader = document.getElementById('loader');
    document.body.classList.add('is-loading');

    studentListTableBody = document.getElementById('studentListTableBody');
    scoreTableBody = document.getElementById('scoreTableBody');
    studentDetailModal = document.getElementById('studentDetailModal');
    closeButton = studentDetailModal.querySelector('.close-button');
    modalOverlay = document.getElementById('studentDetailModal');

    modalStudentName = document.getElementById('modalStudentName');
    modalStudentNumber = document.getElementById('modalStudentNumber');
    modalStudentId = document.getElementById('modalStudentId');
    modalStudentPrefix = document.getElementById('modalStudentPrefix');
    modalStudentFirstName = document.getElementById('modalStudentFirstName');
    modalStudentLastName = document.getElementById('modalStudentLastName');
    modalStudentGrade = document.getElementById('modalStudentGrade');
    modalStudentClass = document.getElementById('modalStudentClass');
    modalStudentStatus = document.getElementById('modalStudentStatus');
    modalStudentDob = document.getElementById('modalStudentDob');
    modalStudentPhone = document.getElementById('modalStudentPhone');

    studentDetailsView = document.getElementById('studentDetailsView');
    studentDetailsEdit = document.getElementById('studentDetailsEdit');
    editStudentInfoBtn = document.getElementById('editStudentInfoBtn');
    saveStudentInfoBtn = document.getElementById('saveStudentInfoBtn');
    cancelStudentInfoBtn = document.getElementById('cancelStudentInfoBtn');

    editStudentNumber = document.getElementById('editStudentNumber');
    editStudentId = document.getElementById('editStudentId');
    editPrefix = document.getElementById('editPrefix');
    editName = document.getElementById('editName');
    editLastName = document.getElementById('editLastName');
    editGrade = document.getElementById('editGrade');
    editClass = document.getElementById('editClass');
    editStatus = document.getElementById('editStatus');
    editDob = document.getElementById('editDob');
    editPhone = document.getElementById('editPhone');

    adminPasswordInput = document.getElementById('adminPasswordInput');
    passwordErrorMessage = document.getElementById('passwordErrorMessage');
    adminPasswordSection = document.getElementById('adminPasswordSection');

    showStudentListBtn = document.getElementById('showStudentListBtn');
    showStudentScoresBtn = document.getElementById('showStudentScoresBtn');
    showStudentScoresBtnAll = document.getElementById('showStudentScoresBtnAll');
    showStudentFeeSummaryBtn = document.getElementById('showStudentFeeSummaryBtn');
    ScoresHistoryBtn = document.getElementById('ScoresHistoryBtn');
    showPunishmentSummaryBtn = document.getElementById('showPunishmentSummaryBtn');

    // Page Containers
    homePlaceholderContainer = document.getElementById('homePlaceholderContainer');
    classPageContainer = document.getElementById('classPageContainer');
    settingsContainer = document.getElementById('settingsContainer');
    contactAdminContainer = document.getElementById('contactAdminContainer');

    // Content Section Containers
    studentListTableContainer = document.getElementById('studentListTableContainer');
    homeTableContainer = document.getElementById('homeTableContainer');
    scoreTableContainer = document.getElementById('scoreTableContainer');
    studentFeeSummaryTableContainer = document.getElementById('studentFeeSummaryTableContainer');
    studentFeeSummaryTableBody = document.getElementById('studentFeeSummaryTableBody');
    feeSummaryTableHeader = document.getElementById('feeSummaryTableHeader');
    feeSummaryTableFooter = document.getElementById('feeSummaryTableFooter');
    feeSummaryTitle = document.getElementById('feeSummaryTitle');
    saveHistoryTableContainer = document.getElementById('saveHistoryTableContainer');
    saveHistoryTableBody = document.getElementById('saveHistoryTableBody');
    punishmentSummarySection = document.getElementById('punishmentSummarySection');
    punishmentSummaryTableContainer = document.getElementById('punishmentSummaryTableContainer');
    punishmentSummaryTable = document.getElementById('punishmentSummaryTable');
    punishmentSummaryTableHeader = document.getElementById('punishmentSummaryTableHeader');
    punishmentSummaryTableBody = document.getElementById('punishmentSummaryTableBody');
    punishmentSummaryTitle = document.getElementById('punishmentSummaryTitle');
    allStudentsWeeklyScoresMainContainer = document.getElementById('allStudentsWeeklyScoresMainContainer');

    clearHistoryBtn = document.getElementById('clearHistoryBtn');
    setMonthlyFeesBtn = document.getElementById('setMonthlyFeesBtn');

    // Assign settings DOM elements
    historyCountDisplay = document.getElementById('historyCountDisplay');
    autoDeleteToggle = document.getElementById('autoDeleteToggle');
    historyLimitInput = document.getElementById('historyLimitInput');
    editHistoryLimitBtn = document.getElementById('editHistoryLimitBtn');
    saveHistoryLimitBtn = document.getElementById('saveHistoryLimitBtn');
    cancelHistoryLimitBtn = document.getElementById('cancelHistoryLimitBtn');
    historyLimitEditActions = document.getElementById('historyLimitEditActions');
    historyLimitErrorMessage = document.getElementById('historyLimitErrorMessage');

    // Assign news settings DOM elements
    newsCountDisplay = document.getElementById('newsCountDisplay');
    autoDeleteNewsToggle = document.getElementById('autoDeleteNewsToggle');
    newsLimitInput = document.getElementById('newsLimitInput');
    editNewsLimitBtn = document.getElementById('editNewsLimitBtn');
    saveNewsLimitBtn = document.getElementById('saveNewsLimitBtn');
    cancelNewsLimitBtn = document.getElementById('cancelNewsLimitBtn');
    newsLimitEditActions = document.getElementById('newsLimitEditActions');
    newsLimitErrorMessage = document.getElementById('newsLimitErrorMessage');

    monthlySelectionModal = document.getElementById('monthlySelectionModal');
    closeMonthlySelectionModalBtn = document.getElementById('closeMonthlySelectionModalBtn');
    monthlySelectionModalStudentName = document.getElementById('monthlySelectionModalStudentName');
    monthButtonsGrid = document.getElementById('monthButtonsGrid');
    cancelMonthlySelectionBtn = document.getElementById('cancelMonthlySelectionBtn');

    weeklyScoresModal = document.getElementById('weeklyScoresModal');
    closeWeeklyScoresModalBtn = document.getElementById('closeWeeklyScoresModalBtn');
    weeklyModalStudentName = document.getElementById('weeklyModalStudentName');
    weeklyModalMonthName = document.getElementById('weeklyModalMonthName');
    weeklyScoresGrid = document.getElementById('weeklyScoresGrid');
    weeklyAdminPasswordInput = document.getElementById('weeklyAdminPasswordInput');
    weeklyPasswordErrorMessage = document.getElementById('weeklyPasswordErrorMessage');
    saveWeeklyScoresBtn = document.getElementById('saveWeeklyScoresBtn');
    cancelWeeklyScoresBtn = document.getElementById('cancelWeeklyScoresBtn');
    weeklyAdminPasswordSection = document.getElementById('weeklyAdminPasswordSection');

    // New elements for all students scores modal
    allStudentsMonthSelectionModal = document.getElementById('allStudentsMonthSelectionModal');
    closeAllStudentsMonthSelectionModalBtn = document.getElementById('closeAllStudentsMonthSelectionModalBtn');
    allStudentsMonthSelectionModalTitle = document.getElementById('allStudentsMonthSelectionModalTitle');
    allStudentsMonthTableBody = document.getElementById('allStudentsMonthTableBody');
    cancelAllStudentsMonthSelectionBtn = document.getElementById('cancelAllStudentsMonthSelectionBtn');

    
    allStudentsWeeklyModalMonthName = document.getElementById('allStudentsWeeklyModalMonthName');
    allStudentsWeeklyScoresTableBody = document.getElementById('allStudentsWeeklyScoresTableBody');
    allStudentsWeeklyAdminPasswordSectionAll = document.getElementById('allStudentsWeeklyAdminPasswordSectionAll');
    allStudentsWeeklyAdminPasswordInputAll = document.getElementById('allStudentsWeeklyAdminPasswordInputAll');
    allStudentsWeeklyPasswordErrorMessageAll = document.getElementById('allStudentsWeeklyPasswordErrorMessageAll');
    saveAllStudentsWeeklyScoresBtn = document.getElementById('saveAllStudentsWeeklyScoresBtn');
    cancelAllStudentsWeeklyScoresBtn = document.getElementById('cancelAllStudentsWeeklyScoresBtn');
    addMultipleWeeklyFeesBtn = document.getElementById('addMultipleWeeklyFeesBtn');

    adminClearHistoryModal = document.getElementById('adminClearHistoryModal');
    closeAdminClearHistoryModalBtn = document.getElementById('closeAdminClearHistoryModalBtn');
    confirmClearHistoryBtn = document.getElementById('confirmClearHistoryBtn');
    cancelClearHistoryBtn = document.getElementById('cancelClearHistoryBtn');

    // New: Admin password modal for Settings entry
    settingsAdminPasswordModal = document.getElementById('settingsAdminPasswordModal');
    closeSettingsAdminPasswordModalBtn = document.getElementById('closeSettingsAdminPasswordModalBtn');
    settingsAdminPasswordInput = document.getElementById('settingsAdminPasswordInput');
    settingsAdminPasswordErrorMessage = document.getElementById('settingsAdminPasswordErrorMessage');
    confirmSettingsAdminPasswordBtn = document.getElementById('confirmSettingsAdminPasswordBtn');
    cancelSettingsAdminPasswordBtn = document.getElementById('cancelSettingsAdminPasswordBtn');

    // New DOM elements for navigation links
    navHomeBtn = document.getElementById('navHomeBtn');
    navClassBtn = document.getElementById('navClassBtn');
    navContactBtn = document.getElementById('navContactBtn');
    navSettingBtn = document.getElementById('navSettingBtn');

    // New: Student Add/Delete buttons
    studentActions = document.getElementById('studentActions');
    addStudentBtn = document.getElementById('addStudentBtn');
    deleteStudentBtn = document.getElementById('deleteStudentBtn');

    // New: Add Student Modal elements
    addStudentModal = document.getElementById('addStudentModal');
    closeAddStudentModalBtn = document.getElementById('closeAddStudentModalBtn');
    addStudentNumber = document.getElementById('addStudentNumber');
    addStudentId = document.getElementById('addStudentId');
    addPrefix = document.getElementById('addPrefix');
    addName = document.getElementById('addName');
    addLastName = document.getElementById('addLastName');
    addGrade = document.getElementById('addGrade');
    addClass = document.getElementById('addClass');
    addStatus = document.getElementById('addStatus');
    addDob = document.getElementById('addDob');
    addPhone = document.getElementById('addPhone');
    addStudentPasswordSection = document.getElementById('addStudentPasswordSection');
    addStudentPasswordInput = document.getElementById('addStudentPasswordInput');
    addStudentErrorMessage = document.getElementById('addStudentErrorMessage');
    saveNewStudentBtn = document.getElementById('saveNewStudentBtn');
    cancelAddStudentBtn = document.getElementById('cancelAddStudentBtn');

    // New: Delete Student Selection Modal elements
    deleteStudentSelectionModal = document.getElementById('deleteStudentSelectionModal');
    closeDeleteStudentSelectionModalBtn = document.getElementById('closeDeleteStudentSelectionModalBtn');
    deleteStudentList = document.getElementById('deleteStudentList');
    cancelDeleteSelectionBtn = document.getElementById('cancelDeleteSelectionBtn');

    // New: Confirm Delete Student Modal elements
    confirmDeleteStudentModal = document.getElementById('confirmDeleteStudentModal');
    closeConfirmDeleteStudentModalBtn = document.getElementById('closeConfirmDeleteStudentModalBtn');
    studentToDeleteName = document.getElementById('studentToDeleteName');
    studentToDeleteId = document.getElementById('studentToDeleteId');
    deleteConfirmationPasswordSection = document.getElementById('deleteConfirmationPasswordSection');
    deleteConfirmationPasswordInput = document.getElementById('deleteConfirmationPasswordInput');
    deleteConfirmationErrorMessage = document.getElementById('deleteConfirmationErrorMessage');
    confirmDeleteStudentFinalBtn = document.getElementById('confirmDeleteStudentFinalBtn');
    cancelDeleteStudentFinalBtn = document.getElementById('cancelDeleteStudentFinalBtn');

    // Assign new monthly fees modal elements
    setMonthlyFeesModal = document.getElementById('setMonthlyFeesModal');
    closeSetMonthlyFeesModalBtn = document.getElementById('closeSetMonthlyFeesModalBtn');
    monthlyFeesGrid = document.getElementById('monthlyFeesGrid');
    saveMonthlyFeesBtn = document.getElementById('saveMonthlyFeesBtn');
    cancelSetMonthlyFeesBtn = document.getElementById('cancelSetMonthlyFeesBtn');
    
    // Assign Add Multiple Weekly Fees Modal elements
    addMultipleWeeklyFeesModal = document.getElementById('addMultipleWeeklyFeesModal');
    closeAddMultipleWeeklyFeesModalBtn = document.getElementById('closeAddMultipleWeeklyFeesModalBtn');
    addMultipleWeeklyFeesModalTitle = document.getElementById('addMultipleWeeklyFeesModalTitle');
    multipleFeeAmountInput = document.getElementById('multipleFeeAmountInput');
    multipleWeeklyFeesTableBody = document.getElementById('multipleWeeklyFeesTableBody');
    selectAllStudentsCheckbox = document.getElementById('selectAllStudentsCheckbox');
    saveMultipleWeeklyFeesBtn = document.getElementById('saveMultipleWeeklyFeesBtn');
    cancelMultipleWeeklyFeesBtn = document.getElementById('cancelMultipleWeeklyFeesBtn');
    addMultipleFeesPasswordSection = document.getElementById('addMultipleFeesPasswordSection');
    addMultipleWeeklyFeesAdminPasswordInput = document.getElementById('addMultipleWeeklyFeesAdminPasswordInput');
    addMultipleWeeklyFeesErrorMessage = document.getElementById('addMultipleWeeklyFeesErrorMessage');
    initialMultipleFeesActions = document.getElementById('initialMultipleFeesActions');
    confirmSaveMultipleFeesBtn = document.getElementById('confirmSaveMultipleFeesBtn');
    cancelSaveMultipleFeesBtn = document.getElementById('cancelSaveMultipleFeesBtn');


    // New: Punishment Summary Navigation elements
    punishmentNav = document.getElementById('punishmentNav');
    prevMonthPunishmentBtn = document.getElementById('prevMonthPunishmentBtn');
    nextMonthPunishmentBtn = document.getElementById('nextMonthPunishmentBtn');
    currentPunishmentMonthDisplay = document.getElementById('currentPunishmentMonthDisplay');

    // Assign Contact Admin Form elements
    contactAdminForm = document.getElementById('contactAdminForm');
    contactSubmitBtn = document.getElementById('contactSubmitBtn');
    captchaQuestion = document.getElementById('captchaQuestion');
    captchaInput = document.getElementById('captchaInput');
    captchaError = document.getElementById('captchaError');

    // Assign News System DOM elements
    newsContainer = document.getElementById('newsContainer');
    addNewsBtn = document.getElementById('addNewsBtn');
    deleteNewsBtn = document.getElementById('deleteNewsBtn');
    addNewsModal = document.getElementById('addNewsModal');
    closeAddNewsModalBtn = document.getElementById('closeAddNewsModalBtn');
    newsTitleInput = document.getElementById('newsTitleInput');
    newsContentInput = document.getElementById('newsContentInput');
    newsImageUrlInput = document.getElementById('newsImageUrlInput');
    pinNewsToggle = document.getElementById('pinNewsToggle');
    newsImagePreview = document.getElementById('newsImagePreview');
    addNewsAdminPasswordInput = document.getElementById('addNewsAdminPasswordInput');
    addNewsErrorMessage = document.getElementById('addNewsErrorMessage');
    saveNewsBtn = document.getElementById('saveNewsBtn');
    cancelAddNewsBtn = document.getElementById('cancelAddNewsBtn');
    deleteNewsModal = document.getElementById('deleteNewsModal');
    closeDeleteNewsModalBtn = document.getElementById('closeDeleteNewsModalBtn');
    deleteNewsList = document.getElementById('deleteNewsList');
    cancelDeleteNewsSelectionBtn = document.getElementById('cancelDeleteNewsSelectionBtn');
    // Assign Confirm Delete News Modal elements
    confirmDeleteNewsModal = document.getElementById('confirmDeleteNewsModal');
    closeConfirmDeleteNewsModalBtn = document.getElementById('closeConfirmDeleteNewsModalBtn');
    newsToDeleteTitle = document.getElementById('newsToDeleteTitle');
    deleteNewsPasswordInput = document.getElementById('deleteNewsPasswordInput');
    deleteNewsErrorMessage = document.getElementById('deleteNewsErrorMessage');
    confirmDeleteNewsFinalBtn = document.getElementById('confirmDeleteNewsFinalBtn');
    cancelDeleteNewsFinalBtn = document.getElementById('cancelDeleteNewsFinalBtn');
    // Assign Image Modal elements
    imageModal = document.getElementById('imageModal');
    closeImageModalBtn = document.getElementById('closeImageModalBtn');
    modalImageContent = document.getElementById('modalImageContent');
    // Assign News Detail Modal elements
    newsDetailModal = document.getElementById('newsDetailModal');
    closeNewsDetailModalBtn = document.getElementById('closeNewsDetailModalBtn');
    modalNewsTitle = document.getElementById('modalNewsTitle');
    modalNewsImage = document.getElementById('modalNewsImage');
    modalNewsContent = document.getElementById('modalNewsContent');
    modalNewsTimestamp = document.getElementById('modalNewsTimestamp');


    // Initial data population from Firebase
    await loadStudentsFromFirebase();
    await loadPaymentRequirements();

    // --- Hide Loader and Show Initial Page ---
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.addEventListener('transitionend', () => {
            loader.style.display = 'none';
            document.body.classList.remove('is-loading');
            switchPage('home');
        });
    }, 1000);

    // --- Event Listeners for Main Navigation Buttons ---
    navHomeBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('home'); });
    navClassBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('class'); });
    navContactBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('contact'); });
    navSettingBtn.addEventListener('click', (e) => { e.preventDefault(); openSettingsAdminPasswordModal(); });

    // --- Event Listeners for Class Page Toggle Buttons ---
    showStudentListBtn.addEventListener('click', () => switchContentSection('studentList'));
    showStudentScoresBtn.addEventListener('click', () => switchContentSection('studentScores'));
    showStudentScoresBtnAll.addEventListener('click', () => switchContentSection('studentScoresAll'));
    showStudentFeeSummaryBtn.addEventListener('click', () => switchContentSection('studentFeeSummary'));
    showPunishmentSummaryBtn.addEventListener('click', () => switchContentSection('punishmentSummary'));
    ScoresHistoryBtn.addEventListener('click', () => switchContentSection('saveHistory'));

    // --- Event Listeners for Modals and other actions ---
    closeButton.addEventListener('click', closeStudentDetailModal);
    modalOverlay.addEventListener('click', (event) => { if (event.target === modalOverlay) closeStudentDetailModal(); });
    editStudentInfoBtn.addEventListener('click', () => toggleEditMode(true));
    saveStudentInfoBtn.addEventListener('click', saveStudentInfo);
    cancelStudentInfoBtn.addEventListener('click', () => { toggleEditMode(false); adminPasswordInput.value = ''; passwordErrorMessage.textContent = ''; });
    
    closeMonthlySelectionModalBtn.addEventListener('click', closeMonthlySelectionModal);
    monthlySelectionModal.addEventListener('click', (event) => { if (event.target === monthlySelectionModal) closeMonthlySelectionModal(); });
    cancelMonthlySelectionBtn.addEventListener('click', closeMonthlySelectionModal);
    
    closeWeeklyScoresModalBtn.addEventListener('click', () => { weeklyScoresModal.style.display = 'none'; });
    weeklyScoresModal.addEventListener('click', (event) => { if (event.target === weeklyScoresModal) weeklyScoresModal.style.display = 'none'; });
    saveWeeklyScoresBtn.addEventListener('click', saveWeeklyScores);
    cancelWeeklyScoresBtn.addEventListener('click', () => { weeklyScoresModal.style.display = 'none'; });
    
    closeAllStudentsMonthSelectionModalBtn.addEventListener('click', () => { closeAllStudentsMonthSelectionModal(); switchContentSection('studentList'); });
    allStudentsMonthSelectionModal.addEventListener('click', (event) => { if (event.target === allStudentsMonthSelectionModal) { closeAllStudentsMonthSelectionModal(); switchContentSection('studentList'); } });
    cancelAllStudentsMonthSelectionBtn.addEventListener('click', () => { closeAllStudentsMonthSelectionModal(); switchContentSection('studentList'); });
    
    saveAllStudentsWeeklyScoresBtn.addEventListener('click', saveAllStudentsWeeklyScores);
    cancelAllStudentsWeeklyScoresBtn.addEventListener('click', () => switchContentSection('studentList'));
    
    addMultipleWeeklyFeesBtn.addEventListener('click', openAddMultipleWeeklyFeesModal);
    closeAddMultipleWeeklyFeesModalBtn.addEventListener('click', closeAddMultipleWeeklyFeesModal);
    cancelMultipleWeeklyFeesBtn.addEventListener('click', closeAddMultipleWeeklyFeesModal);
    saveMultipleWeeklyFeesBtn.addEventListener('click', () => {
        const anyStudentSelected = Array.from(multipleWeeklyFeesTableBody.querySelectorAll('.student-select-checkbox')).some(cb => cb.checked);
        if (!anyStudentSelected) { alert("กรุณาเลือกนักเรียนอย่างน้อยหนึ่งคน"); return; }
        const anyWeekSelected = Array.from(multipleWeeklyFeesTableBody.querySelectorAll('.week-select-checkbox')).some(cb => cb.checked);
        if (!anyWeekSelected) { alert("กรุณาเลือกสัปดาห์อย่างน้อยหนึ่งสัปดาห์"); return; }
        initialMultipleFeesActions.style.display = 'none';
        addMultipleFeesPasswordSection.style.display = 'block';
        addMultipleWeeklyFeesAdminPasswordInput.focus();
    });
    cancelSaveMultipleFeesBtn.addEventListener('click', () => {
        initialMultipleFeesActions.style.display = 'block';
        addMultipleFeesPasswordSection.style.display = 'none';
        addMultipleWeeklyFeesErrorMessage.textContent = '';
    });
    confirmSaveMultipleFeesBtn.addEventListener('click', confirmAndSaveMultipleFees);
    selectAllStudentsCheckbox.addEventListener('change', (event) => {
        multipleWeeklyFeesTableBody.querySelectorAll('.student-select-checkbox').forEach(cb => { cb.checked = event.target.checked; });
    });
    document.querySelectorAll('.select-all-week-checkbox').forEach(headerCheckbox => {
        headerCheckbox.addEventListener('change', (event) => {
            const week = event.target.dataset.week;
            multipleWeeklyFeesTableBody.querySelectorAll(`.week-select-checkbox[data-week="${week}"]`).forEach(cb => { cb.checked = event.target.checked; });
        });
    });

    prevMonthPunishmentBtn.addEventListener('click', () => { if (currentPunishmentMonthIndex > 0) renderPunishmentSummary(currentPunishmentMonthIndex - 1); });
    nextMonthPunishmentBtn.addEventListener('click', () => {
        const currentAcademicMonthIndex = getAcademicMonthIndex(new Date().getMonth());
        if (currentPunishmentMonthIndex < currentAcademicMonthIndex) renderPunishmentSummary(currentPunishmentMonthIndex + 1);
    });

    // --- Settings Event Listeners ---
    clearHistoryBtn.addEventListener('click', openAdminClearHistoryModal);
    closeAdminClearHistoryModalBtn.addEventListener('click', closeAdminClearHistoryModal);
    adminClearHistoryModal.addEventListener('click', (event) => { if (event.target === adminClearHistoryModal) closeAdminClearHistoryModal(); });
    confirmClearHistoryBtn.addEventListener('click', clearSaveHistoryFromFirebase);
    cancelClearHistoryBtn.addEventListener('click', closeAdminClearHistoryModal);

    autoDeleteToggle.addEventListener('change', async () => {
        const currentSettings = (await appSettingsDocRef.get()).data() || {};
        await saveAppSettings({ ...currentSettings, autoDeleteEnabled: autoDeleteToggle.checked });
        await checkAndTrimHistory();
    });
    editHistoryLimitBtn.addEventListener('click', () => toggleHistoryLimitEditMode(true));
    saveHistoryLimitBtn.addEventListener('click', handleSaveHistoryLimit);
    cancelHistoryLimitBtn.addEventListener('click', () => toggleHistoryLimitEditMode(false));

    autoDeleteNewsToggle.addEventListener('change', async () => {
        const currentSettings = (await appSettingsDocRef.get()).data() || {};
        await saveAppSettings({ ...currentSettings, autoDeleteNewsEnabled: autoDeleteNewsToggle.checked });
        await checkAndTrimNews();
    });
    editNewsLimitBtn.addEventListener('click', () => toggleNewsLimitEditMode(true));
    saveNewsLimitBtn.addEventListener('click', handleSaveNewsLimit);
    cancelNewsLimitBtn.addEventListener('click', () => toggleNewsLimitEditMode(false));


    closeSettingsAdminPasswordModalBtn.addEventListener('click', () => { closeSettingsAdminPasswordModal(); switchPage('home'); });
    settingsAdminPasswordModal.addEventListener('click', (event) => { if (event.target === settingsAdminPasswordModal) { closeSettingsAdminPasswordModal(); switchPage('home'); } });
    confirmSettingsAdminPasswordBtn.addEventListener('click', handleSettingsAdminPasswordConfirm);
    cancelSettingsAdminPasswordBtn.addEventListener('click', () => { closeSettingsAdminPasswordModal(); switchPage('home'); });

    addStudentBtn.addEventListener('click', openAddStudentModal);
    deleteStudentBtn.addEventListener('click', openDeleteStudentSelectionModal);
    closeAddStudentModalBtn.addEventListener('click', closeAddStudentModal);
    addStudentModal.addEventListener('click', (event) => { if (event.target === addStudentModal) closeAddStudentModal(); });
    saveNewStudentBtn.addEventListener('click', addNewStudent);
    cancelAddStudentBtn.addEventListener('click', closeAddStudentModal);

    closeDeleteStudentSelectionModalBtn.addEventListener('click', closeDeleteStudentSelectionModal);
    deleteStudentSelectionModal.addEventListener('click', (event) => { if (event.target === deleteStudentSelectionModal) closeDeleteStudentSelectionModal(); });
    cancelDeleteSelectionBtn.addEventListener('click', closeDeleteStudentSelectionModal);

    closeConfirmDeleteStudentModalBtn.addEventListener('click', closeConfirmDeleteStudentModal);
    confirmDeleteStudentModal.addEventListener('click', (event) => { if (event.target === confirmDeleteStudentModal) closeConfirmDeleteStudentModal(); });
    confirmDeleteStudentFinalBtn.addEventListener('click', deleteStudentConfirmed);
    cancelDeleteStudentFinalBtn.addEventListener('click', closeConfirmDeleteStudentModal);

    setMonthlyFeesBtn.addEventListener('click', openSetMonthlyFeesModal);
    closeSetMonthlyFeesModalBtn.addEventListener('click', closeSetMonthlyFeesModal);
    setMonthlyFeesModal.addEventListener('click', (event) => { if (event.target === setMonthlyFeesModal) closeSetMonthlyFeesModal(); });
    saveMonthlyFeesBtn.addEventListener('click', saveMonthlyFees);
    cancelSetMonthlyFeesBtn.addEventListener('click', closeSetMonthlyFeesModal);

    // --- News System Event Listeners ---
    addNewsBtn.addEventListener('click', openAddNewsModal);
    deleteNewsBtn.addEventListener('click', openDeleteNewsModal);
    closeAddNewsModalBtn.addEventListener('click', closeAddNewsModal);
    addNewsModal.addEventListener('click', (event) => { if (event.target === addNewsModal) closeAddNewsModal(); });
    saveNewsBtn.addEventListener('click', saveNews);
    cancelAddNewsBtn.addEventListener('click', closeAddNewsModal);
    closeDeleteNewsModalBtn.addEventListener('click', closeDeleteNewsModal);
    deleteNewsModal.addEventListener('click', (event) => { if (event.target === deleteNewsModal) closeDeleteNewsModal(); });
    cancelDeleteNewsSelectionBtn.addEventListener('click', closeDeleteNewsModal);
    
    // Confirm Delete News Modal Listeners
    closeConfirmDeleteNewsModalBtn.addEventListener('click', closeConfirmDeleteNewsModal);
    confirmDeleteNewsModal.addEventListener('click', (event) => { if (event.target === confirmDeleteNewsModal) closeConfirmDeleteNewsModal(); });
    confirmDeleteNewsFinalBtn.addEventListener('click', deleteNewsItemConfirmed);
    cancelDeleteNewsFinalBtn.addEventListener('click', closeConfirmDeleteNewsModal);

    // Image Modal Listeners
    closeImageModalBtn.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });

    // News Detail Modal Listeners
    closeNewsDetailModalBtn.addEventListener('click', closeNewsDetailModal);
    newsDetailModal.addEventListener('click', (event) => {
        if (event.target === newsDetailModal) {
            closeNewsDetailModal();
        }
    });

    newsImageUrlInput.addEventListener('input', () => {
        const url = newsImageUrlInput.value.trim();
        if (url) {
            newsImagePreview.src = url;
            newsImagePreview.style.display = 'block';
            newsImagePreview.onerror = () => {
                newsImagePreview.style.display = 'none';
            };
        } else {
            newsImagePreview.style.display = 'none';
        }
    });


    if (typeof emailjs !== 'undefined' && !emailjs._isInitialized) {
        emailjs.init('7gaavlGnJ9JjhLxb7');
    }
    if (captchaInput) {
        captchaInput.addEventListener('input', validateCaptcha);
    }
    if (contactAdminForm) {
        contactAdminForm.addEventListener('submit', handleContactFormSubmit);
    }
});
