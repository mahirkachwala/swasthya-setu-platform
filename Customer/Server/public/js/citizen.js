const BACKEND = '';

let lang = localStorage.getItem('vc_lang') || 'en';
let aadhaarVerified = false;
let verifiedData = null;
let lastAppointment = null;
let centersCache = [];
let lookupTimer = null;
let lookupCache = {};
let chatOpen = false;
let detectedVoiceLang = null;

const LANG_MAP = { en: 'EN', hi: 'HI', mr: 'MR' };
const LANG_NAMES = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };
const GREETINGS = {
  en: { title: 'Get Appointment Token', sub: 'At ABDM Enabled Facility', welcome: 'Hello! I can help you find centers, book appointments, or answer vaccine questions. How can I help?' },
  hi: { title: 'अपॉइंटमेंट टोकन प्राप्त करें', sub: 'ABDM सक्षम सुविधा पर', welcome: 'नमस्ते! मैं केंद्र खोजने, अपॉइंटमेंट बुक करने, या टीके के बारे में सवालों के जवाब देने में मदद कर सकता हूं।' },
  mr: { title: 'अपॉइंटमेंट टोकन मिळवा', sub: 'ABDM सक्षम सुविधेवर', welcome: 'नमस्कार! मी केंद्रे शोधणे, अपॉइंटमेंट बुक करणे किंवा लसीबद्दल प्रश्नांची उत्तरे देण्यात मदत करू शकतो.' }
};

