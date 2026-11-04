import { useState, useEffect } from 'react';
// Step 15: Import jsPDF and jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  // ==========================================
  // Core State for Resume Data
  // ==========================================
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 234-5678',
    },
    education: [
      {
        id: 'edu-1',
        schoolName: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        graduationYear: '2023',
      },
    ],
    experience: [
      {
        id: 'exp-1',
        jobTitle: 'Frontend Software Engineer',
        company: 'NovaTech Solutions',
        startDate: 'Jan 2023',
        endDate: 'Present',
        // Step 6: Key responsibilities / details
        details:
          'Engineered responsive web applications using React, Tailwind CSS, and TypeScript. Optimized page load speeds by 35% and collaborated in an agile team.',
      },
    ],
    skills: ['JavaScript', 'React.js', 'Tailwind CSS', 'TypeScript', 'Git & GitHub'],
  });

  // ==========================================
  // Step 9 & 10: AI Summary State
  // ==========================================
  // Step 9: State to hold the professional summary
  const [resumeSummary, setResumeSummary] = useState(
    'Passionate and results-driven Software Developer with hands-on experience in building scalable modern web applications with React, JavaScript, and Tailwind CSS. Dedicated to clean code, seamless user experiences, and continuous technical growth.'
  );

  // Step 10: Input state for summary keywords / background
  const [summaryKeywords, setSummaryKeywords] = useState(
    'Frontend developer, 2 years experience, React, TypeScript, responsive UI, team player'
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState('');

  // ==========================================
  // Skills State & AI Suggestions
  // ==========================================
  const [skills, setSkills] = useState([
    'JavaScript',
    'React.js',
    'Tailwind CSS',
    'TypeScript',
    'Git & GitHub',
  ]);
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [apiStatusMessage, setApiStatusMessage] = useState('');

  // Keep resumeData.skills in sync with skills state
  useEffect(() => {
    setResumeData((prev) => ({
      ...prev,
      skills: skills,
    }));
  }, [skills]);

  // ==========================================
  // Personal Info Handler
  // ==========================================
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }));
  };

  // ==========================================
  // Experience Dynamic Handlers
  // ==========================================
  const handleExperienceChange = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, experience: updated };
    });
  };

  const handleAddExperience = () => {
    const newEntry = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      details: '',
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newEntry],
    }));
  };

  const handleRemoveExperience = (indexToRemove) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, index) => index !== indexToRemove),
    }));
  };

  // ==========================================
  // Education Dynamic Handlers
  // ==========================================
  const handleEducationChange = (index, field, value) => {
    setResumeData((prev) => {
      const updated = [...prev.education];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, education: updated };
    });
  };

  const handleAddEducation = () => {
    const newEntry = {
      id: `edu-${Date.now()}`,
      schoolName: '',
      degree: '',
      graduationYear: '',
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEntry],
    }));
  };

  const handleRemoveEducation = (indexToRemove) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, index) => index !== indexToRemove),
    }));
  };

  // ==========================================
  // Skills Handlers
  // ==========================================
  const handleAddSkill = (skillToAdd) => {
    const value = typeof skillToAdd === 'string' ? skillToAdd : currentSkillInput;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setCurrentSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // ==========================================
  // Step 12: Gemini API Call for Summary
  // ==========================================
  const generateSummary = async () => {
    if (!summaryKeywords.trim()) {
      alert('Please enter a few keywords or background details first!');
      return;
    }

    setIsGeneratingSummary(true);
    setSummaryStatus('Generating summary with Gemini AI...');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    // High quality fallback summary if no API key is provided
    const fallbackSummary = `Results-oriented professional with specialized experience in ${
      summaryKeywords || 'software development'
    }. Proven track record of delivering high-quality, scalable solutions with an emphasis on modern best practices, clean code, and effective cross-functional collaboration.`;

    if (!apiKey) {
      setTimeout(() => {
        setResumeSummary(fallbackSummary);
        setIsGeneratingSummary(false);
        setSummaryStatus('Generated using template logic (Add VITE_GEMINI_API_KEY for live AI).');
      }, 700);
      return;
    }

    try {
      // Step 12: Prompt to instruct the AI
      const promptText = `Write a professional, concise, 2-to-3 sentence resume summary for a software resume based on the following keywords and background: "${summaryKeywords}". Write in first or third person professional resume style. Do not include introductory text or quotes.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (generatedText) {
        // Step 13: Update resumeSummary state
        setResumeSummary(generatedText);
        setSummaryStatus('Successfully generated summary with Gemini!');
      } else {
        setResumeSummary(fallbackSummary);
        setSummaryStatus('Loaded fallback summary.');
      }
    } catch (err) {
      console.warn('Gemini summary error:', err);
      setResumeSummary(fallbackSummary);
      setSummaryStatus('API issue; loaded fallback summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // ==========================================
  // Step 18: Gemini API Call for Skills
  // ==========================================
  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setApiStatusMessage('Fetching skills suggestions...');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const fallbackSkills = [
      'React.js',
      'JavaScript (ES6+)',
      'TypeScript',
      'Node.js & Express',
      'Tailwind CSS',
      'REST APIs & GraphQL',
      'Git & GitHub',
      'SQL & PostgreSQL',
      'Docker & Containers',
      'Unit Testing & CI/CD',
    ];

    if (!apiKey) {
      setTimeout(() => {
        setSuggestedSkills(fallbackSkills);
        setLoadingSuggestions(false);
        setApiStatusMessage('Loaded default skill recommendations.');
      }, 600);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Suggest 10 professional skills for a software developer. Return ONLY a comma-separated list of the 10 skill names, without numbering.',
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = rawText
        .split(/[,\n]/)
        .map((s) => s.replace(/^\d+[\.\)]\s*/, '').replace(/[-*•]\s*/, '').trim())
        .filter((s) => s.length > 0)
        .slice(0, 10);

      setSuggestedSkills(parsed.length > 0 ? parsed : fallbackSkills);
      setApiStatusMessage('AI suggestions loaded!');
    } catch (error) {
      console.warn('Skills API error:', error);
      setSuggestedSkills(fallbackSkills);
      setApiStatusMessage('Loaded fallback suggestions.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // ==========================================
  // Step 17, 18, 19, 20: PDF Export Functionality
  // ==========================================
  const handleExportPDF = () => {
    try {
      // Step 17: Initialize new jsPDF document (A4 portrait)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [109, 94, 182]; // Soft violet (#6d5eb6)
      const textColor = [55, 65, 81]; // Slate-700
      const mutedColor = [138, 100, 123]; // Dusty rose
      let currentY = 20;

      // ------------------------------------------
      // Step 18: Header (Name & Contact Information)
      // ------------------------------------------
      // Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...primaryColor);
      const userName = resumeData.personalInfo.name || 'Your Name';
      doc.text(userName, 105, currentY, { align: 'center' });
      currentY += 7;

      // Contact Info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...mutedColor);
      const contactInfo = [
        resumeData.personalInfo.email || 'email@example.com',
        resumeData.personalInfo.phone || '+1 555-0100',
      ]
        .filter(Boolean)
        .join('  |  ');
      doc.text(contactInfo, 105, currentY, { align: 'center' });
      currentY += 5;

      // Header Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.6);
      doc.line(15, currentY, 195, currentY);
      currentY += 8;

      // ------------------------------------------
      // Professional Summary Section
      // ------------------------------------------
      if (resumeSummary.trim()) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('PROFESSIONAL SUMMARY', 15, currentY);
        currentY += 2;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(15, currentY, 195, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...textColor);
        const splitSummary = doc.splitTextToSize(resumeSummary, 180);
        doc.text(splitSummary, 15, currentY);
        currentY += splitSummary.length * 4.5 + 5;
      }

      // ------------------------------------------
      // Step 19: Experience Section (autoTable)
      // ------------------------------------------
      if (resumeData.experience.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('WORK EXPERIENCE', 15, currentY);
        currentY += 2;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(15, currentY, 195, currentY);
        currentY += 3;

        const experienceTableBody = resumeData.experience.map((exp) => [
          `${exp.jobTitle || 'Job Title'}\n${exp.company || 'Company'}`,
          `${exp.startDate || 'Start'} - ${exp.endDate || 'Present'}`,
          exp.details || 'Key responsibilities and achievements',
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Role & Company', 'Duration', 'Description & Achievements']],
          body: experienceTableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 138],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 8.5,
            textColor: [31, 41, 55],
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 35 },
            2: { cellWidth: 95 },
          },
          margin: { left: 15, right: 15 },
        });

        currentY = doc.lastAutoTable.finalY + 8;
      }

      // ------------------------------------------
      // Step 19: Education Section (autoTable)
      // ------------------------------------------
      if (resumeData.education.length > 0) {
        // Prevent overflowing onto page margin
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('EDUCATION', 15, currentY);
        currentY += 2;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(15, currentY, 195, currentY);
        currentY += 3;

        const educationTableBody = resumeData.education.map((edu) => [
          edu.degree || 'Degree / Major',
          edu.schoolName || 'School Name',
          edu.graduationYear || 'Year',
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Degree / Field of Study', 'Institution', 'Graduation Year']],
          body: educationTableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 138],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 8.5,
            textColor: [31, 41, 55],
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 75, fontStyle: 'bold' },
            1: { cellWidth: 70 },
            2: { cellWidth: 35 },
          },
          margin: { left: 15, right: 15 },
        });

        currentY = doc.lastAutoTable.finalY + 8;
      }

      // ------------------------------------------
      // Skills Section
      // ------------------------------------------
      if (skills.length > 0) {
        if (currentY > 245) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('KEY SKILLS & TECHNOLOGIES', 15, currentY);
        currentY += 2;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(15, currentY, 195, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);

        const skillsString = skills.join('  •  ');
        const splitSkills = doc.splitTextToSize(skillsString, 180);
        doc.text(splitSkills, 15, currentY);
      }

      // ------------------------------------------
      // Step 20: Save & Download the PDF
      // ------------------------------------------
      const cleanFileName = (resumeData.personalInfo.name || 'Resume')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      doc.save(`${cleanFileName}_resume.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error generating your PDF. Please check the browser console.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.18),_transparent_35%),linear-gradient(135deg,_#fffaf6_0%,_#f4f7ff_42%,_#f5fff9_100%)] py-8 px-4 lg:px-8">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-rose-200/80 pb-4">
        <div>
          <h1 className="text-3xl font-black text-violet-900 tracking-tight flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-200 via-amber-100 to-violet-200 shadow-sm">
              📄
            </span>
            AI Resume Builder
          </h1>
          <p className="text-sm text-violet-700/80">
            Design your resume, generate AI summaries & skills, and export to PDF.
          </p>
        </div>

        {/* Step 16: Export to PDF Button */}
        <button
          type="button"
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-violet-500 hover:from-rose-500 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer text-sm"
        >
          <span>📥</span>
          <span>Export to PDF</span>
        </button>
      </header>

      {/* Main Grid: Left = Form Inputs, Right = Live Resume Template */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: Form Inputs (7 Columns on large screens)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-gradient-to-br from-white via-rose-50/60 to-violet-50/90 p-5 rounded-2xl border border-rose-200/80 shadow-[0_14px_30px_rgba(196,181,253,0.15)]">
            <h2 className="text-base font-bold text-violet-900 mb-3 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">👤</span> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={resumeData.personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. john@example.com"
                  value={resumeData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. +1 555-0199"
                  value={resumeData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Step 10 & 11: AI-Powered Summary Form */}
          <div className="bg-gradient-to-br from-white via-violet-50/70 to-rose-50/80 p-5 rounded-2xl border border-violet-200/80 shadow-[0_14px_30px_rgba(196,181,253,0.15)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-violet-900 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">✨</span> AI Professional Summary
              </h2>
              {/* Step 11: Generate Summary Button */}
              <button
                type="button"
                onClick={generateSummary}
                disabled={isGeneratingSummary}
                className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
              >
                {isGeneratingSummary ? '⚡ Generating...' : '✨ Generate Summary'}
              </button>
            </div>

            {/* Step 10: Summary Input for keywords / background */}
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Your Background / Role Keywords (for AI generation)
            </label>
            <textarea
              rows={2}
              value={summaryKeywords}
              onChange={(e) => setSummaryKeywords(e.target.value)}
              placeholder="e.g., Full stack developer with 3 years experience in React, Node.js, and cloud architecture..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none mb-3"
            />

            {/* Editable summary text */}
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Current Professional Summary (Editable)
            </label>
            <textarea
              rows={3}
              value={resumeSummary}
              onChange={(e) => setResumeSummary(e.target.value)}
              placeholder="Your resume summary will appear here..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {summaryStatus && (
              <p className="text-[11px] text-purple-600 mt-1 italic">{summaryStatus}</p>
            )}
          </div>

          {/* Section 3: Experience Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-600">💼</span> Experience
              </h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
              >
                + Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Job #{index + 1}
                    </span>
                    {resumeData.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(index)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Engineer"
                        value={exp.jobTitle}
                        onChange={(e) =>
                          handleExperienceChange(index, 'jobTitle', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Tech"
                        value={exp.company}
                        onChange={(e) =>
                          handleExperienceChange(index, 'company', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Start Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jan 2022"
                        value={exp.startDate}
                        onChange={(e) =>
                          handleExperienceChange(index, 'startDate', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        End Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Present"
                        value={exp.endDate}
                        onChange={(e) =>
                          handleExperienceChange(index, 'endDate', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Step 6: Experience details / achievements */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Key Responsibilities & Achievements
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe what you built, accomplished, or key metrics..."
                      value={exp.details || ''}
                      onChange={(e) =>
                        handleExperienceChange(index, 'details', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Education Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-600">🎓</span> Education
              </h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
              >
                + Add Education
              </button>
            </div>

            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div
                  key={edu.id || index}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      School #{index + 1}
                    </span>
                    {resumeData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(index)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        School / University
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UC Berkeley"
                        value={edu.schoolName}
                        onChange={(e) =>
                          handleEducationChange(index, 'schoolName', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Degree / Major
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.S. in CS"
                        value={edu.degree}
                        onChange={(e) =>
                          handleEducationChange(index, 'degree', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2023"
                        value={edu.graduationYear}
                        onChange={(e) =>
                          handleEducationChange(index, 'graduationYear', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Skills & AI Suggestions */}
          <div className="bg-gradient-to-br from-white via-amber-50/80 to-emerald-50/80 p-5 rounded-2xl border border-amber-200/80 shadow-[0_14px_30px_rgba(253,224,71,0.12)]">
            <h2 className="text-base font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">⚡</span> Skills & AI Suggestions
            </h2>

            {/* Input to add skill */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type a skill..."
                value={currentSkillInput}
                onChange={(e) => setCurrentSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Add Skill
              </button>
            </div>

            {/* Skills Badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-500 ml-1 font-bold text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* AI Skill suggestions */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-700">
                  ✨ Gemini Suggested Skills:
                </span>
                <button
                  type="button"
                  onClick={fetchSuggestions}
                  disabled={loadingSuggestions}
                  className="text-[11px] text-purple-600 hover:underline"
                >
                  {loadingSuggestions ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {suggestedSkills.map((sug, i) => {
                  const added = skills.includes(sug);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSkill(sug)}
                      disabled={added}
                      className={`text-[11px] px-2 py-0.5 rounded border transition ${
                        added
                          ? 'bg-purple-100/50 text-purple-400 border-purple-200 cursor-default'
                          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-600 hover:text-white cursor-pointer'
                      }`}
                    >
                      {added ? '✓ ' : '+ '}
                      {sug}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Step 1: Template Container (Live Resume)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 sticky top-8">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold uppercase tracking-wider">
              📄 Live Printable Resume Template
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
              Real-time Preview
            </span>
          </div>

          {/* Step 1: Template Container with clean white background, padding, subtle border */}
          <div className="relative overflow-hidden rounded-[28px] border border-violet-200 bg-gradient-to-br from-[#fffaf5] via-[#fef3f9] to-[#f3f8ff] p-8 shadow-[0_30px_60px_rgba(167,139,250,0.18)] md:p-10 font-sans text-slate-800 transition">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/60 blur-2xl" />
            <div className="absolute -left-10 bottom-10 h-24 w-24 rounded-full bg-emerald-200/60 blur-2xl" />
            <div className="relative">
              <div className="mb-5 rounded-2xl border border-violet-200 bg-gradient-to-r from-[#f3e8ff] via-[#fff7ed] to-[#ecfeff] px-4 py-5 text-center shadow-inner">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase text-violet-900">
                  {resumeData.personalInfo.name || 'YOUR NAME'}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-violet-700 font-medium">
                  {resumeData.personalInfo.email && (
                    <span className="flex items-center gap-1">
                      ✉️ {resumeData.personalInfo.email}
                    </span>
                  )}
                  {resumeData.personalInfo.email && resumeData.personalInfo.phone && (
                    <span>•</span>
                  )}
                  {resumeData.personalInfo.phone && (
                    <span className="flex items-center gap-1">
                      📞 {resumeData.personalInfo.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Section Dividers & Step 4: Summary Section */}
            {resumeSummary.trim() && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900">
                    Professional Summary
                  </h3>
                  <div className="flex-1 h-px bg-violet-200"></div>
                </div>
                {/* Step 4: Display AI-generated professional summary in dedicated paragraph */}
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
                  {resumeSummary}
                </p>
              </div>
            )}

            {/* Step 5 & 6: Experience Section */}
            {resumeData.experience.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900">
                    Work Experience
                  </h3>
                  <div className="flex-1 h-px bg-violet-200"></div>
                </div>

                {/* Step 5: map() over experience state array */}
                <div className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id || index}>
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                        {/* Step 5: jobTitle and company in bold font */}
                        <div className="text-sm font-bold text-slate-900">
                          {exp.jobTitle || 'Job Title'}{' '}
                          <span className="text-slate-500 font-semibold">
                            | {exp.company || 'Company Name'}
                          </span>
                        </div>
                        {/* Step 5: startDate and endDate next to them */}
                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                          {exp.startDate || 'Start Date'} – {exp.endDate || 'End Date'}
                        </div>
                      </div>

                      {/* Step 6: Experience details / responsibilities */}
                      {exp.details && (
                        <p className="text-xs text-slate-600 mt-1 leading-normal pl-3 border-l-2 border-slate-200">
                          {exp.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Education Section using map() */}
            {resumeData.education.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900">
                    Education
                  </h3>
                  <div className="flex-1 h-px bg-violet-200"></div>
                </div>

                <div className="space-y-3">
                  {resumeData.education.map((edu, index) => (
                    <div
                      key={edu.id || index}
                      className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs md:text-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          {edu.degree || 'Degree'}
                        </span>
                        {edu.schoolName && (
                          <span className="text-slate-600"> — {edu.schoolName}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {edu.graduationYear || 'Graduation Year'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Skills Section formatted cleanly */}
            {skills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900">
                    Skills & Competencies
                  </h3>
                  <div className="flex-1 h-px bg-violet-200"></div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gradient-to-r from-rose-50 to-violet-50 text-violet-800 text-xs font-medium rounded-full border border-violet-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
