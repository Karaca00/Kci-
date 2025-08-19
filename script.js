// Helper function to extract student number from ID
function getStudentNumberFromId(id) {
    if (id.startsWith("ST")) {
        return parseInt(id.substring(2));
    }
    return parseInt(id);
}

let ADMIN_PASSWORD = null;
const LOCAL_VERSION = "1.3.0"; // New: Define local version of the web app

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
const chatCollection = db.collection('chatMessages'); // New: Chat collection
const formsCollection = db.collection('forms'); // เพิ่มบรรทัดนี้
const formSubmissionsCollection = db.collection('formSubmissions'); // เพิ่มบรรทัดนี้
const appSettingsDocRef = appSettingsCollection.doc('appSettings');
const paymentRequirementsDocRef = appSettingsCollection.doc('paymentRequirements');
const versionDocRef = appSettingsCollection.doc('version'); // New: Version document reference

let currentStudentId = null; // Store the ID of the student whose details or scores are currently open
let currentAllStudentsWeeklyScoresMonth = null; // Store the currently selected month for all students' scores
let currentStudentToDelete = null; // New: Store student ID for deletion confirmation
let activePage = 'home'; // To track the current active page/view
let activeClassSection = 'studentList'; // To track active section within class page

let currentReplyInfo = null; // Will store { text, senderName }

// CAPTCHA variables
let captchaAnswer = 0;
let captchaNum1, captchaNum2; // Declare globally for CAPTCHA calculation

// Payment Requirements
let currentPaymentRequirements = {}; // Stores the fetched payment requirements

// Punishment Summary Month Navigation
let currentPunishmentMonthIndex; // Will store the index of the month currently displayed in punishment summary

// Chat User ID and Display Name
let chatUserId = localStorage.getItem('chatUserId');
if (!chatUserId) {
    chatUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chatUserId', chatUserId);
}
let chatDisplayName = localStorage.getItem('chatDisplayName');
let unsubscribeChatListener = null; // To hold the unsubscribe function for chat

// DOM Elements (Declared here, will be assigned inside DOMContentLoaded)
var loader;
var studentListTableBody;
var scoreTableBody;
var studentDetailModal;
var addNewModal;
var closeButton;
var modalOverlay;

var addFormsBtn, deleteFormsBtn;
var addFormsModal, closeAddFormsModalBtn, formTitleInput, formDescriptionInput, questionsContainer, addQuestionBtn, publishFormToggle, addFormErrorMessage, saveFormBtn, cancelAddFormBtn;
var deleteFormsModal, closeDeleteFormsModalBtn, deleteFormsList, cancelDeleteFormsSelectionBtn;
var doFormModal, closeDoFormModalBtn, doFormTitle, doFormDescription, userNameInput, formSubmissionContainer, formSubmissionError, submitFormBtn;
var formSummaryModal, closeFormSummaryModalBtn, summaryFormTitle, formSummaryContainer;
let currentEditingFormId = null;
let currentSubmittingFormId = null;

var modalStudentName;
var modalStudentNumber;
var modalStudentId;
var modalStudentPrefix; // Added for prefix
var modalStudentFirstName; // Added for first name
var modalStudentLastName; // Added for last name
var modalStudentGrade;
var modalStudentClass;
var modalStudentStatus;
var modalStudentDob;
var modalStudentPhone;

var studentDetailsView;
var studentDetailsEdit;
var editStudentInfoBtn;
var saveStudentInfoBtn;
var cancelStudentInfoBtn;

var editStudentNumber;
var editStudentId;
var editPrefix;
var editName;
var editLastName; // Added for last name
var editGrade;
var editClass;
var editStatus;
var editDob;
var editPhone;

var adminPasswordInput;
var passwordErrorMessage;
var adminPasswordSection;

var showStudentListBtn;
var showStudentScoresBtn;
var showStudentScoresBtnAll;
var showStudentFeeSummaryBtn;
var ScoresHistoryBtn;
var showPunishmentSummaryBtn; // New: Punishment Summary Button
var SettingBtn; // Now refers to navSettingBtn

// Page Containers
var homePlaceholderContainer;
var classPageContainer;
var settingsContainer;
var contactAdminContainer;
var chatPageContainer; // New: Chat Page

// Content Section Containers within Class Page
var studentListTableContainer;
var homeTableContainer;
var newTableContainer;
var scoreTableContainer;
var studentFeeSummaryTableContainer;
var studentFeeSummaryTableBody;
var feeSummaryTableHeader;
var feeSummaryTableFooter;
var feeSummaryTitle;
var saveHistoryTableContainer;
var saveHistoryTableBody;
var punishmentSummarySection;
var punishmentSummaryTableContainer; // New: Punishment Summary Table Container
var punishmentSummaryTable; // New: Punishment Summary Table
var punishmentSummaryTableHeader; // New: Punishment Summary Table Header
var punishmentSummaryTableBody; // New: Punishment Summary Table Body
var punishmentSummaryTitle; // New: Punishment Summary Table Title
var allStudentsWeeklyScoresMainContainer;


var clearHistoryBtn;
var setMonthlyFeesBtn; // New: Button to open monthly fees modal

// DOM elements for settings
var historyCountDisplay;
var autoDeleteToggle;
var historyLimitInput;
var editHistoryLimitBtn;
var saveHistoryLimitBtn;
var cancelHistoryLimitBtn;
var historyLimitEditActions;
var historyLimitErrorMessage;

// NEW: DOM elements for news settings
var newsCountDisplay;
var autoDeleteNewsToggle;
var newsLimitInput;
var editNewsLimitBtn;
var saveNewsLimitBtn;
var cancelNewsLimitBtn;
var newsLimitEditActions;
var newsLimitErrorMessage;

var monthlySelectionModal;
var closeMonthlySelectionModalBtn;
var monthlySelectionModalStudentName;
var monthButtonsGrid;
var cancelMonthlySelectionBtn;

var weeklyScoresModal;
var closeWeeklyScoresModalBtn;
var weeklyModalStudentName;
var weeklyModalMonthName;
var weeklyScoresGrid;
var weeklyAdminPasswordInput;
var weeklyPasswordErrorMessage;
var saveWeeklyScoresBtn;
var cancelWeeklyScoresBtn;
var weeklyAdminPasswordSection;

var allStudentsMonthSelectionModal;
var closeAllStudentsMonthSelectionModalBtn;
var allStudentsMonthSelectionModalTitle;
var allStudentsMonthTableBody;
var cancelAllStudentsMonthSelectionBtn;


var allStudentsWeeklyModalMonthName;
var allStudentsWeeklyScoresTableBody;
var allStudentsWeeklyAdminPasswordSectionAll;
var allStudentsWeeklyAdminPasswordInputAll;
var allStudentsWeeklyPasswordErrorMessageAll;
var saveAllStudentsWeeklyScoresBtn;
var cancelAllStudentsWeeklyScoresBtn;
var addMultipleWeeklyFeesBtn; // Button to trigger the multiple fees modal

var adminClearHistoryModal;
var closeAdminClearHistoryModalBtn;
var confirmClearHistoryBtn;
var cancelClearHistoryBtn;

// New: Admin password modal for Settings entry
var settingsAdminPasswordModal;
var closeSettingsAdminPasswordModalBtn;
var settingsAdminPasswordInput;
var settingsAdminPasswordErrorMessage;
var confirmSettingsAdminPasswordBtn;
var cancelSettingsAdminPasswordBtn;

// New: Student Add/Delete buttons
var addStudentBtn;
var deleteStudentBtn;

// New: Add Student Modal elements
var addStudentModal;
var closeAddStudentModalBtn;
var addStudentNumber;
var addStudentId;
var addPrefix;
var addName;
var addLastName; // Added for last name
var addGrade;
var addClass;
var addStatus;
var addDob;
var addPhone;
var addStudentErrorMessage;
var saveNewStudentBtn;
var cancelAddStudentBtn;

// New: Delete Student Selection Modal elements
var deleteStudentSelectionModal;
var closeDeleteStudentSelectionModalBtn;
var deleteStudentList;
var cancelDeleteSelectionBtn;

// New: Confirm Delete Student Modal elements
var confirmDeleteStudentModal;
var closeConfirmDeleteStudentModalBtn;
var studentToDeleteName;
var studentToDeleteId;
var deleteConfirmationErrorMessage;
var confirmDeleteStudentFinalBtn;
var cancelDeleteStudentFinalBtn;

// New: Add Multiple Weekly Fees Modal elements
var addMultipleWeeklyFeesModal;
var closeAddMultipleWeeklyFeesModalBtn;
var addMultipleWeeklyFeesModalTitle;
var multipleFeeAmountInput;
var multipleWeeklyFeesTableBody;
var selectAllStudentsCheckbox;
var saveMultipleWeeklyFeesBtn;
var cancelMultipleWeeklyFeesBtn;
var addMultipleFeesPasswordSection;
var addMultipleWeeklyFeesAdminPasswordInput;
var addMultipleWeeklyFeesErrorMessage;
var initialMultipleFeesActions;
var confirmSaveMultipleFeesBtn;
var cancelSaveMultipleFeesBtn;


var currentWeeklyScores; // Declare at a scope accessible by loadWeeklyScoresFromFirebase and renderWeeklyScores

// Map to store student names and numbers for quick lookup in history table
const studentInfoMap = new Map();

// New: Monthly Fees Modal elements
var setMonthlyFeesModal;
var closeSetMonthlyFeesModalBtn;
var monthlyFeesGrid;
var saveMonthlyFeesBtn;
var cancelSetMonthlyFeesBtn;

// New: Punishment Summary Navigation elements
var punishmentNav;
var prevMonthPunishmentBtn;
var nextMonthPunishmentBtn;
var currentPunishmentMonthDisplay;

// New: Contact Admin Form elements (globally accessible after DOMContentLoaded)
var contactAdminForm;
var contactSubmitBtn;
var captchaQuestion;
var captchaInput;
var captchaError;

// --- News System DOM Elements ---
var newsContainer;
var addNewsBtn;
var deleteNewsBtn;
var addNewsModal;
var closeAddNewsModalBtn;
var newsTitleInput;
var newsContentInput;
var newsImageUrlInput;
var pinNewsToggle;
var addNewsErrorMessage;
var saveNewsBtn;
var cancelAddNewsBtn;
var deleteNewsModal;
var closeDeleteNewsModalBtn;
var deleteNewsList;
var cancelDeleteNewsSelectionBtn;
// New: Confirm Delete News Modal elements
var confirmDeleteNewsModal;
var closeConfirmDeleteNewsModalBtn;
var newsToDeleteTitle;
var deleteNewsErrorMessage;
var confirmDeleteNewsFinalBtn;
var cancelDeleteNewsFinalBtn;
var currentNewsToDeleteId = null;
// New: Image Modal elements
var imageModal;
var closeImageModalBtn;
var modalImageContent;
var newsImagePreview;
// New: News Detail Modal elements
var newsDetailModal;
var closeNewsDetailModalBtn;
var modalNewsTitle;
var modalNewsImage;
var modalNewsContent;
var modalNewsTimestamp;

// --- Chat System DOM Elements ---
var userChatContainer;
var userChatMessages;
var userChatForm;
var userChatMessageInput;
var adminChatContainer;
var adminChatMessages;
var adminChatForm;
var adminChatMessageInput;
var clearChatBtn;
// New: Chat settings DOM elements
var chatCountDisplay;
var autoDeleteChatToggle;
var chatLimitInput;
var editChatLimitBtn;
var saveChatLimitBtn;
var cancelChatLimitBtn;
var chatLimitEditActions;
var chatLimitErrorMessage;

// New: Confirm Clear Chat Modal elements
var confirmClearChatModal;
var closeConfirmClearChatModalBtn;
var confirmClearChatFinalBtn;
var cancelClearChatFinalBtn;

// New: Update Notification Modal elements
var updateNotificationModal;
var localVersionDisplay;
var remoteVersionDisplay;
var refreshPageBtn;

// New: Chat Name Prompt Modal elements
var namePromptModal;
var chatNameInput;
var saveChatNameBtn;
var chatNameErrorMessage;

// New: Chat Name Display elements
var currentUserChatName;
var changeChatNameBtn;

// New DOM elements for navigation links
var navHomeBtn;
var navClassBtn;
var navContactBtn;
var navChatBtn; // New: Chat nav button
var navSettingBtn;

// Chat Reply Preview DOM Elements
var userReplyPreview, adminReplyPreview;
var userReplyPreviewText, adminReplyPreviewText;
var cancelUserReplyBtn, cancelAdminReplyBtn;


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
    // ยกเลิก listener เดิมถ้ามี
    if (window._studentDetailUnsub) window._studentDetailUnsub();
    // Subscribe แบบเรียลไทม์
    window._studentDetailUnsub = studentsCollection.doc(studentId).onSnapshot(doc => {
        if (!doc.exists) {
            console.error("Student not found:", studentId);
            return;
        }
        const student = doc.data();
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
        if (adminPasswordInput) adminPasswordInput.value = '';
        if (passwordErrorMessage) passwordErrorMessage.textContent = '';

        studentDetailModal.style.display = 'flex'; // Show the modal
    });
}

// Function to close the student detail modal
function closeStudentDetailModal() {
    studentDetailModal.style.display = 'none'; // Hide the modal
    currentStudentId = null; // Clear current student ID
    // ยกเลิก listener realtime ถ้ามี
    if (window._studentDetailUnsub) {
        window._studentDetailUnsub();
        window._studentDetailUnsub = null;
    }
}