const I18N = {
  en: {
    home_recommended: 'Highly recommended for you',
    home_rec_sub: 'For vaccination and health tracking',
    hfc_vaccine_title: 'Book your vaccine appointment',
    hfc_vaccine_desc: 'Schedule vaccination at nearest center. Track cold-chain verified vaccines...',
    hfc_vaccine_btn: 'Book now',
    home_track_title: 'Track body vitals',
    home_track_desc: 'Monitor your vaccination and health data',
    tracker_vaccination: 'Vaccination<br>Records',
    tracker_appointment: 'Track<br>Appointments',
    tracker_centers: 'Nearby<br>Centers',
    see_all_trackers: 'See all trackers',
    home_assess_title: 'Self Assessment for health risks',
    hfc_check_title: 'Check Vaccine Eligibility',
    hfc_check_desc: 'Understand your eligibility for available vaccines based on age and health...',
    hfc_check_btn: 'Check Now',
    home_risk_title: 'Check health risk',
    home_risk_desc: 'Assess symptoms or risk of diseases',
    see_all_risks: 'See all',
    home_connect_title: 'Connect your health data',
    hfc_sync_title: 'Sync with ABHA',
    hfc_sync_desc: 'Seamless Integration for Holistic Health Insights across ABDM network...',
    hfc_sync_btn: 'Sync now',
    home_stories_title: 'Top Stories',
    home_stories_desc: 'Interesting stories about vaccination and health',
    qa_vaccine: 'Vaccine<br>Booking',
    qa_abha: 'Create<br>ABHA',
    qa_trackers: 'Health<br>Trackers',
    qa_viewall: 'View<br>All',
    nav_home: 'Home',
    nav_records: 'Records',
    nav_abha: 'ABHA',
    nav_profile: 'Profile',
    btn_get_started: 'Get Started',
    btn_verify: 'Verify & Create ABHA',
    page_centers: 'Vaccination Centers',
    page_book: 'Book Appointment',
    page_records: 'Health Records',
    page_eligibility: 'Vaccine Eligibility',
    page_vitals: 'All Vitals',
    page_insights: 'Health Insights',
    page_insurance: 'Insurance & PMJAY',
    page_vault: 'Secret Vault',
    page_family: 'Family Members',
    page_help: 'Help & Feedback',
    page_terms: 'Terms of Service',
    page_privacy: 'Security & Privacy',
    page_abha_settings: 'ABHA Settings',
    profile_switch: 'Switch Profile',
    profile_refer: 'Refer a Friend',
    profile_update: 'Update Profile',
    profile_add_family: 'Add Family',
    profile_abha_settings: 'ABHA Settings',
    profile_insurance: 'Insurance',
    profile_eligibility: 'Eligibility Check',
    profile_vault: 'Secret Vault',
    profile_help: 'Help & Feedback',
    profile_terms: 'Terms of Service',
    profile_security: 'Security and Privacy',
    profile_logout: 'Logout',
    personalize_layout: 'Personalize Layout',
    view_all_features: 'View All Features',
    cat_insurance: 'Insurance',
    cat_vitals: 'All Vitals',
    cat_insights: 'Insights',
    cat_vault: 'Secret Vault',
    abha_header: 'Ayushman Bharat<br>Digital Health Mission',
    abha_num_label: 'ABHA Number',
    abdm_verified: 'ABDM Verified',
    dob_label: 'DOB',
    created_label: 'Created',
    yrs: 'yrs',
    loading_centers: 'Loading centers...',
    failed_load_centers: 'Failed to load centers',
    slots: 'slots',
    book_appointment: 'Book Appointment',
    navigate: 'Navigate',
    no_appointment: 'No Appointment',
    book_appointment_to_see: 'Book an appointment to see it here',
    book_now: 'Book Now',
    apt_id: 'Appointment ID',
    patient: 'Patient',
    center: 'Center',
    date: 'Date',
    time: 'Time',
    vaccine: 'Vaccine',
    abha_verified_label: 'ABHA Verified',
    yes: 'Yes',
    pending: 'Pending',
    aadhaar: 'Aadhaar',
    status: 'Status',
    verified_status: 'VERIFIED',
    booked_status: 'BOOKED',
    no_records_yet: 'No vaccination records yet',
    fill_all_fields: 'Please fill all required fields',
    booking_failed: 'Booking failed',
    connection_error: 'Connection error. Please try again.',
    abha_created: 'ABHA Created Successfully!',
    your_abha_id: 'Your ABHA ID',
    verification_failed: 'Verification Failed',
    identity_verified: 'Identity Verified',
    enter_valid_age: 'Please enter a valid age.',
    found_vaccines: 'Found {n} vaccine(s) you are eligible for.',
    eligible: 'Eligible',
    not_eligible: 'Not yet eligible',
    consult_doctor: 'Consult Doctor',
    priority_group: 'Priority Group',
    below_min_age: 'Below minimum age',
    doctor_review: 'Doctor Review Required',
    with_caution: 'With Caution',
    recommended: 'Recommended',
    no_vitals_yet: 'No vitals recorded yet. Log your first reading above.',
    enter_vital: 'Please enter at least one vital reading.',
    avg_temp: 'Avg Temperature',
    avg_hr: 'Avg Heart Rate',
    vitals_logged: 'Vitals Logged',
    family_members: 'Family Members',
    covid_label: 'COVID-19',
    abha_setup: 'ABHA Setup',
    vitals_track: 'Vitals Track',
    documents: 'Documents',
    rec_abha: 'Create your ABHA Health ID to unlock full features and digital health records.',
    rec_vaccine: 'Book your vaccination appointment. COVID-19 vaccines are free under the government program.',
    rec_vitals: 'Start tracking your vitals after vaccination to monitor for any side effects.',
    rec_temp_high: 'Your average temperature is elevated. If symptoms persist, consult your doctor.',
    rec_family: 'Add family members to book group appointments and track their vaccination status.',
    rec_vault: 'Store your vaccination certificates securely in the Secret Vault.',
    rec_great: 'Great job! Your vaccination and health profile are well maintained.',
    no_docs_yet: 'No documents stored yet.',
    enter_doc_name: 'Please enter a document name.',
    vault_pin_error: 'Please enter a 4-digit PIN.',
    vault_pin_wrong: 'Incorrect PIN. Please try again.',
    vault_pin_prompt: 'Enter your 4-digit PIN',
    abha_card_title: 'ABHA Health Card',
    create_abha_prompt: 'Create your ABHA to view your health card',
    active_status: 'Active',
    status_label: 'Status',
    district_label: 'District',
    state_label: 'State',
    consent_title: 'Data Sharing Consents',
    consent_records: 'Share Vaccination Records',
    consent_records_desc: 'Allow linked hospitals to view your vaccination history and certificates',
    consent_vitals: 'Share Vitals Data',
    consent_vitals_desc: 'Share temperature, blood pressure, and heart rate data with healthcare providers',
    consent_insurance: 'Share Insurance Information',
    consent_insurance_desc: 'Allow PMJAY and insurance providers to access your coverage and claims data',
    consent_emergency: 'Emergency Medical Access',
    consent_emergency_desc: 'Allow emergency responders to access critical health data during emergencies',
    consent_govt: 'Government Health Programs',
    consent_govt_desc: 'Participate in Ayushman Bharat, Mission Indradhanush, and other national health programs',
    consent_research: 'Anonymized Research Data',
    consent_research_desc: 'Contribute anonymized health data for medical research and public health studies',
    linked_facilities: 'Linked Healthcare Facilities',
    link_abha_prompt: 'Create your ABHA to link healthcare facilities',
    account_actions: 'Account Actions',
    update_abha: 'Update ABHA Details',
    create_abha_now: 'Create ABHA Now',
    delink_abha: 'Delink ABHA Account',
    delink_confirm: 'This will reset all your ABHA data including consents and linked facilities. Continue?',
    abha_delinked: 'ABHA account delinked',
    no_family_yet: 'No family members added yet.',
    enter_name_age: 'Please enter name and age.',
    feedback_thanks: 'Thank you for your feedback! We appreciate your input.',
    write_feedback: 'Please write your feedback.',
    appointment_booked: 'Appointment Booked!',
    view_appointment: 'View My Appointment',
    back_to_home: 'Back to Home',
    chat_error: 'Sorry, I couldn\'t process that. Please try again.',
    safe_tag: 'Safe Vaccines. Trusted Delivery.',
    onboard_powered: 'Powered by ABHA - Ayushman Bharat Health Account'
  },
  hi: {
    home_recommended: 'आपके लिए अत्यधिक अनुशंसित',
    home_rec_sub: 'टीकाकरण और स्वास्थ्य ट्रैकिंग के लिए',
    hfc_vaccine_title: 'अपना टीका अपॉइंटमेंट बुक करें',
    hfc_vaccine_desc: 'निकटतम केंद्र पर टीकाकरण शेड्यूल करें। कोल्ड-चेन सत्यापित टीके ट्रैक करें...',
    hfc_vaccine_btn: 'अभी बुक करें',
    home_track_title: 'शारीरिक स्थिति ट्रैक करें',
    home_track_desc: 'अपने टीकाकरण और स्वास्थ्य डेटा की निगरानी करें',
    tracker_vaccination: 'टीकाकरण<br>रिकॉर्ड',
    tracker_appointment: 'अपॉइंटमेंट<br>ट्रैक करें',
    tracker_centers: 'नजदीकी<br>केंद्र',
    see_all_trackers: 'सभी ट्रैकर देखें',
    home_assess_title: 'स्वास्थ्य जोखिम का स्व-मूल्यांकन',
    hfc_check_title: 'टीका पात्रता जांचें',
    hfc_check_desc: 'उम्र और स्वास्थ्य के आधार पर उपलब्ध टीकों के लिए अपनी पात्रता समझें...',
    hfc_check_btn: 'अभी जांचें',
    home_risk_title: 'स्वास्थ्य जोखिम जांचें',
    home_risk_desc: 'लक्षणों या बीमारियों के जोखिम का आकलन करें',
    see_all_risks: 'सभी देखें',
    home_connect_title: 'अपना स्वास्थ्य डेटा कनेक्ट करें',
    hfc_sync_title: 'ABHA के साथ सिंक करें',
    hfc_sync_desc: 'ABDM नेटवर्क में समग्र स्वास्थ्य जानकारी के लिए सहज एकीकरण...',
    hfc_sync_btn: 'अभी सिंक करें',
    home_stories_title: 'शीर्ष कहानियाँ',
    home_stories_desc: 'टीकाकरण और स्वास्थ्य के बारे में रोचक कहानियाँ',
    qa_vaccine: 'टीका<br>बुकिंग',
    qa_abha: 'ABHA<br>बनाएं',
    qa_trackers: 'स्वास्थ्य<br>ट्रैकर',
    qa_viewall: 'सभी<br>देखें',
    nav_home: 'होम',
    nav_records: 'रिकॉर्ड',
    nav_abha: 'ABHA',
    nav_profile: 'प्रोफ़ाइल',
    btn_get_started: 'शुरू करें',
    btn_verify: 'सत्यापित करें और ABHA बनाएं',
    page_centers: 'टीकाकरण केंद्र',
    page_book: 'अपॉइंटमेंट बुक करें',
    page_records: 'स्वास्थ्य रिकॉर्ड',
    page_eligibility: 'टीका पात्रता',
    page_vitals: 'सभी स्वास्थ्य संकेत',
    page_insights: 'स्वास्थ्य जानकारी',
    page_insurance: 'बीमा और PMJAY',
    page_vault: 'सुरक्षित तिजोरी',
    page_family: 'परिवार के सदस्य',
    page_help: 'सहायता और प्रतिक्रिया',
    page_terms: 'सेवा की शर्तें',
    page_privacy: 'सुरक्षा और गोपनीयता',
    page_abha_settings: 'ABHA सेटिंग्स',
    profile_switch: 'प्रोफ़ाइल बदलें',
    profile_refer: 'मित्र को संदर्भित करें',
    profile_update: 'प्रोफ़ाइल अपडेट',
    profile_add_family: 'परिवार जोड़ें',
    profile_abha_settings: 'ABHA सेटिंग्स',
    profile_insurance: 'बीमा',
    profile_eligibility: 'पात्रता जांच',
    profile_vault: 'सुरक्षित तिजोरी',
    profile_help: 'सहायता और प्रतिक्रिया',
    profile_terms: 'सेवा की शर्तें',
    profile_security: 'सुरक्षा और गोपनीयता',
    profile_logout: 'लॉग आउट',
    personalize_layout: 'लेआउट अनुकूलित करें',
    view_all_features: 'सभी सुविधाएं देखें',
    cat_insurance: 'बीमा',
    cat_vitals: 'सभी स्वास्थ्य संकेत',
    cat_insights: 'जानकारी',
    cat_vault: 'सुरक्षित तिजोरी',
    abha_header: 'आयुष्मान भारत<br>डिजिटल स्वास्थ्य मिशन',
    abha_num_label: 'ABHA नंबर',
    abdm_verified: 'ABDM सत्यापित',
    dob_label: 'जन्म तिथि',
    created_label: 'बनाया गया',
    yrs: 'वर्ष',
    loading_centers: 'केंद्र लोड हो रहे हैं...',
    failed_load_centers: 'केंद्र लोड करने में विफल',
    slots: 'स्लॉट',
    book_appointment: 'अपॉइंटमेंट बुक करें',
    navigate: 'नेविगेट करें',
    no_appointment: 'कोई अपॉइंटमेंट नहीं',
    book_appointment_to_see: 'यहाँ देखने के लिए अपॉइंटमेंट बुक करें',
    book_now: 'अभी बुक करें',
    apt_id: 'अपॉइंटमेंट आईडी',
    patient: 'मरीज',
    center: 'केंद्र',
    date: 'तारीख',
    time: 'समय',
    vaccine: 'टीका',
    abha_verified_label: 'ABHA सत्यापित',
    yes: 'हाँ',
    pending: 'लंबित',
    aadhaar: 'आधार',
    status: 'स्थिति',
    verified_status: 'सत्यापित',
    booked_status: 'बुक किया',
    no_records_yet: 'अभी तक कोई टीकाकरण रिकॉर्ड नहीं',
    fill_all_fields: 'कृपया सभी आवश्यक फील्ड भरें',
    booking_failed: 'बुकिंग विफल',
    connection_error: 'कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।',
    abha_created: 'ABHA सफलतापूर्वक बनाया गया!',
    your_abha_id: 'आपकी ABHA आईडी',
    verification_failed: 'सत्यापन विफल',
    identity_verified: 'पहचान सत्यापित',
    enter_valid_age: 'कृपया एक वैध आयु दर्ज करें।',
    found_vaccines: '{n} टीके मिले जिनके लिए आप पात्र हैं।',
    eligible: 'पात्र',
    not_eligible: 'अभी पात्र नहीं',
    consult_doctor: 'डॉक्टर से परामर्श करें',
    priority_group: 'प्राथमिकता समूह',
    below_min_age: 'न्यूनतम आयु से कम',
    doctor_review: 'डॉक्टर की समीक्षा आवश्यक',
    with_caution: 'सावधानी के साथ',
    recommended: 'अनुशंसित',
    no_vitals_yet: 'अभी तक कोई स्वास्थ्य संकेत दर्ज नहीं। ऊपर अपनी पहली रीडिंग लॉग करें।',
    enter_vital: 'कृपया कम से कम एक स्वास्थ्य संकेत दर्ज करें।',
    avg_temp: 'औसत तापमान',
    avg_hr: 'औसत हृदय गति',
    vitals_logged: 'दर्ज संकेत',
    family_members: 'परिवार के सदस्य',
    covid_label: 'COVID-19',
    abha_setup: 'ABHA सेटअप',
    vitals_track: 'स्वास्थ्य ट्रैक',
    documents: 'दस्तावेज़',
    rec_abha: 'पूर्ण सुविधाओं और डिजिटल स्वास्थ्य रिकॉर्ड के लिए अपना ABHA स्वास्थ्य आईडी बनाएं।',
    rec_vaccine: 'अपना टीकाकरण अपॉइंटमेंट बुक करें। COVID-19 टीके सरकारी कार्यक्रम के तहत मुफ्त हैं।',
    rec_vitals: 'किसी भी दुष्प्रभाव की निगरानी के लिए टीकाकरण के बाद अपने स्वास्थ्य संकेतों को ट्रैक करना शुरू करें।',
    rec_temp_high: 'आपका औसत तापमान बढ़ा हुआ है। यदि लक्षण बने रहते हैं, तो अपने डॉक्टर से परामर्श करें।',
    rec_family: 'समूह अपॉइंटमेंट बुक करने और उनकी टीकाकरण स्थिति ट्रैक करने के लिए परिवार के सदस्यों को जोड़ें।',
    rec_vault: 'अपने टीकाकरण प्रमाणपत्रों को सुरक्षित तिजोरी में सुरक्षित रूप से संग्रहीत करें।',
    rec_great: 'बहुत अच्छे! आपका टीकाकरण और स्वास्थ्य प्रोफाइल अच्छी तरह से बनाए रखा गया है।',
    no_docs_yet: 'अभी तक कोई दस्तावेज़ संग्रहीत नहीं।',
    enter_doc_name: 'कृपया एक दस्तावेज़ का नाम दर्ज करें।',
    vault_pin_error: 'कृपया 4-अंकीय पिन दर्ज करें।',
    vault_pin_wrong: 'गलत पिन। कृपया पुनः प्रयास करें।',
    vault_pin_prompt: 'अपना 4-अंकीय पिन दर्ज करें',
    abha_card_title: 'ABHA स्वास्थ्य कार्ड',
    create_abha_prompt: 'अपना स्वास्थ्य कार्ड देखने के लिए ABHA बनाएं',
    active_status: 'सक्रिय',
    status_label: 'स्थिति',
    district_label: 'जिला',
    state_label: 'राज्य',
    consent_title: 'डेटा साझाकरण सहमति',
    consent_records: 'टीकाकरण रिकॉर्ड साझा करें',
    consent_records_desc: 'लिंक किए गए अस्पतालों को आपका टीकाकरण इतिहास और प्रमाणपत्र देखने की अनुमति दें',
    consent_vitals: 'स्वास्थ्य डेटा साझा करें',
    consent_vitals_desc: 'स्वास्थ्य सेवा प्रदाताओं के साथ तापमान, रक्तचाप और हृदय गति डेटा साझा करें',
    consent_insurance: 'बीमा जानकारी साझा करें',
    consent_insurance_desc: 'PMJAY और बीमा प्रदाताओं को आपकी कवरेज और दावों के डेटा तक पहुंचने की अनुमति दें',
    consent_emergency: 'आपातकालीन चिकित्सा पहुंच',
    consent_emergency_desc: 'आपातकालीन स्थिति में आपातकालीन उत्तरदाताओं को महत्वपूर्ण स्वास्थ्य डेटा तक पहुंचने की अनुमति दें',
    consent_govt: 'सरकारी स्वास्थ्य कार्यक्रम',
    consent_govt_desc: 'आयुष्मान भारत, मिशन इंद्रधनुष और अन्य राष्ट्रीय स्वास्थ्य कार्यक्रमों में भाग लें',
    consent_research: 'गुमनाम अनुसंधान डेटा',
    consent_research_desc: 'चिकित्सा अनुसंधान और सार्वजनिक स्वास्थ्य अध्ययन के लिए गुमनाम स्वास्थ्य डेटा का योगदान करें',
    linked_facilities: 'लिंक की गई स्वास्थ्य सुविधाएं',
    link_abha_prompt: 'स्वास्थ्य सुविधाओं को लिंक करने के लिए ABHA बनाएं',
    account_actions: 'खाता कार्रवाइयां',
    update_abha: 'ABHA विवरण अपडेट करें',
    create_abha_now: 'अभी ABHA बनाएं',
    delink_abha: 'ABHA खाता डिलिंक करें',
    delink_confirm: 'इससे सहमति और लिंक की गई सुविधाओं सहित आपका सभी ABHA डेटा रीसेट हो जाएगा। जारी रखें?',
    abha_delinked: 'ABHA खाता डिलिंक किया गया',
    no_family_yet: 'अभी तक कोई परिवार सदस्य नहीं जोड़ा गया।',
    enter_name_age: 'कृपया नाम और आयु दर्ज करें।',
    feedback_thanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद! हम आपकी राय की सराहना करते हैं।',
    write_feedback: 'कृपया अपनी प्रतिक्रिया लिखें।',
    appointment_booked: 'अपॉइंटमेंट बुक हो गई!',
    view_appointment: 'मेरा अपॉइंटमेंट देखें',
    back_to_home: 'होम पर वापस जाएं',
    chat_error: 'क्षमा करें, मैं इसे प्रोसेस नहीं कर सका। कृपया पुनः प्रयास करें।',
    safe_tag: 'सुरक्षित टीके। विश्वसनीय वितरण।',
    onboard_powered: 'ABHA द्वारा संचालित - आयुष्मान भारत स्वास्थ्य खाता'
  },
  mr: {
    home_recommended: 'तुमच्यासाठी अत्यंत शिफारस केलेले',
    home_rec_sub: 'लसीकरण आणि आरोग्य ट्रॅकिंगसाठी',
    hfc_vaccine_title: 'तुमची लसीकरण भेट बुक करा',
    hfc_vaccine_desc: 'जवळच्या केंद्रावर लसीकरण शेड्यूल करा। कोल्ड-चेन सत्यापित लसी ट्रॅक करा...',
    hfc_vaccine_btn: 'आता बुक करा',
    home_track_title: 'शारीरिक स्थिती ट्रॅक करा',
    home_track_desc: 'तुमचा लसीकरण आणि आरोग्य डेटा पहा',
    tracker_vaccination: 'लसीकरण<br>रेकॉर्ड',
    tracker_appointment: 'भेटी<br>ट्रॅक करा',
    tracker_centers: 'जवळची<br>केंद्रे',
    see_all_trackers: 'सर्व ट्रॅकर पहा',
    home_assess_title: 'आरोग्य जोखमीचे स्व-मूल्यांकन',
    hfc_check_title: 'लस पात्रता तपासा',
    hfc_check_desc: 'वय आणि आरोग्यावर आधारित उपलब्ध लसींसाठी तुमची पात्रता समजून घ्या...',
    hfc_check_btn: 'आता तपासा',
    home_risk_title: 'आरोग्य जोखीम तपासा',
    home_risk_desc: 'लक्षणे किंवा रोगांच्या जोखमीचे मूल्यांकन करा',
    see_all_risks: 'सर्व पहा',
    home_connect_title: 'तुमचा आरोग्य डेटा कनेक्ट करा',
    hfc_sync_title: 'ABHA सोबत सिंक करा',
    hfc_sync_desc: 'ABDM नेटवर्कवर सर्वांगीण आरोग्य माहितीसाठी सहज एकत्रीकरण...',
    hfc_sync_btn: 'आता सिंक करा',
    home_stories_title: 'शीर्ष कथा',
    home_stories_desc: 'लसीकरण आणि आरोग्याबद्दल रोचक कथा',
    qa_vaccine: 'लस<br>बुकिंग',
    qa_abha: 'ABHA<br>तयार करा',
    qa_trackers: 'आरोग्य<br>ट्रॅकर',
    qa_viewall: 'सर्व<br>पहा',
    nav_home: 'होम',
    nav_records: 'रेकॉर्ड',
    nav_abha: 'ABHA',
    nav_profile: 'प्रोफाइल',
    btn_get_started: 'सुरू करा',
    btn_verify: 'सत्यापित करा आणि ABHA तयार करा',
    page_centers: 'लसीकरण केंद्रे',
    page_book: 'भेट बुक करा',
    page_records: 'आरोग्य रेकॉर्ड',
    page_eligibility: 'लस पात्रता',
    page_vitals: 'सर्व आरोग्य संकेत',
    page_insights: 'आरोग्य माहिती',
    page_insurance: 'विमा आणि PMJAY',
    page_vault: 'सुरक्षित तिजोरी',
    page_family: 'कुटुंब सदस्य',
    page_help: 'मदत आणि अभिप्राय',
    page_terms: 'सेवेच्या अटी',
    page_privacy: 'सुरक्षा आणि गोपनीयता',
    page_abha_settings: 'ABHA सेटिंग्ज',
    profile_switch: 'प्रोफाइल बदला',
    profile_refer: 'मित्राला संदर्भ द्या',
    profile_update: 'प्रोफाइल अपडेट',
    profile_add_family: 'कुटुंब जोडा',
    profile_abha_settings: 'ABHA सेटिंग्ज',
    profile_insurance: 'विमा',
    profile_eligibility: 'पात्रता तपासणी',
    profile_vault: 'सुरक्षित तिजोरी',
    profile_help: 'मदत आणि अभिप्राय',
    profile_terms: 'सेवेच्या अटी',
    profile_security: 'सुरक्षा आणि गोपनीयता',
    profile_logout: 'बाहेर पडा',
    personalize_layout: 'लेआउट सानुकूलित करा',
    view_all_features: 'सर्व वैशिष्ट्ये पहा',
    cat_insurance: 'विमा',
    cat_vitals: 'सर्व आरोग्य संकेत',
    cat_insights: 'माहिती',
    cat_vault: 'सुरक्षित तिजोरी',
    abha_header: 'आयुष्मान भारत<br>डिजिटल आरोग्य मिशन',
    abha_num_label: 'ABHA क्रमांक',
    abdm_verified: 'ABDM सत्यापित',
    dob_label: 'जन्म तारीख',
    created_label: 'तयार केले',
    yrs: 'वर्षे',
    loading_centers: 'केंद्रे लोड होत आहेत...',
    failed_load_centers: 'केंद्रे लोड करण्यात अयशस्वी',
    slots: 'स्लॉट',
    book_appointment: 'भेट बुक करा',
    navigate: 'नेव्हिगेट करा',
    no_appointment: 'कोणतीही भेट नाही',
    book_appointment_to_see: 'येथे पाहण्यासाठी भेट बुक करा',
    book_now: 'आता बुक करा',
    apt_id: 'भेट आयडी',
    patient: 'रुग्ण',
    center: 'केंद्र',
    date: 'तारीख',
    time: 'वेळ',
    vaccine: 'लस',
    abha_verified_label: 'ABHA सत्यापित',
    yes: 'होय',
    pending: 'प्रलंबित',
    aadhaar: 'आधार',
    status: 'स्थिती',
    verified_status: 'सत्यापित',
    booked_status: 'बुक केले',
    no_records_yet: 'अद्याप कोणतेही लसीकरण रेकॉर्ड नाहीत',
    fill_all_fields: 'कृपया सर्व आवश्यक फील्ड भरा',
    booking_failed: 'बुकिंग अयशस्वी',
    connection_error: 'कनेक्शन त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    abha_created: 'ABHA यशस्वीरित्या तयार केले!',
    your_abha_id: 'तुमची ABHA आयडी',
    verification_failed: 'सत्यापन अयशस्वी',
    identity_verified: 'ओळख सत्यापित',
    enter_valid_age: 'कृपया वैध वय प्रविष्ट करा.',
    found_vaccines: '{n} लसी सापडल्या ज्यासाठी तुम्ही पात्र आहात.',
    eligible: 'पात्र',
    not_eligible: 'अद्याप पात्र नाही',
    consult_doctor: 'डॉक्टरांचा सल्ला घ्या',
    priority_group: 'प्राधान्य गट',
    below_min_age: 'किमान वयापेक्षा कमी',
    doctor_review: 'डॉक्टरांची तपासणी आवश्यक',
    with_caution: 'सावधगिरीने',
    recommended: 'शिफारस केलेले',
    no_vitals_yet: 'अद्याप कोणतेही आरोग्य संकेत नोंदवलेले नाहीत. वरील तुमची पहिली रीडिंग लॉग करा.',
    enter_vital: 'कृपया किमान एक आरोग्य संकेत प्रविष्ट करा.',
    avg_temp: 'सरासरी तापमान',
    avg_hr: 'सरासरी हृदय गती',
    vitals_logged: 'नोंदवलेले संकेत',
    family_members: 'कुटुंब सदस्य',
    covid_label: 'COVID-19',
    abha_setup: 'ABHA सेटअप',
    vitals_track: 'आरोग्य ट्रॅक',
    documents: 'दस्तऐवज',
    rec_abha: 'पूर्ण वैशिष्ट्ये आणि डिजिटल आरोग्य रेकॉर्डसाठी तुमची ABHA आरोग्य आयडी तयार करा.',
    rec_vaccine: 'तुमची लसीकरण भेट बुक करा. COVID-19 लसी सरकारी कार्यक्रमांतर्गत मोफत आहेत.',
    rec_vitals: 'कोणत्याही दुष्परिणामांवर लक्ष ठेवण्यासाठी लसीकरणानंतर तुमचे आरोग्य संकेत ट्रॅक करणे सुरू करा.',
    rec_temp_high: 'तुमचे सरासरी तापमान वाढलेले आहे. लक्षणे कायम राहिल्यास, डॉक्टरांचा सल्ला घ्या.',
    rec_family: 'गट भेटी बुक करण्यासाठी आणि त्यांची लसीकरण स्थिती ट्रॅक करण्यासाठी कुटुंबातील सदस्यांना जोडा.',
    rec_vault: 'तुमचे लसीकरण प्रमाणपत्रे सुरक्षित तिजोरीत सुरक्षितपणे ठेवा.',
    rec_great: 'छान! तुमचे लसीकरण आणि आरोग्य प्रोफाइल चांगले राखले आहे.',
    no_docs_yet: 'अद्याप कोणतेही दस्तऐवज साठवलेले नाहीत.',
    enter_doc_name: 'कृपया दस्तऐवजाचे नाव प्रविष्ट करा.',
    vault_pin_error: 'कृपया 4-अंकी पिन प्रविष्ट करा.',
    vault_pin_wrong: 'चुकीचा पिन. कृपया पुन्हा प्रयत्न करा.',
    vault_pin_prompt: 'तुमचा 4-अंकी पिन प्रविष्ट करा',
    abha_card_title: 'ABHA आरोग्य कार्ड',
    create_abha_prompt: 'तुमचे आरोग्य कार्ड पाहण्यासाठी ABHA तयार करा',
    active_status: 'सक्रिय',
    status_label: 'स्थिती',
    district_label: 'जिल्हा',
    state_label: 'राज्य',
    consent_title: 'डेटा शेअरिंग संमती',
    consent_records: 'लसीकरण रेकॉर्ड शेअर करा',
    consent_records_desc: 'लिंक केलेल्या रुग्णालयांना तुमचा लसीकरण इतिहास आणि प्रमाणपत्रे पाहण्याची परवानगी द्या',
    consent_vitals: 'आरोग्य डेटा शेअर करा',
    consent_vitals_desc: 'आरोग्य सेवा प्रदात्यांसोबत तापमान, रक्तदाब आणि हृदय गती डेटा शेअर करा',
    consent_insurance: 'विमा माहिती शेअर करा',
    consent_insurance_desc: 'PMJAY आणि विमा प्रदात्यांना तुमच्या कव्हरेज आणि दाव्यांच्या डेटामध्ये प्रवेश करण्याची परवानगी द्या',
    consent_emergency: 'आपत्कालीन वैद्यकीय प्रवेश',
    consent_emergency_desc: 'आणीबाणीच्या वेळी आपत्कालीन प्रतिसादकर्त्यांना महत्त्वपूर्ण आरोग्य डेटामध्ये प्रवेश करण्याची परवानगी द्या',
    consent_govt: 'सरकारी आरोग्य कार्यक्रम',
    consent_govt_desc: 'आयुष्मान भारत, मिशन इंद्रधनुष आणि इतर राष्ट्रीय आरोग्य कार्यक्रमांमध्ये सहभागी व्हा',
    consent_research: 'गोपनीय संशोधन डेटा',
    consent_research_desc: 'वैद्यकीय संशोधन आणि सार्वजनिक आरोग्य अभ्यासासाठी गोपनीय आरोग्य डेटाचे योगदान द्या',
    linked_facilities: 'लिंक केलेल्या आरोग्य सुविधा',
    link_abha_prompt: 'आरोग्य सुविधा लिंक करण्यासाठी ABHA तयार करा',
    account_actions: 'खाते कृती',
    update_abha: 'ABHA तपशील अपडेट करा',
    create_abha_now: 'आता ABHA तयार करा',
    delink_abha: 'ABHA खाते डिलिंक करा',
    delink_confirm: 'यामुळे संमती आणि लिंक केलेल्या सुविधांसह तुमचा सर्व ABHA डेटा रीसेट होईल. सुरू ठेवायचे?',
    abha_delinked: 'ABHA खाते डिलिंक केले',
    no_family_yet: 'अद्याप कोणतेही कुटुंब सदस्य जोडलेले नाहीत.',
    enter_name_age: 'कृपया नाव आणि वय प्रविष्ट करा.',
    feedback_thanks: 'तुमच्या अभिप्रायाबद्दल धन्यवाद! आम्ही तुमच्या मताचे कौतुक करतो.',
    write_feedback: 'कृपया तुमचा अभिप्राय लिहा.',
    appointment_booked: 'भेट बुक झाली!',
    view_appointment: 'माझी भेट पहा',
    back_to_home: 'होमवर परत जा',
    chat_error: 'क्षमा करा, मी हे प्रोसेस करू शकलो नाही. कृपया पुन्हा प्रयत्न करा.',
    safe_tag: 'सुरक्षित लसी. विश्वसनीय वितरण.',
    onboard_powered: 'ABHA द्वारे संचालित - आयुष्मान भारत आरोग्य खाते'
  }
};

