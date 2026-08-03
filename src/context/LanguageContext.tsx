import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'mr';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateCategory: (cat: string) => string;
  translateDepartment: (dept: string) => string;
  translateStatus: (status: string) => string;
  translateSeverity: (sev: string) => string;
  translateText: (text: string | undefined | null) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Header
    'nav.live_intel': 'LIVE CITY INTEL',
    'nav.emergency_hazards': 'Emergency Hazard',
    'nav.emergency_hazards_plural': 'Emergency Hazards Active',
    'nav.all_hazards_cleared': 'All critical hazards cleared or under response',
    'nav.edit_profile': 'Edit Profile',
    'nav.logout': 'Logout',
    'nav.citizen': 'Citizen',
    'nav.officer': 'Officer',
    'nav.worker': 'Field Worker',
    'nav.admin': 'Admin',
    'nav.tab.home': 'Home',
    'nav.tab.report': 'Report Hazard',
    'nav.tab.live_map': 'Live Map',
    'nav.tab.risk_heatmap': 'Risk Heatmap',
    'nav.tab.track': 'Track Report',
    'nav.tab.analytics': 'Analytics',
    'nav.tab.department': 'Dept Dashboard',
    'nav.tab.worker_portal': 'Worker Portal',
    'nav.tab.system_admin': 'System Admin',
    'nav.tab.architecture': 'Architecture',

    // Buttons & Actions
    'btn.submit_report': 'Submit Report',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',
    'btn.search': 'Search',
    'btn.filter': 'Filter',
    'btn.upload_photo': 'Upload Photo',
    'btn.capture_location': 'Capture GPS Location',
    'btn.run_ai': 'Run AI Hazard Analysis',
    'btn.flag_emergency': 'Flag as Emergency Priority',
    'btn.view_details': 'View Details',
    'btn.track_id': 'Track Complaint ID',

    // Statuses
    'status.submitted': 'Submitted',
    'status.verified': 'Verified',
    'status.assigned': 'Assigned',
    'status.in_progress': 'In Progress',
    'status.work_submitted': 'Work Submitted',
    'status.resolved': 'Resolved',
    'status.rejected': 'Rejected',

    // Severity
    'severity.low': 'Low',
    'severity.medium': 'Medium',
    'severity.high': 'High',
    'severity.critical': 'Critical',
    'severity.critical_emergency': '🚨 CRITICAL EMERGENCY',

    // Hazard Categories
    'category.road': 'Road Hazard',
    'category.electrical': 'Electrical Hazard',
    'category.water': 'Water Hazard',
    'category.sanitation': 'Sanitation Hazard',
    'category.environmental': 'Environmental Hazard',
    'category.safety': 'Public Safety Hazard',

    // Departments
    'dept.road': 'Road Department',
    'dept.electricity': 'Electricity Department',
    'dept.water': 'Water & Sewerage',
    'dept.sanitation': 'Sanitation & Waste',
    'dept.environmental': 'Environmental Protection',
    'dept.safety': 'Public Safety & Infrastructure',

    // Report Hazard View
    'report.wizard.step1': 'Upload Media',
    'report.wizard.step2': 'Location & Details',
    'report.wizard.step3': 'AI Review & Route',
    'report.wizard.step4': 'Submitted',
    'report.step1_tag': 'Step 1 of 3',
    'report.step2_tag': 'Step 2 of 3',
    'report.step3_tag': 'Step 3 of 3',
    'report.photos_count': 'Photo(s)',
    'report.videos_count': 'Video(s)',
    'report.upload_title': 'Upload Hazard Media (Photos & Videos)',
    'report.upload_subtitle': 'Combine high-resolution photos and video recordings of the hazard site in one place for AI verification.',
    'report.add_evidence_title': 'Add Hazard Evidence Files',
    'report.add_evidence_desc': 'Upload images (JPG, PNG) or video recordings (MP4, WebM)',
    'report.add_photos': 'Add Photos',
    'report.add_videos': 'Add Videos',
    'report.video_link_label': 'Video Link:',
    'report.video_link_placeholder': 'Or paste video link (MP4, Stream URL)...',
    'report.attach_link': 'Attach Link',
    'report.gallery_title': 'Attached Media Gallery',
    'report.gallery_remove_hint': 'Click Trash icon to remove any file',
    'report.no_media_title': 'No media attached yet',
    'report.no_media_desc': 'Add photos or videos above to proceed with hazard report',
    'report.total_attached': 'Total attached:',
    'report.next_location': 'Next: Location & Description',
    'report.location_title': 'Hazard Location & Description',
    'report.location_subtitle': 'Provide exact address or use high-precision device GPS capture.',
    'report.address_label': 'Hazard Address / Location',
    'report.address_placeholder': 'Street address or landmark',
    'report.detect_location': 'Detect My Present Location',
    'report.detecting_gps': 'Detecting GPS...',
    'report.desc_label': 'Describe the Hazard',
    'report.desc_placeholder': 'E.g., Open electric cables exposed on sidewalk near school entrance. Sparking observed after rain...',
    'report.back': 'Back',
    'report.submitting': 'Submitting...',
    'report.ai_review_title': 'AI Hazard Analysis & Department Mapping',
    'report.ai_review_subtitle': 'AI classified severity, checked duplicate reports nearby, and auto-routed to the responsible department.',
    'report.duplicate_alert': 'Existing Nearby Complaint Linked',
    'report.ai_vision_title': 'AI Vision Assessment',
    'report.certainty': 'Certainty',
    'report.safety_guidance': 'Safety Guidance:',
    'report.category_label': 'Hazard Category',
    'report.severity_label': 'Severity Level',
    'report.dept_label': 'Assigned Department',
    'report.success_title': 'Report Registered Successfully',
    'report.complaint_id': 'Complaint ID:',
    'report.success_desc': 'Save this Complaint ID to track real-time verification, worker assignment, and completion evidence.',
    'report.hazard_title_label': 'Hazard Title:',
    'report.routed_dept_label': 'Routed Department:',
    'report.emergency_level_label': 'Emergency Level:',
    'report.track_now': 'Track Complaint Status Now',
    'report.copy_id': 'Copy ID',
    'report.report_another': 'Report Another Hazard',

    // Landing Hero Section
    'landing.smart_platform_badge': 'Smart City Hazard Intelligence Platform',
    'landing.ai_accuracy_badge': '98.4% AI Verification Accuracy',
    'landing.hero_title_p1': 'Report Hazards Privately.',
    'landing.hero_title_p2': 'Make Your City Safer.',
    'landing.hero_description': 'SafeCity empowers citizens to report potholes, electrical hazards, pipe bursts, and safety risks in seconds with AI location detection, automated department routing, and live resolution verification.',
    'landing.report_now': 'Report Public Hazard Now',
    'landing.explore_map': 'Explore Live Hazard Map',
    'landing.active_hazards': 'Active Hazards',
    'landing.resolved_hazards': 'Resolved Hazards',
    'landing.emergency_hotspots': 'Emergency Hotspots',
    'landing.avg_response': 'Avg Response Velocity',
    
    // Landing Emergency Ticker
    'landing.emergency_title': 'Critical Emergency Hazards Under Dispatch',
    'landing.view_emergency_map': 'View On Emergency Map',

    // Landing Recent Hazards
    'landing.recent_title': 'Recent Public Hazards Reported',
    'landing.recent_subtitle': 'Live citizen submissions across smart city sectors',
    'landing.view_all_map': 'View All On Interactive Map',

    // Landing How It Works Section
    'landing.how_badge': 'Autonomous Pipeline',
    'landing.how_title': 'How SafeCity Solves Public Hazards',
    'landing.how_subtitle': 'End-to-end transparent hazard intelligence workflow powered by advanced AI vision models',
    'landing.step1_title': 'Anonymous Reporting',
    'landing.step1_desc': 'Upload photos/videos with automated browser GPS capture. No account registration needed.',
    'landing.step2_title': 'AI Analysis & Routing',
    'landing.step2_desc': 'AI classifies severity, checks duplicate hazards nearby, and routes to correct municipal department.',
    'landing.step3_title': 'Field Worker Dispatch',
    'landing.step3_desc': 'Department officers verify and assign specialized field technicians equipped with GPS routing.',
    'landing.step4_title': 'AI Completion Audit',
    'landing.step4_desc': 'Worker uploads before & after repair photos. AI calculates confidence score before closing complaint.',

    // Live Map & Risk Heatmap
    'map.title': 'Live Hazard Intelligence Map',
    'map.subtitle': 'Real-time geospatial hazard tracking, live GPS location detection & radius filtering',
    'map.detect_location': 'Detect My Live Location',
    'map.acquiring_gps': 'Acquiring GPS...',
    'map.report_hazard': 'Report Hazard',
    'map.active_center': 'Active Map Center / Live GPS',
    'map.search_placeholder': 'Search location/address (e.g., London, New York)...',
    'map.search_go': 'Go',
    'map.all_categories': 'All Categories',
    'map.all_statuses': 'All Statuses',
    'map.radius': 'Radius:',
    'map.nearby_hazards': 'Nearby Hazards',
    'map.sorted_distance': 'Sorted by distance from your live location',
    'map.click_inspect': 'Click to Inspect',
    'map.no_hazards': 'No hazards found matching current filters.',
    'map.emergency': 'Emergency',
    'map.center_map': 'Center Map',
    'map.full_details': 'Full Details',

    'heatmap.title': 'Public Risk & Hazard Heatmap',
    'heatmap.subtitle': 'GIS density analysis & high-risk emergency zones',
    'heatmap.all_categories': 'All Hazard Categories',
    'heatmap.active_center': 'Active GIS Map Center',
    'heatmap.high_density': 'Red Hotspot Zones',
    'heatmap.medium_density': 'Orange High Risk',
    'heatmap.low_density': 'Green Clear Zones',
    'heatmap.zones': 'Zones',
    'heatmap.city_area': 'City Area',
    'heatmap.zone_intensity': 'Zone Risk Intensity:',

    // Analytics
    'analytics.badge': 'Smart City Governance Analytics',
    'analytics.title': 'Public Hazard Intelligence Analytics',
    'analytics.subtitle': 'Real-time metrics on department response velocity, emergency dispatch speeds, category distribution, and public satisfaction rates.',
    'analytics.total_logged': 'Total Complaints Logged',
    'analytics.resolution_rate': 'City Resolution Rate',
    'analytics.avg_emergency': 'Avg Emergency Response',
    'analytics.ai_accuracy': 'AI Automated Accuracy',
    'analytics.category_dist': 'Hazard Category Distribution',
    'analytics.avg_res_dept': 'Avg Resolution Time by Department (Hours)',
    'analytics.leaderboard': 'Department Performance Leaderboard',
    'analytics.dept_col': 'Department',
    'analytics.total_col': 'Total Complaints',
    'analytics.resolved_col': 'Resolved',
    'analytics.pending_col': 'Pending',
    'analytics.emergency_col': 'Emergency Count',
    'analytics.avg_time_col': 'Avg Fix Time',
    'analytics.score_col': 'Public Score',
    'analytics.hrs': 'Hours',

    // Track & Evidence
    'track.portal': 'Citizen Transparency Portal',
    'track.title': 'Track Complaint Status & Evidence',
    'track.subtitle': 'Enter your unique Complaint ID (e.g., SC-2026-8921) to track verification, worker assignment, and completion evidence.',
    'track.placeholder': 'Enter Complaint ID (e.g. SC-2026-8921)',
    'track.button': 'Track Hazard',
    'track.quick_ids': 'Quick Test IDs:',
    'track.rejected_banner': 'COMPLAINT REJECTED',
    'track.officer_verdict': 'Officer Verdict:',
    'track.rejected_default_note': 'This hazard report was checked by the department officer and determined to be fake, duplicate, or invalid. No worker dispatch will be made.',
    'track.no_found': 'No Complaint Found for ID',
    'track.verify_id': 'Please verify the Complaint ID and try again.',
    'track.all_complaints': 'All Active City Complaints',

    // Modal Details
    'modal.title': 'View Full Details',
    'modal.hazard_info': 'Hazard Summary',
    'modal.status': 'Status:',
    'modal.department': 'Assigned Department:',
    'modal.location': 'Address:',
    'modal.severity': 'Severity:',
    'modal.reported_at': 'Reported',
    'modal.resolution_tracking': 'Resolution Progress Tracking',
    'modal.citizen_desc': 'Citizen Description',
    'modal.dispatched_worker': 'Dispatched Worker:',
    'modal.upvote': 'Upvote',
    'modal.share_link': 'Share Tracking Link',
    'modal.close': 'Close',
    'modal.rejected_title': 'Hazard Complaint Rejected (Marked Fake / Invalid)',
    'modal.verdict_satisfactory': 'Officer Re-Verification Verdict: SATISFACTORY (APPROVED)',
    'modal.satisfactory_default': 'Officer inspected maintenance repair work and confirmed resolution meets city standards.',
    'modal.verified_by': 'Verified By:',
    'modal.verdict_unsatisfactory': 'Officer Re-Verification Verdict: UNSATISFACTORY (REWORK REQUIRED)',
    'modal.reassigned_tech': 'Reassigned Technician for Rework:',
    'modal.photos_title': 'Reported Hazard Photos',
    'modal.videos_title': 'Hazard Video Recordings',
    'modal.media_rec': 'Media Recording',
    'modal.field_evidence': 'Field Technician Onsite Maintenance Evidence',
    'modal.ai_audit': 'AI Audit:',
    'modal.match': 'Match',
    'modal.before_maint': 'BEFORE Maintenance (Onsite Arrival)',
    'modal.before_videos': 'Before Video Recordings:',
    'modal.after_maint': 'AFTER Maintenance (Completed)',
    'modal.maint_in_progress': 'Maintenance repair in progress. Completion photos will be uploaded upon work resolution.',
    'modal.completion_videos': 'Completion Repair Videos:',
    'modal.worker_remarks': 'Worker Field Remarks:',
    'modal.audit_log': 'Official Audit Timeline Log',

    // Email & Share Complaint ID
    'report.email_section_title': 'Send Complaint ID & Details to your Gmail / Email',
    'report.email_placeholder': 'Enter your Gmail address (e.g. citizen@gmail.com)',
    'report.email_send_btn': 'Send to Gmail',
    'report.email_sent_success': 'Complaint ID tracking link dispatched to',
    'report.share_options_title': 'Share Complaint ID & Tracking Options',
    'report.share_whatsapp': 'Share on WhatsApp',
    'report.share_gmail': 'Open Draft in Gmail',
    'report.share_native': 'Share via System',

    'language.select': 'Language / भाषा',
    'language.en': 'English',
    'language.hi': 'हिंदी (Hindi)',
    'language.mr': 'मराठी (Marathi)',
  },
  hi: {
    // Navigation & Header
    'nav.live_intel': 'लाइव सिटी इंटेलिजेंस',
    'nav.emergency_hazards': 'आपातकालीन खतरा',
    'nav.emergency_hazards_plural': 'आपातकालीन खतरे सक्रिय',
    'nav.all_hazards_cleared': 'सभी गंभीर खतरों का समाधान कर दिया गया है',
    'nav.edit_profile': 'प्रोफ़ाइल संपादित करें',
    'nav.logout': 'लॉग आउट',
    'nav.citizen': 'नागरिक',
    'nav.officer': 'अधिकारी',
    'nav.worker': 'क्षेत्र कार्यकर्ता',
    'nav.admin': 'एडमिन',
    'nav.tab.home': 'होम',
    'nav.tab.report': 'खतरे की रिपोर्ट करें',
    'nav.tab.live_map': 'लाइव मैप',
    'nav.tab.risk_heatmap': 'जोखिम हीटमैप',
    'nav.tab.track': 'रिपोर्ट ट्रैक करें',
    'nav.tab.analytics': 'विश्लेषिकी',
    'nav.tab.department': 'विभाग डैशबोर्ड',
    'nav.tab.worker_portal': 'कार्यकर्ता पोर्टल',
    'nav.tab.system_admin': 'सिस्टम एडमिन',
    'nav.tab.architecture': 'वास्तुकला',

    // Buttons & Actions
    'btn.submit_report': 'रिपोर्ट जमा करें',
    'btn.cancel': 'रद्द करें',
    'btn.save': 'सहेजें',
    'btn.search': 'खोजें',
    'btn.filter': 'फ़िल्टर',
    'btn.upload_photo': 'फ़ोटो अपलोड करें',
    'btn.capture_location': 'जीपीएस स्थान कैप्चर करें',
    'btn.run_ai': 'एआई खतरा विश्लेषण चलाएं',
    'btn.flag_emergency': 'आपातकालीन प्राथमिकता के रूप में चिह्नित करें',
    'btn.view_details': 'विवरण देखें',
    'btn.track_id': 'शिकायत आईडी ट्रैक करें',

    // Statuses
    'status.submitted': 'प्रस्तुत',
    'status.verified': 'सत्यापित',
    'status.assigned': 'आवंटित',
    'status.in_progress': 'प्रगति पर',
    'status.work_submitted': 'कार्य प्रस्तुत',
    'status.resolved': 'हल किया गया',
    'status.rejected': 'अस्वीकृत',

    // Severity
    'severity.low': 'निम्न',
    'severity.medium': 'मध्यम',
    'severity.high': 'उच्च',
    'severity.critical': 'गंभीर',
    'severity.critical_emergency': '🚨 गंभीर आपातकाल',

    // Hazard Categories
    'category.road': 'सड़क का खतरा',
    'category.electrical': 'बिजली का खतरा',
    'category.water': 'जल/पाइप का खतरा',
    'category.sanitation': 'स्वच्छता/कचरा का खतरा',
    'category.environmental': 'पर्यावरण का खतरा',
    'category.safety': 'सार्वजनिक सुरक्षा का खतरा',
    'category.traffic': 'ट्रैफिक पुलिस / यातायात उल्लंघन',

    // Departments
    'dept.road': 'सड़क विभाग',
    'dept.electricity': 'बिजली विभाग',
    'dept.water': 'जल एवं सीवरेज विभाग',
    'dept.sanitation': 'स्वच्छता एवं कचरा प्रबंधन',
    'dept.environmental': 'पर्यावरण संरक्षण विभाग',
    'dept.safety': 'सार्वजनिक सुरक्षा एवं बुनियादी ढांचा',
    'dept.traffic': 'ट्रैफिक पुलिस विभाग',

    // Report Hazard View
    'report.wizard.step1': 'मीडिया अपलोड करें',
    'report.wizard.step2': 'स्थान और विवरण',
    'report.wizard.step3': 'एआई समीक्षा और मार्ग',
    'report.wizard.step4': 'प्रस्तुत किया गया',
    'report.step1_tag': 'चरण 1 का 3',
    'report.step2_tag': 'चरण 2 का 3',
    'report.step3_tag': 'चरण 3 का 3',
    'report.photos_count': 'तस्वीरें',
    'report.videos_count': 'वीडियो',
    'report.upload_title': 'खतरे के मीडिया अपलोड करें (फ़ोटो और वीडियो)',
    'report.upload_subtitle': 'एआई सत्यापन के लिए खतरे के स्थान की उच्च-रिज़ॉल्यूशन फ़ोटो और वीडियो रिकॉर्डिंग एक ही स्थान पर अपलोड करें।',
    'report.add_evidence_title': 'खतरे के प्रमाण फ़ाइलें जोड़ें',
    'report.add_evidence_desc': 'छवियां (JPG, PNG) या वीडियो रिकॉर्डिंग (MP4, WebM) अपलोड करें',
    'report.add_photos': 'फ़ोटो जोड़ें',
    'report.add_videos': 'वीडियो जोड़ें',
    'report.video_link_label': 'वीडियो लिंक:',
    'report.video_link_placeholder': 'या वीडियो लिंक (MP4, स्ट्रीम URL) पेस्ट करें...',
    'report.attach_link': 'लिंक जोड़ें',
    'report.gallery_title': 'संलग्न मीडिया गैलरी',
    'report.gallery_remove_hint': 'किसी भी फ़ाइल को हटाने के लिए ट्रैश आइकन पर क्लिक करें',
    'report.no_media_title': 'अभी तक कोई मीडिया संलग्न नहीं है',
    'report.no_media_desc': 'खतरे की रिपोर्ट के साथ आगे बढ़ने के लिए ऊपर फ़ोटो या वीडियो जोड़ें',
    'report.total_attached': 'कुल संलग्न:',
    'report.next_location': 'अगला: स्थान और विवरण',
    'report.location_title': 'खतरे का स्थान और विवरण',
    'report.location_subtitle': 'सटीक पता प्रदान करें या उच्च-सटीकता डिवाइस जीपीएस का उपयोग करें।',
    'report.address_label': 'खतरे का पता / स्थान',
    'report.address_placeholder': 'सड़क का पता या लैंडमार्क',
    'report.detect_location': 'मेरा वर्तमान स्थान पहचानें',
    'report.detecting_gps': 'जीपीएस पहचाना जा रहा है...',
    'report.desc_label': 'खतरे का वर्णन करें',
    'report.desc_placeholder': 'उदा., स्कूल के प्रवेश द्वार के पास फुटपाथ पर खुले बिजली के तार। बारिश के बाद चिंगारी देखी गई...',
    'report.back': 'पीछे',
    'report.submitting': 'जमा हो रहा है...',
    'report.ai_review_title': 'एआई खतरा विश्लेषण एवं विभाग मैपिंग',
    'report.ai_review_subtitle': 'एआई ने गंभीरता का वर्गीकरण किया, पास की डुप्लिकेट रिपोर्ट की जांच की और जिम्मेदार विभाग को स्वचालित रूप से भेजा।',
    'report.duplicate_alert': 'मौजूदा निकटवर्ती शिकायत लिंक की गई',
    'report.ai_vision_title': 'एआई विजन आकलन',
    'report.certainty': 'निश्चितता',
    'report.safety_guidance': 'सुरक्षा निर्देश:',
    'report.category_label': 'खतरे की श्रेणी',
    'report.severity_label': 'गंभीरता का स्तर',
    'report.dept_label': 'आवंटित विभाग',
    'report.success_title': 'रिपोर्ट सफलतापूर्वक दर्ज की गई',
    'report.complaint_id': 'शिकायत आईडी:',
    'report.success_desc': 'रियल-टाइम सत्यापन, कार्यकर्ता आवंटन और पूर्णता साक्ष्य को ट्रैक करने के लिए इस शिकायत आईडी को सहेजें।',
    'report.hazard_title_label': 'खतरे का शीर्षक:',
    'report.routed_dept_label': 'रूट किया गया विभाग:',
    'report.emergency_level_label': 'आपातकालीन स्तर:',
    'report.track_now': 'अभी शिकायत की स्थिति ट्रैक करें',
    'report.copy_id': 'आईडी कॉपी करें',
    'report.report_another': 'किसी अन्य खतरे की रिपोर्ट करें',

    // Landing Hero Section
    'landing.smart_platform_badge': 'स्मार्ट सिटी खतरा इंटेलिजेंस प्लेटफॉर्म',
    'landing.ai_accuracy_badge': '98.4% एआई सत्यापन सटीकता',
    'landing.hero_title_p1': 'गोपनीय रूप से खतरों की रिपोर्ट करें।',
    'landing.hero_title_p2': 'अपने शहर को अधिक सुरक्षित बनाएं।',
    'landing.hero_description': 'सेफसिटी नागरिकों को एआई स्थान पहचान, स्वचालित विभाग आवंटन और लाइव सत्यापन के साथ सेकंडों में गड्ढों, बिजली के खतरों और पाइप टूटने की रिपोर्ट करने में सक्षम बनाती है।',
    'landing.report_now': 'अभी सार्वजनिक खतरे की रिपोर्ट करें',
    'landing.explore_map': 'लाइव खतरा मैप देखें',
    'landing.active_hazards': 'सक्रिय खतरे',
    'landing.resolved_hazards': 'हल किए गए खतरे',
    'landing.emergency_hotspots': 'आपातकालीन हॉटस्पॉट',
    'landing.avg_response': 'औसत प्रतिक्रिया समय',

    // Landing Emergency Ticker
    'landing.emergency_title': 'प्रेषण के तहत गंभीर आपातकालीन खतरे',
    'landing.view_emergency_map': 'आपातकालीन मानचित्र पर देखें',

    // Landing Recent Hazards
    'landing.recent_title': 'हाल ही में रिपोर्ट किए गए सार्वजनिक खतरे',
    'landing.recent_subtitle': 'स्मार्ट सिटी क्षेत्रों से लाइव नागरिक प्रस्तुतियाँ',
    'landing.view_all_map': 'इंटरएक्टिव मैप पर सभी देखें',

    // Landing How It Works Section
    'landing.how_badge': 'स्वचालित प्रक्रिया',
    'landing.how_title': 'सेफसिटी सार्वजनिक खतरों को कैसे हल करती है',
    'landing.how_subtitle': 'उन्नत एआई विजन मॉडल द्वारा संचालित एंड-टू-एंड पारदर्शी खतरा समाधान कार्यप्रवाह',
    'landing.step1_title': 'अनाम रिपोर्टिंग',
    'landing.step1_desc': 'ऑटोमेटेड जीपीएस कैप्चर के साथ फोटो/वीडियो अपलोड करें। किसी खाते की आवश्यकता नहीं।',
    'landing.step2_title': 'एआई विश्लेषण और रूटिंग',
    'landing.step2_desc': 'एआई गंभीरता का वर्गीकरण करता है, पास के डुप्लिकेट खतरों की जांच करता है और सही नगर निगम विभाग को भेजता है।',
    'landing.step3_title': 'फील्ड कार्यकर्ता प्रेषण',
    'landing.step3_desc': 'विभाग अधिकारी सत्यापित करते हैं और जीपीएस रूटिंग से लैस विशेष क्षेत्र तकनीशियनों को आवंटित करते हैं।',
    'landing.step4_title': 'एआई समापन ऑडिट',
    'landing.step4_desc': 'कार्यकर्ता मरम्मत से पहले और बाद की तस्वीरें अपलोड करता है। शिकायत बंद करने से पहले एआई विश्वसनीयता स्कोर की गणना करता है।',

    // Live Map & Risk Heatmap
    'map.title': 'लाइव खतरा इंटेलिजेंस मैप',
    'map.subtitle': 'रियल-टाइम भू-स्थानिक खतरा ट्रैकिंग, लाइव जीपीएस स्थान पहचान और दायरा फ़िल्टरिंग',
    'map.detect_location': 'मेरा लाइव स्थान पहचानें',
    'map.acquiring_gps': 'जीपीएस प्राप्त किया जा रहा है...',
    'map.report_hazard': 'खतरे की रिपोर्ट करें',
    'map.active_center': 'सक्रिय मानचित्र केंद्र / लाइव जीपीएस',
    'map.search_placeholder': 'स्थान/पता खोजें (उदा., मुंबई, बेलापुर)...',
    'map.search_go': 'खोजें',
    'map.all_categories': 'सभी श्रेणियां',
    'map.all_statuses': 'सभी स्थितियां',
    'map.radius': 'दायरा:',
    'map.nearby_hazards': 'आस-पास के खतरे',
    'map.sorted_distance': 'आपके वर्तमान स्थान से दूरी के अनुसार सूचीबद्ध',
    'map.click_inspect': 'जांच के लिए क्लिक करें',
    'map.no_hazards': 'वर्तमान फ़िल्टर से मेल खाने वाला कोई खतरा नहीं मिला।',
    'map.emergency': 'आपातकाल',
    'map.center_map': 'मैप केंद्रित करें',
    'map.full_details': 'पूरा विवरण',

    'heatmap.title': 'सार्वजनिक जोखिम एवं खतरा हीटमैप',
    'heatmap.subtitle': 'जीआईएस घनत्व विश्लेषण और उच्च जोखिम वाले आपातकालीन क्षेत्र',
    'heatmap.all_categories': 'सभी खतरा श्रेणियां',
    'heatmap.active_center': 'सक्रिय जीआईएस मानचित्र केंद्र',
    'heatmap.high_density': 'लाल हॉटस्पॉट क्षेत्र',
    'heatmap.medium_density': 'नारंगी उच्च जोखिम',
    'heatmap.low_density': 'हरा सुरक्षित क्षेत्र',
    'heatmap.zones': 'क्षेत्र',
    'heatmap.city_area': 'शहर का क्षेत्र',
    'heatmap.zone_intensity': 'क्षेत्र जोखिम तीव्रता:',

    // Analytics
    'analytics.badge': 'स्मार्ट सिटी शासन विश्लेषण',
    'analytics.title': 'सार्वजनिक खतरा इंटेलिजेंस विश्लेषण',
    'analytics.subtitle': 'विभाग की प्रतिक्रिया गति, आपातकालीन प्रेषण गति, श्रेणी वितरण और सार्वजनिक संतुष्टि दरों पर रियल-टाइम मेट्रिक्स।',
    'analytics.total_logged': 'कुल दर्ज शिकायतें',
    'analytics.resolution_rate': 'शहर समाधान दर',
    'analytics.avg_emergency': 'औसत आपातकालीन प्रतिक्रिया',
    'analytics.ai_accuracy': 'एआई स्वचालित सटीकता',
    'analytics.category_dist': 'खतरा श्रेणी वितरण',
    'analytics.avg_res_dept': 'विभाग द्वारा औसत समाधान समय (घंटे)',
    'analytics.leaderboard': 'विभाग प्रदर्शन लीडरबोर्ड',
    'analytics.dept_col': 'विभाग',
    'analytics.total_col': 'कुल शिकायतें',
    'analytics.resolved_col': 'हल की गईं',
    'analytics.pending_col': 'लंबित',
    'analytics.emergency_col': 'आपातकालीन संख्या',
    'analytics.avg_time_col': 'औसत ठीक करने का समय',
    'analytics.score_col': 'सार्वजनिक स्कोर',
    'analytics.hrs': 'घंटे',

    // Card UI
    'card.citizens': 'नागरिक',
    'card.track_status': 'स्थिति ट्रैक करें',
    'card.citizens_upvoted': 'नागरिकों ने अपवोट किया',
    'card.upvote': 'अपवोट',

    // Track & Evidence
    'track.portal': 'नागरिक पारदर्शिता पोर्टल',
    'track.title': 'शिकायत की स्थिति और साक्ष्य ट्रैक करें',
    'track.subtitle': 'सत्यापन, कार्यकर्ता आवंटन और समापन साक्ष्य को ट्रैक करने के लिए अपनी विशिष्ट शिकायत आईडी दर्ज करें (उदा. SC-2026-8921)।',
    'track.placeholder': 'शिकायत आईडी दर्ज करें (उदा. SC-2026-8921)',
    'track.button': 'खतरा ट्रैक करें',
    'track.quick_ids': 'त्वरित परीक्षण आईडी:',
    'track.rejected_banner': 'शिकायत अस्वीकृत',
    'track.officer_verdict': 'अधिकारी का निर्णय:',
    'track.rejected_default_note': 'इस खतरा रिपोर्ट की विभाग अधिकारी द्वारा जांच की गई और इसे नकली, डुप्लिकेट या अमान्य पाया गया। कोई कार्यकर्ता नहीं भेजा जाएगा।',
    'track.no_found': 'आईडी के लिए कोई शिकायत नहीं मिली',
    'track.verify_id': 'कृपया शिकायत आईडी सत्यापित करें और पुनः प्रयास करें।',
    'track.all_complaints': 'शहर की सभी सक्रिय शिकायतें',

    // Modal Details
    'modal.title': 'पूरा विवरण देखें',
    'modal.hazard_info': 'खतरे का सारांश',
    'modal.status': 'स्थिति:',
    'modal.department': 'आवंटित विभाग:',
    'modal.location': 'पता:',
    'modal.severity': 'गंभीरता:',
    'modal.reported_at': 'रिपोर्ट दर्ज',
    'modal.resolution_tracking': 'समाधान प्रगति ट्रैकिंग',
    'modal.citizen_desc': 'नागरिक विवरण',
    'modal.dispatched_worker': 'भेजा गया कार्यकर्ता:',
    'modal.upvote': 'अपवोट',
    'modal.share_link': 'ट्रैकिंग लिंक साझा करें',
    'modal.close': 'बंद करें',
    'modal.rejected_title': 'खतरा शिकायत अस्वीकृत (नकली / अमान्य चिह्नित)',
    'modal.verdict_satisfactory': 'अधिकारी पुन: सत्यापन निर्णय: संतोषजनक (स्वीकृत)',
    'modal.satisfactory_default': 'अधिकारी ने रखरखाव मरम्मत कार्य का निरीक्षण किया और पुष्टि की कि समाधान शहर के मानकों को पूरा करता है।',
    'modal.verified_by': 'सत्यापितकर्ता:',
    'modal.verdict_unsatisfactory': 'अधिकारी पुन: सत्यापन निर्णय: असंतोषजनक (पुनः कार्य आवश्यक)',
    'modal.reassigned_tech': 'पुनः कार्य के लिए पुन: सौंपे गए तकनीशियन:',
    'modal.photos_title': 'रिपोर्ट की गई खतरे की तस्वीरें',
    'modal.videos_title': 'खतरे की वीडियो रिकॉर्डिंग',
    'modal.media_rec': 'मीडिया रिकॉर्डिंग',
    'modal.field_evidence': 'क्षेत्र तकनीशियन ऑनसाइट रखरखाव साक्ष्य',
    'modal.ai_audit': 'एआई ऑडिट:',
    'modal.match': 'मैच',
    'modal.before_maint': 'रखरखाव से पहले (ऑनसाइट आगमन)',
    'modal.before_videos': 'पहले की वीडियो रिकॉर्डिंग:',
    'modal.after_maint': 'रखरखाव के बाद (पूरा हुआ)',
    'modal.maint_in_progress': 'रखरखाव मरम्मत प्रगति पर है। कार्य समाधान होने पर पूर्णता की तस्वीरें अपलोड की जाएंगी।',
    'modal.completion_videos': 'समापन मरम्मत वीडियो:',
    'modal.worker_remarks': 'कार्यकर्ता की टिप्पणी:',
    'modal.audit_log': 'आधिकारिक ऑडिट टाइमलाइन लॉग',

    // Email & Share Complaint ID
    'report.email_section_title': 'शिकायत आईडी और विवरण अपने जीमेल / ईमेल पर भेजें',
    'report.email_placeholder': 'अपना जीमेल पता दर्ज करें (उदा. citizen@gmail.com)',
    'report.email_send_btn': 'जीमेल पर भेजें',
    'report.email_sent_success': 'शिकायत आईडी ट्रैकिंग लिंक सफलतापूर्वक भेजा गया',
    'report.share_options_title': 'शिकायत आईडी और ट्रैकिंग विकल्प साझा करें',
    'report.share_whatsapp': 'व्हाट्सएप पर साझा करें',
    'report.share_gmail': 'जीमेल ड्राफ्ट खोलें',
    'report.share_native': 'सिस्टम द्वारा साझा करें',

    'language.select': 'भाषा (Language)',
    'language.en': 'English',
    'language.hi': 'हिंदी (Hindi)',
    'language.mr': 'मराठी (Marathi)',
  },
  mr: {
    // Navigation & Header
    'nav.live_intel': 'लाईव्ह सिटी इंटेलिजन्स',
    'nav.emergency_hazards': 'आणीबाणीचा धोका',
    'nav.emergency_hazards_plural': 'आणीबाणीचे धोके सक्रिय',
    'nav.all_hazards_cleared': 'सर्व गंभीर धोके पूर्णपणे सोडवले गेले आहेत',
    'nav.edit_profile': 'प्रोफाइल संपादित करा',
    'nav.logout': 'लॉगआउट',
    'nav.citizen': 'नागरिक',
    'nav.officer': 'अधिकारी',
    'nav.worker': 'क्षेत्र कामगार',
    'nav.admin': 'ॲडमिन',
    'nav.tab.home': 'होम',
    'nav.tab.report': 'धोक्याची नोंद करा',
    'nav.tab.live_map': 'लाईव्ह मॅप',
    'nav.tab.risk_heatmap': 'जोखीम हीटमॅप',
    'nav.tab.track': 'तक्रार ट्रॅक करा',
    'nav.tab.analytics': 'विश्लेषण',
    'nav.tab.department': 'विभाग डॅशबोर्ड',
    'nav.tab.worker_portal': 'कामगार पोर्टल',
    'nav.tab.system_admin': 'सिस्टम ॲडमिन',
    'nav.tab.architecture': 'आर्किटेक्चर',

    // Buttons & Actions
    'btn.submit_report': 'अहवाल सादर करा',
    'btn.cancel': 'रद्द करा',
    'btn.save': 'जतन करा',
    'btn.search': 'शोधा',
    'btn.filter': 'फिल्टर',
    'btn.upload_photo': 'फोटो अपलोड करा',
    'btn.capture_location': 'जीपीएस लोकेशन नोंदवा',
    'btn.run_ai': 'एआई धोका विश्लेषण चालवा',
    'btn.flag_emergency': 'आणीबाणी प्राधान्य म्हणून चिन्हांकित करा',
    'btn.view_details': 'तपशील पहा',
    'btn.track_id': 'तक्रार आयडी ट्रॅक करा',

    // Statuses
    'status.submitted': 'सबमिट केले',
    'status.verified': 'सत्यापित',
    'status.assigned': 'नियुक्त केले',
    'status.in_progress': 'प्रगतीपथावर',
    'status.work_submitted': 'काम सादर केले',
    'status.resolved': 'निवारण झाले',
    'status.rejected': 'नाकारले',

    // Severity
    'severity.low': 'कमी',
    'severity.medium': 'मध्यम',
    'severity.high': 'जास्त',
    'severity.critical': 'गंभीर',
    'severity.critical_emergency': '🚨 गंभीर आणीबाणी',

    // Hazard Categories
    'category.road': 'रस्त्याचा धोका',
    'category.electrical': 'विजेचा धोका',
    'category.water': 'पाण्याचा धोका',
    'category.sanitation': 'स्वच्छतेचा धोका',
    'category.environmental': 'पर्यावरणाचा धोका',
    'category.safety': 'सार्वजनिक सुरक्षेचा धोका',
    'category.traffic': 'ट्रॅफिक पोलीस / वाहतूक उल्लंघन',

    // Departments
    'dept.road': 'रस्ते विभाग',
    'dept.electricity': 'विद्युत विभाग',
    'dept.water': 'पाणी व सांडपाणी विभाग',
    'dept.sanitation': 'स्वच्छता व कचरा व्यवस्थापन',
    'dept.environmental': 'पर्यावरण संरक्षण विभाग',
    'dept.safety': 'सार्वजनिक सुरक्षा व पायाभूत सुविधा',
    'dept.traffic': 'ट्रॅफिक पोलीस विभाग',

    // Report Hazard View
    'report.wizard.step1': 'मीडिया अपलोड करा',
    'report.wizard.step2': 'स्थान आणि तपशील',
    'report.wizard.step3': 'एआय पुनरावलोकन आणि मार्ग',
    'report.wizard.step4': 'सबमिट केले',
    'report.step1_tag': 'टप्पा 1 पैकी 3',
    'report.step2_tag': 'टप्पा 2 पैकी 3',
    'report.step3_tag': 'टप्पा 3 पैकी 3',
    'report.photos_count': 'फोटो',
    'report.videos_count': 'व्हिडिओ',
    'report.upload_title': 'धोक्याचे मीडिया अपलोड करा (फोटो आणि व्हिडिओ)',
    'report.upload_subtitle': 'एआय पडताळणीसाठी धोक्याच्या ठिकाणाचे उच्च-गुणवत्तेचे फोटो आणि व्हिडिओ रेकॉर्डिंग एकाच ठिकाणी अपलोड करा.',
    'report.add_evidence_title': 'धोक्याचे पुरावे फायली जोडा',
    'report.add_evidence_desc': 'प्रतिमा (JPG, PNG) किंवा व्हिडिओ रेकॉर्डिंग (MP4, WebM) अपलोड करा',
    'report.add_photos': 'फोटो जोडा',
    'report.add_videos': 'व्हिडिओ जोडा',
    'report.video_link_label': 'व्हिडिओ लिंक:',
    'report.video_link_placeholder': 'किंवा व्हिडिओ लिंक (MP4, स्ट्रीम URL) पेस्ट करा...',
    'report.attach_link': 'लिंक जोडा',
    'report.gallery_title': 'संलग्न मीडिया गॅलरी',
    'report.gallery_remove_hint': 'कोणतीही फाइल काढून टाकण्यासाठी कचराकुंडी आयकॉनवर क्लिक करा',
    'report.no_media_title': 'अद्याप कोणतेही मीडिया जोडलेले नाही',
    'report.no_media_desc': 'धोक्याचा अहवाल सुरू ठेवण्यासाठी वर फोटो किंवा व्हिडिओ जोडा',
    'report.total_attached': 'एकूण जोडलेले:',
    'report.next_location': 'पुढील: स्थान आणि वर्णन',
    'report.location_title': 'धोक्याचे स्थान आणि वर्णन',
    'report.location_subtitle': 'अचूक पत्ता द्या किंवा उच्च-अचूकता डिव्हाइस जीपीएस वापरा.',
    'report.address_label': 'धोक्याचा पत्ता / स्थान',
    'report.address_placeholder': 'रस्त्याचा पत्ता किंवा लँडमार्क',
    'report.detect_location': 'माझे सध्याचे स्थान शोधा',
    'report.detecting_gps': 'जीपीएस शोधत आहे...',
    'report.desc_label': 'धोक्याचे वर्णन करा',
    'report.desc_placeholder': 'उदा., शाळेच्या प्रवेशद्वाराजवळ पदपथावर उघड्या विजेच्या तारा. पावसानंतर ठिणग्या दिसल्या...',
    'report.back': 'मागे',
    'report.submitting': 'सबमिट होत आहे...',
    'report.ai_review_title': 'एआय धोका विश्लेषण आणि विभाग मॅपिंग',
    'report.ai_review_subtitle': 'एआयने तीव्रतेचे वर्गीकरण केले, जवळपासच्या डुप्लिकेट अहवालांची तपासणी केली आणि जबाबदार विभागाकडे स्वयंचलितपणे पाठवले.',
    'report.duplicate_alert': 'विद्यमान जवळपासची तक्रार लिंक केली',
    'report.ai_vision_title': 'एआय व्हिजन मूल्यमापन',
    'report.certainty': 'खात्री',
    'report.safety_guidance': 'सुरक्षा मार्गदर्शक:',
    'report.category_label': 'धोक्याचा वर्ग',
    'report.severity_label': 'तीव्रता पातळी',
    'report.dept_label': 'नियुक्त विभाग',
    'report.success_title': 'अहवाल यशस्वीरित्या नोंदवला गेला',
    'report.complaint_id': 'तक्रार आयडी:',
    'report.success_desc': 'रिअल-टाइम पडताळणी, कामगार नियुक्ती आणि पूर्णतेचे पुरावे ट्रॅक करण्यासाठी हा तक्रार आयडी जतन करा.',
    'report.hazard_title_label': 'धोक्याचे शीर्षक:',
    'report.routed_dept_label': 'मार्गस्थ विभाग:',
    'report.emergency_level_label': 'आणीबाणी पातळी:',
    'report.track_now': 'आत्ताच तक्रार स्थिती ट्रॅक करा',
    'report.copy_id': 'आयडी कॉपी करा',
    'report.report_another': 'दुसऱ्या धोक्याची नोंद करा',

    // Landing Hero Section
    'landing.smart_platform_badge': 'स्मार्ट सिटी जोखीम नियंत्रण व्यासपीठ',
    'landing.ai_accuracy_badge': '98.4% एआय पडताळणी अचूकता',
    'landing.hero_title_p1': 'खासगीरीत्या धोक्यांची नोंद करा.',
    'landing.hero_title_p2': 'तुमचे शहर अधिक सुरक्षित करा.',
    'landing.hero_description': 'सेफसिटी नागरिकांना एआय लोकेशन डिटेक्शन, स्वयंचलित विभाग मार्ग आणि थेट निराकरण पडताळणीसह काही सेकंदात खड्डे, विजेचे धोके आणि पाईप फुटल्याची नोंद करण्यास सक्षम करते.',
    'landing.report_now': 'आत्ताच सार्वजनिक धोक्याची नोंद करा',
    'landing.explore_map': 'लाईव्ह धोका नकाशा पहा',
    'landing.active_hazards': 'सक्रिय धोके',
    'landing.resolved_hazards': 'निवारण झालेले धोके',
    'landing.emergency_hotspots': 'आणीबाणी हॉटस्पॉट',
    'landing.avg_response': 'सरासरी प्रतिसाद वेळ',

    // Landing Emergency Ticker
    'landing.emergency_title': 'नियुक्तीखालील गंभीर आणीबाणीचे धोके',
    'landing.view_emergency_map': 'आणीबाणी नकाशावर पहा',

    // Landing Recent Hazards
    'landing.recent_title': 'नुकतेच नोंदवलेले सार्वजनिक धोके',
    'landing.recent_subtitle': 'स्मार्ट सिटी क्षेत्रांमधील थेट नागरिक नोंदी',
    'landing.view_all_map': 'इंटरअॅक्टिव्ह नकाशावर सर्व पहा',

    // Landing How It Works Section
    'landing.how_badge': 'स्वयंचलित प्रक्रिया',
    'landing.how_title': 'सेफसिटी सार्वजनिक धोके कसे सोडवते',
    'landing.how_subtitle': 'प्रगत एआय व्हिजन मॉडेलद्वारे संचलित पारदर्शक धोका निवारण कार्यप्रवाह',
    'landing.step1_title': 'अनामित नोंदणी',
    'landing.step1_desc': 'ऑटोमेटेड जीपीएस सह फोटो/व्हिडिओ अपलोड करा. कोणत्याही खात्याची गरज नाही.',
    'landing.step2_title': 'एआय विश्लेषण आणि मार्ग',
    'landing.step2_desc': 'एआय तीव्रतेचे वर्गीकरण करते, जवळपासचे डुप्लिकेट धोके तपासते आणि योग्य महापालिका विभागाकडे पाठवते.',
    'landing.step3_title': 'क्षेत्र कामगार नियुक्ती',
    'landing.step3_desc': 'विभाग अधिकारी पडताळणी करतात आणि जीपीएस मार्गदर्शनासह विशेष क्षेत्र तंत्रज्ञांची नियुक्ती करतात.',
    'landing.step4_title': 'एआय पूर्णता ऑडिट',
    'landing.step4_desc': 'कामगार दुरुस्तीपूर्वीचे आणि नंतरचे फोटो अपलोड करतो. तक्रार बंद करण्यापूर्वी एआय अचूकता स्कोअरची गणना करते.',

    // Live Map & Risk Heatmap
    'map.title': 'लाईव्ह धोका इंटेलिजन्स नकाशा',
    'map.subtitle': 'रिअल-टाइम भू-स्थानिक धोका ट्रॅकिंग, लाईव्ह जीपीएस स्थान ओळख आणि त्रिज्या फिल्टरिंग',
    'map.detect_location': 'माझे लाईव्ह स्थान शोधा',
    'map.acquiring_gps': 'जीपीएस शोधत आहे...',
    'map.report_hazard': 'धोक्याची नोंद करा',
    'map.active_center': 'सक्रिय नकाशा केंद्र / लाईव्ह जीपीएस',
    'map.search_placeholder': 'स्थान/पत्ता शोधा (उदा., मुंबई, पुणे, बेलापूर)...',
    'map.search_go': 'शोधा',
    'map.all_categories': 'सर्व वर्ग',
    'map.all_statuses': 'सर्व स्थिती',
    'map.radius': 'त्रिज्या:',
    'map.nearby_hazards': 'जवळपासचे धोके',
    'map.sorted_distance': 'तुमच्या स्थानावरील अंतराच्या क्रमानुसार',
    'map.click_inspect': 'तपासण्यासाठी क्लिक करा',
    'map.no_hazards': 'निवडलेल्या फिल्टरनुसार कोणताही धोका आढळला नाही.',
    'map.emergency': 'आणीबाणी',
    'map.center_map': 'नकाशा केंद्रित करा',
    'map.full_details': 'पूर्ण तपशील',

    'heatmap.title': 'सार्वजनिक जोखीम आणि धोका हीटमॅप',
    'heatmap.subtitle': 'जीआयएस घनता विश्लेषण आणि उच्च-जोखीम आणीबाणीचे क्षेत्र',
    'heatmap.all_categories': 'सर्व धोका वर्ग',
    'heatmap.active_center': 'सक्रिय जीआयएस नकाशा केंद्र',
    'heatmap.high_density': 'लाल हॉटस्पॉट क्षेत्र',
    'heatmap.medium_density': 'नारंगी उच्च जोखीम',
    'heatmap.low_density': 'हिरवा सुरक्षित भाग',
    'heatmap.zones': 'क्षेत्रे',
    'heatmap.city_area': 'शहर क्षेत्र',
    'heatmap.zone_intensity': 'क्षेत्र जोखीम तीव्रता:',

    // Analytics
    'analytics.badge': 'स्मार्ट सिटी गव्हर्नन्स विश्लेषण',
    'analytics.title': 'सार्वजनिक धोका बुद्धिमत्ता विश्लेषण',
    'analytics.subtitle': 'विभागाचा प्रतिसाद वेग, आणीबाणीचा तातडीने निपटारा, वर्गवारी वितरण आणि सार्वजनिक समाधान दरांवरील रिअल-टाइम आकडेवारी.',
    'analytics.total_logged': 'एकूण नोंदवलेल्या तक्रारी',
    'analytics.resolution_rate': 'शहर निवारण दर',
    'analytics.avg_emergency': 'सरासरी आणीबाणी प्रतिसाद',
    'analytics.ai_accuracy': 'एआय स्वयंचलित अचूकता',
    'analytics.category_dist': 'धोका वर्गवारी वितरण',
    'analytics.avg_res_dept': 'विभागांनुसार सरासरी निवारण वेळ (तास)',
    'analytics.leaderboard': 'विभाग कार्यक्षमता लीडरबोर्ड',
    'analytics.dept_col': 'विभाग',
    'analytics.total_col': 'एकूण तक्रारी',
    'analytics.resolved_col': 'सोडवलेल्या',
    'analytics.pending_col': 'प्रलंबित',
    'analytics.emergency_col': 'आणीबाणी संख्या',
    'analytics.avg_time_col': 'सरासरी दुरुस्ती वेळ',
    'analytics.score_col': 'सार्वजनिक स्कोअर',
    'analytics.hrs': 'तास',

    // Track & Evidence
    'track.portal': 'नागरिक पारदर्शकता पोर्टल',
    'track.title': 'तक्रार स्थिती आणि पुरावे ट्रॅक करा',
    'track.subtitle': 'पडताळणी, कामगार वाटप आणि काम पूर्ण पुरावे ट्रॅक करण्यासाठी तुमची युनिक तक्रार आयडी प्रविष्ट करा (उदा. SC-2026-8921).',
    'track.placeholder': 'तक्रार आयडी प्रविष्ट करा (उदा. SC-2026-8921)',
    'track.button': 'धोका ट्रॅक करा',
    'track.quick_ids': 'जलद चाचणी आयडी:',
    'track.rejected_banner': 'तक्रार नाकारली',
    'track.officer_verdict': 'अधिकार्‍याचा निर्णय:',
    'track.rejected_default_note': 'या धोक्याच्या अहवालाची विभाग अधिकार्‍याकडून तपासणी केली गेली आणि तो बनावट, डुप्लिकेट किंवा अमान्य असल्याचे आढळले. कोणताही कामगार पाठवला जाणार नाही.',
    'track.no_found': 'आयडीसाठी कोणतीही तक्रार आढळली नाही',
    'track.verify_id': 'कृपया तक्रार आयडी सत्यापित करा आणि पुन्हा प्रयत्न करा.',
    'track.all_complaints': 'शहरातील सर्व सक्रिय तक्रारी',

    // Modal Details
    'modal.title': 'पूर्ण तपशील पहा',
    'modal.hazard_info': 'धोक्याचा सारांश',
    'modal.status': 'स्थिती:',
    'modal.department': 'नियुक्त विभाग:',
    'modal.location': 'पत्ता:',
    'modal.severity': 'गंभीरता:',
    'modal.reported_at': 'नोंदवले',
    'modal.resolution_tracking': 'निवारण प्रगती ट्रॅकिंग',
    'modal.citizen_desc': 'नागरिक वर्णन',
    'modal.dispatched_worker': 'पाठवलेला कामगार:',
    'modal.upvote': 'अपव्होट',
    'modal.share_link': 'ट्रॅकिंग लिंक शेअर करा',
    'modal.close': 'बंद करा',
    'modal.rejected_title': 'धोका तक्रार नाकारली (बनावट / अमान्य चिन्हांकित)',
    'modal.verdict_satisfactory': 'अधिकारी पुन: पडताळणी निर्णय: समाधानकारक (मंजूर)',
    'modal.satisfactory_default': 'अधिकार्‍याने दुरुस्ती कामाची पाहणी केली आणि ते शहराच्या मानकांनुसार असल्याची पुष्टी केली.',
    'modal.verified_by': 'पडताळणीकर्ता:',
    'modal.verdict_unsatisfactory': 'अधिकारी पुन: पडताळणी निर्णय: असमाधानकारक (पुन्हा काम आवश्यक)',
    'modal.reassigned_tech': 'पुन्हा कामासाठी नियुक्त तंत्रज्ञ:',
    'modal.photos_title': 'नोंदवलेल्या धोक्याचे फोटो',
    'modal.videos_title': 'धोक्याचे व्हिडिओ रेकॉर्डिंग',
    'modal.media_rec': 'मीडिया रेकॉर्डिंग',
    'modal.field_evidence': 'क्षेत्र तंत्रज्ञ ऑनसाइट दुरुस्ती पुरावे',
    'modal.ai_audit': 'एआई ऑडिट:',
    'modal.match': 'साम्य',
    'modal.before_maint': 'दुरुस्तीपूर्वी (ऑनसाइट आगमन)',
    'modal.before_videos': 'पूर्वीचे व्हिडिओ रेकॉर्डिंग:',
    'modal.after_maint': 'दुरुस्तीनंतर (पूर्ण झालेले)',
    'modal.maint_in_progress': 'दुरुस्तीचे काम सुरू आहे. काम पूर्ण झाल्यावर फोटो अपलोड केले जातील.',
    'modal.completion_videos': 'काम पूर्णतेचे व्हिडिओ:',
    'modal.worker_remarks': 'कामगाराच्या नोंदी:',
    'modal.audit_log': 'अधिकृत ऑडिट टाइमलाइन लॉग',

    // Email & Share Complaint ID
    'report.email_section_title': 'तक्रार आयडी आणि तपशील तुमच्या जीमेल / ईमेलवर पाठवा',
    'report.email_placeholder': 'तुमचा जीमेल पत्ता प्रविष्ट करा (उदा. citizen@gmail.com)',
    'report.email_send_btn': 'जीमेलवर पाठवा',
    'report.email_sent_success': 'तक्रार आयडी ट्रॅकिंग लिंक यशस्वीरित्या पाठवली',
    'report.share_options_title': 'तक्रार आयडी आणि ट्रॅकिंग पर्याय शेअर करा',
    'report.share_whatsapp': 'व्हॉट्सॲपवर शेअर करा',
    'report.share_gmail': 'जीमेल ड्राफ्ट उघडा',
    'report.share_native': 'सिस्टमद्वारे शेअर करा',

    // Card UI
    'card.citizens': 'नागरिक',
    'card.track_status': 'स्थिती ट्रॅक करा',
    'card.citizens_upvoted': 'नागरिकांनी अपव्होट केले',
    'card.upvote': 'अपव्होट',

    'language.select': 'भाषा (Language)',
    'language.en': 'English',
    'language.hi': 'हिंदी (Hindi)',
    'language.mr': 'मराठी (Marathi)',
  },
};

