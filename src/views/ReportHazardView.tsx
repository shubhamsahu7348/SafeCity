import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Camera,
  Video,
  Film,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Copy,
  Share2,
  Building2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Complaint,
  HazardCategory,
  SeverityLevel,
  Department,
  AIAnalysisResponse,
  AIDuplicateCheckResponse,
} from '../types';
import { ShareComplaintCard } from '../components/ShareComplaintCard';

interface ReportHazardViewProps {
  onComplaintSubmitted: (complaint: Complaint) => void;
  onTrackComplaint: (complaintId: string) => void;
}

export const ReportHazardView: React.FC<ReportHazardViewProps> = ({
  onComplaintSubmitted,
  onTrackComplaint,
}) => {
  const { t, language, translateDepartment, translateSeverity, translateText } = useLanguage();
  const [step, setStep] = useState<number>(1);

  // Form State - Multiple Photos and Videos
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(37.774929);
  const [longitude, setLongitude] = useState<number>(-122.419416);
  const [address, setAddress] = useState<string>('San Francisco, CA');

  // AI Classification State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<AIDuplicateCheckResponse | null>(null);

  // Vehicle License Plate & Violation State
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState<string>('');
  const [violationType, setViolationType] = useState<string>('');
  const [isPlateDetectedByAI, setIsPlateDetectedByAI] = useState<boolean>(false);

  // Editable fields initialized by AI
  const [category, setCategory] = useState<HazardCategory>('Road Hazard');
  const [subCategory, setSubCategory] = useState<string>('Pothole');
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [department, setDepartment] = useState<Department>('Road Department');

  // Submitted complaint state for success page
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Handle multiple photo uploads
  const handleMultiplePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newPhoto = reader.result;
          setPhotos((prev) => [...prev, newPhoto]);
          setPhotoUrl((prev) => prev || newPhoto);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple video uploads
  const handleMultipleVideosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setVideos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add custom video URL
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setVideos((prev) => [...prev, videoUrlInput.trim()]);
    setVideoUrlInput('');
  };

  // Location Detection State
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Sample default image picker option removed per user request

  // Remove photo item
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (photoUrl === prev[index]) {
        setPhotoUrl(updated[0] || '');
      }
      return updated;
    });
  };

  // Remove video item
  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-detect browser GPS location with high accuracy and reverse geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setLocationStatus(msg);
      alert(msg);
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        setLocationStatus('Resolving location address via OpenStreetMap...');

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
              setLocationStatus(`✅ Location detected: ${data.display_name}`);
            } else {
              setAddress(`GPS Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
              setLocationStatus(`✅ Coordinates set: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
          } else {
            setAddress(`GPS Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
            setLocationStatus(`✅ Coordinates set: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        } catch (e) {
          setAddress(`GPS Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          setLocationStatus(`✅ Coordinates set: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setIsLocating(false);
        let msg = 'Unable to access device location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied by browser. Please allow location access.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location position is unavailable on this device.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setLocationStatus(`⚠️ ${msg}`);
        alert(`${msg}\n\nYou can manually enter your street address in the input box below.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Step 3: Run AI Hazard Analysis
  const handleRunAIAnalysis = async () => {
    const activePhoto = photos[0] || photoUrl;
    if (!description && !activePhoto) {
      alert('Please provide at least one photo or description for AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Analyze Hazard
      const res = await fetch('/api/ai/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activePhoto,
          description,
          latitude,
          longitude,
          language,
        }),
      });

      if (res.ok) {
        const data: AIAnalysisResponse = await res.json();
        setAiAnalysis(data);
        setCategory(data.category);
        setSubCategory(data.subCategory);
        const resolvedSeverity = data.severity === 'Critical' || data.isEmergency ? 'Critical' : data.severity;
        setSeverity(resolvedSeverity);
        setIsEmergency(resolvedSeverity === 'Critical');
        setDepartment(data.suggestedDepartment);

        if (data.detectedVehiclePlateNumber) {
          setVehiclePlateNumber(data.detectedVehiclePlateNumber);
          setIsPlateDetectedByAI(true);
        }
        if (data.violationType) {
          setViolationType(data.violationType);
        }
      }

      // 2. Check Duplicates
      const dupRes = await fetch('/api/ai/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          latitude,
          longitude,
          category,
        }),
      });

      if (dupRes.ok) {
        const dupData: AIDuplicateCheckResponse = await dupRes.json();
        setDuplicateCheck(dupData);
      }
    } catch (err) {
      console.error('AI analysis request failed:', err);
    } finally {
      setIsAnalyzing(false);
      setStep(3);
    }
  };

  // Final Submit
  const handleSubmitReport = async () => {
    const primaryPhoto = photos[0] || photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
    const primaryVideo = videos[0] || undefined;

    const payload = {
      title: `${subCategory} ${category === 'Traffic Violation' ? 'Violation' : 'Hazard'} at ${address.split(',')[0]}`,
      category,
      subCategory,
      severity,
      isEmergency: severity === 'Critical',
      description: description || `Hazard reported near ${address}`,
      photoUrl: primaryPhoto,
      videoUrl: primaryVideo,
      photos: photos.length > 0 ? photos : [primaryPhoto],
      videos: videos,
      latitude,
      longitude,
      address,
      assignedDepartment: department,
      vehiclePlateNumber: vehiclePlateNumber.trim().toUpperCase() || undefined,
      aiDetectedPlateNumber: aiAnalysis?.detectedVehiclePlateNumber || vehiclePlateNumber.trim().toUpperCase() || undefined,
      licensePlateDetectedByAI: isPlateDetectedByAI || !!vehiclePlateNumber,
      violationType: violationType || (category === 'Traffic Violation' ? subCategory : undefined),
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newComplaint: Complaint = await res.json();
        setSubmittedComplaint(newComplaint);
        onComplaintSubmitted(newComplaint);
        setStep(4); // Success screen
      }
    } catch (err) {
      console.error('Submit complaint error:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Wizard Progress Indicator */}
      <div className="bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
        {[
          { num: 1, label: t('report.wizard.step1', 'Upload Media') },
          { num: 2, label: t('report.wizard.step2', 'Location & Details') },
          { num: 3, label: t('report.wizard.step3', 'AI Review & Route') },
          { num: 4, label: t('report.wizard.step4', 'Submitted') },
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                step === s.num
                  ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md ring-4 ring-indigo-100'
                  : step > s.num
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-xs font-extrabold hidden sm:inline ${
                step === s.num ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Combined Photo & Video Media Upload */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 text-xs font-black rounded-full border border-indigo-200">
                {t('report.step1_tag', 'Step 1 of 3')}
              </span>
              <div className="flex items-center space-x-2 text-xs font-extrabold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>{photos.length} {t('report.photos_count', 'Photo(s)')}</span>
                <span className="text-slate-300">•</span>
                <Video className="w-3.5 h-3.5 text-cyan-600" />
                <span>{videos.length} {t('report.videos_count', 'Video(s)')}</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              {t('report.upload_title', 'Upload Hazard Media (Photos & Videos)')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('report.upload_subtitle', 'Combine high-resolution photos and video recordings of the hazard site in one place for AI verification.')}
            </p>
          </div>

          {/* Unified Media Uploader Box */}
          <div className="p-6 bg-slate-50/90 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-cyan-100 text-indigo-600 flex items-center justify-center shadow-inner flex-shrink-0">
                  <Camera className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{t('report.add_evidence_title', 'Add Hazard Evidence Files')}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t('report.add_evidence_desc', 'Upload images (JPG, PNG) or video recordings (MP4, WebM)')}</p>
                </div>
              </div>

              {/* Combined Buttons for Photo and Video */}
              <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-center">
                {/* Photo Picker */}
                <input
                  type="file"
                  id="multi-photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handleMultiplePhotosUpload}
                  className="hidden"
                />
                <label
                  htmlFor="multi-photo-upload"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('report.add_photos', 'Add Photos')}</span>
                </label>

                {/* Video Picker */}
                <input
                  type="file"
                  id="multi-video-upload"
                  accept="video/*"
                  multiple
                  onChange={handleMultipleVideosUpload}
                  className="hidden"
                />
                <label
                  htmlFor="multi-video-upload"
                  className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <Film className="w-4 h-4" />
                  <span>{t('report.add_videos', 'Add Videos')}</span>
                </label>
              </div>
            </div>

            {/* Video URL Input Row */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{t('report.video_link_label', 'Video Link:')}</span>
              <input
                type="text"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder={t('report.video_link_placeholder', 'Or paste video link (MP4, Stream URL)...')}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddVideoUrl}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('report.attach_link', 'Attach Link')}</span>
              </button>
            </div>

            {/* Unified Media Gallery Display */}
            {(photos.length > 0 || videos.length > 0) ? (
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{t('report.gallery_title', 'Attached Media Gallery')} ({photos.length + videos.length})</span>
                  <span className="text-[11px] text-slate-400">{t('report.gallery_remove_hint', 'Click Trash icon to remove any file')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Photo Cards */}
                  {photos.map((url, idx) => (
                    <div key={`photo-${idx}`} className="relative group rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-sm h-36 bg-slate-900">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-950/90 text-indigo-300 font-mono text-[10px] font-bold rounded-lg border border-indigo-700/80 flex items-center space-x-1">
                        <Camera className="w-3 h-3 text-indigo-400" />
                        <span>{t('report.photos_count', 'Photo')} #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Video Cards */}
                  {videos.map((vidUrl, idx) => (
                    <div key={`video-${idx}`} className="relative bg-slate-950 p-2 rounded-2xl border-2 border-cyan-700/80 shadow-md">
                      <div className="flex items-center justify-between pb-1 px-1">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center space-x-1">
                          <Video className="w-3 h-3 text-cyan-400" />
                          <span>{t('report.videos_count', 'Video Clip')} #{idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-md text-[10px]"
                          title="Remove Video"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {vidUrl.startsWith('data:video') || vidUrl.endsWith('.mp4') || vidUrl.endsWith('.webm') ? (
                        <video src={vidUrl} controls className="w-full h-28 rounded-xl object-cover bg-black" />
                      ) : (
                        <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-xl truncate">
                          🔗 {vidUrl}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-xl border border-slate-200 text-slate-500 space-y-1">
                <Camera className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">{t('report.no_media_title', 'No media attached yet')}</p>
                <p className="text-[11px] text-slate-400">{t('report.no_media_desc', 'Add photos or videos above to proceed with hazard report')}</p>
              </div>
            )}
          </div>

          {/* Navigation Button */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">
              {t('report.total_attached', 'Total attached:')} <strong className="text-indigo-700">{photos.length} {t('report.photos_count', 'photo(s)')}</strong> and <strong className="text-cyan-700">{videos.length} {t('report.videos_count', 'video(s)')}</strong>
            </span>

            <button
              onClick={() => setStep(2)}
              disabled={photos.length === 0 && !photoUrl && videos.length === 0}
              className={`px-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center space-x-2 transition-all ${
                photos.length > 0 || photoUrl || videos.length > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{t('report.next_location', 'Next: Location & Description')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Description */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 text-xs font-black rounded-full border border-indigo-200">
              {t('report.step2_tag', 'Step 2 of 3')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              {t('report.location_title', 'Hazard Location & Description')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('report.location_subtitle', 'Provide exact address or use high-precision device GPS capture.')}
            </p>
          </div>

          {/* GPS Location Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                {t('report.address_label', 'Hazard Address / Location')}
              </label>
              {locationStatus && (
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  {locationStatus}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('report.address_placeholder', 'Street address or landmark')}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-800"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 whitespace-nowrap transition-colors shadow-md disabled:opacity-75"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{t('report.detecting_gps', 'Detecting GPS...')}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-white" />
                    <span>{t('report.detect_location', 'Detect My Present Location')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              {t('report.desc_label', 'Describe the Hazard')}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.desc_placeholder', 'E.g., Open electric cables exposed on sidewalk near school entrance. Sparking observed after rain...')}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-800"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('report.back', 'Back')}</span>
            </button>

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{t('report.submitting', 'Submitting...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>{t('btn.submit_report', 'Submit Report')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI Review, Classification & Routing */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-full border border-indigo-200">
              {t('report.step3_tag', 'Step 3 of 3')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              {t('report.ai_review_title', 'AI Hazard Analysis & Department Mapping')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('report.ai_review_subtitle', 'AI classified severity, checked duplicate reports nearby, and auto-routed to the responsible department.')}
            </p>
          </div>

          {/* Duplicate Detection Alert */}
          {duplicateCheck && duplicateCheck.isDuplicate && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>{t('report.duplicate_alert', 'Existing Nearby Complaint Linked')} ({duplicateCheck.similarityScore}% Match)</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {duplicateCheck.reasoning}
              </p>
              <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                Complaint linked to existing ID: {duplicateCheck.matchedComplaintId}
              </span>
            </div>
          )}

          {/* AI Analysis Findings Card */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-cyan-300" />
                  {t('report.ai_vision_title', 'AI Vision Assessment')}
                </span>
                <span className="px-3 py-0.5 text-xs font-bold bg-indigo-500/20 text-cyan-300 rounded-full border border-indigo-500/40">
                  {aiAnalysis.confidenceScore}% {t('report.certainty', 'Certainty')}
                </span>
              </div>

              <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                {aiAnalysis.aiSummary}
              </p>

              <div className="p-3 bg-slate-950/80 rounded-xl text-xs text-amber-300 border border-amber-500/30">
                <strong>{t('report.safety_guidance', 'Safety Guidance:')}</strong> {aiAnalysis.safetyAdvice}
              </div>
            </div>
          )}

          {/* Editable AI Classification Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('report.category_label', 'Hazard Category')}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as HazardCategory;
                  setCategory(val);
                  if (val === 'Traffic Violation') {
                    setDepartment('Traffic Police Department');
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                <option value="Road Hazard">{t('category.road', 'Road Hazard')}</option>
                <option value="Electrical Hazard">{t('category.electrical', 'Electrical Hazard')}</option>
                <option value="Water Hazard">{t('category.water', 'Water Hazard')}</option>
                <option value="Sanitation Hazard">{t('category.sanitation', 'Sanitation Hazard')}</option>
                <option value="Environmental Hazard">{t('category.environmental', 'Environmental Hazard')}</option>
                <option value="Public Safety Hazard">{t('category.safety', 'Public Safety Hazard')}</option>
                <option value="Traffic Violation">{t('category.traffic', 'Traffic Police / Violation')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('report.severity_label', 'Severity Level')}
              </label>
              <select
                value={severity}
                onChange={(e) => {
                  const val = e.target.value as SeverityLevel;
                  setSeverity(val);
                  setIsEmergency(val === 'Critical');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                <option value="Low">{t('severity.low', 'Low')}</option>
                <option value="Medium">{t('severity.medium', 'Medium')}</option>
                <option value="High">{t('severity.high', 'High')}</option>
                <option value="Critical">{t('severity.critical', 'Critical (Emergency)')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('report.dept_label', 'Assigned Department')}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800"
              >
                <option value="Road Department">{t('dept.road', 'Road Department')}</option>
                <option value="Electricity Department">{t('dept.electricity', 'Electricity Department')}</option>
                <option value="Water & Sewerage">{t('dept.water', 'Water & Sewerage')}</option>
                <option value="Sanitation & Waste">{t('dept.sanitation', 'Sanitation & Waste')}</option>
                <option value="Environmental Protection">{t('dept.environmental', 'Environmental Protection')}</option>
                <option value="Public Safety & Infrastructure">{t('dept.safety', 'Public Safety & Infrastructure')}</option>
                <option value="Traffic Police Department">{t('dept.traffic', 'Traffic Police Department')}</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              {severity === 'Critical' ? (
                <label className="flex items-center space-x-2 p-3 bg-red-50 rounded-xl border border-red-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-xs font-extrabold text-red-700 uppercase tracking-wider">
                    {t('btn.flag_emergency', 'Flag as Emergency Priority')}
                  </span>
                </label>
              ) : (
                <div className="hidden sm:block min-h-[46px]" />
              )}
            </div>
          </div>

          {/* AI Vehicle License Plate Recognition & Edit Card */}
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>{t('traffic.plate_title', 'AI Vehicle License Plate Recognition')}</span>
              </div>
              {isPlateDetectedByAI && (
                <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-bold text-[10px] rounded-full uppercase tracking-wider">
                  AI Direct Vision Extracted
                </span>
              )}
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              {t('traffic.plate_desc', 'AI Vision automatically copies vehicle nameplate numbers. You can verify or edit the detected plate number below:')}
            </p>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-2.5 bg-yellow-400 text-black font-black text-xs font-mono rounded-xl border-2 border-slate-900 shadow-sm shrink-0 flex items-center space-x-1">
                <span>IND</span>
              </div>
              <input
                type="text"
                value={vehiclePlateNumber}
                onChange={(e) => setVehiclePlateNumber(e.target.value.toUpperCase())}
                placeholder={t('traffic.plate_placeholder', 'E.g., MH 12 AB 1234')}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-amber-300 focus:border-amber-500 rounded-xl font-mono font-black text-slate-900 text-sm tracking-widest uppercase shadow-inner"
              />
            </div>
            <div className="text-[11px] text-amber-900/90 font-bold flex items-center space-x-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Flow: Directly routed to Traffic Police Officer. Police officer levies e-Challan fine based on plate number (no field worker needed).</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('report.back', 'Back')}</span>
            </button>

            <button
              onClick={handleSubmitReport}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('btn.submit_report', 'Submit Report')}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Complaint Success & ID Generation Screen */}
      {step === 4 && submittedComplaint && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              {t('report.success_title', 'Report Registered Successfully')}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              {t('report.complaint_id', 'Complaint ID:')} {submittedComplaint.id}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {t('report.success_desc', 'Save this Complaint ID to track real-time verification, worker assignment, and completion evidence.')}
            </p>
          </div>

          {/* Complaint Details Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">{t('report.hazard_title_label', 'Hazard Title:')}</span>
              <span className="text-slate-900">{translateText(submittedComplaint.title)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">{t('report.routed_dept_label', 'Routed Department:')}</span>
              <span className="text-blue-700">{translateDepartment(submittedComplaint.assignedDepartment)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">{t('report.emergency_level_label', 'Emergency Level:')}</span>
              <span className={submittedComplaint.isEmergency ? 'text-red-600 font-extrabold' : 'text-slate-700'}>
                {submittedComplaint.isEmergency ? t('severity.critical_emergency', '🚨 CRITICAL EMERGENCY') : translateSeverity(submittedComplaint.severity)}
              </span>
            </div>
          </div>

          {/* Send Complaint ID to Gmail & Share Card */}
          <div className="max-w-md mx-auto">
            <ShareComplaintCard complaint={submittedComplaint} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTrackComplaint(submittedComplaint.id)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('report.track_now', 'Track Complaint Status Now')}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(submittedComplaint.id);
                alert(`Complaint ID ${submittedComplaint.id} copied!`);
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center space-x-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>{t('report.copy_id', 'Copy ID')}</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setPhotoUrl('');
                setDescription('');
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300"
            >
              {t('report.report_another', 'Report Another Hazard')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