function t(key) {
  const dict = I18N[lang] || I18N.en;
  return dict[key] || (I18N.en[key] || key);
}

function setLanguage(l) {
  lang = l;
  localStorage.setItem('vc_lang', l);
  document.querySelectorAll('.lang-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.lang-chip').forEach(b => {
    if (b.textContent.includes(l === 'en' ? 'Eng' : l === 'hi' ? 'हिन' : 'मरा')) b.classList.add('active');
  });
  updateLangUI();
}

function updateLangUI() {
  const g = GREETINGS[lang] || GREETINGS.en;
  const t = I18N[lang] || I18N.en;
  const label = LANG_MAP[lang] || 'EN';
  const el = id => document.getElementById(id);
  if (el('lang-label')) el('lang-label').textContent = label;
  if (el('chat-lang-label')) el('chat-lang-label').textContent = label;
  if (el('overlay-lang-tag')) el('overlay-lang-tag').textContent = label;
  if (el('overlay-lang-label')) el('overlay-lang-label').textContent = LANG_NAMES[lang] || 'English';
  if (el('home-greeting')) el('home-greeting').textContent = g.title;
  if (el('home-subtitle')) el('home-subtitle').textContent = g.sub;
  if (el('chat-welcome')) el('chat-welcome').textContent = g.welcome;
  if (el('overlay-welcome')) el('overlay-welcome').textContent = g.welcome;
  if (el('profile-lang')) el('profile-lang').textContent = LANG_NAMES[lang] || 'English';

  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    if (t[key]) node.innerHTML = t[key];
  });

  document.querySelectorAll('[data-i18n-text]').forEach(node => {
    const key = node.getAttribute('data-i18n-text');
    if (t[key]) node.textContent = t[key];
  });

  updateUserUI();
}