// Function to toggle between view and edit mode for student info
function toggleEditMode(isEditMode) {
    const modalContent = studentDetailModal.querySelector('.modal-content');
    if (isEditMode) {
        studentDetailsView.classList.add('hidden');
        studentDetailsEdit.classList.add('grid');
        editStudentInfoBtn.classList.add('hidden');
        saveStudentInfoBtn.classList.remove('hidden');
        cancelStudentInfoBtn.classList.remove('hidden');
        modalContent.classList.add('expanded-edit-mode');
        adminPasswordSection.classList.remove('hidden');
    } else {
        studentDetailsView.classList.remove('hidden');
        studentDetailsEdit.classList.remove('grid');
        editStudentInfoBtn.classList.remove('hidden');
        saveStudentInfoBtn.classList.add('hidden');
        cancelStudentInfoBtn.classList.add('hidden');
        modalContent.classList.remove('expanded-edit-mode');
        adminPasswordSection.classList.add('hidden');
    }
}

// Function to save student information (admin access required)
async function saveStudentInfo() {
    // ตรวจสอบรหัสผ่านแอดมินก่อนบันทึก (ยกเว้นถ้าอยู่หน้า Menu Admin)
    if (!window.location.hash.includes('admin')) { // สมมติว่าหน้า Admin มี hash 'admin'
        const password = adminPasswordInput ? adminPasswordInput.value : '';
        if (!password || password !== ADMIN_PASSWORD) {
            passwordErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
            passwordErrorMessage.style.color = "red";
            return;
        }
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
    if (weeklyAdminPasswordInput) weeklyAdminPasswordInput.value = '';
    if (weeklyPasswordErrorMessage) weeklyPasswordErrorMessage.textContent = '';
    if (weeklyAdminPasswordSection) weeklyAdminPasswordSection.style.display = 'flex'; // Show password section for weekly scores

    weeklyScoresModal.style.display = 'flex'; // Show the modal
}

// Function to render weekly score inputs
function renderWeeklyScores(weeklyScores) {
    weeklyScoresGrid.innerHTML = '';
    const numWeeks = 5;
    const monthRequirements = currentPaymentRequirements[currentWeeklyMonth] || { weeklyFees: {} };
    const weeklyFeesRequired = monthRequirements.weeklyFees || {};
    for (let i = 1; i <= numWeeks; i++) {
        const weekKey = `week${i}`;
        const score = weeklyScores[weekKey] !== undefined ? weeklyScores[weekKey] : 0;
        const requiredFee = weeklyFeesRequired[weekKey] !== undefined ? weeklyFeesRequired[weekKey] : 0;
        const scoreItem = document.createElement('div');
        scoreItem.classList.add('score-input-item');
        scoreItem.innerHTML = `
            <label for="weeklyScore${i}">สัปดาห์ที่ ${i} (${requiredFee} บาท)</label>
            <input type="number" id="weeklyScore${i}" min="0" value="${score}" class="${requiredFee > 0 && score === 0 ? 'payment-status-red' : requiredFee > 0 && score < requiredFee ? 'payment-status-yellow' : ''}">
        `;
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
    // ตรวจสอบรหัสผ่านแอดมินก่อนบันทึก (ยกเว้นถ้าอยู่หน้า Menu Admin)
    if (!window.location.hash.includes('admin')) {
        const password = weeklyAdminPasswordInput ? weeklyAdminPasswordInput.value : '';
        if (!password || password !== ADMIN_PASSWORD) {
            weeklyPasswordErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
            return;
        }
    }
    if (weeklyPasswordErrorMessage) weeklyPasswordErrorMessage.textContent = ""; // Clear error message

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
            if (weeklyAdminPasswordSection) weeklyAdminPasswordSection.style.display = 'none'; // Hide password section

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
            if (weeklyAdminPasswordSection) weeklyAdminPasswordSection.style.display = 'none'; // Hide password section
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
    if (allStudentsWeeklyAdminPasswordInputAll) allStudentsWeeklyAdminPasswordInputAll.value = '';
    if (allStudentsWeeklyPasswordErrorMessageAll) allStudentsWeeklyPasswordErrorMessageAll.textContent = '';
    if (allStudentsWeeklyAdminPasswordSectionAll) allStudentsWeeklyAdminPasswordSectionAll.style.display = 'none'; // Hide password section
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
    if (allStudentsWeeklyAdminPasswordSectionAll) allStudentsWeeklyAdminPasswordSectionAll.style.display = 'flex';
}

async function saveAllStudentsWeeklyScores() {
    // ตรวจสอบรหัสผ่านแอดมินก่อนบันทึก (ยกเว้นถ้าอยู่หน้า Menu Admin)
    if (!window.location.hash.includes('admin')) {
        const password = allStudentsWeeklyAdminPasswordInputAll ? allStudentsWeeklyAdminPasswordInputAll.value : '';
        if (!password || password !== ADMIN_PASSWORD) {
            allStudentsWeeklyPasswordErrorMessageAll.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
            return;
        }
    }
    if (allStudentsWeeklyPasswordErrorMessageAll) allStudentsWeeklyPasswordErrorMessageAll.textContent = ""; // Clear error message

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
            <th></th> </tr>
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
            // Chat settings
            autoDeleteChatToggle.checked = settings.autoDeleteChatEnabled || false;
            chatLimitInput.value = settings.chatLimit || 200;
        } else {
            // Set default settings if document doesn't exist
            const defaultSettings = {
                autoDeleteEnabled: false,
                historyLimit: 100,
                autoDeleteNewsEnabled: false,
                newsLimit: 10,
                autoDeleteChatEnabled: false,
                chatLimit: 200
            };
            await appSettingsDocRef.set(defaultSettings);
            autoDeleteToggle.checked = defaultSettings.autoDeleteEnabled;
            historyLimitInput.value = defaultSettings.historyLimit;
            autoDeleteNewsToggle.checked = defaultSettings.autoDeleteNewsEnabled;
            newsLimitInput.value = defaultSettings.newsLimit;
            autoDeleteChatToggle.checked = defaultSettings.autoDeleteChatEnabled;
            chatLimitInput.value = defaultSettings.chatLimit;
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
    if(settingsAdminPasswordInput) settingsAdminPasswordInput.value = '';
    if(settingsAdminPasswordErrorMessage) settingsAdminPasswordErrorMessage.textContent = '';
    if(settingsAdminPasswordInput) settingsAdminPasswordInput.focus();
}

function closeSettingsAdminPasswordModal() {
    settingsAdminPasswordModal.style.display = 'none';
}

async function handleSettingsAdminPasswordConfirm() {
    const password = settingsAdminPasswordInput ? settingsAdminPasswordInput.value : '';
    if (password !== ADMIN_PASSWORD) {
        if(settingsAdminPasswordErrorMessage) settingsAdminPasswordErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        return;
    }
    if(settingsAdminPasswordErrorMessage) settingsAdminPasswordErrorMessage.textContent = "";
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

    // Unsubscribe from any active chat listener when switching pages
    if (unsubscribeChatListener) {
        unsubscribeChatListener();
        unsubscribeChatListener = null;
        console.log("Unsubscribed from chat listener.");
    }

    switch (pageName) {
        case 'home':
            if (homePlaceholderContainer) homePlaceholderContainer.classList.add('active');
            if (navHomeBtn) navHomeBtn.classList.add('active');
            renderNews(); // Render news when switching to home
            break;
        case 'class':
            if (classPageContainer) classPageContainer.classList.add('active');
            if (navClassBtn) navClassBtn.classList.add('active');
            switchContentSection(activeClassSection || 'studentList');
            break;
        case 'contact':
            if (contactAdminContainer) contactAdminContainer.classList.add('active');
            if (navContactBtn) navContactBtn.classList.add('active');
            generateCaptcha();
            break;
        case 'chat':
            if (chatPageContainer) chatPageContainer.classList.add('active');
            if (navChatBtn) navChatBtn.classList.add('active');
            // Check for display name before loading chat
            if (!chatDisplayName) {
                if (namePromptModal) namePromptModal.style.display = 'flex';
            } else {
                // START: Updated section
                if(currentUserChatName) currentUserChatName.textContent = `ชื่อที่แสดง: ${chatDisplayName}`;
                loadGroupChat();
                // END: Updated section
            }
            break;
        case 'settings':
            if (settingsContainer) settingsContainer.classList.add('active');
            if (navSettingBtn) navSettingBtn.classList.add('active');
            loadAppSettings();
            checkAndTrimHistory();
            checkAndTrimNews();
            checkAndTrimChat(); // New: check chat count on settings load
            loadGroupChat(true); // Load admin view of group chat
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
    if(btnId && document.getElementById(btnId)) document.getElementById(btnId).classList.add('active');


    switch (sectionName) {
        case 'studentList':
            if (studentListTableContainer) studentListTableContainer.classList.add('active');
            await renderStudentList();
            break;
        case 'studentScores':
            if (scoreTableContainer) scoreTableContainer.classList.add('active');
            await renderStudentScores();
            break;
        case 'studentScoresAll':
            openAllStudentsMonthSelectionModal();
            document.querySelector(`#classPageContainer .content-section.active`)?.classList.remove('active');
            if (studentListTableContainer) studentListTableContainer.classList.add('active'); // Fallback to a visible section
            break;
        case 'allStudentsWeeklyScores':
             if (allStudentsWeeklyScoresMainContainer) allStudentsWeeklyScoresMainContainer.classList.add('active');
             await displayAllStudentsWeeklyScoresInMain(month);
             break;
        case 'studentFeeSummary':
            if (studentFeeSummaryTableContainer) studentFeeSummaryTableContainer.classList.add('active');
            await renderStudentFeeSummary();
            break;
        case 'punishmentSummary':
            if (punishmentSummarySection) punishmentSummarySection.classList.add('active');
            await renderPunishmentSummary();
            break;
        case 'saveHistory':
            if (saveHistoryTableContainer) saveHistoryTableContainer.classList.add('active');
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

    multipleFeeAmountInput.value = "0";
    selectAllStudentsCheckbox.checked = false;
    document.querySelectorAll('.select-all-week-checkbox').forEach(cb => cb.checked = false);
    if (addMultipleWeeklyFeesAdminPasswordInput) addMultipleWeeklyFeesAdminPasswordInput.value = '';
    if (addMultipleWeeklyFeesErrorMessage) addMultipleWeeklyFeesErrorMessage.textContent = '';
    
    if (initialMultipleFeesActions) initialMultipleFeesActions.style.display = 'block';
    if (addMultipleFeesPasswordSection) addMultipleFeesPasswordSection.style.display = 'none';

    addMultipleWeeklyFeesModal.style.display = 'flex';
}

function closeAddMultipleWeeklyFeesModal() {
    addMultipleWeeklyFeesModal.style.display = 'none';
}

async function confirmAndSaveMultipleFees() {
    // CHANGE: Password check removed for security refactoring.
    /*
    const password = addMultipleWeeklyFeesAdminPasswordInput.value;
    if (password !== ADMIN_PASSWORD) {
        addMultipleWeeklyFeesErrorMessage.textContent = "รหัสผ่านแอดมินไม่ถูกต้อง";
        return;
    }
    */
    if (addMultipleWeeklyFeesErrorMessage) addMultipleWeeklyFeesErrorMessage.textContent = "";

    const month = currentAllStudentsWeeklyScoresMonth;
    if (!month) {
        console.error("Month not selected.");
        return;
    }
    
    const amountToSet = parseInt(multipleFeeAmountInput.value);
    if (isNaN(amountToSet) || amountToSet < 0) {
        if(addMultipleWeeklyFeesErrorMessage) addMultipleWeeklyFeesErrorMessage.textContent = "กรุณาใส่จำนวนเงินเป็นตัวเลขที่ไม่ติดลบ";
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
        if(addMultipleWeeklyFeesErrorMessage) addMultipleWeeklyFeesErrorMessage.textContent = "ไม่มีการเลือกนักเรียนหรือสัปดาห์";
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
        if(addMultipleWeeklyFeesErrorMessage) addMultipleWeeklyFeesErrorMessage.textContent = "เกิดข้อผิดพลาดในการบันทึก";
    }
}

// --- CAPTCHA Functions ---
function generateCaptcha() {
    captchaNum1 = Math.floor(Math.random() * 10) + 1;
    captchaNum2 = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = captchaNum1 + captchaNum2;
    if(captchaQuestion) captchaQuestion.textContent = `คุณไม่ใช่บอทใช่ไหม? ${captchaNum1} + ${captchaNum2} = ?`;
    if(captchaInput) captchaInput.value = '';
    if(captchaError) captchaError.textContent = '';
    if(contactSubmitBtn) contactSubmitBtn.disabled = true;
}

function validateCaptcha() {
    const userAnswer = parseInt(captchaInput.value);
    if (userAnswer === captchaAnswer) {
        if(captchaError) {
            captchaError.textContent = 'ยืนยันสำเร็จ!';
            captchaError.style.color = 'var(--success-color)';
        }
        if(contactSubmitBtn) contactSubmitBtn.disabled = false;
    } else {
        if(captchaError) captchaError.textContent = '';
        if(contactSubmitBtn) contactSubmitBtn.disabled = true;
    }
}

async function handleContactFormSubmit(event) {
    event.preventDefault();

    if (contactSubmitBtn.disabled) {
        if(captchaError) captchaError.textContent = 'กรุณากรอกคำตอบให้ถูกต้อง';
        return;
    }

    const statusDiv = document.getElementById('contactStatus');
    if (statusDiv) {
        statusDiv.textContent = 'กำลังส่งข้อความ...';
        statusDiv.style.color = 'var(--primary-color)';
    }

    const serviceID = 'service_93p3p1u';
    const templateID = 'template_lx9nl0c';

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            if(statusDiv) {
                statusDiv.textContent = 'ส่งข้อความเรียบร้อยแล้ว!';
                statusDiv.style.color = 'var(--success-color)';
            }
            contactAdminForm.reset();
            generateCaptcha();
        }, (error) => {
            console.error('การส่งข้อความล้มเหลว:', error);
            if(statusDiv) {
                statusDiv.textContent = 'การส่งข้อความล้มเหลว กรุณาลองใหม่อีกครั้ง';
                statusDiv.style.color = 'var(--danger-color)';
            }
            generateCaptcha();
        });
}

// --- NEWS SYSTEM FUNCTIONS ---
// CHANGE: Refactored to use DocumentFragment for better performance.
// Event listeners are now handled by Event Delegation in DOMContentLoaded.
async function renderNews() {
    if (!newsContainer) return;
    newsContainer.innerHTML = ''; // Clear old content
    const fragment = document.createDocumentFragment(); // Use a fragment for performance

    try {
        const snapshot = await newsCollection.get();
        if (newsCountDisplay) {
            newsCountDisplay.textContent = `จำนวนข่าวสารปัจจุบัน: ${snapshot.size}`;
        }
        if (snapshot.empty) {
            newsContainer.innerHTML = '<p>ยังไม่มีข่าวสารหรือประกาศในขณะนี้</p>';
            return;
        }

        const sortedDocs = snapshot.docs.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();
            const aIsPinned = aData.isPinned || false;
            const bIsPinned = bData.isPinned || false;
            if (aIsPinned !== bIsPinned) return aIsPinned ? -1 : 1;
            // Handle cases where timestamp might be null
            const aTime = aData.timestamp ? aData.timestamp.toMillis() : 0;
            const bTime = bData.timestamp ? bData.timestamp.toMillis() : 0;
            return bTime - aTime;
        });

        // ใช้ Promise.all เพื่อเช็ค formId กับ collection forms ก่อนแสดงปุ่ม
        const newsCardsPromises = sortedDocs.map(async doc => {
            const news = doc.data();
            const newsId = doc.id;
            const card = document.createElement('div');
            card.className = 'news-card';
            if (news.isPinned) {
                card.classList.add('pinned');
            }

            // Store data on the element for the event delegate
            card.dataset.newsData = JSON.stringify({ ...news, id: newsId });

            let innerHTML = '';
            if (news.imageUrl) {
                innerHTML += `<img src="${news.imageUrl}" alt="${news.title}" loading="lazy">`;
            }
            innerHTML += '<div class="news-card-content">';
            innerHTML += `<h3>${news.isPinned ? '📌 ' : ''}${news.title}</h3>`;
            
            // Truncate long content for the card view
            const contentPreview = news.content.length > 100 ? news.content.substring(0, 100) + '...' : news.content;
            innerHTML += `<p>${contentPreview}</p>`;

            if (news.timestamp) {
                innerHTML += `<div class="news-card-timestamp">โพสต์เมื่อ: ${new Date(news.timestamp.toDate()).toLocaleString('th-TH')}</div>`;
            }

            // ตรวจสอบว่ามี field formId และมีฟอร์มจริงใน collection forms
            let showFormBtn = false;
            if (news.formId) {
                try {
                    const formDoc = await formsCollection.doc(news.formId).get();
                    if (formDoc.exists) {
                        showFormBtn = true;
                    }
                } catch (err) {
                    // ไม่แสดงปุ่มถ้า error
                }
            }
            if (showFormBtn) {
                innerHTML += `<button class="start-form-btn" data-form-id="${news.formId}">เริ่มทำแบบประเมิน</button>`;
                card.dataset.formId = news.formId;
            }

            innerHTML += '</div>';
            card.innerHTML = innerHTML;

            return card;
        });
        const newsCards = await Promise.all(newsCardsPromises);
        newsCards.forEach(card => fragment.appendChild(card));

        newsContainer.appendChild(fragment); // Append the entire fragment once

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
    if (!newsData) return;
    modalNewsTitle.textContent = newsData.title;
    modalNewsContent.innerHTML = ''; // Clear previous content

    if (newsData.isForm) {
        // --- FIX: Create button element and add event listener directly ---
        const contentParagraph = document.createElement('p');
        contentParagraph.textContent = newsData.content;
        modalNewsContent.appendChild(contentParagraph);

        // เพิ่มปุ่ม "เริ่มทำแบบประเมิน" ใต้คำอธิบาย
        if (newsData.formId) {
            const startFormBtn = document.createElement('button');
            startFormBtn.className = 'start-form-btn';
            startFormBtn.textContent = 'เริ่มทำแบบประเมิน';
            startFormBtn.style.marginTop = '18px';
            startFormBtn.onclick = function() {
                openDoFormModal(newsData.formId);
            };
            modalNewsContent.appendChild(startFormBtn);
        }

        // เพิ่มส่วนแสดงรายชื่อผู้ที่ยังไม่ได้ทำแบบประเมิน ถ้าเป็นข่าวสารที่มีแบบประเมิน
        if (newsData.isForm && newsData.formId && typeof formsCollection !== 'undefined' && typeof formSubmissionsCollection !== 'undefined') {
            // สร้าง container สำหรับรายชื่อ
            const formStatusDiv = document.createElement('div');
            formStatusDiv.style.marginTop = '20px';
            formStatusDiv.innerHTML = '<strong>รายชื่อผู้ที่ยังไม่ได้ทำแบบประเมิน:</strong><br><span>กำลังโหลด...</span>';
            modalNewsContent.appendChild(formStatusDiv);

            // ดึงข้อมูลแบบประเมินและการส่งคำตอบ
            (async () => {
                try {
                    // ดึง submissions
                    const submissionsSnapshot = await formSubmissionsCollection.where('formId', '==', newsData.formId).get();
                    const submittedIds = new Set();
                    submissionsSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.submitterStudentId) submittedIds.add(data.submitterStudentId);
                    });

                    // ดึงรายชื่อนักเรียนทั้งหมด
                    let notDoneNames = [];
                    if (Array.isArray(studentsData)) {
                        studentsData.forEach(student => {
                            const name = `เลขที่ ${student.studentNumber} - ${student.prefix}${student.name} ${student.lastName}`;
                            if (!submittedIds.has(student.id)) {
                                notDoneNames.push(name);
                            }
                        });
                    }

                    formStatusDiv.innerHTML = `<strong>รายชื่อผู้ที่ยังไม่ได้ทำแบบประเมิน:</strong><br>${notDoneNames.length ? notDoneNames.join('<br>') : '<em>ทุกคนทำครบแล้ว</em>'}`;
                } catch (err) {
                    formStatusDiv.innerHTML = '<span style="color:red">เกิดข้อผิดพลาดในการโหลดสถานะแบบประเมิน</span>';
                }
            })();
        }

        if (modalNewsImage) modalNewsImage.style.display = 'none';
    } else {
    // Otherwise, show normal content
    modalNewsContent.textContent = newsData.content;
    if (modalNewsImage) {
        if (newsData.imageUrl) {
            modalNewsImage.src = newsData.imageUrl;
            modalNewsImage.style.display = 'block';
        } else {
            modalNewsImage.style.display = 'none';
        }
    }
}

    // --- FIXED TIMESTAMP HANDLING (REVISED) ---
    let displayDate = 'ไม่ระบุเวลา';
    if (newsData.timestamp) {
        let dateObject;
        // Case 1: It's a live Firebase Timestamp object
        if (typeof newsData.timestamp.toDate === 'function') {
            dateObject = newsData.timestamp.toDate();
        } 
        // Case 2: It's a stringified Timestamp object from JSON.parse() which has a `seconds` property
        else if (typeof newsData.timestamp.seconds === 'number') {
            dateObject = new Date(newsData.timestamp.seconds * 1000);
        }
        // Fallback for other potential string formats
        else {
             dateObject = new Date(newsData.timestamp);
        }
        
        // Check if the created date is valid before formatting
        if (dateObject && !isNaN(dateObject.getTime())) {
            displayDate = dateObject.toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    modalNewsTimestamp.textContent = `โพสต์เมื่อ: ${displayDate}`;
    // --- END OF FIX ---
    
    newsDetailModal.style.display = 'flex';
}






function closeNewsDetailModal() {
    newsDetailModal.style.display = 'none';
}

// --- CHAT SYSTEM FUNCTIONS ---

function showReplyPreview(replyInfo, isAdminView = false) {
    currentReplyInfo = replyInfo;
    if (isAdminView) {
        adminReplyPreviewText.textContent = replyInfo.text;
        adminReplyPreview.style.display = 'flex';
        adminChatMessageInput.focus();
    } else {
        userReplyPreviewText.textContent = replyInfo.text;
        userReplyPreview.style.display = 'flex';
        userChatMessageInput.focus();
    }
}

function hideReplyPreview() {
    currentReplyInfo = null;
    if (userReplyPreview) userReplyPreview.style.display = 'none';
    if (adminReplyPreview) adminReplyPreview.style.display = 'none';
}

// Function to render messages in a given container
function renderMessages(docs, container, currentId) {
    container.innerHTML = ''; // Clear existing messages
    const isAdminView = (container.id === 'adminChatMessages');

    docs.forEach(doc => {
        const data = doc.data();
        const docId = doc.id; // Get the unique ID of the message document

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('chat-message');
        messageWrapper.id = `msg-${docId}`; // Assign a unique ID to the message wrapper

        const messageContentWrapper = document.createElement('div');
        messageContentWrapper.classList.add('message-content-wrapper');

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');

        if (data.senderId === currentId || (currentId === 'admin' && data.isFromAdmin)) {
            messageWrapper.classList.add('sent');
        } else {
            messageWrapper.classList.add('received');
            const senderName = document.createElement('p');
            senderName.classList.add('message-sender-name');
            senderName.textContent = data.senderName || 'Anonymous';
            if (data.isFromAdmin) {
                senderName.classList.add('admin-name');
            }
            messageWrapper.appendChild(senderName);
        }

        if (data.isFromAdmin) {
            messageBubble.classList.add('admin-message');
        }

        if (data.replyTo && data.replyTo.messageId) {
            const replyBlock = document.createElement('div');
            replyBlock.classList.add('replied-to-message', 'clickable');
            replyBlock.title = 'คลิกเพื่อไปที่ข้อความที่ตอบกลับ';
            replyBlock.innerHTML = `
                <p class="replied-to-sender">${data.replyTo.senderName || 'Anonymous'}</p>
                <p class="replied-to-text">${data.replyTo.text}</p>
            `;

            // --- UPDATED: Simplified click-to-scroll functionality ---
            replyBlock.onclick = () => {
                const targetMessageElement = document.getElementById(`msg-${data.replyTo.messageId}`);
                if (targetMessageElement) {
                    targetMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            messageBubble.appendChild(replyBlock);
        }

        const messageText = document.createElement('p');
        messageText.textContent = data.text;
        messageBubble.appendChild(messageText);

        messageContentWrapper.appendChild(messageBubble);

        const replyButton = document.createElement('button');
        replyButton.classList.add('reply-btn');
        replyButton.innerHTML = '&#x21A9;';
        replyButton.title = 'ตอบกลับ';
        replyButton.onclick = () => {
            const replyInfo = {
                messageId: docId,
                text: data.text,
                senderName: data.senderName || 'Anonymous'
            };
            showReplyPreview(replyInfo, isAdminView);
        };
        messageContentWrapper.appendChild(replyButton);

        const timestamp = document.createElement('span');
        timestamp.classList.add('message-timestamp');
        timestamp.textContent = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
        messageContentWrapper.appendChild(timestamp);

        messageWrapper.appendChild(messageContentWrapper);
        container.appendChild(messageWrapper);
    });
    container.scrollTop = container.scrollHeight;
}

// Function to load all messages for the group chat
function loadGroupChat(isAdminView = false) {
    if (unsubscribeChatListener) unsubscribeChatListener(); // Unsubscribe from previous listener
    
    const container = isAdminView ? adminChatMessages : userChatMessages;
    const currentId = isAdminView ? 'admin' : chatUserId;

    if (!container) return; // Add null check for robustness

    unsubscribeChatListener = chatCollection
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            renderMessages(snapshot.docs, container, currentId);
        }, error => {
            console.error("Error loading group chat: ", error);
            container.innerHTML = '<p style="color: red; text-align: center;">เกิดข้อผิดพลาดในการโหลดแชท</p>';
        });
}


async function handleUserChatSubmit(e) {
    e.preventDefault();
    const messageText = userChatMessageInput.value; // ดึงข้อความดิบ
    const trimmedMessage = messageText.trim();     // ตัดช่องว่างหน้า-หลัง

    // ถ้าข้อความที่ตัดแล้วเป็นค่าว่าง (หมายถึงมีแต่การเว้นวรรคหรือขึ้นบรรทัดใหม่)
    if (trimmedMessage === '' || !chatDisplayName) {
        userChatMessageInput.value = ''; // สั่งให้เคลียร์ข้อความในช่องพิมพ์
        return; // และหยุดการทำงาน
    }

    const messageData = {
        text: trimmedMessage, // ส่งข้อความที่ตัดช่องว่างแล้ว
        senderId: chatUserId,
        senderName: chatDisplayName,
        isFromAdmin: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (currentReplyInfo) {
        messageData.replyTo = currentReplyInfo;
    }

    try {
        await chatCollection.add(messageData);
        userChatMessageInput.value = ''; // เคลียร์ข้อความหลังส่งสำเร็จ
        hideReplyPreview();
        await checkAndTrimChat();
    } catch (error) {
        console.error("Error sending user message:", error);
    }
}

async function handleAdminChatSubmit(e) {
    e.preventDefault();
    const messageText = adminChatMessageInput.value; // ดึงข้อความดิบ
    const trimmedMessage = messageText.trim();     // ตัดช่องว่างหน้า-หลัง

    // ถ้าข้อความที่ตัดแล้วเป็นค่าว่าง
    if (trimmedMessage === '') {
        adminChatMessageInput.value = ''; // สั่งให้เคลียร์ข้อความในช่องพิมพ์
        return; // และหยุดการทำงาน
    }

    const messageData = {
        text: trimmedMessage, // ส่งข้อความที่ตัดช่องว่างแล้ว
        senderId: 'admin',
        senderName: 'แอดมิน',
        isFromAdmin: true,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (currentReplyInfo) {
        messageData.replyTo = currentReplyInfo;
    }

    try {
        await chatCollection.add(messageData);
        adminChatMessageInput.value = ''; // เคลียร์ข้อความหลังส่งสำเร็จ
        hideReplyPreview();
        await checkAndTrimChat();
    } catch (error) {
        console.error("Error sending admin message:", error);
    }
}

// --- NEW: Chat Name Prompt Functions ---
function handleSaveChatName() {
    const name = chatNameInput.value.trim();
    if (name.length > 0 && name.length <= 25) {
        chatDisplayName = name;
        localStorage.setItem('chatDisplayName', name);

        // NEW: Update the name display on the chat page immediately
        if(currentUserChatName) {
            currentUserChatName.textContent = `ชื่อที่แสดง: ${chatDisplayName}`;
        }
        
        namePromptModal.style.display = 'none';
        chatNameErrorMessage.textContent = '';
        
        // Load chat if it's not already loaded
        if (activePage === 'chat' && !unsubscribeChatListener) {
            loadGroupChat();
        }
    } else {
        chatNameErrorMessage.textContent = 'กรุณาใส่ชื่อที่มีความยาว 1-25 ตัวอักษร';
    }
}


// --- NEW: Clear Chat Functions ---
function openConfirmClearChatModal() {
    confirmClearChatModal.style.display = 'flex';
}

function closeConfirmClearChatModal() {
    confirmClearChatModal.style.display = 'none';
}

async function clearAllChatMessages() {
    try {
        const snapshot = await chatCollection.get();
        if (snapshot.empty) {
            console.log("No chat messages to delete.");
            closeConfirmClearChatModal();
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("All chat messages have been deleted.");
        closeConfirmClearChatModal();
        // The real-time listener will automatically update the view.
    } catch (error) {
        console.error("Error clearing all chat messages:", error);
        // You might want to show an error message in the modal here
    }
}

// --- NEW: Chat Settings ---
async function checkAndTrimChat() {
    try {
        const settingsDoc = await appSettingsDocRef.get();
        if (!settingsDoc.exists) return;

        const settings = settingsDoc.data();

        // Use get() for a one-time count to avoid conflicts with real-time listener
        const snapshot = await chatCollection.get();
        const currentCount = snapshot.size;

        if (chatCountDisplay) {
            chatCountDisplay.textContent = `จำนวนข้อความแชทปัจจุบัน: ${currentCount}`;
        }

        if (!settings.autoDeleteChatEnabled) {
            return;
        }

        const limit = settings.chatLimit || 200;

        if (currentCount > limit) {
            const recordsToDelete = snapshot.docs.slice(limit);
            // Query for the oldest messages to delete
            const oldMessagesQuery = chatCollection.orderBy('timestamp', 'aกsc').limit(recordsToDelete.length);
            const oldMessagesSnapshot = await oldMessagesQuery.get();
            
            const batch = db.batch();
            oldMessagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Deleted ${oldMessagesSnapshot.size} old chat messages.`);
            if (chatCountDisplay) {
                chatCountDisplay.textContent = `จำนวนข้อความแชทปัจจุบัน: ${limit}`;
            }
        }
    } catch (error) {
        console.error("Error checking and trimming chat messages:", error);
    }
}

function toggleChatLimitEditMode(isEditMode) {
    if (isEditMode) {
        chatLimitInput.removeAttribute('readonly');
        editChatLimitBtn.style.display = 'none';
        chatLimitEditActions.style.display = 'flex';
    } else {
        chatLimitInput.setAttribute('readonly', true);
        editChatLimitBtn.style.display = 'inline-block';
        chatLimitEditActions.style.display = 'none';
        chatLimitErrorMessage.textContent = '';
        loadAppSettings(); // Revert to saved value
    }
}

async function handleSaveChatLimit() {
    chatLimitErrorMessage.textContent = "";
    const newLimit = parseInt(chatLimitInput.value);
    if (isNaN(newLimit) || newLimit <= 0) {
        chatLimitErrorMessage.textContent = "ขีดจำกัดต้องเป็นตัวเลขและมากกว่า 0";
        return;
    }

    const currentSettings = (await appSettingsDocRef.get()).data() || {};
    const updatedSettings = { ...currentSettings, chatLimit: newLimit };

    const success = await saveAppSettings(updatedSettings);
    if (success) {
        toggleChatLimitEditMode(false);
        await checkAndTrimChat(); // Run trim immediately
    } else {
        chatLimitErrorMessage.textContent = "เกิดข้อผิดพลาดในการบันทึก";
    }
}

// --- NEW: Update Checker ---
function checkForUpdates() {
    versionDocRef.onSnapshot(doc => {
        if (doc.exists) {
            const remoteVersion = doc.data().version;
            // Check if an update is needed and the modal is not already shown
            if (remoteVersion && remoteVersion !== LOCAL_VERSION && updateNotificationModal.style.display !== 'flex') {
                console.log(`Update available! Local: ${LOCAL_VERSION}, Remote: ${remoteVersion}`);
                // Show update notification modal
                localVersionDisplay.textContent = LOCAL_VERSION;
                remoteVersionDisplay.textContent = remoteVersion;
                updateNotificationModal.style.display = 'flex';
            } else if (remoteVersion === LOCAL_VERSION) {
                 console.log("App is up to date.");
            }
        } else {
            // If the version document doesn't exist, create it with the current local version.
            versionDocRef.set({ version: LOCAL_VERSION })
                .then(() => {
                    console.log(`Version document created with version ${LOCAL_VERSION}.`);
                })
                .catch(error => {
                    console.error("Error creating version document:", error);
                });
        }
    }, error => {
        console.error("Error with real-time update checker:", error);
    });
}


// --- Event Listeners and Initial Load ---

document.addEventListener('DOMContentLoaded', async () => {
    // --- Edit Form Submission Modal Logic ---
    const editFormSubmissionModal = document.getElementById('editFormSubmissionModal');
    const closeEditFormSubmissionModalBtn = document.getElementById('closeEditFormSubmissionModalBtn');
    const editFormSubmissionStudentList = document.getElementById('editFormSubmissionStudentList');
    const cancelEditFormSubmissionBtn = document.getElementById('cancelEditFormSubmissionBtn');
    let currentEditingFormId = null;

    // เปิด modal รายชื่อนักเรียนที่ส่งคำตอบแล้ว
    async function openEditFormSubmissionModal(formId) {
        currentEditingFormId = formId;
        editFormSubmissionStudentList.innerHTML = '<li>กำลังโหลด...</li>';
        editFormSubmissionModal.style.display = 'flex';
        try {
            // ดึงข้อมูลการส่งของแบบประเมินนี้
            const submissionsSnapshot = await formSubmissionsCollection.where('formId', '==', formId).get();
            if (submissionsSnapshot.empty) {
                editFormSubmissionStudentList.innerHTML = '<li>ยังไม่มีนักเรียนส่งคำตอบ</li>';
                return;
            }
            // สร้างรายการนักเรียนที่ส่งคำตอบแล้ว
            const items = [];
            submissionsSnapshot.forEach(doc => {
                const data = doc.data();
                const student = studentsData.find(s => s.id === data.submitterStudentId);
                if (!student) return;
                items.push(`<li><span>เลขที่ ${student.studentNumber} - ${student.prefix}${student.name} ${student.lastName}</span> <button class="edit-student-answer-btn" data-id="${doc.id}">แก้ไขคำตอบ</button></li>`);
            });
            editFormSubmissionStudentList.innerHTML = items.length ? items.join('') : '<li>ยังไม่มีนักเรียนส่งคำตอบ</li>';
        } catch (error) {
            editFormSubmissionStudentList.innerHTML = '<li>เกิดข้อผิดพลาดในการโหลดข้อมูล</li>';
        }
    }

    // ปิด modal
    if (closeEditFormSubmissionModalBtn) closeEditFormSubmissionModalBtn.addEventListener('click', () => { editFormSubmissionModal.style.display = 'none'; });
    if (cancelEditFormSubmissionBtn) cancelEditFormSubmissionBtn.addEventListener('click', () => { editFormSubmissionModal.style.display = 'none'; });

    // Event delegation สำหรับปุ่มแก้ไขคำตอบแต่ละคน
    if (editFormSubmissionStudentList) editFormSubmissionStudentList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-student-answer-btn')) {
            const submissionId = e.target.dataset.id;
            // ปิด popup รายชื่อนักเรียนก่อน
            editFormSubmissionModal.style.display = 'none';
            // ดึงข้อมูล submission
            try {
                const submissionDoc = await formSubmissionsCollection.doc(submissionId).get();
                if (!submissionDoc.exists) {
                    document.getElementById('editFormModalError').textContent = 'ไม่พบข้อมูลคำตอบ';
                    return;
                }
                const submissionData = submissionDoc.data();
                // ดึงข้อมูลฟอร์ม
                const formDoc = await formsCollection.doc(currentEditingFormId).get();
                if (!formDoc.exists) {
                    document.getElementById('editFormModalError').textContent = 'ไม่พบแบบประเมิน';
                    return;
                }
                const formData = formDoc.data();
                // เปิด modal editFormModal พร้อมข้อมูลเดิม
                document.getElementById('editFormModalTitle').textContent = formData.title + ' (แก้ไขคำตอบ)';
                document.getElementById('editFormModalDescription').textContent = formData.description;
                const editFormModalContainer = document.getElementById('editFormModalContainer');
                editFormModalContainer.innerHTML = '';
                document.getElementById('editFormModalError').textContent = '';
                // สร้างฟอร์มคำถามพร้อมเติมคำตอบเดิม
                formData.questions.forEach((q, index) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'form-question';
                    let inputHtml = '';
                    if (q.type === 'text') {
                        inputHtml = `<input type="text" name="q_${index}" required value="${submissionData.answers[`q_${index}`] || ''}">`;
                    } else if (q.type === 'multiple-choice') {
                        inputHtml = '<div class="form-options">';
                        q.options.forEach((opt, optIndex) => {
                            const checked = submissionData.answers[`q_${index}`] === opt ? 'checked' : '';
                            inputHtml += `<label><input type="radio" name="q_${index}" value="${opt}" ${checked}> ${opt}</label>`;
                        });
                        inputHtml += '</div>';
                    }
                    questionDiv.innerHTML = `<p><strong>ข้อ ${index + 1}.</strong> ${q.title}</p>${inputHtml}`;
                    editFormModalContainer.appendChild(questionDiv);
                });
                // เปิด modal
                document.getElementById('editFormModal').style.display = 'flex';
                // กำหนด handler ใหม่สำหรับการแก้ไข
                const saveBtn = document.getElementById('editFormModalSaveBtn');
                saveBtn.onclick = async () => {
                    const answers = {};
                    const formElements = editFormModalContainer.elements;
                    let allAnswered = true;
                    const questions = formData.questions;
                    for (let i = 0; i < questions.length; i++) {
                        const input = formElements[`q_${i}`];
                        if (!input) continue;
                        if (input.type === 'text') {
                            if (!input.value.trim()) { allAnswered = false; break; }
                            answers[`q_${i}`] = input.value.trim();
                        } else if (input.length) {
                            const checked = Array.from(input).find(radio => radio.checked);
                            if (!checked) { allAnswered = false; break; }
                            answers[`q_${i}`] = checked.value;
                        }
                    }
                    if (!allAnswered) {
                        document.getElementById('editFormModalError').textContent = 'กรุณาตอบคำถามให้ครบทุกข้อ';
                        return;
                    }
                    try {
                        await formSubmissionsCollection.doc(submissionId).update({ answers });
                        document.getElementById('editFormModalError').textContent = 'บันทึกการแก้ไขคำตอบเรียบร้อยแล้ว';
                        setTimeout(() => { document.getElementById('editFormModal').style.display = 'none'; document.getElementById('editFormModalError').textContent = ''; }, 1200);
                    } catch (error) {
                        document.getElementById('editFormModalError').textContent = 'เกิดข้อผิดพลาดในการบันทึก';
                    }
                };
                // ปุ่มยกเลิก
                document.getElementById('editFormModalCancelBtn').onclick = () => {
                    document.getElementById('editFormModal').style.display = 'none';
                };
                document.getElementById('closeEditFormModalBtn').onclick = () => {
                    document.getElementById('editFormModal').style.display = 'none';
                };
            } catch (error) {
                document.getElementById('editFormModalError').textContent = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
            }
        }
    });
    // Assign DOM elements inside DOMContentLoaded
    loader = document.getElementById('loader');
    if (loader) document.body.classList.add('is-loading');

    studentListTableBody = document.getElementById('studentListTableBody');
    scoreTableBody = document.getElementById('scoreTableBody');
    studentDetailModal = document.getElementById('studentDetailModal');
    if (studentDetailModal) closeButton = studentDetailModal.querySelector('.close-button');
    
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
    chatPageContainer = document.getElementById('chatPageContainer');

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

    // Assign chat settings DOM elements
    chatCountDisplay = document.getElementById('chatCountDisplay');
    autoDeleteChatToggle = document.getElementById('autoDeleteChatToggle');
    chatLimitInput = document.getElementById('chatLimitInput');
    editChatLimitBtn = document.getElementById('editChatLimitBtn');
    saveChatLimitBtn = document.getElementById('saveChatLimitBtn');
    cancelChatLimitBtn = document.getElementById('cancelChatLimitBtn');
    chatLimitEditActions = document.getElementById('chatLimitEditActions');
    chatLimitErrorMessage = document.getElementById('chatLimitErrorMessage');

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
    navChatBtn = document.getElementById('navChatBtn');
    navSettingBtn = document.getElementById('navSettingBtn');

    // New: Student Add/Delete buttons
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

    // =============================================
    // ===== START: Admin Settings Menu Logic   =====
    // =============================================
    const settingsMenuItems = document.querySelectorAll('.settings-menu-item');
    const settingsPanels = document.querySelectorAll('.settings-panel');

    if (settingsMenuItems) {
        settingsMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // นำ class 'active' ออกจากทุกเมนูและทุก panel
                settingsMenuItems.forEach(i => i.classList.remove('active'));
                settingsPanels.forEach(p => p.classList.remove('active'));

                // เพิ่ม class 'active' ให้กับเมนูที่ถูกคลิก
                item.classList.add('active');

                // แสดง panel ที่ตรงกับเมนูที่เลือก
                const targetId = item.getAttribute('data-target');
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }
    // ===========================================
    // ===== END: Admin Settings Menu Logic   =====
    // ===========================================

    // =============================================
    // ===== START: FORMS SYSTEM LOGIC          =====
    // =============================================

    // --- Assign Form System DOM Elements ---
    addFormsBtn = document.getElementById('addFormsBtn');
    deleteFormsBtn = document.getElementById('deleteFormsBtn');

    addFormsModal = document.getElementById('addFormsModal');
    closeAddFormsModalBtn = document.getElementById('closeAddFormsModalBtn');
    formTitleInput = document.getElementById('formTitleInput');
    formDescriptionInput = document.getElementById('formDescriptionInput');
    questionsContainer = document.getElementById('questionsContainer');
    addQuestionBtn = document.getElementById('addQuestionBtn');
    addFormErrorMessage = document.getElementById('addFormErrorMessage');
    saveFormBtn = document.getElementById('saveFormBtn');
    cancelAddFormBtn = document.getElementById('cancelAddFormBtn');

    deleteFormsModal = document.getElementById('deleteFormsModal');
    closeDeleteFormsModalBtn = document.getElementById('closeDeleteFormsModalBtn');
    deleteFormsList = document.getElementById('deleteFormsList');
    cancelDeleteFormsSelectionBtn = document.getElementById('cancelDeleteFormsSelectionBtn');
    doFormModal = document.getElementById('doFormModal');
    closeDoFormModalBtn = document.getElementById('closeDoFormModalBtn');
    doFormTitle = document.getElementById('doFormTitle');
    doFormDescription = document.getElementById('doFormDescription');
    userNameInput = document.getElementById('userNameInput');
    formSubmissionContainer = document.getElementById('formSubmissionContainer');
    formSubmissionError = document.getElementById('formSubmissionError');
    submitFormBtn = document.getElementById('submitFormBtn');
    formSummaryModal = document.getElementById('formSummaryModal');
    closeFormSummaryModalBtn = document.getElementById('closeFormSummaryModalBtn');
    summaryFormTitle = document.getElementById('summaryFormTitle');
    formSummaryContainer = document.getElementById('formSummaryContainer');



    // --- Functions for Creating Forms ---

    let questionCounter = 0;
    function addQuestionField(type = 'text', title = '', options = []) {
        questionCounter++;
        const realIndex = questionsContainer ? questionsContainer.children.length + 1 : questionCounter;
        const questionId = `q_${questionCounter}`;
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.id = `question-item-${questionId}`;

        let optionsHtml = '';
        if (type === 'multiple-choice') {
            optionsHtml = `<div class="option-input-container" id="options-for-${questionId}">
                ${options.map((opt, idx) => `<div class="option-item"><input type="text" value="${opt}" placeholder="ตัวเลือกที่ ${idx + 1}" class="option-input"><button type="button" class="remove-option-btn">&times;</button></div>`).join('')}
            </div>
            <button type="button" class="add-option-btn" data-target="${questionId}">+ เพิ่มตัวเลือก</button>`;
        }

        questionDiv.innerHTML = `<div class="question-item-header">
            <label for="question-title-${questionId}">คำถามที่ ${realIndex}:</label>
            <button type="button" class="delete-question-btn" data-target="${questionId}">&times;</button>
        </div>
        <input type="text" id="question-title-${questionId}" value="${title}" placeholder="พิมพ์คำถามของคุณที่นี่" class="question-title-input">
        <select class="question-type-select" data-target="${questionId}">
            <option value="text" ${type === 'text' ? 'selected' : ''}>ข้อความสั้น</option>
            <option value="multiple-choice" ${type === 'multiple-choice' ? 'selected' : ''}>หลายตัวเลือก</option>
        </select>
        <div id="options-container-${questionId}">${optionsHtml}</div>`;
        questionsContainer.appendChild(questionDiv);

        // Scroll to latest question
        setTimeout(() => {
            questionDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function addOptionField(questionId) {
        const optionsContainer = document.getElementById(`options-for-${questionId}`);
        const optionCount = optionsContainer.children.length + 1;
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.innerHTML = `
        <input type="text" placeholder="ตัวเลือกที่ ${optionCount}" class="option-input">
        <button type="button" class="remove-option-btn">&times;</button>
    `;
        optionsContainer.appendChild(optionDiv);
    }

    // --- Event Listeners for Form Creation ---

    if(addQuestionBtn) addQuestionBtn.addEventListener('click', () => {
        // Validate: ไม่ให้เพิ่มคำถามว่างซ้ำ
        const lastQuestion = questionsContainer.lastElementChild;
        if (lastQuestion) {
            const lastTitle = lastQuestion.querySelector('.question-title-input').value.trim();
            if (!lastTitle) {
                addFormErrorMessage.textContent = 'กรุณากรอกคำถามก่อนเพิ่มคำถามใหม่';
                lastQuestion.querySelector('.question-title-input').focus();
                return;
            }
        }
        addFormErrorMessage.textContent = '';
        addQuestionField();
    });

    // เพิ่มปุ่ม '+ เพิ่มคำถาม' ด้านล่างเสมอ
    function renderAddQuestionBtn() {
        let btn = document.getElementById('add-question-bottom-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'add-question-bottom-btn';
            btn.className = 'add-question-btn';
            btn.textContent = '+ เพิ่มคำถาม';
            btn.style = 'margin-top:12px;background:#1976d2;color:#fff;border:none;border-radius:4px;padding:6px 16px;display:block;width:100%';
            btn.onclick = () => {
                const lastQuestion = questionsContainer.lastElementChild;
                if (lastQuestion) {
                    const lastTitle = lastQuestion.querySelector('.question-title-input').value.trim();
                    if (!lastTitle) {
                        addFormErrorMessage.textContent = 'กรุณากรอกคำถามก่อนเพิ่มคำถามใหม่';
                        lastQuestion.querySelector('.question-title-input').focus();
                        return;
                    }
                }
                addFormErrorMessage.textContent = '';
                addQuestionField();
            };
            questionsContainer.after(btn);
        }
    }

    // เรียก renderAddQuestionBtn ทุกครั้งที่มีการเปลี่ยนแปลงคำถาม
    const observer = new MutationObserver(renderAddQuestionBtn);
    observer.observe(questionsContainer, { childList: true });

    if(questionsContainer) {
        questionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-question-btn')) {
                const questionId = e.target.dataset.target;
                document.getElementById(`question-item-${questionId}`).remove();
                renumberQuestions();
            }
            if (e.target.classList.contains('add-option-btn')) {
                addOptionField(e.target.dataset.target);
            }
            if (e.target.classList.contains('remove-option-btn')) {
                const optionDiv = e.target.parentElement;
                const optionsContainer = optionDiv.parentElement;
                optionDiv.remove();
                // Renumber remaining option placeholders
                const optionInputs = optionsContainer.querySelectorAll('.option-input');
                optionInputs.forEach((input, idx) => {
                    input.placeholder = `ตัวเลือกที่ ${idx + 1}`;
                });
            }
        });

        // ฟังก์ชันรีนัมเบอร์ label คำถามที่ X
        function renumberQuestions() {
            const questionItems = questionsContainer.querySelectorAll('.question-item');
            questionItems.forEach((item, idx) => {
                const label = item.querySelector('.question-item-header label');
                if (label) {
                    label.textContent = `คำถามที่ ${idx + 1}:`;
                }
            });
        }

        questionsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('question-type-select')) {
                const questionId = e.target.dataset.target;
                const optionsContainer = document.getElementById(`options-container-${questionId}`);
                if (e.target.value === 'multiple-choice') {
                    optionsContainer.innerHTML = `
                    <div class="option-input-container" id="options-for-${questionId}">
                        <div class="option-item">
                            <input type="text" placeholder="ตัวเลือกที่ 1" class="option-input">
                            <button type="button" class="remove-option-btn">&times;</button>
                        </div>
                    </div>
                    <button type="button" class="add-option-btn" data-target="${questionId}">+ เพิ่มตัวเลือก</button>
                `;
                } else {
                    optionsContainer.innerHTML = '';
                }
            }
        });
    }

    // --- Open/Close Modals ---
    if(addFormsBtn) addFormsBtn.addEventListener('click', () => {
        formTitleInput.value = '';
        formDescriptionInput.value = '';
        questionsContainer.innerHTML = '';
        addQuestionField(); // Start with one question
        addFormsModal.style.display = 'flex';
    });
    if(closeAddFormsModalBtn) closeAddFormsModalBtn.addEventListener('click', () => addFormsModal.style.display = 'none');
    if(cancelAddFormBtn) cancelAddFormBtn.addEventListener('click', () => addFormsModal.style.display = 'none');

    // --- Save Form Logic ---
    if(saveFormBtn) saveFormBtn.addEventListener('click', async () => {
        const title = formTitleInput.value.trim();
        const description = formDescriptionInput.value.trim();

        if (!title) {
            addFormErrorMessage.textContent = 'กรุณากรอกหัวข้อแบบประเมิน';
            return;
        }

        const questions = [];
        const questionItems = questionsContainer.querySelectorAll('.question-item');
        for (const item of questionItems) {
            const questionTitle = item.querySelector('.question-title-input').value.trim();
            const questionType = item.querySelector('.question-type-select').value;

            if (!questionTitle) continue;

            let options = [];
            if (questionType === 'multiple-choice') {
                const optionInputs = item.querySelectorAll('.option-input');
                optionInputs.forEach(opt => {
                    if (opt.value.trim()) options.push(opt.value.trim());
                });
            }
            questions.push({ title: questionTitle, type: questionType, options: options });
        }

        if (questions.length === 0) {
            addFormErrorMessage.textContent = 'กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ';
            return;
        }

        try {
            const formDocRef = await formsCollection.add({
                title: title,
                description: description,
                questions: questions,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            // เผยแพร่ไปที่ข่าวสารทันที
            await newsCollection.add({
                title: `${title}`,
                content: description || 'กรุณาตอบแบบประเมิน',
                formId: formDocRef.id,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                pinned: false
            });
            addFormsModal.style.display = 'none';
            renderNews(); // Refresh news list
        } catch (error) {
            console.error("Error saving form: ", error);
            addFormErrorMessage.textContent = 'เกิดข้อผิดพลาดในการบันทึก';
        }
    });

    // --- Open/Close Manage Forms Modal ---
    if(deleteFormsBtn) deleteFormsBtn.addEventListener('click', async () => {
        deleteFormsList.innerHTML = '<li>กำลังโหลด...</li>';
        deleteFormsModal.style.display = 'flex';

        try {
            const snapshot = await formsCollection.orderBy('timestamp', 'desc').get();
            deleteFormsList.innerHTML = '';
            if(snapshot.empty) {
                deleteFormsList.innerHTML = '<li>ยังไม่มีแบบประเมิน</li>';
                return;
            }
            snapshot.forEach(doc => {
                const form = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                <span>${form.title}</span>
                <div class="form-actions">
                    <button class="summary-form-btn" data-id="${doc.id}">ดูสรุป</button>
                    <button class="delete-form-btn" data-id="${doc.id}">ลบ</button>
                    <button class="edit-form-btn" data-id="${doc.id}">แก้ไขคำตอบ</button>
                </div>
            `;
                deleteFormsList.appendChild(li);
            });
        } catch(error) {
            console.error("Error loading forms: ", error);
            deleteFormsList.innerHTML = '<li>เกิดข้อผิดพลาด</li>';
        }
    });
    if(closeDeleteFormsModalBtn) closeDeleteFormsModalBtn.addEventListener('click', () => deleteFormsModal.style.display = 'none');
    if(cancelDeleteFormsSelectionBtn) cancelDeleteFormsSelectionBtn.addEventListener('click', () => deleteFormsModal.style.display = 'none');

    // --- Logic for Manage Forms Buttons (Delete, Summary) ---
    if(deleteFormsList) deleteFormsList.addEventListener('click', async (e) => {
        const formId = e.target.dataset.id;
        if (!formId) return;

        // ...
        if (e.target.classList.contains('delete-form-btn')) {
            // Create custom confirmation modal
            let confirmModal = document.getElementById('confirmDeleteFormModal');
            if (!confirmModal) {
                confirmModal = document.createElement('div');
                confirmModal.id = 'confirmDeleteFormModal';
                confirmModal.className = 'modal-overlay';
                confirmModal.innerHTML = `
                    <div class="modal-content modal-delete-form">
                        <h3 class="modal-title">ยืนยันการลบแบบประเมิน</h3>
                        <p class="modal-desc">คุณต้องการลบแบบประเมิน, ข้อมูลการตอบกลับ และข่าวที่เกี่ยวข้องทั้งหมดใช่หรือไม่?<br><span class='text-danger'>การกระทำนี้ไม่สามารถย้อนกลับได้</span></p>
                        <button id="confirmDeleteFormBtn" class="btn btn-danger btn-modal">ลบ</button>
                        <button id="cancelDeleteFormBtn" class="btn btn-secondary btn-modal">ยกเลิก</button>
                    </div>
                `;
                document.body.appendChild(confirmModal);
            } else {
                confirmModal.style.display = 'flex';
            }
            confirmModal.classList.add('modal-overlay-active');

            // Add event listeners for confirm/cancel
            document.getElementById('confirmDeleteFormBtn').onclick = async () => {
                confirmModal.style.display = 'none';
                    try {
                        // 1. Delete the form document
                        await formsCollection.doc(formId).delete();
                        // 2. Delete all submissions for this form
                        const submissionsSnapshot = await formSubmissionsCollection.where('formId', '==', formId).get();
                        const batch = db.batch();
                        submissionsSnapshot.forEach(doc => {
                            batch.delete(formSubmissionsCollection.doc(doc.id));
                        });
                        await batch.commit();
                        // 3. Delete related news
                        const newsSnapshot = await newsCollection.where('formId', '==', formId).get();
                        const newsBatch = db.batch();
                        newsSnapshot.forEach(doc => {
                            newsBatch.delete(newsCollection.doc(doc.id));
                        });
                        await newsBatch.commit();
                        // 4. Refresh the forms list UI
                        deleteFormsModal.style.display = 'none';
                        await renderNews();
                    } catch (error) {
                        alert('เกิดข้อผิดพลาดในการลบแบบประเมิน: ' + error.message);
                    }
            };
            document.getElementById('cancelDeleteFormBtn').onclick = () => {
                confirmModal.style.display = 'none';
            };
        }
        // ...
        if (e.target.classList.contains('edit-form-btn')) {
            openEditFormSubmissionModal(formId);
        }

        if (e.target.classList.contains('summary-form-btn')) {
            openFormSummaryModal(formId);
        }

    });

    // REPLACED FUNCTION
async function openDoFormModal(formId) {
    currentSubmittingFormId = formId;

    try {
        // 1. ดึงข้อมูลของแบบประเมิน
        const formDoc = await formsCollection.doc(formId).get();
        if (!formDoc.exists) {
            formSubmissionError.textContent = 'ไม่พบแบบประเมิน';
            return;
        }
        const formData = formDoc.data();

        // 2. ดึงข้อมูลการส่งทั้งหมดของแบบประเมินนี้ เพื่อเช็คว่าใครทำไปแล้วบ้าง
        const submissionsSnapshot = await formSubmissionsCollection.where('formId', '==', formId).get();
        const submittedStudentIds = new Set(); // ใช้ Set เพื่อการค้นหาที่รวดเร็ว
        submissionsSnapshot.forEach(doc => {
            // เราจะเก็บ studentId ตอนส่งข้อมูล (จะแก้ไขในข้อ 2.2)
            if (doc.data().submitterStudentId) {
                submittedStudentIds.add(doc.data().submitterStudentId);
            }
        });

        // 3. แสดงหัวข้อและคำอธิบายของแบบประเมิน
        doFormTitle.textContent = formData.title;
        doFormDescription.textContent = formData.description;
        formSubmissionContainer.innerHTML = ''; // ล้างคำถามเก่า
        formSubmissionError.textContent = ''; // ล้างข้อความ error เก่า

        // 4. สร้าง Dropdown ของรายชื่อนักเรียน
        const userNameSelect = document.getElementById('userNameInput');
        userNameSelect.innerHTML = ''; // ล้างตัวเลือกเก่า

        // เพิ่มตัวเลือกตั้งต้น
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "--- กรุณาเลือกชื่อของคุณ ---";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        userNameSelect.appendChild(defaultOption);

        // วนลูปสร้างตัวเลือกจากข้อมูลนักเรียนทั้งหมด
        studentsData.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id; // value คือ ID ของนักเรียน
            option.textContent = `เลขที่ ${student.studentNumber} - ${student.prefix}${student.name} ${student.lastName}`;

            // 5. ตรวจสอบว่านักเรียนคนนี้เคยทำแบบประเมินแล้วหรือยัง
            if (submittedStudentIds.has(student.id)) {
                option.disabled = true; // ปิดการใช้งานตัวเลือก
                option.textContent += " (ทำแล้ว)"; // เพิ่มข้อความบอก
            }
            userNameSelect.appendChild(option);
        });

        // 6. สร้างคำถามของแบบประเมิน
        formData.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'form-question';
            let inputHtml = '';
            if (q.type === 'text') {
                inputHtml = `<input type="text" name="q_${index}" required>`;
            } else if (q.type === 'multiple-choice') {
                inputHtml = '<div class="form-options">';
                q.options.forEach((opt, optIndex) => {
                    inputHtml += `
                    <label>
                        <input type="radio" name="q_${index}" value="${opt}" required>
                        ${opt}
                    </label>
                `;
                });
                inputHtml += '</div>';
            }
            questionDiv.innerHTML = `<p>${q.title}</p>${inputHtml}`;
            formSubmissionContainer.appendChild(questionDiv);
        });

        // 7. แสดง Modal
        doFormModal.style.display = 'flex';

    } catch (error) {
    console.error("Error opening form modal:", error);
    formSubmissionError.textContent = 'เกิดข้อผิดพลาดในการโหลดแบบประเมิน';
    }
}