const textTranslations: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    // Complaint Titles
    'Exposed High Voltage Cable near Oak Elementary': 'ओक एलीमेंट्री के पास खुला हाई वोल्टेज केबल',
    'Exposed High-Voltage Cable on School Walkway': 'स्कूल के पैदल पथ पर खुला हाई-वोल्टेज केबल',
    'Deep Pothole Causing Vehicle Axle Damage': 'वाहन के धुरे को नुकसान पहुंचाने वाला गहरा गड्ढा',
    'Deep Pothole Causing Traffic Gridlock': 'ट्रैफिक जाम करने वाला गहरा गड्ढा',
    'Major Water Main Burst & Flooding Sidewalk': 'मुख्य पानी की पाइपलाइन फटना और फुटपाथ पर पानी भर जाना',
    'Water Pipeline Leakage & Flooding': 'पानी की पाइपलाइन रिसाव और जलभराव',
    'Uncovered Sewage Manhole in Residential Zone': 'रिहायशी इलाके में खुला सीवर का ढक्कन',
    'Overflowing Commercial Garbage & Medical Waste Spill': 'व्यावसायिक कचरे का अत्यधिक फैलाव और कचरा बिखराव',
    'Fallen Oak Tree Blocking Two Traffic Lanes': 'दो ट्रैफिक लेन को बाधित करने वाला गिरा हुआ पेड़',
    'Broken Traffic Streetlight dark at intersection': 'चौराहे पर अंधेरा करने वाली टूटी हुई स्ट्रीट लाइट',
    'Potholes on Main Street': 'मुख्य सड़क पर गहरे गड्ढे',
    'Garbage Accumulation near Market': 'बाजार के पास कचरे का ढेर',
    'Water Leakage on Park Avenue': 'पार्क एवेन्यू पर पानी का रिसाव',
    'Damaged Transformer': 'क्षतिग्रस्त ट्रांसफार्मर',

    // Traffic & Violation Phrases
    'traffic violation': 'ट्रैफिक नियम का उल्लंघन',
    'Traffic violation': 'ट्रैफिक नियम का उल्लंघन',
    'Traffic Violation': 'ट्रैफिक नियम का उल्लंघन',
    'traffic violations': 'ट्रैफिक नियमों का उल्लंघन',
    'Traffic violations': 'ट्रैफिक नियमों का उल्लंघन',
    'Traffic Violations': 'ट्रैफिक नियमों का उल्लंघन',
    'traffic police': 'ट्रैफिक पुलिस',
    'Traffic police': 'ट्रैफिक पुलिस',
    'Traffic Police': 'ट्रैफिक पुलिस',
    'Traffic Police Department': 'ट्रैफिक पुलिस विभाग',
    'Traffic Police Officer': 'ट्रैफिक पुलिस अधिकारी',
    'traffic signal broken': 'ट्रैफिक सिग्नल खराब / बंद',
    'Traffic signal broken': 'ट्रैफिक सिग्नल खराब / बंद',
    'Traffic Signal Broken': 'ट्रैफिक सिग्नल खराब / बंद',
    'traffic signal failure': 'ट्रैफिक सिग्नल विफलता',
    'Traffic signal failure': 'ट्रैफिक सिग्नल विफलता',
    'Traffic Signal Failure': 'ट्रैफिक सिग्नल विफलता',
    'illegal parking': 'अवैध पार्किंग',
    'Illegal parking': 'अवैध पार्किंग',
    'Illegal Parking': 'अवैध पार्किंग',
    'driving on wrong side': 'गलत दिशा में ड्राइविंग',
    'Driving on wrong side': 'गलत दिशा में ड्राइविंग',
    'Wrong side driving': 'गलत दिशा में ड्राइविंग',
    'speeding vehicle': 'तेज रफ्तार वाहन',
    'Speeding vehicle': 'तेज रफ्तार वाहन',
    'traffic congestion': 'ट्रैफिक जाम / भीड़भाड़',
    'Traffic congestion': 'ट्रैफिक जाम / भीड़भाड़',
    'traffic jam': 'ट्रैफिक जाम',
    'Traffic jam': 'ट्रैफिक जाम',
    'Traffic Jam': 'ट्रैफिक जाम',

    // SubCategories
    'Open Wire': 'खुला तार',
    'Pothole': 'गड्ढा',
    'Pipe Burst': 'पाइप फटना',
    'Open Manhole': 'खुला मैनहोल',
    'Garbage': 'कचरा',
    'Fallen Tree': 'गिरा हुआ पेड़',
    'Damaged Pole': 'क्षतिग्रस्त खंभा',

    // Specific Belapur & Road Hazard Entries
    'damaged road surface hazard at belapur east': 'बेलापुर ईस्ट में क्षतिग्रस्त सड़क की सतह का खतरा',
    'Damaged Road Surface Hazard at Belapur East': 'बेलापुर ईस्ट में क्षतिग्रस्त सड़क की सतह का खतरा',
    'Damaged road surface hazard at belapur east': 'बेलापुर ईस्ट में क्षतिग्रस्त सड़क की सतह का खतरा',
    'Damaged road surface hazard at Belapur East': 'बेलापुर ईस्ट में क्षतिग्रस्त सड़क की सतह का खतरा',
    'Damaged Road Surface Hazard': 'क्षतिग्रस्त सड़क की सतह का खतरा',
    'Damaged road surface hazard': 'क्षतिग्रस्त सड़क की सतह का खतरा',
    'Damaged road surface': 'क्षतिग्रस्त सड़क की सतह',
    'damaged road surface': 'क्षतिग्रस्त सड़क की सतह',
    'Road Surface Hazard': 'सड़क की सतह का खतरा',
    'Road hazard': 'सड़क का खतरा',
    'Road Hazard': 'सड़क का खतरा',
    'Belapur East': 'बेलापुर ईस्ट',
    'belapur east': 'बेलापुर ईस्ट',
    'Belapur': 'बेलापुर',
    'belapur': 'बेलापुर',
    'at Belapur East': 'बेलापुर ईस्ट में',
    'at belapur east': 'बेलापुर ईस्ट में',
    'Sector 11 Belapur East': 'सेक्टर 11 बेलापुर ईस्ट',
    'Sector 11, Belapur East, Navi Mumbai': 'सेक्टर 11, बेलापुर ईस्ट, नवी मुंबई',

    // Common Addresses / Locations
    'corner of 4th St & Mission St, San Francisco, CA': '4वीं स्ट्रीट और मिशन स्ट्रीट, मुंबई / पुणे',
    '845 Market St, Downtown, San Francisco, CA': '845 मार्केट स्ट्रीट, मुख्य नगर',
    '16th St & Valencia St, Mission District, SF': '16वीं स्ट्रीट और वैलेंसिया मार्ग',
    '24th St & Folsom St, San Francisco, CA': '24वीं स्ट्रीट और फॉलसम मार्ग',
    'Post St & Sutter St, SF': 'पोस्ट स्ट्रीट और सटर मार्ग',
    'Fell St & Stanyan St, Golden Gate Park, SF': 'फेल स्ट्रीट और स्टैनयन पार्क मार्ग',
    '5th St & Howard St, SF': '5वीं स्ट्रीट और हावर्ड चौक',

    // Officer / Worker / Role Notes & Remarks
    'An underground power duct cover collapsed exposing thick live electrical wires on the sidewalk right next to the school crosswalk. Sparking noticed after light rain.': 'भूमिगत बिजली का ढक्कन टूटने से स्कूल के रास्ते पर चालू तार खुले दिख रहे हैं। हल्की बारिश के बाद चिंगारी देखी गई।',
    'A 2-foot wide, 6-inch deep pothole has formed in the middle lane of Market Street following heavy rain. Multiple cars hit it today.': 'भारी बारिश के बाद मार्केट स्ट्रीट की मध्य लेन में 2-फुट चौड़ा, 6-इंच गहरा गड्ढा बन गया है। आज कई कारें इससे टकराई हैं।',
    'Pressurized water gushing from underground line near bus stop. Flooding 100ft of sidewalk and encroaching on shop entrances.': 'बस स्टॉप के पास भूमिगत लाइन से भारी दबाव से पानी बह रहा है। फुटपाथ जलमग्न हो गया है।',
    'Cast iron cover is missing completely from deep sewer shaft. Extreme hazard for pedestrians and children at night.': 'गहरे सीवर शाफ्ट से ढक्कन गायब है। रात में पैदल चलने वालों और बच्चों के लिए भारी खतरा।',
    'Dumpsters behind medical center overflowing onto public lane. Attracting rodents and foul smell.': 'मेडिकल सेंटर के पीछे कचरे के डिब्बे सार्वजनिक गली में ओवरफ्लो हो रहे हैं। बदबू फैल रही है।',
    'Large limb broke off ancient oak tree during storm and crushed parked car fender while blocking vehicular access.': 'तूफान के दौरान पेड़ की बड़ी शाखा टूटकर कार पर गिर गई और रास्ता बंद हो गया।',
    'LED street lamp head dangling by wiring after wind gust. Intersection pitch black at night.': 'तेज हवा के बाद स्ट्रीट लैंप तारों से लटक रहा है। रात में चौराहे पर पूरी तरह से अंधेरा रहता है।',

    // Verification & Timeline Notes
    'Verified onsite via emergency patrol. Cordoned off area with hazard tape.': 'आपातकालीन गश्त द्वारा स्थल पर पुष्टि की गई। खतरे के टेप से क्षेत्र को घेरा गया।',
    'High priority road repair scheduled for night crew asphalt patch.': 'रात की टीम द्वारा डामर पैच कार्य निर्धारित।',
    'Main isolation valve shutoff team on site.': 'मुख्य वाल्व बंद करने वाली टीम मौके पर।',
    'Verified new lockable steel cover installed. AI verification score 96%.': 'नया लॉक करने योग्य स्टील कवर लगाया गया। एआई सत्यापन स्कोर 96%।',
    'Pending HazMat sanitation vehicle dispatch.': 'सफाई वाहन प्रेषण लंबित।',
    'Chainsaw clearance completed and wood chipped.': 'पेड़ की कटाई और सफाई पूरी हो चुकी है।',
    'Citizen Anonymous': 'अज्ञात नागरिक',
    'Department Officer': 'विभाग अधिकारी',
    'Worker': 'क्षेत्रीय कार्यकर्ता',
    'Citizen': 'नागरिक',
  },
  mr: {
    // Complaint Titles
    'Exposed High Voltage Cable near Oak Elementary': 'ऑक एलिमेंटरी जवळ उघडी हाय व्होल्टेज केबल',
    'Exposed High-Voltage Cable on School Walkway': 'शाळेच्या पादचारी मार्गावर उघडी हाय-व्होल्टेज केबल',
    'Deep Pothole Causing Vehicle Axle Damage': 'वाहनाच्या अ‍ॅक्सलचे नुकसान करणारा खोल खड्डा',
    'Deep Pothole Causing Traffic Gridlock': 'वाहतूक कोंडी करणारा खोल खड्डा',
    'Major Water Main Burst & Flooding Sidewalk': 'मुख्य पाण्याची पाईपलाईन फुटली आणि पदपथावर पाणी साचले',
    'Water Pipeline Leakage & Flooding': 'पाण्याच्या पाईपलाईनमधून गळती आणि जलमय भाग',
    'Uncovered Sewage Manhole in Residential Zone': 'निवासी भागात उघडे गटाराचे मॅनहोल',
    'Overflowing Commercial Garbage & Medical Waste Spill': 'व्यावसायिक कचरा ओव्हरफ्लो आणि कचऱ्याचा सांडणारा भाग',
    'Fallen Oak Tree Blocking Two Traffic Lanes': 'दोन ट्रॅफिक लेन अडवणारे पडलेले झाड',
    'Broken Traffic Streetlight dark at intersection': 'चौकात अंधार करणारी तुटलेली स्ट्रीट लाईट',
    'Potholes on Main Street': 'मुख्य रस्त्यावर मोठे खड्डे',
    'Garbage Accumulation near Market': 'बाजाराजवळ कचऱ्याचा साचलेला ढीग',
    'Water Leakage on Park Avenue': 'पार्क एव्हेन्यूवर पाण्याची गळती',
    'Damaged Transformer': 'नादुरुस्त ट्रान्सफॉर्मर',

    // Traffic & Violation Phrases
    'traffic violation': 'वाहतूक नियमांचे उल्लंघन',
    'Traffic violation': 'वाहतूक नियमांचे उल्लंघन',
    'Traffic Violation': 'वाहतूक नियमांचे उल्लंघन',
    'traffic violations': 'वाहतूक नियमांचे उल्लंघन',
    'Traffic violations': 'वाहतूक नियमांचे उल्लंघन',
    'Traffic Violations': 'वाहतूक नियमांचे उल्लंघन',
    'traffic police': 'ट्रॅफिक पोलीस',
    'Traffic police': 'ट्रॅफिक पोलीस',
    'Traffic Police': 'ट्रॅफिक पोलीस',
    'Traffic Police Department': 'ट्रॅफिक पोलीस विभाग',
    'Traffic Police Officer': 'ट्रॅफिक पोलीस अधिकारी',
    'traffic signal broken': 'ट्रॅफिक सिग्नल नादुरुस्त / बंद',
    'Traffic signal broken': 'ट्रॅफिक सिग्नल नादुरुस्त / बंद',
    'Traffic Signal Broken': 'ट्रॅफिक सिग्नल नादुरुस्त / बंद',
    'traffic signal failure': 'ट्रॅफिक सिग्नल विफलता',
    'Traffic signal failure': 'ट्रॅफिक सिग्नल विफलता',
    'Traffic Signal Failure': 'ट्रॅफिक सिग्नल विफलता',
    'illegal parking': 'बेकायदेशीर पार्किंग',
    'Illegal parking': 'बेकायदेशीर पार्किंग',
    'Illegal Parking': 'बेकायदेशीर पार्किंग',
    'driving on wrong side': 'उलट्या दिशेने वाहन चालवणे',
    'Driving on wrong side': 'उलट्या दिशेने वाहन चालवणे',
    'Wrong side driving': 'उलट्या दिशेने वाहन चालवणे',
    'speeding vehicle': 'अतिवेगाने जाणारे वाहन',
    'Speeding vehicle': 'अतिवेगाने जाणारे वाहन',
    'traffic congestion': 'वाहतूक कोंडी',
    'Traffic congestion': 'वाहतूक कोंडी',
    'traffic jam': 'वाहतूक कोंडी',
    'Traffic jam': 'वाहतूक कोंडी',
    'Traffic Jam': 'वाहतूक कोंडी',

    // SubCategories
    'Open Wire': 'उघडी तार',
    'Pothole': 'रस्त्यातील खड्डा',
    'Pipe Burst': 'पाईप फुटणे',
    'Open Manhole': 'उघडे मॅनहोल',
    'Garbage': 'साचलेला कचरा',
    'Fallen Tree': 'पडलेले झाड',
    'Damaged Pole': 'नादुरुस्त खांब',

    // Specific Belapur & Road Hazard Entries
    'damaged road surface hazard at belapur east': 'बेलापूर पूर्व येथील खराब रस्त्याचा धोका',
    'Damaged Road Surface Hazard at Belapur East': 'बेलापूर पूर्व येथील खराब रस्त्याचा धोका',
    'Damaged road surface hazard at belapur east': 'बेलापूर पूर्व येथील खराब रस्त्याचा धोका',
    'Damaged road surface hazard at Belapur East': 'बेलापूर पूर्व येथील खराब रस्त्याचा धोका',
    'Damaged Road Surface Hazard': 'खराब रस्त्याचा धोका',
    'Damaged road surface hazard': 'खराब रस्त्याचा धोका',
    'Damaged road surface': 'खराब रस्त्याची पृष्ठभाग',
    'damaged road surface': 'खराब रस्त्याची पृष्ठभाग',
    'Road Surface Hazard': 'रस्त्याच्या पृष्ठभागाचा धोका',
    'Road hazard': 'रस्त्याचा धोका',
    'Road Hazard': 'रस्त्याचा धोका',
    'Belapur East': 'बेलापूर पूर्व',
    'belapur east': 'बेलापूर पूर्व',
    'Belapur': 'बेलापूर',
    'belapur': 'बेलापूर',
    'at Belapur East': 'बेलापूर पूर्व येथे',
    'at belapur east': 'बेलापूर पूर्व येथे',
    'Sector 11 Belapur East': 'सेक्टर ११ बेलापूर पूर्व',
    'Sector 11, Belapur East, Navi Mumbai': 'सेक्टर ११, बेलापूर पूर्व, नवी मुंबई',

    // Common Addresses / Locations
    'corner of 4th St & Mission St, San Francisco, CA': 'चौथा रस्ता व मिशन स्ट्रीट, मुंबई / पुणे',
    '845 Market St, Downtown, San Francisco, CA': '८४५ मार्केट स्ट्रीट, मुख्य शहर',
    '16th St & Valencia St, Mission District, SF': '१६ वा रस्ता व व्हेलेन्सिया स्ट्रीट',
    '24th St & Folsom St, San Francisco, CA': '२४ वा रस्ता व फॉलसम स्ट्रीट',
    'Post St & Sutter St, SF': 'पोस्ट स्ट्रीट व सटर स्ट्रीट',
    'Fell St & Stanyan St, Golden Gate Park, SF': 'फेअल स्ट्रीट व स्टॅनयन पार्क रस्ता',
    '5th St & Howard St, SF': '५ वा रस्ता व हॉवर्ड चौक',

    // Officer / Worker / Role Notes & Remarks
    'An underground power duct cover collapsed exposing thick live electrical wires on the sidewalk right next to the school crosswalk. Sparking noticed after light rain.': 'शाळेजवळील पदपथावर भुयारी वीज वाहिनीचे झाकण तुटल्याने चालू विजेच्या तारा उघड्या पडल्या आहेत. हलक्या पावसानंतर ठिणग्या दिसल्या.',
    'A 2-foot wide, 6-inch deep pothole has formed in the middle lane of Market Street following heavy rain. Multiple cars hit it today.': 'मुसळधार पावसानंतर रस्त्याच्या मधोमध २ फूट रुंद आणि ६ इंच खोल खड्डा पडला आहे. आज अनेक गाड्या आदळल्या.',
    'Pressurized water gushing from underground line near bus stop. Flooding 100ft of sidewalk and encroaching on shop entrances.': 'बस थांब्याजवळ भुयारी लाईनमझून जोरदार दाबाने पाणी वाहत आहे. पदपथावर १०० फूट पाणी साचले आहे.',
    'Cast iron cover is missing completely from deep sewer shaft. Extreme hazard for pedestrians and children at night.': 'गटाराच्या खोल मॅनहोलचे झाकण गायब आहे. रात्रीच्या वेळी पादचारी व मुलांसाठी अत्यंत धोकादायक.',
    'Dumpsters behind medical center overflowing onto public lane. Attracting rodents and foul smell.': 'वैद्यकीय केंद्रामागील कचराकुंडी गल्लीत ओव्हरफ्लो झाली आहे. दुर्गंधी सुटली आहे.',
    'Large limb broke off ancient oak tree during storm and crushed parked car fender while blocking vehicular access.': 'वादळात झाडाची मोठी फांदी तुटून गाडीवर पडली आणि रस्ता बंद झाला.',
    'LED street lamp head dangling by wiring after wind gust. Intersection pitch black at night.': 'वादळी वाऱ्यामुळे स्ट्रीट लाईट तारांना लटकत आहे. रात्री चौकात पूर्ण अंधार असतो.',

    // Verification & Timeline Notes
    'Verified onsite via emergency patrol. Cordoned off area with hazard tape.': 'आपत्कालीन गस्तीद्वारे प्रत्यक्ष पाहणी पूर्ण. धोकादायक पट्ट्याने परिसर बंद केला.',
    'High priority road repair scheduled for night crew asphalt patch.': 'रात्रीच्या पथकाद्वारे डांबरीकरणाचे काम नियोजित.',
    'Main isolation valve shutoff team on site.': 'मुख्य व्हॉल्व्ह बंद करणारे पथक घटनास्थळी दाखल.',
    'Verified new lockable steel cover installed. AI verification score 96%.': 'नवीन लॉक होणारे स्टीलचे झाकण बसवले. एआय तपासणी स्कोर ९६%.',
    'Pending HazMat sanitation vehicle dispatch.': 'कचरा उचलणारी गाडी पाठवणे प्रलंबित.',
    'Chainsaw clearance completed and wood chipped.': 'झाड कापून रस्ता मोकळा केला.',
    'Citizen Anonymous': 'अनामित नागरिक',
    'Department Officer': 'विभाग अधिकारी',
    'Worker': 'क्षेत्रीय कर्मचारी',
    'Citizen': 'नागरिक',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('safecity_language');
    if (saved === 'hi' || saved === 'mr' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('safecity_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const translateCategory = (cat: string): string => {
    if (!cat) return '';
    const lower = cat.toLowerCase();
    if (lower.includes('road')) return t('category.road', 'Road Hazard');
    if (lower.includes('electr')) return t('category.electrical', 'Electrical Hazard');
    if (lower.includes('water')) return t('category.water', 'Water Hazard');
    if (lower.includes('sanitat') || lower.includes('waste')) return t('category.sanitation', 'Sanitation Hazard');
    if (lower.includes('environ')) return t('category.environmental', 'Environmental Hazard');
    if (lower.includes('traffic') || lower.includes('violat')) return t('category.traffic', 'Traffic Police / Violation');
    if (lower.includes('safety') || lower.includes('public')) return t('category.safety', 'Public Safety Hazard');
    return translateText(cat);
  };

  const translateDepartment = (dept: string): string => {
    if (!dept) return '';
    const lower = dept.toLowerCase();
    if (lower.includes('road')) return t('dept.road', 'Road Department');
    if (lower.includes('electr')) return t('dept.electricity', 'Electricity Department');
    if (lower.includes('water') || lower.includes('sewer')) return t('dept.water', 'Water & Sewerage');
    if (lower.includes('sanitat') || lower.includes('waste')) return t('dept.sanitation', 'Sanitation & Waste');
    if (lower.includes('environ')) return t('dept.environmental', 'Environmental Protection');
    if (lower.includes('traffic')) return t('dept.traffic', 'Traffic Police Department');
    if (lower.includes('safety') || lower.includes('infrastr')) return t('dept.safety', 'Public Safety & Infrastructure');
    return translateText(dept);
  };

  const translateStatus = (status: string): string => {
    if (!status) return '';
    const lower = status.toLowerCase();
    if (lower === 'submitted') return t('status.submitted', 'Submitted');
    if (lower === 'verified') return t('status.verified', 'Verified');
    if (lower === 'assigned') return t('status.assigned', 'Assigned');
    if (lower === 'in progress' || lower === 'in_progress') return t('status.in_progress', 'In Progress');
    if (lower === 'work submitted' || lower === 'work_submitted') return t('status.work_submitted', 'Work Submitted');
    if (lower === 'resolved') return t('status.resolved', 'Resolved');
    if (lower === 'rejected') return t('status.rejected', 'Rejected');
    return status;
  };

  const translateSeverity = (sev: string): string => {
    if (!sev) return '';
    const lower = sev.toLowerCase();
    if (lower === 'low') return t('severity.low', 'Low');
    if (lower === 'medium') return t('severity.medium', 'Medium');
    if (lower === 'high') return t('severity.high', 'High');
    if (lower === 'critical') return t('severity.critical', 'Critical');
    return sev;
  };

  const translateText = (text: string | undefined | null): string => {
    if (!text) return '';
    if (language === 'en') return text;

    const trimmed = text.trim();

    // 1. Direct exact match in textTranslations
    if (textTranslations[language] && textTranslations[language][trimmed]) {
      return textTranslations[language][trimmed];
    }

    // 2. Direct exact match in UI translations
    if (translations[language] && translations[language][trimmed]) {
      return translations[language][trimmed];
    }

    // 3. Case-insensitive exact lookup in textTranslations
    const dict = textTranslations[language] || {};
    const lower = trimmed.toLowerCase();
    for (const key of Object.keys(dict)) {
      if (key.toLowerCase() === lower) {
        return dict[key];
      }
    }

    // 4. Sub-phrase substring replacements (longest keys in textTranslations first)
    let result = trimmed;
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
      if (key.length < 2) continue;
      const keyLower = key.toLowerCase();
      if (result.toLowerCase().includes(keyLower)) {
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, dict[key]);
      }
    }

    // 5. Fallback word-level replacement for dynamically entered or remaining English hazard text
    const hiWords: Record<string, string> = {
      'traffic': 'ट्रैफिक',
      'violation': 'उल्लंघन',
      'violations': 'उल्लंघन',
      'violating': 'उल्लंघन',
      'police': 'पुलिस',
      'signal': 'सिग्नल',
      'signals': 'सिग्नल',
      'rule': 'नियम',
      'rules': 'नियम',
      'speeding': 'तेज गति',
      'parking': 'पार्किंग',
      'illegal': 'अवैध',
      'wrong': 'गलत',
      'side': 'दिशा / साइड',
      'lane': 'लेन',
      'lanes': 'लेन',
      'vehicle': 'वाहन',
      'vehicles': 'वाहन',
      'pothole': 'गड्ढा',
      'potholes': 'गड्ढे',
      'water': 'पानी',
      'leak': 'रिसाव',
      'leakage': 'रिसाव',
      'pipe': 'पाइप',
      'pipes': 'पाइप',
      'burst': 'फटना',
      'wire': 'तार',
      'wires': 'तार',
      'cable': 'केबल',
      'cables': 'केबल',
      'open': 'खुला',
      'exposed': 'खुला',
      'manhole': 'मैनहोल',
      'manholes': 'मैनहोल',
      'sewage': 'सीवर',
      'sewer': 'सीवर',
      'drain': 'नाली',
      'drainage': 'जल निकासी',
      'garbage': 'कचरा',
      'trash': 'कचरा',
      'waste': 'कचरा',
      'tree': 'पेड़',
      'fallen': 'गिरा हुआ',
      'broken': 'टूटा हुआ',
      'damaged': 'क्षतिग्रस्त',
      'light': 'लाइट',
      'lights': 'लाइटें',
      'lamp': 'लैंप',
      'street': 'स्ट्रीट',
      'road': 'सड़क',
      'roads': 'सड़कें',
      'surface': 'सतह',
      'officer': 'अधिकारी',
      'officers': 'अधिकारी',
      'worker': 'कार्यकर्ता',
      'workers': 'कार्यकर्ता',
      'hazard': 'खतरा',
      'hazards': 'खतरे',
      'emergency': 'आपातकाल',
      'near': 'के पास',
      'opposite': 'के सामने',
      'behind': 'के पीछे',
      'front': 'के सामने',
      'at': 'पर',
      'on': 'पर',
      'in': 'में',
      'by': 'द्वारा',
      'to': 'को',
      'from': 'से',
      'market': 'बाजार',
      'school': 'स्कूल',
      'hospital': 'अस्पताल',
      'station': 'स्टेशन',
      'bridge': 'पुल',
      'park': 'पार्क',
      'block': 'ब्लॉक',
      'sector': 'सेक्टर',
      'main': 'मुख्य',
      'east': 'ईस्ट',
      'west': 'वेस्ट',
      'north': 'नॉर्थ',
      'south': 'साउथ',
      'citizen': 'नागरिक',
      'citizens': 'नागरिक',
      'track': 'ट्रैक',
      'tracking': 'ट्रैकिंग',
      'status': 'स्थिति',
      'address': 'पता',
      'description': 'विवरण',
      'registered': 'पंजीकृत',
      'register': 'पंजीकृत करें',
      'report': 'रिपोर्ट',
      'reported': 'रिपोर्ट किया गया',
      'submitted': 'सबमिट किया गया',
      'verified': 'सत्यापित',
      'assigned': 'आवंटित',
      'progress': 'प्रगति पर',
      'resolved': 'हल हो गया',
      'rejected': 'अस्वीकृत',
      'cause': 'कारण',
      'causing': 'वजह से',
      'risk': 'जोखिम',
      'danger': 'खतरा',
      'dangerous': 'खतरनाक',
      'area': 'क्षेत्र',
      'zone': 'जोन',
      'location': 'स्थान',
      'details': 'विवरण',
    };

    const mrWords: Record<string, string> = {
      'traffic': 'ट्रॅफिक',
      'violation': 'उल्लंघन',
      'violations': 'उल्लंघन',
      'violating': 'उल्लंघन',
      'police': 'पोलीस',
      'signal': 'सिग्नल',
      'signals': 'सिग्नल',
      'rule': 'नियम',
      'rules': 'नियम',
      'speeding': 'वेगवान',
      'parking': 'पार्किंग',
      'illegal': 'बेकायदेशीर',
      'wrong': 'चुकीच्या',
      'side': 'बाजूने',
      'lane': 'लेन',
      'lanes': 'लेन',
      'vehicle': 'वाहन',
      'vehicles': 'वाहने',
      'pothole': 'खड्डा',
      'potholes': 'खड्डे',
      'water': 'पाणी',
      'leak': 'गळती',
      'leakage': 'गळती',
      'pipe': 'पाईप',
      'pipes': 'पाईप्स',
      'burst': 'फुटणे',
      'wire': 'तार',
      'wires': 'तारा',
      'cable': 'केबल',
      'cables': 'केबल्स',
      'open': 'उघडे',
      'exposed': 'उघडे',
      'manhole': 'मॅनहोल',
      'manholes': 'मॅनहोल्स',
      'sewage': 'गटार',
      'sewer': 'गटार',
      'drain': 'नाली',
      'drainage': 'निचरण्याची सोय',
      'garbage': 'कचरा',
      'trash': 'कचरा',
      'waste': 'कचरा',
      'tree': 'झाड',
      'fallen': 'पडलेले',
      'broken': 'तुटलेले',
      'damaged': 'नादुरुस्त',
      'light': 'लाईट',
      'lights': 'दिवे',
      'lamp': 'दिवा',
      'street': 'रस्ता',
      'road': 'रस्ता',
      'roads': 'रस्ते',
      'surface': 'भाग',
      'officer': 'अधिकारी',
      'officers': 'अधिकारी',
      'worker': 'कर्मचारी',
      'workers': 'कर्मचारी',
      'hazard': 'धोका',
      'hazards': 'धोके',
      'emergency': 'आणीबाणी',
      'near': 'जवळ',
      'opposite': 'समोर',
      'behind': 'मागे',
      'front': 'समोर',
      'at': 'येथे',
      'on': 'वर',
      'in': 'मध्ये',
      'by': 'द्वारे',
      'to': 'ला',
      'from': 'पासून',
      'market': 'बाजार',
      'school': 'शाळा',
      'hospital': 'रुग्णालय',
      'station': 'स्टेशन',
      'bridge': 'पूल',
      'park': 'पार्क',
      'block': 'ब्लॉक',
      'sector': 'सेक्टर',
      'main': 'मुख्य',
      'east': 'पूर्व',
      'west': 'पश्चिम',
      'citizen': 'नागरिक',
      'citizens': 'नागरिक',
      'track': 'ट्रॅक',
      'tracking': 'ट्रॅकिंग',
      'status': 'स्थिती',
      'address': 'पत्ता',
      'description': 'वर्णन',
      'registered': 'नोंदणीकृत',
      'register': 'नोंदणी करा',
      'report': 'अहवाल',
      'reported': 'नोंदवले',
      'submitted': 'सादर केले',
      'verified': 'सत्यापित',
      'assigned': 'नियुक्त',
      'progress': 'प्रगतीवर',
      'resolved': 'सोडवले',
      'rejected': 'नाकारले',
      'risk': 'धोका',
      'danger': 'धोका',
      'dangerous': 'धोकादायक',
      'area': 'भाग',
      'zone': 'झोन',
      'location': 'स्थान',
      'details': 'तपशील',
    };

    const wordDict = language === 'hi' ? hiWords : language === 'mr' ? mrWords : null;
    if (wordDict) {
      for (const [engWord, transWord] of Object.entries(wordDict)) {
        result = result.replace(new RegExp(`\\b${engWord}\\b`, 'gi'), transWord);
      }
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      translateCategory,
      translateDepartment,
      translateStatus,
      translateSeverity,
      translateText,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