function updateUserUI() {
  const nameEls = ['home-user-name', 'records-user-name', 'profile-name'];
  const name = verifiedData ? verifiedData.name : 'Guest';
  nameEls.forEach(id => { const e = document.getElementById(id); if (e) e.textContent = name; });

  const cardName = document.getElementById('user-card-name');
  const cardMeta = document.getElementById('user-card-meta');
  const cardAbha = document.getElementById('user-card-abha');
  const cardLink = document.getElementById('user-card-link');
  const kycBanner = document.getElementById('kyc-banner');
  const profileMeta = document.getElementById('profile-meta');
  const verifyLabel = document.getElementById('verify-status-label');

  if (verifiedData) {
    if (cardName) cardName.textContent = `${verifiedData.name},`;
    const age = verifiedData.dob ? calcAge(verifiedData.dob) : '';
    if (cardMeta) cardMeta.textContent = `${verifiedData.gender || ''}, ${age} years`;
    if (cardAbha) cardAbha.textContent = verifiedData.abhaAddress || '';
    if (cardLink) { cardLink.style.display = 'inline-block'; cardLink.onclick = () => goTo('abha'); }
    if (kycBanner) kycBanner.style.display = 'none';
    if (profileMeta) profileMeta.textContent = `${verifiedData.gender || ''}, ${age} years`;
    if (verifyLabel) { verifyLabel.textContent = 'Verified'; verifyLabel.style.color = '#16a34a'; }
  } else {
    if (cardName) cardName.textContent = 'Guest User';
    if (cardMeta) cardMeta.textContent = 'Verify Aadhaar to get ABHA';
    if (cardAbha) cardAbha.textContent = '';
    if (cardLink) cardLink.style.display = 'none';
    if (kycBanner) kycBanner.style.display = 'flex';
    if (profileMeta) profileMeta.textContent = 'Verify to see your details';
    if (verifyLabel) { verifyLabel.textContent = 'Pending'; verifyLabel.style.color = '#e65100'; }
  }
}

function calcAge(dob) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}

function switchTab(tab) {
  const map = { home: 'home', records: 'records', abha: 'abha', profile: 'profile' };
  if (map[tab]) goTo(map[tab]);
}

function renderAbhaCard(data) {
  const initials = data.photo || data.name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  const age = calcAge(data.dob);
  const qrSvg = `<svg viewBox="0 0 40 40" width="40" height="40"><rect x="0" y="0" width="40" height="40" fill="white"/><rect x="2" y="2" width="10" height="10" fill="#1a237e"/><rect x="4" y="4" width="6" height="6" fill="white"/><rect x="5" y="5" width="4" height="4" fill="#1a237e"/><rect x="28" y="2" width="10" height="10" fill="#1a237e"/><rect x="30" y="4" width="6" height="6" fill="white"/><rect x="31" y="5" width="4" height="4" fill="#1a237e"/><rect x="2" y="28" width="10" height="10" fill="#1a237e"/><rect x="4" y="30" width="6" height="6" fill="white"/><rect x="5" y="31" width="4" height="4" fill="#1a237e"/><rect x="14" y="2" width="3" height="3" fill="#1a237e"/><rect x="19" y="2" width="3" height="3" fill="#1a237e"/><rect x="14" y="7" width="3" height="3" fill="#1a237e"/><rect x="24" y="7" width="3" height="3" fill="#1a237e"/><rect x="14" y="14" width="3" height="3" fill="#1a237e"/><rect x="19" y="14" width="3" height="3" fill="#1a237e"/><rect x="24" y="14" width="3" height="3" fill="#1a237e"/><rect x="2" y="14" width="3" height="3" fill="#1a237e"/><rect x="7" y="14" width="3" height="3" fill="#1a237e"/><rect x="2" y="19" width="3" height="3" fill="#1a237e"/><rect x="14" y="19" width="3" height="3" fill="#1a237e"/><rect x="28" y="14" width="3" height="3" fill="#1a237e"/><rect x="35" y="14" width="3" height="3" fill="#1a237e"/><rect x="28" y="19" width="3" height="3" fill="#1a237e"/><rect x="35" y="19" width="3" height="3" fill="#1a237e"/><rect x="19" y="28" width="3" height="3" fill="#1a237e"/><rect x="28" y="28" width="3" height="3" fill="#1a237e"/><rect x="33" y="28" width="3" height="3" fill="#1a237e"/><rect x="19" y="33" width="3" height="3" fill="#1a237e"/><rect x="24" y="33" width="3" height="3" fill="#1a237e"/><rect x="33" y="33" width="3" height="3" fill="#1a237e"/><rect x="28" y="35" width="3" height="3" fill="#1a237e"/></svg>`;
  return `
    <div class="abha-card-header">
      <div class="ac-govt">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="rgba(255,255,255,0.6)" stroke-width="1"/><path d="M12 4l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="rgba(255,255,255,0.8)"/></svg>
        <div class="ac-govt-text">${t('abha_header')}</div>
      </div>
      <div class="ac-logo-text">ABHA</div>
    </div>
    <div class="abha-card-body">
      <div class="abha-card-photo">${esc(initials)}</div>
      <div class="abha-card-info">
        <div class="ac-name">${esc(data.name)}</div>
        <div class="ac-detail">${esc(data.gender)} | ${age} ${t('yrs')} | ${esc(data.bloodGroup || 'N/A')} | ${esc(data.state || 'Maharashtra')}</div>
        <div class="ac-abha-label">${t('abha_num_label')}</div>
        <div class="ac-abha">${esc(data.abhaId)}</div>
        <div class="ac-addr">${esc(data.abhaAddress)}</div>
      </div>
    </div>
    <div class="abha-card-footer">
      <div class="ac-qr">${qrSvg}</div>
      <div>
        <div class="ac-abdm">${t('abdm_verified')}</div>
        <div class="ac-meta">${t('dob_label')}: ${esc(data.dob)}<br>${t('created_label')}: ${new Date().toLocaleDateString('en-IN')}</div>
      </div>
    </div>
  `;
}

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  const fab = document.getElementById('chat-fab');
  if (fab) fab.classList.toggle('hidden', page === 'assistant' || page === 'onboarding');
  if (chatOpen && (page === 'assistant' || page === 'onboarding')) toggleChat();

  if (page === 'centers') loadCenters();
  if (page === 'book') loadBookingForm();
  if (page === 'appointment') loadAppointment();
  updateLangUI();
  if (page === 'records') loadRecords();
  if (page === 'assistant') setTimeout(() => document.getElementById('chat-input')?.focus(), 200);
  if (page === 'vitals') loadVitals();
  if (page === 'insights') loadInsights();
  if (page === 'abha-settings') loadAbhaSettings();
  if (page === 'family') loadFamily();
  if (page === 'insurance') loadInsurance();
  if (page === 'abha' && aadhaarVerified && verifiedData) {
    const section = document.getElementById('abha-card-section');
    if (section) {
      section.style.display = 'block';
      document.getElementById('abha-card-display').innerHTML = renderAbhaCard(verifiedData);
    }
  }
}

function toggleChat() {
  const overlay = document.getElementById('chat-overlay');
  const fab = document.getElementById('chat-fab');
  chatOpen = !chatOpen;
  overlay.classList.toggle('open', chatOpen);
  if (chatOpen) {
    fab.classList.add('hidden');
    setTimeout(() => document.getElementById('overlay-input')?.focus(), 300);
  } else {
    const activePage = document.querySelector('.page.active');
    const pageId = activePage ? activePage.id.replace('page-', '') : '';
    if (pageId !== 'assistant' && pageId !== 'onboarding') fab.classList.remove('hidden');
  }
}

function openChatWith(msg) {
  if (!chatOpen) toggleChat();
  setTimeout(() => {
    const input = document.getElementById('overlay-input');
    if (input) { input.value = msg; sendOverlayMessage(); }
  }, 400);
}

async function onAadhaarInput(val) {
  const formatted = formatAadhaar(val);
  document.getElementById('v-aadhaar').value = formatted;
  const statusEl = document.getElementById('v-lookup-status');
  const autofillEl = document.getElementById('v-autofill');

  if (formatted.length < 14) {
    autofillEl.style.display = 'none';
    statusEl.textContent = '';
    return;
  }

  statusEl.textContent = 'Looking up...';
  clearTimeout(lookupTimer);
  lookupTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/aadhaar/lookup/${formatted}`);
      const data = await res.json();
      if (data.found) {
        lookupCache[formatted] = data;
        document.getElementById('v-name').value = data.name;
        document.getElementById('v-dob').value = data.dob;
        document.getElementById('v-gender').value = data.gender;
        document.getElementById('v-phone').value = data.phone;
        document.getElementById('v-address').value = data.address;
        autofillEl.style.display = 'block';
        statusEl.textContent = 'Details found - auto-filled';
        statusEl.style.color = '#16a34a';
      } else {
        autofillEl.style.display = 'none';
        statusEl.textContent = 'Aadhaar not found in database';
        statusEl.style.color = '#ef4444';
      }
    } catch (e) {
      statusEl.textContent = 'Lookup failed';
      statusEl.style.color = '#ef4444';
    }
  }, 300);
}

async function onAadhaarInput2(val) {
  const formatted = formatAadhaar(val);
  document.getElementById('v2-aadhaar').value = formatted;
  const statusEl = document.getElementById('v2-lookup-status');
  const autofillEl = document.getElementById('v2-autofill');

  if (formatted.length < 14) {
    autofillEl.style.display = 'none';
    statusEl.textContent = '';
    return;
  }

  statusEl.textContent = 'Looking up...';
  try {
    const res = await fetch(`${BACKEND}/api/aadhaar/lookup/${formatted}`);
    const data = await res.json();
    if (data.found) {
      lookupCache[formatted] = data;
      document.getElementById('v2-name').value = data.name;
      document.getElementById('v2-dob').value = data.dob;
      autofillEl.style.display = 'block';
      statusEl.textContent = 'Details found';
      statusEl.style.color = '#16a34a';
    } else {
      autofillEl.style.display = 'none';
      statusEl.textContent = 'Aadhaar not found';
      statusEl.style.color = '#ef4444';
    }
  } catch (e) {
    statusEl.textContent = 'Lookup failed';
    statusEl.style.color = '#ef4444';
  }
}

async function onBookAadhaarInput(val) {
  const formatted = formatAadhaar(val);
  document.getElementById('b-aadhaar').value = formatted;
  const autofillEl = document.getElementById('b-autofill');

  if (formatted.length < 14) {
    autofillEl.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`${BACKEND}/api/aadhaar/lookup/${formatted}`);
    const data = await res.json();
    if (data.found) {
      lookupCache[formatted] = data;
      document.getElementById('b-name').value = data.name;
      document.getElementById('b-phone').value = data.phone;
      autofillEl.style.display = 'block';
    } else {
      autofillEl.style.display = 'none';
    }
  } catch (e) {}
}

function formatAadhaar(val) {
  const digits = val.replace(/[^0-9]/g, '').substring(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join('-');
}

async function verifyAndCreateABHA() {
  const aadhaarId = document.getElementById('v-aadhaar').value.trim();
  const errEl = document.getElementById('v-error');
  errEl.textContent = '';

  if (aadhaarId.length < 14) { errEl.textContent = 'Enter complete Aadhaar number'; return; }

  const cached = lookupCache[aadhaarId];
  if (!cached) { errEl.textContent = 'Aadhaar not found. Please check the number.'; return; }

  try {
    const res = await fetch(`${BACKEND}/api/aadhaar/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaarId, name: cached.name, dob: cached.dob })
    });
    const data = await res.json();
    const resultEl = document.getElementById('v-result');
    resultEl.style.display = 'block';

    if (data.verified) {
      aadhaarVerified = true;
      verifiedData = { aadhaarId, ...data };
      localStorage.setItem('vc_verified', JSON.stringify(verifiedData));
      resultEl.innerHTML = `<div class="verify-result ok"><div class="big-icon">&#10003;</div><h3>${t('abha_created')}</h3><p>${t('your_abha_id')}: <strong>${data.abhaId}</strong></p><p style="margin-top:4px">${data.abhaAddress}</p></div>`;

      const section = document.getElementById('abha-card-section');
      section.style.display = 'block';
      document.getElementById('abha-card-display').innerHTML = renderAbhaCard(data);
      document.getElementById('kyc-banner').style.display = 'none';
      updateUserUI();
    } else {
      resultEl.innerHTML = `<div class="verify-result fail"><div class="big-icon">&#10007;</div><h3>${t('verification_failed')}</h3><p>${data.reason}</p></div>`;
    }
  } catch (err) {
    errEl.textContent = t('connection_error');
  }
}