async function loadAdminPasswordFromFirebase() {
    try {
        const adminDoc = await appSettingsCollection.doc('admin').get();
        if (adminDoc.exists && adminDoc.data().password) {
            ADMIN_PASSWORD = adminDoc.data().password;
            console.log('Loaded ADMIN_PASSWORD from Firebase');
        } else {
            ADMIN_PASSWORD = '301';
            console.warn('Admin password not found in Firestore! Using fallback password.');
        }
    } catch (e) {
        ADMIN_PASSWORD = '301';
        console.error('Error loading admin password from Firestore, using fallback password:', e);
    }
}

loadAdminPasswordFromFirebase();

    // --- Logic to handle form submission ---
    if(submitFormBtn) submitFormBtn.addEventListener('click', async () => {
        const userName = userNameInput.value.trim();
        if (!userName) {
            formSubmissionError.textContent = 'กรุณากรอกชื่อ-นามสกุล';
            return;
        }

        const answers = {};
        const formElements = formSubmissionContainer.elements;
        let allAnswered = true;

        // Loop through questions to collect answers
        const questionsSnapshot = await formsCollection.doc(currentSubmittingFormId).get();
        const questions = questionsSnapshot.data().questions;

        for (let i = 0; i < questions.length; i++) {
            const input = formElements[`q_${i}`];
            if (!input) continue;

            if (input.type === 'text') {
                if (!input.value.trim()) {
                    allAnswered = false;
                    break;
                }
                answers[`q_${i}`] = input.value.trim();
            } else if (input.length) { // Radio buttons
                const checked = Array.from(input).find(radio => radio.checked);
                if (!checked) {
                    allAnswered = false;
                    break;
                }
                answers[`q_${i}`] = checked.value;
            }
        }

        if (!allAnswered) {
            formSubmissionError.textContent = 'กรุณาตอบคำถามให้ครบทุกข้อ';
            return;
        }

        try {
            await formSubmissionsCollection.add({
                formId: currentSubmittingFormId,
                submitterName: userName,
                submitterStudentId: userNameInput.value, // เพิ่มบรรทัดนี้
                answers: answers,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
                formSubmissionError.innerHTML = '<span style="color: green;">ส่งคำตอบเรียบร้อยแล้ว</span>';
            setTimeout(() => { doFormModal.style.display = 'none'; formSubmissionError.textContent = ''; }, 1200);
        } catch (error) {
            console.error("Error submitting form: ", error);
            formSubmissionError.textContent = 'เกิดข้อผิดพลาดในการส่งคำตอบ';
        }
    });

    // --- Logic to show Form Summary ---
    async function openFormSummaryModal(formId) {
    formSummaryContainer.innerHTML = '<p>กำลังโหลดสรุปผล...</p>';
    formSummaryModal.style.display = 'flex';

    try {
        // 1. ดึงข้อมูลจำเป็นทั้งหมด: แบบประเมิน, การส่ง, และรายชื่อนักเรียน
        const formDoc = await formsCollection.doc(formId).get();
        if (!formDoc.exists) {
            formSummaryContainer.innerHTML = '<p>ไม่พบแบบประเมินนี้</p>';
            return;
        }
        const formData = formDoc.data();
        summaryFormTitle.textContent = `สรุปผล: ${formData.title}`;

        const submissionsSnapshot = await formSubmissionsCollection.where('formId', '==', formId).get();

        // 2. สร้าง Map ของข้อมูลการส่ง และ Set ของ ID คนที่ส่งแล้ว
        const submissionsMap = new Map();
        submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.submitterStudentId) {
                submissionsMap.set(data.submitterStudentId, data);
            }
        });
        const submittedStudentIds = new Set(submissionsMap.keys());

        // 3. แยกนักเรียนเป็น 2 กลุ่ม: ทำแล้ว และ ยังไม่ทำ
        const notSubmittedStudents = studentsData.filter(student => !submittedStudentIds.has(student.id));

        // 4. เริ่มสร้าง HTML สำหรับแสดงผล
        let summaryHtml = `<p><strong>จำนวนผู้ตอบกลับ: ${submittedStudentIds.size} / ${studentsData.length} คน</strong></p>`;
        
        // ---- ส่วนแสดงรายชื่อผู้ที่ "ยังไม่ทำ" ----
        summaryHtml += `
            <div class="summary-list not-submitted-list">
                <h4>รายชื่อผู้ที่ยังไม่ทำ (${notSubmittedStudents.length} คน)</h4>
                <ul>
                    ${notSubmittedStudents.length > 0 ? notSubmittedStudents.map(s => `<li>เลขที่ ${s.studentNumber} - ${s.prefix}${s.name} ${s.lastName}</li>`).join('') : '<li>ไม่มีนักเรียนที่ค้าง</li>'}
                </ul>
            </div>
            <hr>
        `;

        // ---- ส่วนแสดงรายละเอียดคำตอบรายบุคคลของผู้ที่ "ทำแล้ว" ----
        summaryHtml += '<h3>รายละเอียดคำตอบรายบุคคล</h3>';
        if (submittedStudentIds.size > 0) {
            studentsData.forEach(student => {
                if (submittedStudentIds.has(student.id)) {
                    const submission = submissionsMap.get(student.id);
                    summaryHtml += `
                        <div class="summary-student-card">
                            <h4>เลขที่ ${student.studentNumber} - ${student.prefix}${student.name} ${student.lastName}</h4>
                            <ul>
                    `;
                    formData.questions.forEach((question, index) => {
                        const answer = submission.answers[`q_${index}`] || '<em>(ไม่ได้ตอบ)</em>';
                        summaryHtml += `<li><strong>${question.title}:</strong> ${answer}</li>`;
                    });
                    summaryHtml += `
                            </ul>
                        </div>
                    `;
                }
            });
        } else {
            summaryHtml += '<p>ยังไม่มีผู้ส่งคำตอบ</p>';
        }
        
        // 5. นำ HTML ไปแสดงผล
        formSummaryContainer.innerHTML = summaryHtml;

    } catch (error) {
        console.error("Error generating detailed form summary:", error);
        formSummaryContainer.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูลสรุป</p>';
    }
}

    // --- Add event listeners for new modals ---
    if(closeDoFormModalBtn) closeDoFormModalBtn.addEventListener('click', () => doFormModal.style.display = 'none');
    if(closeFormSummaryModalBtn) closeFormSummaryModalBtn.addEventListener('click', () => formSummaryModal.style.display = 'none');
    
    // ===========================================
    // ===== END: FORMS SYSTEM LOGIC            =====
    // ===========================================
    
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

    // Assign Chat System DOM elements
    userChatContainer = document.getElementById('userChatContainer');
    userChatMessages = document.getElementById('userChatMessages');
    userChatForm = document.getElementById('userChatForm');
    userChatMessageInput = document.getElementById('userChatMessageInput');
    adminChatContainer = document.getElementById('adminChatContainer');
    adminChatMessages = document.getElementById('adminChatMessages');
    adminChatForm = document.getElementById('adminChatForm');
    adminChatMessageInput = document.getElementById('adminChatMessageInput');
    clearChatBtn = document.getElementById('clearChatBtn');

    // Assign Confirm Clear Chat Modal elements
    confirmClearChatModal = document.getElementById('confirmClearChatModal');
    closeConfirmClearChatModalBtn = document.getElementById('closeConfirmClearChatModalBtn');
    confirmClearChatFinalBtn = document.getElementById('confirmClearChatFinalBtn');
    cancelClearChatFinalBtn = document.getElementById('cancelClearChatFinalBtn');

    // Assign Update Notification Modal elements
    updateNotificationModal = document.getElementById('updateNotificationModal');
    localVersionDisplay = document.getElementById('localVersionDisplay');
    remoteVersionDisplay = document.getElementById('remoteVersionDisplay');
    refreshPageBtn = document.getElementById('refreshPageBtn');

    // Assign Chat Name Prompt Modal elements
    namePromptModal = document.getElementById('namePromptModal');
    chatNameInput = document.getElementById('chatNameInput');
    saveChatNameBtn = document.getElementById('saveChatNameBtn');
    chatNameErrorMessage = document.getElementById('chatNameErrorMessage');

    // NEW: Assign chat name display elements
    currentUserChatName = document.getElementById('currentUserChatName');
    changeChatNameBtn = document.getElementById('changeChatNameBtn');

    // BUG FIX: Moved reply preview assignments and listeners here
    userReplyPreview = document.getElementById('userReplyPreview');
    adminReplyPreview = document.getElementById('adminReplyPreview');
    userReplyPreviewText = document.getElementById('userReplyPreviewText');
    adminReplyPreviewText = document.getElementById('adminReplyPreviewText');
    cancelUserReplyBtn = document.getElementById('cancelUserReplyBtn');
    cancelAdminReplyBtn = document.getElementById('cancelAdminReplyBtn');

    if(cancelUserReplyBtn) cancelUserReplyBtn.addEventListener('click', hideReplyPreview);
    if(cancelAdminReplyBtn) cancelAdminReplyBtn.addEventListener('click', hideReplyPreview);
    // END BUG FIX
    // Initial data population from Firebase
    await loadStudentsFromFirebase();
    await loadPaymentRequirements();
    checkForUpdates(); // New: Set up real-time update listener

    // --- Hide Loader and Show Initial Page ---
    if(loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.addEventListener('transitionend', () => {
                loader.style.display = 'none';
                document.body.classList.remove('is-loading');
                switchPage('home');
            });
        }, 1000);
    } else {
        switchPage('home');
    }

    // --- Event Listeners for Main Navigation Buttons ---
    if(navHomeBtn) navHomeBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('home'); });
    if(navClassBtn) navClassBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('class'); });
    if(navContactBtn) navContactBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('contact'); });
    if(navChatBtn) navChatBtn.addEventListener('click', (e) => { e.preventDefault(); switchPage('chat'); });
    if(navSettingBtn) navSettingBtn.addEventListener('click', (e) => { e.preventDefault(); openSettingsAdminPasswordModal(); });

    // --- Event Listeners for Class Page Toggle Buttons ---
    if(showStudentListBtn) showStudentListBtn.addEventListener('click', () => switchContentSection('studentList'));
    if(showStudentScoresBtn) showStudentScoresBtn.addEventListener('click', () => switchContentSection('studentScores'));
    if(showStudentScoresBtnAll) showStudentScoresBtnAll.addEventListener('click', () => switchContentSection('studentScoresAll'));
    if(showStudentFeeSummaryBtn) showStudentFeeSummaryBtn.addEventListener('click', () => switchContentSection('studentFeeSummary'));
    if(showPunishmentSummaryBtn) showPunishmentSummaryBtn.addEventListener('click', () => switchContentSection('punishmentSummary'));
    if(ScoresHistoryBtn) ScoresHistoryBtn.addEventListener('click', () => switchContentSection('saveHistory'));

    // --- Event Listeners for Modals and other actions ---
    if(closeButton) closeButton.addEventListener('click', closeStudentDetailModal);
    
    if(editStudentInfoBtn) editStudentInfoBtn.addEventListener('click', () => toggleEditMode(true));
    if(saveStudentInfoBtn) saveStudentInfoBtn.addEventListener('click', saveStudentInfo);
    if(cancelStudentInfoBtn) cancelStudentInfoBtn.addEventListener('click', () => { toggleEditMode(false); if(adminPasswordInput) adminPasswordInput.value = ''; if(passwordErrorMessage) passwordErrorMessage.textContent = ''; });
    
    if(closeMonthlySelectionModalBtn) closeMonthlySelectionModalBtn.addEventListener('click', closeMonthlySelectionModal);
    if(cancelMonthlySelectionBtn) cancelMonthlySelectionBtn.addEventListener('click', closeMonthlySelectionModal);
    
    if(closeWeeklyScoresModalBtn) closeWeeklyScoresModalBtn.addEventListener('click', () => { weeklyScoresModal.style.display = 'none'; });
    if(saveWeeklyScoresBtn) saveWeeklyScoresBtn.addEventListener('click', saveWeeklyScores);
    if(cancelWeeklyScoresBtn) cancelWeeklyScoresBtn.addEventListener('click', () => { weeklyScoresModal.style.display = 'none'; });
    
    if(closeAllStudentsMonthSelectionModalBtn) closeAllStudentsMonthSelectionModalBtn.addEventListener('click', () => { closeAllStudentsMonthSelectionModal(); switchContentSection('studentList'); });
    if(cancelAllStudentsMonthSelectionBtn) cancelAllStudentsMonthSelectionBtn.addEventListener('click', () => { closeAllStudentsMonthSelectionModal(); switchContentSection('studentList'); });
    
    if(saveAllStudentsWeeklyScoresBtn) saveAllStudentsWeeklyScoresBtn.addEventListener('click', saveAllStudentsWeeklyScores);
    if(cancelAllStudentsWeeklyScoresBtn) cancelAllStudentsWeeklyScoresBtn.addEventListener('click', () => switchContentSection('studentList'));
    
    if(addMultipleWeeklyFeesBtn) addMultipleWeeklyFeesBtn.addEventListener('click', openAddMultipleWeeklyFeesModal);
    if(closeAddMultipleWeeklyFeesModalBtn) closeAddMultipleWeeklyFeesModalBtn.addEventListener('click', closeAddMultipleWeeklyFeesModal);
    if(cancelMultipleWeeklyFeesBtn) cancelMultipleWeeklyFeesBtn.addEventListener('click', closeAddMultipleWeeklyFeesModal);
    if(saveMultipleWeeklyFeesBtn) saveMultipleWeeklyFeesBtn.addEventListener('click', () => {
        const anyStudentSelected = Array.from(multipleWeeklyFeesTableBody.querySelectorAll('.student-select-checkbox')).some(cb => cb.checked);
        if (!anyStudentSelected) {
            addMultipleWeeklyFeesErrorMessage.textContent = 'กรุณาเลือกนักเรียนอย่างน้อยหนึ่งคน';
            addMultipleWeeklyFeesErrorMessage.style.color = 'red';
            addMultipleWeeklyFeesErrorMessage.style.display = 'block';
            return;
        }
        const anyWeekSelected = Array.from(multipleWeeklyFeesTableBody.querySelectorAll('.week-select-checkbox')).some(cb => cb.checked);
        if (!anyWeekSelected) {
            addMultipleWeeklyFeesErrorMessage.textContent = 'กรุณาเลือกสัปดาห์อย่างน้อยหนึ่งสัปดาห์';
            addMultipleWeeklyFeesErrorMessage.style.color = 'red';
            addMultipleWeeklyFeesErrorMessage.style.display = 'block';
            return;
        }
        if(initialMultipleFeesActions) initialMultipleFeesActions.style.display = 'none';
        if(addMultipleFeesPasswordSection) addMultipleFeesPasswordSection.style.display = 'block';
        if(addMultipleWeeklyFeesAdminPasswordInput) addMultipleWeeklyFeesAdminPasswordInput.focus();
    });
    if(cancelSaveMultipleFeesBtn) cancelSaveMultipleFeesBtn.addEventListener('click', () => {
        if(initialMultipleFeesActions) initialMultipleFeesActions.style.display = 'block';
        if(addMultipleFeesPasswordSection) addMultipleFeesPasswordSection.style.display = 'none';
        if(addMultipleWeeklyFeesErrorMessage) addMultipleWeeklyFeesErrorMessage.textContent = '';
    });
    if(confirmSaveMultipleFeesBtn) confirmSaveMultipleFeesBtn.addEventListener('click', confirmAndSaveMultipleFees);
    if(selectAllStudentsCheckbox) selectAllStudentsCheckbox.addEventListener('change', (event) => {
        multipleWeeklyFeesTableBody.querySelectorAll('.student-select-checkbox').forEach(cb => { cb.checked = event.target.checked; });
    });
    document.querySelectorAll('.select-all-week-checkbox').forEach(headerCheckbox => {
        headerCheckbox.addEventListener('change', (event) => {
            const week = event.target.dataset.week;
            multipleWeeklyFeesTableBody.querySelectorAll(`.week-select-checkbox[data-week="${week}"]`).forEach(cb => { cb.checked = event.target.checked; });
        });
    });

    if(prevMonthPunishmentBtn) prevMonthPunishmentBtn.addEventListener('click', () => { if (currentPunishmentMonthIndex > 0) renderPunishmentSummary(currentPunishmentMonthIndex - 1); });
    if(nextMonthPunishmentBtn) nextMonthPunishmentBtn.addEventListener('click', () => {
        const currentAcademicMonthIndex = getAcademicMonthIndex(new Date().getMonth());
        if (currentPunishmentMonthIndex < currentAcademicMonthIndex) renderPunishmentSummary(currentPunishmentMonthIndex + 1);
    });

    // --- Settings Event Listeners ---
    if(clearHistoryBtn) clearHistoryBtn.addEventListener('click', openAdminClearHistoryModal);
    if(closeAdminClearHistoryModalBtn) closeAdminClearHistoryModalBtn.addEventListener('click', closeAdminClearHistoryModal);
    if(confirmClearHistoryBtn) confirmClearHistoryBtn.addEventListener('click', clearSaveHistoryFromFirebase);
    if(cancelClearHistoryBtn) cancelClearHistoryBtn.addEventListener('click', closeAdminClearHistoryModal);

    if(autoDeleteToggle) autoDeleteToggle.addEventListener('change', async () => {
        const currentSettings = (await appSettingsDocRef.get()).data() || {};
        await saveAppSettings({ ...currentSettings, autoDeleteEnabled: autoDeleteToggle.checked });
        await checkAndTrimHistory();
    });
    if(editHistoryLimitBtn) editHistoryLimitBtn.addEventListener('click', () => toggleHistoryLimitEditMode(true));
    if(saveHistoryLimitBtn) saveHistoryLimitBtn.addEventListener('click', handleSaveHistoryLimit);
    if(cancelHistoryLimitBtn) cancelHistoryLimitBtn.addEventListener('click', () => toggleHistoryLimitEditMode(false));

    if(autoDeleteNewsToggle) autoDeleteNewsToggle.addEventListener('change', async () => {
        const currentSettings = (await appSettingsDocRef.get()).data() || {};
        await saveAppSettings({ ...currentSettings, autoDeleteNewsEnabled: autoDeleteNewsToggle.checked });
        await checkAndTrimNews();
    });
    if(editNewsLimitBtn) editNewsLimitBtn.addEventListener('click', () => toggleNewsLimitEditMode(true));
    if(saveNewsLimitBtn) saveNewsLimitBtn.addEventListener('click', handleSaveNewsLimit);
    if(cancelNewsLimitBtn) cancelNewsLimitBtn.addEventListener('click', () => toggleNewsLimitEditMode(false));

    // New: Chat Settings Listeners
    if(autoDeleteChatToggle) autoDeleteChatToggle.addEventListener('change', async () => {
        const currentSettings = (await appSettingsDocRef.get()).data() || {};
        await saveAppSettings({ ...currentSettings, autoDeleteChatEnabled: autoDeleteChatToggle.checked });
        await checkAndTrimChat();
    });
    if(editChatLimitBtn) editChatLimitBtn.addEventListener('click', () => toggleChatLimitEditMode(true));
    if(saveChatLimitBtn) saveChatLimitBtn.addEventListener('click', handleSaveChatLimit);
    if(cancelChatLimitBtn) cancelChatLimitBtn.addEventListener('click', () => toggleChatLimitEditMode(false));


    if(closeSettingsAdminPasswordModalBtn) closeSettingsAdminPasswordModalBtn.addEventListener('click', () => { closeSettingsAdminPasswordModal(); switchPage('home'); });
    if(confirmSettingsAdminPasswordBtn) confirmSettingsAdminPasswordBtn.addEventListener('click', handleSettingsAdminPasswordConfirm);
    if(cancelSettingsAdminPasswordBtn) cancelSettingsAdminPasswordBtn.addEventListener('click', () => { closeSettingsAdminPasswordModal(); switchPage('home'); });

    if(addStudentBtn) addStudentBtn.addEventListener('click', openAddStudentModal);
    if(deleteStudentBtn) deleteStudentBtn.addEventListener('click', openDeleteStudentSelectionModal);
    if(closeAddStudentModalBtn) closeAddStudentModalBtn.addEventListener('click', closeAddStudentModal);
    if(saveNewStudentBtn) saveNewStudentBtn.addEventListener('click', addNewStudent);
    if(cancelAddStudentBtn) cancelAddStudentBtn.addEventListener('click', closeAddStudentModal);

    if(closeDeleteStudentSelectionModalBtn) closeDeleteStudentSelectionModalBtn.addEventListener('click', closeDeleteStudentSelectionModal);
    if(cancelDeleteSelectionBtn) cancelDeleteSelectionBtn.addEventListener('click', closeDeleteStudentSelectionModal);

    if(closeConfirmDeleteStudentModalBtn) closeConfirmDeleteStudentModalBtn.addEventListener('click', closeConfirmDeleteStudentModal);
    if(confirmDeleteStudentFinalBtn) confirmDeleteStudentFinalBtn.addEventListener('click', deleteStudentConfirmed);
    if(cancelDeleteStudentFinalBtn) cancelDeleteStudentFinalBtn.addEventListener('click', closeConfirmDeleteStudentModal);

    if(setMonthlyFeesBtn) setMonthlyFeesBtn.addEventListener('click', openSetMonthlyFeesModal);
    if(closeSetMonthlyFeesModalBtn) closeSetMonthlyFeesModalBtn.addEventListener('click', closeSetMonthlyFeesModal);
    if(saveMonthlyFeesBtn) saveMonthlyFeesBtn.addEventListener('click', saveMonthlyFees);
    if(cancelSetMonthlyFeesBtn) cancelSetMonthlyFeesBtn.addEventListener('click', closeSetMonthlyFeesModal);

    // --- News System Event Listeners ---
    if(addNewsBtn) addNewsBtn.addEventListener('click', openAddNewsModal);
    if(deleteNewsBtn) deleteNewsBtn.addEventListener('click', openDeleteNewsModal);
    if(closeAddNewsModalBtn) closeAddNewsModalBtn.addEventListener('click', closeAddNewsModal);
    if(saveNewsBtn) saveNewsBtn.addEventListener('click', saveNews);
    if(cancelAddNewsBtn) cancelAddNewsBtn.addEventListener('click', closeAddNewsModal);
    if(closeDeleteNewsModalBtn) closeDeleteNewsModalBtn.addEventListener('click', closeDeleteNewsModal);
    if(cancelDeleteNewsSelectionBtn) cancelDeleteNewsSelectionBtn.addEventListener('click', closeDeleteNewsModal);
    
    // CHANGE: Added Event Delegation for news cards
    if (newsContainer) {
        newsContainer.addEventListener('click', (event) => {
            const card = event.target.closest('.news-card');
            if (!card) return;

            const isFormButton = event.target.classList.contains('start-form-btn');
            const formId = card.dataset.formId;

            if (isFormButton && formId) {
                openDoFormModal(formId);
            } else if (card.dataset.newsData) {
                const newsData = JSON.parse(card.dataset.newsData);
                openNewsDetailModal(newsData);
            }
        });
    }

    // Confirm Delete News Modal Listeners
    if(closeConfirmDeleteNewsModalBtn) closeConfirmDeleteNewsModalBtn.addEventListener('click', closeConfirmDeleteNewsModal);
    if(confirmDeleteNewsFinalBtn) confirmDeleteNewsFinalBtn.addEventListener('click', deleteNewsItemConfirmed);
    if(cancelDeleteNewsFinalBtn) cancelDeleteNewsFinalBtn.addEventListener('click', closeConfirmDeleteNewsModal);

    // Confirm Clear Chat Modal Listeners
    if(closeConfirmClearChatModalBtn) closeConfirmClearChatModalBtn.addEventListener('click', closeConfirmClearChatModal);
    if(confirmClearChatFinalBtn) confirmClearChatFinalBtn.addEventListener('click', clearAllChatMessages);
    if(cancelClearChatFinalBtn) cancelClearChatFinalBtn.addEventListener('click', closeConfirmClearChatModal);

    // Image Modal Listeners
    if(closeImageModalBtn) closeImageModalBtn.addEventListener('click', closeImageModal);
    
    // News Detail Modal Listeners
    if(closeNewsDetailModalBtn) closeNewsDetailModalBtn.addEventListener('click', closeNewsDetailModal);
    
    if(newsImageUrlInput) newsImageUrlInput.addEventListener('input', () => {
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

    // --- Chat System Event Listeners ---
    if(clearChatBtn) clearChatBtn.addEventListener('click', openConfirmClearChatModal);
    if(saveChatNameBtn) saveChatNameBtn.addEventListener('click', handleSaveChatName);

    // NEW: Event listener for the change name button
    if(changeChatNameBtn) changeChatNameBtn.addEventListener('click', () => {
        // Pre-fill the input with the current name
        if(chatNameInput) chatNameInput.value = chatDisplayName || '';
        // Show the name prompt modal
        if(namePromptModal) namePromptModal.style.display = 'flex';
        if(chatNameInput) chatNameInput.focus();
    });


    // --- Update Notification Listener ---
    if(refreshPageBtn) refreshPageBtn.addEventListener('click', () => {
        location.reload();
    });

    // =============================================
    // ===== START: Auto-growing Textarea Logic =====
    // =============================================

    function autoGrowTextarea(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto'; // รีเซ็ตความสูง
        textarea.style.height = (textarea.scrollHeight) + 'px'; // ตั้งค่าความสูงตามเนื้อหา
    }

    function handleTextareaKeydown(event) {
        const textarea = event.target;
        const form = textarea.closest('form');

        // ถ้ากด Enter (โดยไม่กด Shift)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // ป้องกันการขึ้นบรรทัดใหม่

            // ส่งฟอร์มตาม id
            if (form && typeof form.requestSubmit === 'function') {
                form.requestSubmit();
            }
        }
    }
    
    if(userChatMessageInput) {
        userChatMessageInput.addEventListener('input', () => autoGrowTextarea(userChatMessageInput));
        userChatMessageInput.addEventListener('keydown', handleTextareaKeydown);
    }
    if(adminChatMessageInput) {
        adminChatMessageInput.addEventListener('input', () => autoGrowTextarea(adminChatMessageInput));
        adminChatMessageInput.addEventListener('keydown', handleTextareaKeydown);
    }

    if(userChatForm) userChatForm.addEventListener('submit', (e) => {
        handleUserChatSubmit(e).then(() => {
            if(userChatMessageInput) autoGrowTextarea(userChatMessageInput);
        });
    });
    if(adminChatForm) adminChatForm.addEventListener('submit', (e) => {
        handleAdminChatSubmit(e).then(() => {
            if(adminChatMessageInput) autoGrowTextarea(adminChatMessageInput);
        });
    });
    
    // --- QR Code Generator Tool ---
if (document.getElementById('other-tool')) {
  if (!window.qrcode) {
    var qrScript = document.createElement('script');
    qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    qrScript.onload = function() {
      setupQrTool();
    };
    document.head.appendChild(qrScript);
  } else {
    setupQrTool();
  }
}

function setupQrTool() {
  const qrText = document.getElementById('qrText');
  const qrColor = document.getElementById('qrColor');
  const qrBgColor = document.getElementById('qrBgColor');
  const qrSize = document.getElementById('qrSize');
  const generateBtn = document.getElementById('generateQrBtn');
  const qrResult = document.getElementById('qrResult');
  const qrCanvas = document.getElementById('qrCanvas');
  const downloadBtn = document.getElementById('downloadQrBtn');
  const qrAlert = document.getElementById('qrAlert');

  const qrBorderInput = document.getElementById('qrBorderWidth');
  const qrBorderColorInput = document.getElementById('qrBorderColor');
  const qrRadiusInput = document.getElementById('qrRadius');
  const qrColorPreview = document.getElementById('qrColorPreview');
  const qrBgColorPreview = document.getElementById('qrBgColorPreview');

  // เพิ่ม: ดึง Element ของช่องใส่ชื่อไฟล์
  const qrFilenameInput = document.getElementById('qrFilename');

  function updateColorPreview() {
    qrColorPreview.style.background = qrColor.value;
    qrBgColorPreview.style.background = qrBgColor.value;
  }
  qrColor.addEventListener('input', updateColorPreview);
  qrBgColor.addEventListener('input', updateColorPreview);
  updateColorPreview();

  let lastQrData = null;
  
  function generate() {
    const text = qrText.value.trim();
    const color = qrColor.value;
    const bgColor = qrBgColor.value;
    let size = parseInt(qrSize.value, 10);
    let borderWidth = parseInt(qrBorderInput.value, 10) || 0;
    let borderColor = qrBorderColorInput.value || '#2563eb';
    let radius = parseInt(qrRadiusInput.value, 10) || 0;
    if (!text) {
      qrAlert.textContent = 'กรุณากรอกข้อความหรือ URL ที่ต้องการสร้าง QR Code';
      qrAlert.classList.remove('hidden');
      qrResult.classList.add('hidden');
      return;
    }
    if (isNaN(size) || size < 100 || size > 600) {
      qrAlert.textContent = 'ขนาดต้องอยู่ระหว่าง 100 ถึง 600 พิกเซล';
      qrAlert.classList.remove('hidden');
      qrResult.classList.add('hidden');
      return;
    }
    qrAlert.classList.add('hidden');
    let qr = window.qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    let cellSize = Math.floor(size / qr.getModuleCount());
    let qrSizePx = cellSize * qr.getModuleCount();
    let totalSize = qrSizePx + borderWidth * 2;
    qrCanvas.width = totalSize;
    qrCanvas.height = totalSize;
    let ctx = qrCanvas.getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(totalSize - radius, 0);
    ctx.quadraticCurveTo(totalSize, 0, totalSize, radius);
    ctx.lineTo(totalSize, totalSize - radius);
    ctx.quadraticCurveTo(totalSize, totalSize, totalSize - radius, totalSize);
    ctx.lineTo(radius, totalSize);
    ctx.quadraticCurveTo(0, totalSize, 0, totalSize - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, totalSize, totalSize);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius + borderWidth, borderWidth);
    ctx.lineTo(totalSize - radius - borderWidth, borderWidth);
    ctx.quadraticCurveTo(totalSize - borderWidth, borderWidth, totalSize - borderWidth, radius + borderWidth);
    ctx.lineTo(totalSize - borderWidth, totalSize - radius - borderWidth);
    ctx.quadraticCurveTo(totalSize - borderWidth, totalSize - borderWidth, totalSize - radius - borderWidth, totalSize - borderWidth);
    ctx.lineTo(radius + borderWidth, totalSize - borderWidth);
    ctx.quadraticCurveTo(borderWidth, totalSize - borderWidth, borderWidth, totalSize - radius - borderWidth);
    ctx.lineTo(borderWidth, radius + borderWidth);
    ctx.quadraticCurveTo(borderWidth, borderWidth, radius + borderWidth, borderWidth);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = bgColor;
    ctx.fillRect(borderWidth, borderWidth, qrSizePx, qrSizePx);
    ctx.restore();
    for (let r = 0; r < qr.getModuleCount(); r++) {
      for (let c = 0; c < qr.getModuleCount(); c++) {
        ctx.fillStyle = qr.isDark(r, c) ? color : bgColor;
        ctx.fillRect(borderWidth + c * cellSize, borderWidth + r * cellSize, cellSize, cellSize);
      }
    }
    qrResult.classList.remove('hidden');
    lastQrData = text;
  }

  generateBtn.addEventListener('click', generate);

  // เพิ่ม: qrFilenameInput เข้าไปในกลุ่ม control เพื่อให้ auto-update ทำงาน (ถ้ามี)
  const allControls = [qrText, qrColor, qrBgColor, qrSize, qrBorderInput, qrBorderColorInput, qrRadiusInput, qrFilenameInput];
  allControls.forEach(control => {
      control.addEventListener('input', () => {
        if (qrText.value.trim()){
            generate();
        }
      });
  });

  downloadBtn.addEventListener('click', function() {
    if (!lastQrData) {
      qrAlert.textContent = 'กรุณาสร้าง QR Code ก่อนดาวน์โหลด';
      qrAlert.classList.remove('hidden');
      return;
    }
    const link = document.createElement('a');
    
    // แก้ไข: ตรรกะสำหรับตั้งชื่อไฟล์
    let filename = qrFilenameInput.value.trim();
    if (!filename) {
        filename = 'qrcode'; // ถ้าไม่ได้กรอกชื่อ ให้ใช้ชื่อเริ่มต้น
    }
    // ตรวจสอบและเพิ่ม .png ถ้ายังไม่มี
    if (!filename.toLowerCase().endsWith('.png')) {
        filename += '.png';
    }
    link.download = filename;
    
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
  });
}

    // ===========================================
    // ===== END: Auto-growing Textarea Logic =====
    // ===========================================

    if (typeof emailjs !== 'undefined' && !emailjs._isInitialized) {
        emailjs.init('7gaavlGnJ9JjhLxb7');
    }
    if (captchaInput) {
        captchaInput.addEventListener('input', validateCaptcha);
    }
    if (contactAdminForm) {
        contactAdminForm.addEventListener('submit', handleContactFormSubmit);
    }
    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (event) => {
            // ไม่ต้องปิด modal เมื่อคลิก overlay ทุกกรณี
            // (ปิดได้เฉพาะกดปุ่ม close/cancel เท่านั้น)
            return;
        });
    });
});