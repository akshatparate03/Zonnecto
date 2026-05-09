import React, { useState, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Same Apps Script URL jo forgot-password use karta hai
const OTP_SCRIPT_URL =
  import.meta.env.VITE_OTP_SCRIPT_URL || "YOUR_APPS_SCRIPT_URL_HERE";

const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const INDIA_CITIES = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": [
    "Amaravati",
    "Anantapur",
    "Chittoor",
    "Eluru",
    "Guntur",
    "Kadapa",
    "Kakinada",
    "Kurnool",
    "Nellore",
    "Rajahmundry",
    "Tirupati",
    "Vijayawada",
    "Visakhapatnam",
    "Vizianagaram",
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat"],
  Assam: ["Dibrugarh", "Guwahati", "Jorhat", "Silchar", "Tezpur"],
  Bihar: [
    "Arrah",
    "Aurangabad",
    "Bhagalpur",
    "Bihar Sharif",
    "Buxar",
    "Darbhanga",
    "Gaya",
    "Katihar",
    "Muzaffarpur",
    "Patna",
    "Purnia",
    "Sasaram",
    "Siwan",
  ],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: [
    "Bhilai",
    "Bilaspur",
    "Durg",
    "Jagdalpur",
    "Korba",
    "Raigarh",
    "Raipur",
  ],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  Goa: ["Margao", "Panaji", "Vasco da Gama"],
  Gujarat: [
    "Ahmedabad",
    "Anand",
    "Bharuch",
    "Bhavnagar",
    "Gandhinagar",
    "Jamnagar",
    "Junagadh",
    "Mehsana",
    "Morbi",
    "Nadiad",
    "Rajkot",
    "Surat",
    "Vadodara",
    "Valsad",
  ],
  Haryana: [
    "Ambala",
    "Bhiwani",
    "Faridabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Karnal",
    "Kurukshetra",
    "Panipat",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],
  "Himachal Pradesh": [
    "Dharamshala",
    "Hamirpur",
    "Kangra",
    "Kullu",
    "Mandi",
    "Shimla",
    "Solan",
  ],
  "Jammu and Kashmir": [
    "Anantnag",
    "Baramulla",
    "Jammu",
    "Kathua",
    "Srinagar",
    "Udhampur",
  ],
  Jharkhand: [
    "Bokaro",
    "Deoghar",
    "Dhanbad",
    "Giridih",
    "Jamshedpur",
    "Ranchi",
  ],
  Karnataka: [
    "Ballari",
    "Belagavi",
    "Bengaluru",
    "Bidar",
    "Chikkamagaluru",
    "Davanagere",
    "Dharwad",
    "Hassan",
    "Hubballi",
    "Kalaburagi",
    "Mandya",
    "Mangaluru",
    "Mysuru",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Vijayapura",
  ],
  Kerala: [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],
  Ladakh: ["Kargil", "Leh"],
  Lakshadweep: ["Kavaratti"],
  "Madhya Pradesh": [
    "Bhopal",
    "Chhindwara",
    "Dewas",
    "Gwalior",
    "Indore",
    "Jabalpur",
    "Khandwa",
    "Morena",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Shivpuri",
    "Ujjain",
    "Vidisha",
  ],
  Maharashtra: [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Chandrapur",
    "Dhule",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai",
    "Nagpur",
    "Nanded",
    "Nashik",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],
  Manipur: ["Bishnupur", "Churachandpur", "Imphal", "Thoubal"],
  Meghalaya: ["Nongpoh", "Shillong", "Tura"],
  Mizoram: ["Aizawl", "Lunglei"],
  Nagaland: ["Dimapur", "Kohima", "Mokokchung"],
  Odisha: [
    "Angul",
    "Balasore",
    "Berhampur",
    "Bhubaneswar",
    "Cuttack",
    "Jharsuguda",
    "Puri",
    "Rourkela",
    "Sambalpur",
  ],
  Puducherry: ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  Punjab: [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Mansa",
    "Moga",
    "Mohali",
    "Muktsar",
    "Patiala",
    "Rupnagar",
    "Sangrur",
    "Tarn Taran",
  ],
  Rajasthan: [
    "Ajmer",
    "Alwar",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Dholpur",
    "Dungarpur",
    "Ganganagar",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Tonk",
    "Udaipur",
  ],
  Sikkim: ["Gangtok", "Gyalshing", "Mangan", "Namchi"],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kancheepuram",
    "Kanyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar",
  ],
  Telangana: [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hyderabad",
    "Jagitial",
    "Jangaon",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal",
    "Yadadri Bhuvanagiri",
  ],
  Tripura: ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Allahabad",
    "Ambedkar Nagar",
    "Amroha",
    "Auraiya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur",
    "Kasganj",
    "Kaushambi",
    "Kushinagar",
    "Lakhimpur Kheri",
    "Lalitpur",
    "Lucknow",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharth Nagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],
  Uttarakhand: [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi",
  ],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur",
  ],
};
export default function Register() {
  // ── Form fields ──
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const usernameTimerRef = React.useRef(null);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cityCustom, setCityCustom] = useState(""); // Other city manual input
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── DP ──
  const [dpFile, setDpFile] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);
  const dpInputRef = useRef(null);

  // ── OTP flow ──
  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [serverOtp, setServerOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // ── UI state ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const navigate = useNavigate();
  const inviteCode = searchParams.get("invite");

  // ─── Username Availability Check (debounced) ─────────────────────────────
  const handleUsernameChange = (val) => {
    setUsername(val);
    setUsernameStatus(null);
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    const trimmed = val.trim();
    if (!trimmed || trimmed.length < 3) return;
    setUsernameStatus("checking");
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(trimmed)}`,
        );
        setUsernameStatus(res.data?.available ? "available" : "taken");
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  };

  // ─── Validators ───────────────────────────────────────
  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[\S]{8,20}$/.test(pwd);

  // ─── DP handler ───────────────────────────────────────
  const handleDpChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setError("");
    setDpFile(file);
    setDpPreview(URL.createObjectURL(file));
  };

  // ─── Step 1 submit: validate + send OTP ───────────────
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!dpFile) {
      setError("Please upload a profile picture — it's mandatory!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be 8-16 characters with uppercase, lowercase, digit, and special character (any special char)",
      );
      return;
    }
    if (!email) {
      setError("Email is required");
      return;
    }
    if (usernameStatus === "taken") {
      setError(
        "This username is already taken. Please choose a different one.",
      );
      return;
    }

    // Check if email already registered (optional — fails silently)
    setOtpSending(true);
    try {
      await sendOtp(email);
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setOtpSending(false);
    }
  };

  // ─── Send OTP via Backend → Apps Script (same as forgot-password flow) ────
  const sendOtp = async (toEmail) => {
    // Step 1: Backend se OTP generate karo — Redis mein store hoga (10 min)
    const res = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
      email: toEmail.trim(),
      name: fullName || username || "",
    });

    const generatedOtp = res.data?.otp;
    if (!generatedOtp) throw new Error("Failed to generate OTP from server");

    // Step 2: Apps Script ko OTP do — email bhejega (no-cors, fire & forget)
    fetch(
      `${OTP_SCRIPT_URL}?action=sendOtp&email=${encodeURIComponent(toEmail.trim())}&otp=${encodeURIComponent(generatedOtp)}&name=${encodeURIComponent(fullName || username || "")}`,
      { mode: "no-cors" },
    ).catch(() => {});

    // OTP ab backend Redis mein hai, verify bhi backend se hoga
    setServerOtp("BACKEND");
  };

  // ─── Resend timer ──────────────────────────────────────
  const startResendTimer = () => {
    setOtpResendTimer(60);
    const iv = setInterval(() => {
      setOtpResendTimer((t) => {
        if (t <= 1) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    setOtpSending(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await sendOtp(email);
      startResendTimer();
    } catch (err) {
      setError("Failed to resend OTP. Try again.");
    } finally {
      setOtpSending(false);
    }
  };

  // ─── OTP box key handler ───────────────────────────────
  const handleOtpChange = (i, val) => {
    const cleaned = val.replace(/\D/, "").slice(-1);
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);
    if (cleaned && i < 5) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      otpRefs[i - 1].current?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs[5].current?.focus();
    }
  };

  // ─── Step 2 submit: verify OTP + register ─────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    // Backend se OTP verify karo
    try {
      const verifyRes = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email: email.trim(),
        otp: enteredOtp,
      });
      if (!verifyRes.data?.message?.includes("verified")) {
        setError("Incorrect OTP. Please check your email and try again.");
        return;
      }
    } catch (verifyErr) {
      setError(
        verifyErr.response?.data?.error ||
          "Incorrect or expired OTP. Please try again.",
      );
      return;
    }

    setLoading(true);
    try {
      // Register user
      const userData = await register(email, password, username, inviteCode);

      // Save profile data from registration form
      try {
        const finalCity = city === "other" ? cityCustom : city;
        await axios.post(
          `${API_BASE_URL}/user/update-profile-at-registration`,
          {
            fullName: fullName.trim(),
            age: age.trim(),
            gender,
            city: finalCity,
            state,
          },
        );
      } catch (profileErr) {
        console.warn("Profile save failed (non-critical):", profileErr.message);
      }

      // Upload DP if selected
      if (dpFile && userData?.userId) {
        try {
          const fd = new FormData();
          fd.append("file", dpFile);
          await axios.post(`${API_BASE_URL}/user/upload-dp`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (dpErr) {
          console.warn("DP upload failed (non-critical):", dpErr.message);
        }
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // STYLES
  // ────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    .zn-root {
      min-height: 100vh; min-height: 100dvh; background: #070710;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem; font-family: 'DM Sans', sans-serif;
      position: relative; overflow-x: hidden;
    }
    .zn-orb {
      position: fixed; border-radius: 50%; filter: blur(90px);
      opacity: 0.18; pointer-events: none;
      animation: floatOrb 12s ease-in-out infinite alternate;
    }
    .zn-orb-1 { width: min(600px,90vw); height: min(600px,90vw); background: radial-gradient(circle, #a855f7, #7c3aed); top: -150px; left: -150px; animation-duration: 14s; }
    .zn-orb-2 { width: min(550px,85vw); height: min(550px,85vw); background: radial-gradient(circle, #06b6d4, #3b82f6); bottom: -150px; right: -150px; animation-duration: 10s; animation-direction: alternate-reverse; }
    @keyframes floatOrb { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(40px,30px) scale(1.08)} }
    .zn-grid {
      position: fixed; inset: 0; pointer-events: none;
      background-image: linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);
      background-size: 48px 48px;
    }

    /* CARD */
    .zn-card {
      position: relative; width: 100%; max-width: 1000px;
      display: grid; grid-template-columns: 280px 1fr;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 24px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
      animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both; overflow: hidden;
    }
    @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
    .zn-card::before {
      content:''; position:absolute; top:0; left:10%; right:10%; height:1px; z-index:1;
      background: linear-gradient(90deg,transparent,rgba(168,85,247,0.7),rgba(6,182,212,0.7),transparent);
    }

    /* LEFT */
    .zn-left {
      background: rgba(139,92,246,0.07); border-right: 1px solid rgba(139,92,246,0.15);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 2.5rem 2rem; gap: 1.5rem; position: relative; overflow: hidden;
    }
    .zn-left::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at center,rgba(139,92,246,0.12) 0%,transparent 70%); pointer-events:none; }
    .zn-logo-img-wrap {
      width: 90px; height: 90px; border-radius: 22px;
      background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 40px rgba(139,92,246,0.25); overflow: hidden; position: relative; z-index:1;
    }
    .zn-logo-img-wrap img { width: 68px; height: 68px; object-fit: contain; }
    .zn-brand {
      font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800;
      background: linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #22d3ee 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      letter-spacing: -0.02em; line-height: 1; text-align: center; position: relative; z-index:1;
    }
    .zn-tagline { font-size: 0.72rem; color: rgba(255,255,255,0.35); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500; text-align: center; position: relative; z-index:1; }
    .zn-left-divider { width: 60%; height: 1px; background: linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent); position: relative; z-index:1; }
    .zn-left-features { display: flex; flex-direction: column; gap: 0.85rem; width: 100%; position: relative; z-index:1; }
    .zn-feature { display: flex; align-items: center; gap: 0.65rem; font-size: 0.8rem; color: rgba(255,255,255,0.45); }
    .zn-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: linear-gradient(135deg,#a855f7,#22d3ee); flex-shrink:0; }
    .zn-login-link { font-size: 0.78rem; color: rgba(255,255,255,0.3); text-align: center; position: relative; z-index:1; }
    .zn-login-link a { color: #a78bfa; font-weight: 600; text-decoration: none; transition: color 0.2s; }
    .zn-login-link a:hover { color: #c4b5fd; }

    /* RIGHT */
    .zn-right { padding: 2rem 2.25rem; display: flex; flex-direction: column; justify-content: center; }
    .zn-form-title { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:rgba(255,255,255,0.85); margin-bottom:1.25rem; letter-spacing:-0.01em; }
    .zn-section-label {
      font-family:'Syne',sans-serif; font-size:0.65rem; font-weight:700; letter-spacing:0.12em;
      text-transform:uppercase; color:rgba(139,92,246,0.6); margin-bottom:0.6rem; margin-top:0.9rem;
      display:flex; align-items:center; gap:0.5rem;
    }
    .zn-section-label::after { content:''; flex:1; height:1px; background:rgba(139,92,246,0.15); }

    .zn-form { display: flex; flex-direction: column; gap: 0; }
    .zn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .zn-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; }
    .zn-row-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.6rem; }
    .zn-field { display: flex; flex-direction: column; gap: 0.28rem; }
    .zn-label { font-size:0.68rem; font-weight:500; color:rgba(255,255,255,0.4); letter-spacing:0.06em; text-transform:uppercase; }

    .zn-input-wrap { position:relative; display:flex; align-items:center; }
    .zn-input-icon { position:absolute; left:10px; color:rgba(139,92,246,0.55); display:flex; pointer-events:none; }
    .zn-input {
      width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
      border-radius:9px; padding:0.55rem 0.8rem 0.55rem 2.2rem; color:#fff;
      font-family:'DM Sans',sans-serif; font-size:0.83rem; transition:all 0.2s; outline:none;
    }
    .zn-input-no-icon { padding-left: 0.8rem; }
    .zn-input::placeholder { color:rgba(255,255,255,0.17); }
    .zn-input:focus { border-color:rgba(139,92,246,0.5); background:rgba(139,92,246,0.07); box-shadow:0 0 0 2.5px rgba(139,92,246,0.12); }
    .zn-input:disabled { opacity:0.5; cursor:not-allowed; }
    .zn-select {
      width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
      border-radius:9px; padding:0.55rem 2.2rem 0.55rem 0.8rem; color:#fff;
      font-family:'DM Sans',sans-serif; font-size:0.83rem; transition:all 0.2s; outline:none;
      cursor:pointer; appearance:none; -webkit-appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23a78bfa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 10px center; background-size:12px;
    }
    .zn-select:focus { border-color:rgba(139,92,246,0.6); background-color:rgba(139,92,246,0.09); box-shadow:0 0 0 2.5px rgba(139,92,246,0.15); }
    .zn-select option { background:#1c1033; color:#e2e8f0; }
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
    input[type=number]{-moz-appearance:textfield}

    .zn-select-wrap { position:relative; }
    .zn-select-arrow { position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:rgba(139,92,246,0.6);display:flex; }
    /* Hide scrollbar in dropdowns */
    .zn-select { scrollbar-width:none; -ms-overflow-style:none; }
    .zn-select::-webkit-scrollbar { display:none; width:0; height:0; }
    /* Locked city field */
    .zn-select-locked { position:relative;display:flex;align-items:center;gap:0.5rem;width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:9px;padding:0.55rem 0.8rem;cursor:pointer;opacity:0.6;user-select:none; }
    .zn-select-locked-icon { color:rgba(139,92,246,0.5);display:flex;flex-shrink:0; }
    .zn-select-locked-text { font-size:0.83rem;color:rgba(255,255,255,0.3); }
    .zn-state-msg { position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#1e1040;border:1px solid rgba(139,92,246,0.4);color:#c084fc;font-size:0.72rem;padding:0.3rem 0.7rem;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:10; }
    .zn-state-msg::after { content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1e1040; }
    .zn-row-2 { display:grid;grid-template-columns:1fr 1fr;gap:0.75rem; }
    .zn-pw-toggle { position:absolute; right:10px; background:none; border:none; color:rgba(255,255,255,0.28); cursor:pointer; padding:0; display:flex; transition:color 0.2s; }
    .zn-pw-toggle:hover { color:rgba(139,92,246,0.8); }
    .zn-pw-hint { font-size:0.67rem; color:rgba(255,255,255,0.25); margin-top:0.15rem; }

    /* ── DP UPLOAD ── */
    .zn-dp-section { display:flex; align-items:center; gap:1.25rem; padding:0.75rem; background:rgba(255,255,255,0.03); border:1px dashed rgba(139,92,246,0.25); border-radius:12px; cursor:pointer; transition:all 0.2s; }
    .zn-dp-section:hover { border-color:rgba(139,92,246,0.5); background:rgba(139,92,246,0.06); }
    .zn-dp-section.has-dp { border-style:solid; border-color:rgba(139,92,246,0.35); }
    .zn-dp-avatar {
      width:60px; height:60px; border-radius:50%; flex-shrink:0; overflow:hidden;
      background:rgba(139,92,246,0.1); border:2px solid rgba(139,92,246,0.25);
      display:flex; align-items:center; justify-content:center; color:rgba(139,92,246,0.5);
    }
    .zn-dp-avatar img { width:100%; height:100%; object-fit:cover; }
    .zn-dp-info { flex:1; }
    .zn-dp-title { font-size:0.82rem; font-weight:600; color:rgba(255,255,255,0.8); margin-bottom:0.2rem; }
    .zn-dp-sub { font-size:0.72rem; color:rgba(255,255,255,0.35); }
    .zn-dp-badge { font-size:0.65rem; color:#f87171; font-weight:600; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); padding:0.1rem 0.4rem; border-radius:4px; display:inline-block; margin-top:0.2rem; }
    .zn-dp-badge.uploaded { color:#4ade80; background:rgba(74,222,128,0.1); border-color:rgba(74,222,128,0.2); }

    /* ERROR / SUCCESS */
    .zn-error {
      display:flex; align-items:center; gap:0.5rem;
      background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25);
      color:#fca5a5; padding:0.6rem 0.85rem; border-radius:9px; font-size:0.8rem;
      margin-bottom:0.75rem; animation:shake 0.4s ease;
    }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }

    .zn-invite-badge {
      display:flex; align-items:center; gap:0.5rem;
      background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.25);
      color:#c084fc; padding:0.5rem 0.85rem; border-radius:9px; font-size:0.8rem; font-weight:500; margin-bottom:0.75rem;
    }

    /* BUTTON */
    .zn-btn {
      width:100%; margin-top:1rem; padding:0.75rem; border:none; border-radius:11px;
      background:linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#0891b2 100%);
      color:#fff; font-family:'Syne',sans-serif; font-size:0.92rem; font-weight:700;
      letter-spacing:0.04em; cursor:pointer; position:relative; overflow:hidden;
      transition:opacity 0.2s,transform 0.15s;
      box-shadow:0 4px 20px rgba(124,58,237,0.35),0 0 0 1px rgba(255,255,255,0.08) inset;
    }
    .zn-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent); pointer-events:none; }
    .zn-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 8px 28px rgba(124,58,237,0.45); }
    .zn-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .zn-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:7px; }
    @keyframes spin { to{transform:rotate(360deg)} }

    /* ── OTP STEP ── */
    .zn-otp-wrap {
      display:flex; flex-direction:column; align-items:center;
      padding:1.5rem 0; gap:1.5rem; animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .zn-otp-icon {
      width:64px; height:64px; border-radius:18px;
      background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.25);
      display:flex; align-items:center; justify-content:center; color:#c084fc;
    }
    .zn-otp-title { font-family:'Syne',sans-serif; font-size:1.15rem; font-weight:800; color:#fff; text-align:center; }
    .zn-otp-sub { font-size:0.83rem; color:rgba(255,255,255,0.4); text-align:center; line-height:1.55; }
    .zn-otp-sub strong { color:#c084fc; }
    .zn-otp-boxes { display:flex; gap:0.6rem; justify-content:center; }
    .zn-otp-box {
      width:48px; height:56px; border-radius:12px; border:1px solid rgba(255,255,255,0.1);
      background:rgba(255,255,255,0.05); color:#fff; font-family:'Syne',sans-serif;
      font-size:1.4rem; font-weight:700; text-align:center; outline:none; transition:all 0.2s;
    }
    .zn-otp-box:focus { border-color:rgba(139,92,246,0.6); background:rgba(139,92,246,0.1); box-shadow:0 0 0 3px rgba(139,92,246,0.15); }
    .zn-otp-box.filled { border-color:rgba(139,92,246,0.4); background:rgba(139,92,246,0.08); }
    .zn-otp-resend { font-size:0.8rem; color:rgba(255,255,255,0.35); text-align:center; }
    .zn-otp-resend button { background:none; border:none; cursor:pointer; color:#a78bfa; font-weight:600; font-size:0.8rem; transition:color 0.2s; padding:0; }
    .zn-otp-resend button:hover:not(:disabled) { color:#c4b5fd; }
    .zn-otp-resend button:disabled { color:rgba(255,255,255,0.2); cursor:not-allowed; }
    .zn-back-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.35); font-size:0.8rem; display:flex; align-items:center; gap:0.3rem; transition:color 0.2s; padding:0; }
    .zn-back-btn:hover { color:rgba(255,255,255,0.7); }

    /* MOBILE */
    @media(max-width:720px){
      .zn-root{padding:1rem;align-items:flex-start;overflow-y:auto;height:auto;min-height:100vh;min-height:100dvh;}
      .zn-card{grid-template-columns:1fr;max-width:500px;}
      .zn-left{padding:2rem 1.5rem 1.5rem;flex-direction:row;flex-wrap:wrap;justify-content:center;gap:1rem;border-right:none;border-bottom:1px solid rgba(139,92,246,0.15);}
      .zn-left-features,.zn-left-divider{display:none;}
      .zn-right{padding:1.5rem;}
      .zn-row-3,.zn-row-4{grid-template-columns:1fr 1fr;}
      .zn-brand{font-size:1.6rem;}
    }
    @media(max-width:480px){
      .zn-root{padding:0.75rem;}
      .zn-right{padding:1.25rem;}
      .zn-left{padding:1.5rem 1.25rem 1.25rem;}
      .zn-brand{font-size:1.5rem;}
      .zn-row-3,.zn-row-4{grid-template-columns:1fr 1fr;}
    }
    @media(max-width:420px){
      .zn-root{padding:0.5rem;}
      .zn-right{padding:1rem;}
      .zn-left{padding:1.25rem 1rem 1rem;}
      .zn-row,.zn-row-3,.zn-row-4{grid-template-columns:1fr;}
      .zn-otp-box{width:38px;height:46px;font-size:1.1rem;}
      .zn-brand{font-size:1.4rem;}
      .zn-input,.zn-select{font-size:0.85rem;}
      .zn-btn-main{font-size:0.88rem;padding:0.78rem;}
    }
    @media(max-width:360px){
      .zn-right{padding:0.9rem 0.75rem;}
      .zn-otp-box{width:34px;height:42px;font-size:1rem;}
      .zn-brand{font-size:1.3rem;}
      .zn-otp-wrap{gap:0.35rem;}
    }
  `;

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="zn-root">
        <div className="zn-orb zn-orb-1" />
        <div className="zn-orb zn-orb-2" />
        <div className="zn-grid" />

        <div className="zn-card">
          {/* ── Left Panel ── */}
          <div className="zn-left">
            <div className="zn-logo-img-wrap">
              <img src="/Zonnecto.png" alt="Zonnecto" />
            </div>
            <div className="zn-brand">Zonnecto</div>
            <div className="zn-tagline">Anonymous Connections</div>
            <div className="zn-left-divider" />
            <div className="zn-left-features">
              {[
                "Stay completely anonymous",
                "Real-time encrypted chats",
                "Connect to anyone randomly",
                "No tracking, no data selling",
              ].map((f) => (
                <div className="zn-feature" key={f}>
                  <span className="zn-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
            <div className="zn-left-divider" />
            <div className="zn-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="zn-right">
            {/* ══════ STEP 1: FORM ══════ */}
            {step === 1 && (
              <>
                <div className="zn-form-title">Create Your Account</div>
                <form className="zn-form" onSubmit={handleStep1Submit}>
                  {error && (
                    <div className="zn-error">
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}
                  {inviteCode && (
                    <div className="zn-invite-badge">
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      Invite code: <strong>{inviteCode}</strong>
                    </div>
                  )}

                  {/* ── Profile Picture ── */}
                  <div className="zn-section-label">Profile Picture</div>
                  <div
                    className={`zn-dp-section${dpFile ? " has-dp" : ""}`}
                    onClick={() => dpInputRef.current?.click()}
                  >
                    <div className="zn-dp-avatar">
                      {dpPreview ? (
                        <img src={dpPreview} alt="dp" />
                      ) : (
                        <svg
                          width="26"
                          height="26"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </div>
                    <div className="zn-dp-info">
                      <div className="zn-dp-title">
                        {dpFile
                          ? dpFile.name.slice(0, 28)
                          : "Upload Profile Picture"}
                      </div>
                      <div className="zn-dp-sub">
                        {dpFile
                          ? "Click to change"
                          : "JPG, PNG, WEBP — max 5MB"}
                      </div>
                      <span
                        className={`zn-dp-badge${dpFile ? " uploaded" : ""}`}
                      >
                        {dpFile ? "✓ Uploaded" : "Mandatory"}
                      </span>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="rgba(139,92,246,0.5)"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <input
                      ref={dpInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleDpChange}
                    />
                  </div>

                  {/* ── Personal Info ── */}
                  <div className="zn-section-label">Personal Info</div>
                  <div className="zn-row-4">
                    <div className="zn-field">
                      <label className="zn-label">Full Name</label>
                      <div className="zn-input-wrap">
                        <span className="zn-input-icon">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          className="zn-input"
                          type="text"
                          placeholder="Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={otpSending}
                        />
                      </div>
                    </div>
                    <div className="zn-field">
                      <label className="zn-label">Username</label>
                      <div className="zn-input-wrap">
                        <span className="zn-input-icon">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          className="zn-input"
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          required
                          disabled={otpSending}
                          style={{
                            paddingRight: usernameStatus ? "2.5rem" : undefined,
                          }}
                        />
                        {/* Username availability indicator */}
                        {usernameStatus === "checking" && (
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ animation: "spin 0.7s linear infinite" }}
                            >
                              <path
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                strokeOpacity="0.3"
                              />
                              <path d="M21 12a9 9 0 00-9-9" />
                            </svg>
                          </span>
                        )}
                        {usernameStatus === "available" && (
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              color: "#4ade80",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                        {usernameStatus === "taken" && (
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              color: "#f87171",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </span>
                        )}
                      </div>
                      {/* Username status message */}
                      {usernameStatus === "taken" && (
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "0.75rem",
                            color: "#f87171",
                          }}
                        >
                          ✗ This username is already taken
                        </p>
                      )}
                      {usernameStatus === "available" && (
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "0.75rem",
                            color: "#4ade80",
                          }}
                        >
                          ✓ Username is available
                        </p>
                      )}
                    </div>
                    <div className="zn-field">
                      <label className="zn-label">Age</label>
                      <div className="zn-input-wrap">
                        <span className="zn-input-icon">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </span>
                        <input
                          className="zn-input"
                          type="number"
                          placeholder="18+"
                          min="18"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          disabled={otpSending}
                        />
                      </div>
                    </div>
                    <div className="zn-field">
                      <label className="zn-label">Gender</label>
                      <select
                        className="zn-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={otpSending}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* ── Location ── */}
                  <div className="zn-section-label">Location</div>
                  <div className="zn-row-2">
                    {/* State Dropdown */}
                    <div className="zn-field">
                      <label className="zn-label">State</label>
                      <div className="zn-select-wrap">
                        <select
                          className="zn-select"
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setCity("");
                            setCityCustom("");
                          }}
                          disabled={otpSending}
                        >
                          <option value="">Select State</option>
                          {INDIA_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span className="zn-select-arrow">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* City Field - always visible, locked until state selected */}
                    <div className="zn-field">
                      <label className="zn-label">City</label>
                      {!state ? (
                        /* Locked state - click shows tooltip */
                        <div
                          className="zn-select-locked"
                          onClick={() => {
                            const el = document.getElementById("state-msg");
                            if (el) {
                              el.style.opacity = "1";
                              setTimeout(() => {
                                el.style.opacity = "0";
                              }, 2000);
                            }
                          }}
                        >
                          <span className="zn-select-locked-icon">
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                              />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                          </span>
                          <span className="zn-select-locked-text">
                            Select city
                          </span>
                          <span id="state-msg" className="zn-state-msg">
                            Please select state first
                          </span>
                        </div>
                      ) : city === "other" ? (
                        <input
                          className="zn-input zn-input-no-icon"
                          type="text"
                          placeholder="Enter your city"
                          value={cityCustom}
                          onChange={(e) => setCityCustom(e.target.value)}
                          disabled={otpSending}
                          autoFocus
                        />
                      ) : (
                        <div className="zn-select-wrap">
                          <select
                            className="zn-select"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              setCityCustom("");
                            }}
                            disabled={otpSending}
                          >
                            <option value="">Select City</option>
                            {(INDIA_CITIES[state] || []).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="other">
                              — Other (type manually) —
                            </option>
                          </select>
                          <span className="zn-select-arrow">
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Account ── */}
                  <div className="zn-section-label">Account Details</div>
                  <div className="zn-row-3">
                    <div className="zn-field">
                      <label className="zn-label">Email</label>
                      <div className="zn-input-wrap">
                        <span className="zn-input-icon">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="2" y="4" width="20" height="16" rx="3" />
                            <path d="M2 7l10 7 10-7" />
                          </svg>
                        </span>
                        <input
                          className="zn-input"
                          type="email"
                          placeholder="you@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={otpSending}
                        />
                      </div>
                    </div>
                    <div className="zn-field">
                      <label className="zn-label">Password</label>
                      <div className="zn-input-wrap">
                        <span className="zn-input-icon">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </span>
                        <input
                          className="zn-input"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={otpSending}
                        />
                        <button
                          type="button"
                          className="zn-pw-toggle"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="zn-pw-hint">
                        8-20 chars, A-Z a-z 0-9 any special char
                      </div>
                    </div>
                    <div className="zn-field">
                      <label className="zn-label">Confirm Password</label>
                      <div className="zn-input-wrap">
                        <span className="zn-input-icon">
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </span>
                        <input
                          className="zn-input"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={otpSending}
                        />
                        <button
                          type="button"
                          className="zn-pw-toggle"
                          onClick={() => setShowConfirm((v) => !v)}
                          tabIndex={-1}
                        >
                          {showConfirm ? (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    className="zn-btn"
                    type="submit"
                    disabled={otpSending}
                  >
                    {otpSending && <span className="zn-spinner" />}
                    {otpSending
                      ? "Sending OTP..."
                      : "Continue & Verify Email →"}
                  </button>
                </form>
              </>
            )}

            {/* ══════ STEP 2: OTP ══════ */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit}>
                <div className="zn-otp-wrap">
                  <div className="zn-otp-icon">
                    <svg
                      width="30"
                      height="30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                  </div>
                  <div>
                    <div className="zn-otp-title">Verify your email</div>
                    <div className="zn-otp-sub" style={{ marginTop: "0.4rem" }}>
                      We sent a 6-digit OTP to
                      <br />
                      <strong>{email}</strong>
                    </div>
                  </div>

                  {error && (
                    <div className="zn-error" style={{ width: "100%" }}>
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* OTP Boxes */}
                  <div className="zn-otp-boxes" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        className={`zn-otp-box${digit ? " filled" : ""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={loading}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  <div className="zn-otp-resend">
                    Didn't receive it?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpResendTimer > 0 || otpSending}
                    >
                      {otpResendTimer > 0
                        ? `Resend in ${otpResendTimer}s`
                        : otpSending
                          ? "Sending..."
                          : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    className="zn-btn"
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", marginTop: 0 }}
                  >
                    {loading && <span className="zn-spinner" />}
                    {loading
                      ? "Creating Account..."
                      : "Verify & Create Account →"}
                  </button>

                  <button
                    type="button"
                    className="zn-back-btn"
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to form
                  </button>
                </div>
              </form>
            )}
          </div>
          {/* end zn-right */}
        </div>
        {/* end zn-card */}
      </div>
    </>
  );
}