async function verifyFromSubpage() {
  const aadhaarId = document.getElementById('v2-aadhaar').value.trim();
  const errEl = document.getElementById('v2-error');
  errEl.textContent = '';

  if (aadhaarId.length < 14) { errEl.textContent = 'Enter complete Aadhaar number'; return; }
  const cached = lookupCache[aadhaarId];
  if (!cached) { errEl.textContent = 'Aadhaar not found'; return; }

  try {
    const res = await fetch(`${BACKEND}/api/aadhaar/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaarId, name: cached.name, dob: cached.dob })
    });
    const data = await res.json();
    const resultEl = document.getElementById('v2-result');
    resultEl.style.display = 'block';
    if (data.verified) {
      aadhaarVerified = true;
      verifiedData = { aadhaarId, ...data };
      localStorage.setItem('vc_verified', JSON.stringify(verifiedData));
      resultEl.innerHTML = `<div class="verify-result ok"><div class="big-icon">&#10003;</div><h3>${t('identity_verified')}</h3><p>ABHA: ${data.abhaId}</p></div>`;
      updateUserUI();
    } else {
      resultEl.innerHTML = `<div class="verify-result fail"><div class="big-icon">&#10007;</div><h3>${t('verification_failed')}</h3><p>${data.reason}</p></div>`;
    }
  } catch (err) {
    errEl.textContent = t('connection_error');
  }
}

let mapplsMap = null;
let leafletMap = null;
let mapplsLoaded = false;
let mapplsLoadingPromise = null;

async function loadMapplsSDK() {
  if (mapplsLoaded) return true;
  if (mapplsLoadingPromise) return mapplsLoadingPromise;

  mapplsLoadingPromise = new Promise(async (resolve) => {
    try {
      const configRes = await fetch(`${BACKEND}/api/config/mappls`);
      const configData = await configRes.json();
      if (!configData.configured || !configData.key) {
        console.log('[MAPPLS] No key configured, falling back to Leaflet');
        resolve(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://apis.mappls.com/advancedmaps/api/${configData.key}/map_sdk?layer=vector&v=3.0`;
      script.onload = () => {
        mapplsLoaded = true;
        console.log('[MAPPLS] SDK loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.log('[MAPPLS] SDK load failed, falling back to Leaflet');
        resolve(false);
      };
      document.head.appendChild(script);
    } catch (err) {
      console.log('[MAPPLS] Config fetch failed:', err.message);
      resolve(false);
    }
  });

  return mapplsLoadingPromise;
}

async function loadCenters() {
  const list = document.getElementById('centers-list');
  const mapEl = document.getElementById('centers-map');
  list.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:20px">${t('loading_centers')}</p>`;

  try {
    const res = await fetch(`${BACKEND}/api/centers`);
    const data = await res.json();
    centersCache = data.centers || [];

    const mapplsReady = await loadMapplsSDK();

    if (mapplsReady && window.mappls) {
      if (!mapplsMap) {
        mapEl.innerHTML = '';
        mapplsMap = new mappls.Map(mapEl, {
          center: [19.1197, 72.8464],
          zoom: 11,
          zoomControl: true,
          location: false
        });

        mapplsMap.addListener('load', () => {
          addMapplsMarkers();
        });
      } else {
        addMapplsMarkers();
      }
    } else if (window.L) {
      if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
      }
      mapEl.innerHTML = '';
      leafletMap = L.map(mapEl).setView([19.12, 72.87], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(leafletMap);
      centersCache.forEach((c, i) => {
        const vaccines = Object.entries(c.vaccinesAvailable || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
        L.marker([c.lat, c.lng]).addTo(leafletMap)
          .bindPopup(`<b>${c.name}</b><br>${c.address}<br>${c.openSlots} ${t('slots')}<br>${vaccines}<br><br><button onclick="selectCenterForBooking('${c.centerId}')" style="background:#6C63FF;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;margin-right:6px">${t('book_appointment')}</button><button onclick="navigateToCenter(${c.lat},${c.lng})" style="background:#16a34a;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px">${t('navigate')}</button>`)
          .on('click', () => scrollToCenter(i));
      });
      setTimeout(() => leafletMap.invalidateSize(), 200);
    }

    list.innerHTML = centersCache.map((c, i) => {
      const vaccines = Object.entries(c.vaccinesAvailable || {}).map(([k, v]) => `<span class="badge vaccine">${k}: ${v}</span>`).join('');
      return `<div class="center-card" id="center-${i}">
        <h4>${c.name}</h4>
        <p class="center-addr">${c.address}</p>
        <div class="center-meta"><span class="badge slots">${c.openSlots} ${t('slots')}</span>${vaccines}</div>
        <div class="center-actions">
          <button class="btn-center-book" onclick="selectCenterForBooking('${c.centerId}')">${t('book_appointment')}</button>
          <button class="btn-center-nav" onclick="navigateToCenter(${c.lat},${c.lng})">${t('navigate')}</button>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = `<p style="text-align:center;color:#ef4444;padding:20px">${t('failed_load_centers')}</p>`;
  }
}

function addMapplsMarkers() {
  if (!mapplsMap || !centersCache.length) return;
  centersCache.forEach((c, i) => {
    const vaccines = Object.entries(c.vaccinesAvailable || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
    const popupHtml = `<div style="max-width:220px;font-family:sans-serif">
      <b style="font-size:13px">${c.name}</b><br>
      <small style="color:#64748b">${c.address}</small><br>
      <span style="display:inline-block;margin:4px 0;background:#dcfce7;color:#166534;padding:2px 8px;border-radius:8px;font-size:11px">${c.openSlots} slots</span>
      <small style="display:block;margin:4px 0;color:#475569">${vaccines}</small>
      <div style="margin-top:6px;display:flex;gap:6px">
        <button onclick="selectCenterForBooking('${c.centerId}')" style="background:#6C63FF;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:11px;flex:1">Book</button>
        <button onclick="navigateToCenter(${c.lat},${c.lng})" style="background:#16a34a;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:11px;flex:1">Navigate</button>
      </div>
    </div>`;

    try {
      const marker = new mappls.Marker({
        map: mapplsMap,
        position: { lat: c.lat, lng: c.lng },
        fitbounds: i === centersCache.length - 1
      });

      const infoWindow = new mappls.InfoWindow({
        map: mapplsMap,
        content: popupHtml
      });

      marker.addListener('click', () => {
        infoWindow.open(mapplsMap, marker);
        scrollToCenter(i);
      });
    } catch (err) {
      console.log(`[MAPPLS] Marker error for ${c.name}:`, err.message);
    }
  });
}

function navigateToCenter(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
  window.open(url, '_blank');
}

function scrollToCenter(i) {
  document.getElementById('center-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function selectCenterForBooking(centerId) {
  goTo('book');
  setTimeout(() => {
    const sel = document.getElementById('b-center');
    if (sel) sel.value = centerId;
  }, 100);
}

async function loadBookingForm() {
  if (!aadhaarVerified) {
    document.getElementById('book-verify-prompt').style.display = 'block';
  } else {
    document.getElementById('book-verify-prompt').style.display = 'none';
    document.getElementById('b-aadhaar').value = verifiedData?.aadhaarId || '';
    document.getElementById('b-name').value = verifiedData?.name || '';
    document.getElementById('b-phone').value = verifiedData?.phone || '';
    document.getElementById('b-autofill').style.display = 'block';
  }
  document.getElementById('book-form').style.display = 'block';
  document.getElementById('book-success').style.display = 'none';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('b-date').min = tomorrow.toISOString().split('T')[0];

  const sel = document.getElementById('b-center');
  if (centersCache.length === 0) {
    try {
      const res = await fetch(`${BACKEND}/api/centers`);
      centersCache = (await res.json()).centers || [];
    } catch (e) {}
  }
  sel.innerHTML = centersCache.map(c => `<option value="${c.centerId}">${c.name} (${c.openSlots} ${t('slots')})</option>`).join('');
}

async function bookAppointment() {
  const aadhaarId = document.getElementById('b-aadhaar').value.trim();
  const name = document.getElementById('b-name').value.trim();
  const phone = document.getElementById('b-phone').value.trim();
  const centerId = document.getElementById('b-center').value;
  const vaccineType = document.getElementById('b-vaccine').value;
  const date = document.getElementById('b-date').value;
  const time = document.getElementById('b-time').value;
  const errEl = document.getElementById('b-error');
  errEl.textContent = '';

  if (!aadhaarId || !name || !centerId || !date) { errEl.textContent = t('fill_all_fields'); return; }

  const slotTime = `${date}T${time}:00+05:30`;

  try {
    const res = await fetch(`${BACKEND}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaarId, patientName: name, phone, language: lang, centerId, slotTime, vaccineType, aadhaarVerified })
    });
    const data = await res.json();
    if (data.appointment) {
      lastAppointment = data.appointment;
      localStorage.setItem('vc_last_apt', JSON.stringify(lastAppointment));
      localStorage.setItem('appointmentId', data.appointment.appointmentId);
      showBookingSuccess(data.appointment);
    } else {
      errEl.textContent = data.error || t('booking_failed');
    }
  } catch (err) {
    errEl.textContent = t('connection_error');
  }
}

function showBookingSuccess(apt) {
  document.getElementById('book-form').style.display = 'none';
  document.getElementById('book-success').style.display = 'block';

  const sl = new Date(apt.slotTime);
  document.getElementById('book-details').innerHTML = `
    <div class="detail-row"><label>${t('apt_id')}</label><span>${apt.appointmentId}</span></div>
    <div class="detail-row"><label>${t('patient')}</label><span>${apt.patientName}</span></div>
    <div class="detail-row"><label>${t('center')}</label><span>${apt.centerName}</span></div>
    <div class="detail-row"><label>${t('date')}</label><span>${sl.toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</span></div>
    <div class="detail-row"><label>${t('time')}</label><span>${sl.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</span></div>
    <div class="detail-row"><label>${t('vaccine')}</label><span>${apt.vaccineType}</span></div>
    <div class="detail-row"><label>${t('abha_verified_label')}</label><span>${apt.aadhaarVerified ? t('yes') : t('pending')}</span></div>
  `;

  const qr = document.getElementById('book-qr');
  qr.innerHTML = '';
  if (window.QRCode) {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, JSON.stringify({ id: apt.appointmentId, center: apt.centerName, slot: apt.slotTime, vaccine: apt.vaccineType }), { width: 200, margin: 2 }, () => qr.appendChild(canvas));
  }
}

function loadAppointment() {
  const el = document.getElementById('apt-content');
  const apt = lastAppointment || JSON.parse(localStorage.getItem('vc_last_apt') || 'null');

  if (!apt) {
    el.innerHTML = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><h3>${t('no_appointment')}</h3><p>${t('book_appointment_to_see')}</p><button onclick="goTo('book')" class="btn-primary" style="margin-top:16px;max-width:200px">${t('book_now')}</button></div>`;
    return;
  }

  const sl = new Date(apt.slotTime);
  el.innerHTML = `
    <div class="apt-card">
      <span class="apt-status ${apt.aadhaarVerified ? 'verified' : 'booked'}">${apt.aadhaarVerified ? t('verified_status') : t('booked_status')}</span>
      <h3>${apt.centerName}</h3>
      <div class="detail-card">
        <div class="detail-row"><label>${t('apt_id')}</label><span>${apt.appointmentId}</span></div>
        <div class="detail-row"><label>${t('patient')}</label><span>${apt.patientName}</span></div>
        <div class="detail-row"><label>${t('date')}</label><span>${sl.toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</span></div>
        <div class="detail-row"><label>${t('time')}</label><span>${sl.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</span></div>
        <div class="detail-row"><label>${t('vaccine')}</label><span>${apt.vaccineType}</span></div>
        <div class="detail-row"><label>${t('aadhaar')}</label><span>${apt.aadhaarId}</span></div>
        <div class="detail-row"><label>${t('status')}</label><span style="color:#16a34a;font-weight:700">${apt.status}</span></div>
      </div>
      <div class="qr-box" id="apt-qr"></div>
    </div>
  `;

  if (window.QRCode) {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, JSON.stringify({ id: apt.appointmentId, center: apt.centerName, slot: apt.slotTime, vaccine: apt.vaccineType, verified: apt.aadhaarVerified }), { width: 220, margin: 2 }, () => document.getElementById('apt-qr')?.appendChild(canvas));
  }
}

async function checkAppointmentStatus() {
  const id = localStorage.getItem('appointmentId');
  if (!id) return;

  try {
    const response = await fetch(`${BACKEND}/api/appointments/${id}`);
    const data = await response.json();
    if (data.appointment) {
      lastAppointment = data.appointment;
      localStorage.setItem('vc_last_apt', JSON.stringify(data.appointment));
      const statusEl = document.querySelector('.apt-card .detail-row:last-child span:last-child');
      if (statusEl) statusEl.textContent = data.appointment.status;
    }
  } catch (e) {}
}

setInterval(checkAppointmentStatus, 5000);

function loadRecords() {
  const apt = lastAppointment || JSON.parse(localStorage.getItem('vc_last_apt') || 'null');
  const countEl = document.getElementById('record-count');
  const listEl = document.getElementById('records-list');

  if (apt) {
    countEl.textContent = '1';
    const sl = new Date(apt.slotTime);
    listEl.innerHTML = `
      <div class="record-card" onclick="goTo('appointment')">
        <h4>${apt.vaccineType}</h4>
        <small>${sl.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</small>
        <div><span class="rc-status ${apt.status === 'VACCINATED' ? 'done' : 'booked'}">${apt.status}</span></div>
      </div>
    `;
  } else {
    countEl.textContent = '0';
    listEl.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:20px;grid-column:1/-1">${t('no_records_yet')}</p>`;
  }
}

function logout() {
  aadhaarVerified = false;
  verifiedData = null;
  lastAppointment = null;
  localStorage.removeItem('vc_verified');
  localStorage.removeItem('vc_last_apt');
  if (chatOpen) toggleChat();
  goTo('onboarding');
}

function showToast(msg) {
  let toast = document.getElementById('vc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vc-toast';
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:12px 24px;border-radius:12px;font-size:13px;z-index:99999;opacity:0;transition:opacity 0.3s;max-width:85vw;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.2)';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function openPersonalize() {
  const sections = [
    { key: 'show_booking', label: 'Appointment Booking' },
    { key: 'show_centers', label: 'Nearby Centers' },
    { key: 'show_eligibility', label: 'Vaccine Eligibility' },
    { key: 'show_sync', label: 'Sync with ABHA' }
  ];
  const saved = JSON.parse(localStorage.getItem('vc_layout_prefs') || '{}');
  let html = '<div style="padding:20px;max-width:400px;margin:auto">';
  html += '<h3 style="margin:0 0 4px;font-size:18px">Personalize Layout</h3>';
  html += '<p style="color:#64748b;font-size:13px;margin:0 0 18px">Choose which sections to show on your home screen.</p>';
  sections.forEach(s => {
    const checked = saved[s.key] !== undefined ? saved[s.key] : true;
    html += `<label style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #f1f5f9;cursor:pointer;font-size:14px">
      <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleLayoutPref('${s.key}', this.checked)" style="width:18px;height:18px;accent-color:#6C63FF">
      ${s.label}
    </label>`;
  });
  html += '<button onclick="applyLayoutPrefs();closePersonalize()" style="margin-top:18px;width:100%;padding:12px;background:#6C63FF;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">Save Preferences</button>';
  html += '</div>';

  let overlay = document.getElementById('personalize-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'personalize-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center';
    overlay.onclick = (e) => { if (e.target === overlay) closePersonalize(); };
    document.body.appendChild(overlay);
  }
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:16px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2)';
  card.innerHTML = html;
  overlay.innerHTML = '';
  overlay.appendChild(card);
  overlay.style.display = 'flex';
}

function closePersonalize() {
  const overlay = document.getElementById('personalize-overlay');
  if (overlay) overlay.style.display = 'none';
}

function toggleLayoutPref(key, val) {
  const saved = JSON.parse(localStorage.getItem('vc_layout_prefs') || '{}');
  saved[key] = val;
  localStorage.setItem('vc_layout_prefs', JSON.stringify(saved));
}

function applyLayoutPrefs() {
  const saved = JSON.parse(localStorage.getItem('vc_layout_prefs') || '{}');
  const mapping = {
    show_booking: 'section-booking',
    show_centers: 'section-centers',
    show_eligibility: 'section-eligibility',
    show_sync: 'section-sync'
  };
  Object.entries(mapping).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = saved[key] === false ? 'none' : '';
  });
}

function syncWithAbha() {
  if (!aadhaarVerified || !verifiedData) {
    showToast('Please verify your Aadhaar first to sync with ABHA');
    goTo('verify');
    return;
  }

  const btn = document.querySelector('[data-i18n="hfc_sync_btn"]');
  if (btn) {
    btn.textContent = 'Syncing...';
    btn.disabled = true;
  }

  setTimeout(() => {
    const syncData = {
      abhaId: verifiedData.abhaId,
      abhaAddress: verifiedData.abhaAddress,
      name: verifiedData.name,
      syncedAt: new Date().toISOString(),
      facilities: ['PHC Andheri West', 'District Hospital Mumbai', 'AIIMS Delhi'],
      records: Math.floor(Math.random() * 5) + 3
    };
    localStorage.setItem('vc_abha_sync', JSON.stringify(syncData));

    if (btn) {
      btn.textContent = 'Synced!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = 'Sync now';
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    }
    showToast(`Synced ${syncData.records} health records from ABDM network`);
  }, 1500);
}

function referAFriend() {
  const appUrl = window.location.origin;
  const userName = verifiedData ? verifiedData.name : 'a friend';
  const shareText = `Hey! ${userName} invites you to try Swasthya Setu - a blockchain-secured vaccine platform with ABHA integration. Book appointments, track vaccines, and manage your health digitally. Join here: ${appUrl}`;

  if (navigator.share) {
    navigator.share({
      title: 'Swasthya Setu - Health Platform',
      text: shareText,
      url: appUrl
    }).catch(() => {});
  } else {
    const tempInput = document.createElement('textarea');
    tempInput.value = shareText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Referral link copied to clipboard!');
  }
}

let chatSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

async function sendChatMessage(msg, area, isOverlay) {
  if (!msg) return;

  area.innerHTML += `<div class="chat-bubble user"><p>${esc(msg)}</p></div>`;
  area.innerHTML += `<div class="chat-bubble typing" id="${isOverlay ? 'overlay' : 'page'}-typing">...</div>`;
  area.scrollTop = area.scrollHeight;

  const responseLang = detectedVoiceLang || lang;
  detectedVoiceLang = null;

  const userData = verifiedData ? {
    aadhaarId: verifiedData.aadhaarId || verifiedData.abhaId,
    name: verifiedData.name,
    phone: '',
    aadhaarVerified: aadhaarVerified
  } : null;

  try {
    const res = await fetch(`${BACKEND}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        language: responseLang,
        sessionId: chatSessionId,
        userData: userData
      })
    });
    const data = await res.json();
    const typingEl = document.getElementById(`${isOverlay ? 'overlay' : 'page'}-typing`);
    if (typingEl) typingEl.remove();

    area.innerHTML += `<div class="chat-bubble bot"><p>${esc(data.reply)}</p></div>`;

    if (data.booking) {
      lastAppointment = data.booking;
      localStorage.setItem('vc_last_apt', JSON.stringify(data.booking));
      localStorage.setItem('appointmentId', data.booking.appointmentId);
      const aptLabel = responseLang === 'hi' ? 'अपॉइंटमेंट देखें' : responseLang === 'mr' ? 'भेट पहा' : 'View Appointment';
      area.innerHTML += `<div class="chat-bubble bot chat-action"><button class="chat-action-btn" onclick="goTo('appointment')">${esc(aptLabel)}</button></div>`;
    } else if (data.intent === 'FIND_CENTERS') {
      const label = responseLang === 'hi' ? 'केंद्र देखें' : responseLang === 'mr' ? 'केंद्रे पहा' : 'View Centers';
      area.innerHTML += `<div class="chat-bubble bot chat-action"><button class="chat-action-btn" onclick="goTo('centers')">${esc(label)}</button></div>`;
    } else if (data.intent === 'CHECK_APPOINTMENT') {
      const label = responseLang === 'hi' ? 'मेरा अपॉइंटमेंट' : responseLang === 'mr' ? 'माझी भेट' : 'My Appointment';
      area.innerHTML += `<div class="chat-bubble bot chat-action"><button class="chat-action-btn" onclick="goTo('appointment')">${esc(label)}</button></div>`;
    } else if (data.intent === 'CHECK_ELIGIBILITY') {
      const label = responseLang === 'hi' ? 'पात्रता जांचें' : responseLang === 'mr' ? 'पात्रता तपासा' : 'Check Eligibility';
      area.innerHTML += `<div class="chat-bubble bot chat-action"><button class="chat-action-btn" onclick="goTo('eligibility')">${esc(label)}</button></div>`;
    } else if (data.intent === 'CREATE_ABHA') {
      const label = responseLang === 'hi' ? 'ABHA बनाएं' : responseLang === 'mr' ? 'ABHA तयार करा' : 'Create ABHA';
      area.innerHTML += `<div class="chat-bubble bot chat-action"><button class="chat-action-btn" onclick="goTo('verify')">${esc(label)}</button></div>`;
    }

    if (data.audioBase64) {
      try {
        const audio = new Audio('data:audio/wav;base64,' + data.audioBase64);
        audio.play();
      } catch (_) {}
    } else if (window.speechSynthesis && data.reply) {
      const utter = new SpeechSynthesisUtterance(data.reply);
      utter.lang = responseLang === 'hi' ? 'hi-IN' : responseLang === 'mr' ? 'mr-IN' : 'en-IN';
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    }

    if (data.pipeline) {
      console.log('[AI Pipeline]', `LLM:${data.pipeline.llm || '-'} → TTS:${data.pipeline.tts || '-'} | Intent:${data.intent || 'NONE'}`);
    }
  } catch (err) {
    const typingEl = document.getElementById(`${isOverlay ? 'overlay' : 'page'}-typing`);
    if (typingEl) typingEl.remove();
    area.innerHTML += `<div class="chat-bubble bot"><p>${t('chat_error')}</p></div>`;
  }
  area.scrollTop = area.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  const area = document.getElementById('chat-messages');
  await sendChatMessage(msg, area, false);
}

async function sendOverlayMessage() {
  const input = document.getElementById('overlay-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  const area = document.getElementById('overlay-messages');
  await sendChatMessage(msg, area, true);
}

let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let voiceRequestId = 0;

function toggleVoice() {
  const btn = document.getElementById('voice-btn');
  if (isRecording) {
    isRecording = false;
    btn.classList.remove('recording');
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    return;
  }
  isRecording = true;
  voiceRequestId++;
  const thisRequest = voiceRequestId;
  btn.classList.add('recording');
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) startBrowserSTT(btn, thisRequest, false);
  startIndicSTT(btn, thisRequest, false);
}

function toggleOverlayVoice() {
  const btn = document.getElementById('overlay-voice-btn');
  if (isRecording) {
    isRecording = false;
    btn.classList.remove('recording');
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    return;
  }
  isRecording = true;
  voiceRequestId++;
  const thisRequest = voiceRequestId;
  btn.classList.add('recording');
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) startBrowserSTT(btn, thisRequest, true);
  startIndicSTT(btn, thisRequest, true);
}

function startBrowserSTT(btn, requestId, isOverlay) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    if (voiceRequestId !== requestId) return;
    voiceRequestId++;
    const transcript = event.results[0][0].transcript;
    detectedVoiceLang = lang;
    if (isOverlay) {
      document.getElementById('overlay-input').value = transcript;
      sendOverlayMessage();
    } else {
      document.getElementById('chat-input').value = transcript;
      sendMessage();
    }
  };
  recognition.onerror = () => { btn.classList.remove('recording'); isRecording = false; };
  recognition.onend = () => { btn.classList.remove('recording'); isRecording = false; };
  recognition.start();
}

async function startIndicSTT(btn, requestId, isOverlay) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      btn.classList.remove('recording');
      isRecording = false;
      if (audioChunks.length === 0 || voiceRequestId !== requestId) return;
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('language', lang);
      try {
        const res = await fetch(`${BACKEND}/api/voice/stt`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.text && voiceRequestId === requestId) {
          voiceRequestId++;
          detectedVoiceLang = lang;
          if (isOverlay) {
            document.getElementById('overlay-input').value = data.text;
            sendOverlayMessage();
          } else {
            document.getElementById('chat-input').value = data.text;
            sendMessage();
          }
        }
      } catch (err) { console.log('STT fallback:', err.message); }
    };
    mediaRecorder.start();
    setTimeout(() => { if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 7000);
  } catch (err) { console.log('Mic unavailable:', err.message); }
}

function checkEligibility() {
  const age = parseInt(document.getElementById('elig-age').value);
  const pregnant = document.getElementById('elig-pregnant').value === 'yes';
  const allergy = document.getElementById('elig-allergy').value === 'yes';
  const doses = parseInt(document.getElementById('elig-doses').value);
  const diabetes = document.getElementById('elig-diabetes').checked;
  const heart = document.getElementById('elig-heart').checked;
  const lung = document.getElementById('elig-lung').checked;
  const immuno = document.getElementById('elig-immuno').checked;

  if (!age || age <= 0) {
    document.getElementById('elig-result').innerHTML = `<div class="info-card" style="background:#fef2f2;border-left:4px solid #ef4444"><p style="color:#991b1b">${t('enter_valid_age')}</p></div>`;
    return;
  }

  const vaccines = [];
  const hasChronic = diabetes || heart || lung || immuno;

  if (age >= 12 && !allergy) {
    if (doses < 2) vaccines.push({ name: 'Covishield (AstraZeneca)', eligible: true, cls: 'eligible', badge: 'yes', badgeText: t('eligible'), desc: `You need ${2 - doses} more dose(s). Recommended interval: 12-16 weeks between doses.${hasChronic ? ' Priority group due to chronic condition.' : ''}`, priority: hasChronic });
    if (doses < 2) vaccines.push({ name: 'Covaxin (BBV152)', eligible: true, cls: 'eligible', badge: 'yes', badgeText: t('eligible'), desc: `You need ${2 - doses} more dose(s). Recommended interval: 4-6 weeks between doses.`, priority: false });
    if (doses >= 2 && age >= 18) vaccines.push({ name: 'Booster Dose (Corbevax)', eligible: true, cls: 'eligible', badge: 'yes', badgeText: t('eligible'), desc: 'You qualify for a booster dose. Recommended 6+ months after second dose.', priority: hasChronic });
    if (doses >= 2 && age < 18) vaccines.push({ name: 'Booster Dose', eligible: false, cls: 'not-eligible', badge: 'no', badgeText: t('not_eligible'), desc: 'Booster doses for under 18 are not yet recommended.' });
    if (doses >= 3) vaccines.push({ name: 'Additional Booster', eligible: false, cls: 'partial', badge: 'caution', badgeText: t('consult_doctor'), desc: 'You have completed your vaccination schedule. Consult your doctor for any additional doses.' });
  }
  if (age < 12) vaccines.push({ name: t('covid_label') + ' Vaccines', eligible: false, cls: 'not-eligible', badge: 'no', badgeText: t('below_min_age'), desc: 'COVID-19 vaccines are currently approved for ages 12 and above.' });

  if (allergy) vaccines.push({ name: 'Note: Allergy Reported', eligible: false, cls: 'partial', badge: 'caution', badgeText: t('doctor_review'), desc: 'Please consult with your doctor before receiving any vaccine. Inform the vaccination center about your allergy history.' });
  if (pregnant && age >= 18) vaccines.push({ name: 'Pregnancy Advisory', eligible: true, cls: 'partial', badge: 'caution', badgeText: t('with_caution'), desc: 'COVID-19 vaccination during pregnancy is recommended but should be done after consultation with your OB-GYN.' });

  if (age >= 6) vaccines.push({ name: 'Influenza (Flu) Vaccine', eligible: true, cls: 'eligible', badge: 'yes', badgeText: t('eligible'), desc: 'Annual flu vaccination is recommended. Available at all centers.' });
  if (age >= 50 || immuno) vaccines.push({ name: 'Pneumococcal Vaccine', eligible: true, cls: 'eligible', badge: 'yes', badgeText: t('recommended'), desc: `Recommended for ${immuno ? 'immunocompromised individuals' : 'adults 50+'}.` });

  let html = `<div class="info-card green"><p>${t('found_vaccines').replace('{n}', vaccines.filter(v => v.eligible).length)}</p></div>`;
  vaccines.forEach(v => {
    html += `<div class="elig-card ${v.cls}"><h4>${v.name}</h4><p>${v.desc}</p><span class="elig-badge ${v.badge}">${v.badgeText}</span>${v.priority ? `<span class="elig-badge yes" style="margin-left:6px">${t('priority_group')}</span>` : ''}</div>`;
  });
  document.getElementById('elig-result').innerHTML = html;
}

function loadInsurance() {
  const families = JSON.parse(localStorage.getItem('vc_family') || '[]');
  document.getElementById('ins-family-count').textContent = 1 + families.length;
  if (verifiedData) {
    document.getElementById('ins-policy-id').textContent = 'PMJAY-MH-' + (verifiedData.abhaId || '').replace(/[^0-9]/g, '').slice(0, 4);
  }
  const claimsEl = document.getElementById('ins-claims');
  const claims = JSON.parse(localStorage.getItem('vc_claims') || '[]');
  if (claims.length === 0 && lastAppointment) {
    claims.push({ date: lastAppointment.date || new Date().toLocaleDateString(), desc: 'Vaccination — ' + (lastAppointment.vaccine || 'Covishield'), amount: '₹0 (Fully Covered)', status: 'Processed' });
    localStorage.setItem('vc_claims', JSON.stringify(claims));
  }
  if (claims.length > 0) {
    claimsEl.innerHTML = claims.map(c => `<div class="ins-cov-item"><div class="ins-cov-icon ok"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><span>${esc(c.desc)}</span><small>${c.amount}</small></div>`).join('');
  }
}

function loadVitals() {
  const vitals = JSON.parse(localStorage.getItem('vc_vitals') || '[]');
  const historyEl = document.getElementById('vitals-history');
  if (vitals.length > 0) {
    const latest = vitals[0];
    document.getElementById('vital-temp').textContent = latest.temp || '--';
    document.getElementById('vital-bp').textContent = latest.bpSys && latest.bpDia ? `${latest.bpSys}/${latest.bpDia}` : '--';
    document.getElementById('vital-hr').textContent = latest.hr || '--';

    if (latest.temp && parseFloat(latest.temp) > 38) document.getElementById('vital-temp').classList.add('vital-warn');
    else document.getElementById('vital-temp').classList.remove('vital-warn');
    if (latest.hr && parseInt(latest.hr) > 100) document.getElementById('vital-hr').classList.add('vital-warn');
    else document.getElementById('vital-hr').classList.remove('vital-warn');

    historyEl.innerHTML = vitals.map((v, i) => {
      const tempWarn = v.temp && parseFloat(v.temp) > 38 ? ' vital-warn' : '';
      const hrWarn = v.hr && parseInt(v.hr) > 100 ? ' vital-warn' : '';
      return `<div class="vital-entry"><div><div class="vital-entry-data"><span class="${tempWarn}">${v.temp ? v.temp + '°C' : '-'}</span><span>${v.bpSys && v.bpDia ? v.bpSys + '/' + v.bpDia : '-'} mmHg</span><span class="${hrWarn}">${v.hr ? v.hr + ' bpm' : '-'}</span></div>${v.notes ? '<div class="vital-entry-note">' + esc(v.notes) + '</div>' : ''}</div><div><div class="vital-entry-time">${v.time}</div><button class="vault-doc-del" onclick="deleteVital(${i})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>`;
    }).join('');
  } else {
    document.getElementById('vital-temp').textContent = '--';
    document.getElementById('vital-bp').textContent = '--';
    document.getElementById('vital-hr').textContent = '--';
    historyEl.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:20px">${t('no_vitals_yet')}</p>`;
  }
}

function logVitals() {
  const temp = document.getElementById('log-temp').value;
  const bpSys = document.getElementById('log-bp-sys').value;
  const bpDia = document.getElementById('log-bp-dia').value;
  const hr = document.getElementById('log-hr').value;
  const notes = document.getElementById('log-notes').value.trim();

  if (!temp && !bpSys && !hr) {
    alert(t('enter_vital'));
    return;
  }

  const vitals = JSON.parse(localStorage.getItem('vc_vitals') || '[]');
  const now = new Date();
  vitals.unshift({
    temp: temp || null,
    bpSys: bpSys || null,
    bpDia: bpDia || null,
    hr: hr || null,
    notes: notes || null,
    time: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ts: now.getTime()
  });
  localStorage.setItem('vc_vitals', JSON.stringify(vitals));
  document.getElementById('log-temp').value = '';
  document.getElementById('log-bp-sys').value = '';
  document.getElementById('log-bp-dia').value = '';
  document.getElementById('log-hr').value = '';
  document.getElementById('log-notes').value = '';
  loadVitals();
}

function deleteVital(i) {
  const vitals = JSON.parse(localStorage.getItem('vc_vitals') || '[]');
  vitals.splice(i, 1);
  localStorage.setItem('vc_vitals', JSON.stringify(vitals));
  loadVitals();
}

function loadInsights() {
  const vitals = JSON.parse(localStorage.getItem('vc_vitals') || '[]');
  const hasAppointment = !!lastAppointment;
  const families = JSON.parse(localStorage.getItem('vc_family') || '[]');

  let score = 40;
  if (aadhaarVerified) score += 15;
  if (hasAppointment) score += 20;
  if (vitals.length > 0) score += 10;
  if (families.length > 0) score += 5;
  if (vitals.length >= 3) score += 5;
  const vaultDocs = JSON.parse(localStorage.getItem('vc_vault_docs') || '[]');
  if (vaultDocs.length > 0) score += 5;
  score = Math.min(100, score);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const ring = document.getElementById('insight-ring');
  if (ring) {
    ring.setAttribute('stroke-dasharray', circumference.toFixed(1));
    ring.setAttribute('stroke-dashoffset', offset.toFixed(1));
    const color = score >= 80 ? '#16a34a' : score >= 50 ? '#6C63FF' : '#e65100';
    ring.setAttribute('stroke', color);
  }
  document.getElementById('insight-score').textContent = score;

  const cardsEl = document.getElementById('insight-cards');
  const tempEntries = vitals.filter(v => v.temp);
  const hrEntries = vitals.filter(v => v.hr);
  const avgTemp = tempEntries.length > 0 ? (tempEntries.reduce((s, v) => s + parseFloat(v.temp), 0) / tempEntries.length).toFixed(1) : '--';
  const avgHR = hrEntries.length > 0 ? Math.round(hrEntries.reduce((s, v) => s + parseInt(v.hr), 0) / hrEntries.length) : '--';
  const tempClass = avgTemp !== '--' && parseFloat(avgTemp) > 37.5 ? 'warn' : 'good';
  const hrClass = avgHR !== '--' && avgHR > 90 ? 'warn' : 'good';
  cardsEl.innerHTML = `
    <div class="insight-card"><h4>${t('avg_temp')}</h4><div class="insight-val ${tempClass}">${avgTemp !== '--' ? avgTemp + '°C' : '--'}</div></div>
    <div class="insight-card"><h4>${t('avg_hr')}</h4><div class="insight-val ${hrClass}">${avgHR !== '--' ? avgHR + ' bpm' : '--'}</div></div>
    <div class="insight-card"><h4>${t('vitals_logged')}</h4><div class="insight-val neutral">${vitals.length}</div></div>
    <div class="insight-card"><h4>${t('family_members')}</h4><div class="insight-val neutral">${families.length}</div></div>
  `;

  const barsEl = document.getElementById('insight-bars');
  const covidPct = hasAppointment ? 100 : 0;
  const abhaPct = aadhaarVerified ? 100 : 0;
  const vitalsPct = Math.min(100, vitals.length * 20);
  const docsPct = Math.min(100, vaultDocs.length * 25);
  barsEl.innerHTML = [
    { label: t('covid_label'), pct: covidPct, color: '#16a34a' },
    { label: t('abha_setup'), pct: abhaPct, color: '#6C63FF' },
    { label: t('vitals_track'), pct: vitalsPct, color: '#e65100' },
    { label: t('documents'), pct: docsPct, color: '#0ea5e9' }
  ].map(b => `<div class="insight-bar"><span class="insight-bar-label">${b.label}</span><div class="insight-bar-track"><div class="insight-bar-fill" style="width:${b.pct}%;background:${b.color}"></div></div><span class="insight-bar-val">${b.pct}%</span></div>`).join('');

  const recsEl = document.getElementById('insight-recs');
  const recs = [];
  if (!aadhaarVerified) recs.push(t('rec_abha'));
  if (!hasAppointment) recs.push(t('rec_vaccine'));
  if (vitals.length === 0) recs.push(t('rec_vitals'));
  if (vitals.length > 0 && avgTemp !== '--' && parseFloat(avgTemp) > 37.5) recs.push(t('rec_temp_high'));
  if (families.length === 0) recs.push(t('rec_family'));
  if (vaultDocs.length === 0) recs.push(t('rec_vault'));
  if (recs.length === 0) recs.push(t('rec_great'));
  recsEl.innerHTML = recs.map(r => `<div class="insight-rec">${r}</div>`).join('');
}

function unlockVault() {
  const pinInput = document.getElementById('vault-pin');
  const pin = pinInput.value;
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    document.getElementById('vault-hint').textContent = t('vault_pin_error');
    document.getElementById('vault-hint').style.color = '#ef4444';
    return;
  }
  const storedPin = localStorage.getItem('vc_vault_pin');
  if (!storedPin) {
    localStorage.setItem('vc_vault_pin', pin);
    showVault();
  } else if (storedPin === pin) {
    showVault();
  } else {
    document.getElementById('vault-hint').textContent = t('vault_pin_wrong');
    document.getElementById('vault-hint').style.color = '#ef4444';
    pinInput.value = '';
  }
}

function showVault() {
  document.getElementById('vault-locked').style.display = 'none';
  document.getElementById('vault-unlocked').style.display = 'block';
  renderVaultDocs();
}

function lockVault() {
  document.getElementById('vault-locked').style.display = 'block';
  document.getElementById('vault-unlocked').style.display = 'none';
  document.getElementById('vault-pin').value = '';
  document.getElementById('vault-hint').textContent = t('vault_pin_prompt');
  document.getElementById('vault-hint').style.color = '#94a3b8';
}

function renderVaultDocs() {
  const docs = JSON.parse(localStorage.getItem('vc_vault_docs') || '[]');
  const el = document.getElementById('vault-docs');
  if (docs.length === 0) {
    el.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:16px">${t('no_docs_yet')}</p>`;
    return;
  }
  el.innerHTML = docs.map((d, i) => `<div class="vault-doc">
    <div class="vault-doc-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
    <div class="vault-doc-info"><h4>${esc(d.name)}</h4><small>${esc(d.type)} &bull; ${d.date}</small>${d.notes ? '<br><small>' + esc(d.notes) + '</small>' : ''}</div>
    <button class="vault-doc-del" onclick="deleteVaultDoc(${i})"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
  </div>`).join('');
}

function addVaultDoc() {
  const name = document.getElementById('vault-doc-name').value.trim();
  const type = document.getElementById('vault-doc-type').value;
  const notes = document.getElementById('vault-doc-notes').value.trim();
  if (!name) { alert(t('enter_doc_name')); return; }
  const docs = JSON.parse(localStorage.getItem('vc_vault_docs') || '[]');
  docs.unshift({ name, type, notes, date: new Date().toLocaleDateString() });
  localStorage.setItem('vc_vault_docs', JSON.stringify(docs));
  document.getElementById('vault-doc-name').value = '';
  document.getElementById('vault-doc-notes').value = '';
  renderVaultDocs();
}

function deleteVaultDoc(i) {
  const docs = JSON.parse(localStorage.getItem('vc_vault_docs') || '[]');
  docs.splice(i, 1);
  localStorage.setItem('vc_vault_docs', JSON.stringify(docs));
  renderVaultDocs();
}

function loadAbhaSettings() {
  const el = document.getElementById('abha-settings-content');
  const name = verifiedData ? verifiedData.name : 'Not Set';
  const abha = verifiedData ? verifiedData.abhaId : 'Not Created';
  const abhaAddr = verifiedData ? verifiedData.abhaAddress : 'Not Set';
  const isVerified = aadhaarVerified;
  const district = verifiedData ? (verifiedData.district || 'Mumbai') : '';
  const state = verifiedData ? (verifiedData.state || 'Maharashtra') : '';

  const consentData = JSON.parse(localStorage.getItem('vc_abha_consents') || '{"share_records":true,"share_vitals":false,"share_insurance":false,"allow_research":false,"emergency_access":true,"govt_programs":true}');

  const profileCard = isVerified && verifiedData ? `<div class="abha-card" style="margin:0 12px 8px;border-radius:14px">${renderAbhaCard(verifiedData)}</div>` : `
    <div style="text-align:center;padding:24px">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>
      <p style="color:#94a3b8;font-size:14px;margin-top:8px">${t('create_abha_prompt')}</p>
    </div>
  `;

  el.innerHTML = `
    <div class="abha-setting-card" style="padding:0;overflow:hidden">
      <div style="padding:16px 20px 8px"><h4><span class="setting-icon" style="background:#ede9fe"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg></span> ${t('abha_card_title')}</h4></div>
      ${profileCard}
      ${isVerified ? `<div style="padding:12px 20px;display:flex;gap:12px">
        <div style="flex:1;background:#f0fdf4;border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:700;color:#16a34a">${t('active_status')}</div>
          <div style="font-size:11px;color:#64748b">${t('status_label')}</div>
        </div>
        <div style="flex:1;background:#eff6ff;border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:700;color:#2563eb">${district}</div>
          <div style="font-size:11px;color:#64748b">${t('district_label')}</div>
        </div>
        <div style="flex:1;background:#faf5ff;border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:700;color:#7c3aed">${state}</div>
          <div style="font-size:11px;color:#64748b">${t('state_label')}</div>
        </div>
      </div>` : ''}
    </div>

    <div class="abha-setting-card">
      <h4><span class="setting-icon" style="background:#fef3c7"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span> ${t('consent_title')}</h4>
      <div class="toggle-row">
        <div class="toggle-info">
          <label>${t('consent_records')}</label>
          <div class="toggle-desc">${t('consent_records_desc')}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" ${consentData.share_records ? 'checked' : ''} onchange="updateConsent('share_records',this.checked)"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info">
          <label>${t('consent_vitals')}</label>
          <div class="toggle-desc">${t('consent_vitals_desc')}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" ${consentData.share_vitals ? 'checked' : ''} onchange="updateConsent('share_vitals',this.checked)"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info">
          <label>${t('consent_insurance')}</label>
          <div class="toggle-desc">${t('consent_insurance_desc')}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" ${consentData.share_insurance ? 'checked' : ''} onchange="updateConsent('share_insurance',this.checked)"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info">
          <label>${t('consent_emergency')}</label>
          <div class="toggle-desc">${t('consent_emergency_desc')}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" ${consentData.emergency_access ? 'checked' : ''} onchange="updateConsent('emergency_access',this.checked)"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info">
          <label>${t('consent_govt')}</label>
          <div class="toggle-desc">${t('consent_govt_desc')}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" ${consentData.govt_programs ? 'checked' : ''} onchange="updateConsent('govt_programs',this.checked)"><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info">
          <label>${t('consent_research')}</label>
          <div class="toggle-desc">${t('consent_research_desc')}</div>
        </div>
        <label class="toggle-switch"><input type="checkbox" ${consentData.allow_research ? 'checked' : ''} onchange="updateConsent('allow_research',this.checked)"><span class="toggle-slider"></span></label>
      </div>
    </div>

    <div class="abha-setting-card">
      <h4><span class="setting-icon" style="background:#dbeafe"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span> ${t('linked_facilities')}</h4>
      ${isVerified ? `
        <div class="facility-item"><div class="facility-dot"></div><span class="facility-name">PHC Andheri West</span><span class="facility-type">PHC</span></div>
        <div class="facility-item"><div class="facility-dot"></div><span class="facility-name">District Hospital, Mumbai</span><span class="facility-type">Hospital</span></div>
        <div class="facility-item"><div class="facility-dot"></div><span class="facility-name">KEM Hospital, Parel</span><span class="facility-type">Hospital</span></div>
        <div class="facility-item"><div class="facility-dot" style="background:#f59e0b;box-shadow:0 0 6px rgba(245,158,11,0.4)"></div><span class="facility-name">Rural Health Center, Mulshi</span><span class="facility-type">RHC</span></div>
        <div class="facility-item"><div class="facility-dot" style="background:#3b82f6;box-shadow:0 0 6px rgba(59,130,246,0.4)"></div><span class="facility-name">AIIMS Vaccination Center</span><span class="facility-type">Govt</span></div>
      ` : `<p style="color:#94a3b8;font-size:14px;padding:8px 0;text-align:center">${t('link_abha_prompt')}</p>`}
    </div>

    <div class="abha-setting-card">
      <h4><span class="setting-icon" style="background:#fce4ec"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></span> ${t('account_actions')}</h4>
      <button onclick="goTo('verify')" class="btn-primary" style="width:100%;margin-bottom:8px">${isVerified ? t('update_abha') : t('create_abha_now')}</button>
      ${isVerified ? `<button onclick="if(confirm('${t('delink_confirm').replace(/'/g, "\\'")}')){ localStorage.removeItem('vc_verified'); localStorage.removeItem('vc_abha_consents'); localStorage.removeItem('vc_abha_sync'); aadhaarVerified=false; verifiedData=null; loadAbhaSettings(); showToast('${t('abha_delinked').replace(/'/g, "\\'")}'); }" class="btn-secondary" style="width:100%;color:#ef4444;border-color:#fecaca">${t('delink_abha')}</button>` : ''}
    </div>
  `;
}

function updateConsent(key, val) {
  const c = JSON.parse(localStorage.getItem('vc_abha_consents') || '{"share_records":true,"share_vitals":false,"share_insurance":false,"allow_research":false}');
  c[key] = val;
  localStorage.setItem('vc_abha_consents', JSON.stringify(c));
}

function loadFamily() {
  const families = JSON.parse(localStorage.getItem('vc_family') || '[]');
  const el = document.getElementById('family-list');
  if (families.length === 0) {
    el.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:16px">${t('no_family_yet')}</p>`;
    return;
  }
  el.innerHTML = families.map((f, i) => `<div class="family-card">
    <div class="family-avatar"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></div>
    <div class="family-info"><h4>${esc(f.name)}</h4><small>${esc(f.relation)} &bull; ${f.age} yrs &bull; ${esc(f.gender)}</small>${f.aadhaar ? '<br><small>Aadhaar: ' + esc(f.aadhaar) + '</small>' : ''}</div>
    <button class="family-del" onclick="deleteFamilyMember(${i})"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
  </div>`).join('');
}

function addFamilyMember() {
  const name = document.getElementById('fam-name').value.trim();
  const relation = document.getElementById('fam-relation').value;
  const age = document.getElementById('fam-age').value;
  const aadhaar = document.getElementById('fam-aadhaar').value.trim();
  const gender = document.getElementById('fam-gender').value;
  if (!name || !age) { alert(t('enter_name_age')); return; }
  const families = JSON.parse(localStorage.getItem('vc_family') || '[]');
  families.push({ name, relation, age: parseInt(age), aadhaar, gender });
  localStorage.setItem('vc_family', JSON.stringify(families));
  document.getElementById('fam-name').value = '';
  document.getElementById('fam-age').value = '';
  document.getElementById('fam-aadhaar').value = '';
  loadFamily();
}

function deleteFamilyMember(i) {
  const families = JSON.parse(localStorage.getItem('vc_family') || '[]');
  families.splice(i, 1);
  localStorage.setItem('vc_family', JSON.stringify(families));
  loadFamily();
}

function formatAadhaar(val) {
  const digits = val.replace(/\D/g, '');
  const parts = [];
  for (let i = 0; i < digits.length && i < 12; i += 4) parts.push(digits.slice(i, i + 4));
  return parts.join('-');
}

function toggleFaq(el) {
  el.classList.toggle('open');
}

let currentRating = 0;
function setRating(n) {
  currentRating = n;
  document.querySelectorAll('#rating-stars .star').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
}

function submitFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  if (!text) { alert(t('write_feedback')); return; }
  const feedbacks = JSON.parse(localStorage.getItem('vc_feedbacks') || '[]');
  feedbacks.push({ text, rating: currentRating, date: new Date().toLocaleDateString() });
  localStorage.setItem('vc_feedbacks', JSON.stringify(feedbacks));
  document.getElementById('feedback-result').innerHTML = `<div class="info-card green"><p>${t('feedback_thanks')}</p></div>`;
  document.getElementById('feedback-text').value = '';
  currentRating = 0;
  document.querySelectorAll('#rating-stars .star').forEach(s => s.classList.remove('active'));
}

function esc(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

(function init() {
  const saved = localStorage.getItem('vc_verified');
  if (saved) {
    try {
      verifiedData = JSON.parse(saved);
      aadhaarVerified = true;
    } catch (_) {}
  }
  const savedApt = localStorage.getItem('vc_last_apt');
  if (savedApt) {
    try { lastAppointment = JSON.parse(savedApt); } catch (_) {}
  }
  updateLangUI();
  applyLayoutPrefs();
})();