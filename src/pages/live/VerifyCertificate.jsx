import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCertificate } from "../../api/certificateApi";
import { generateCertificate } from "../../utils/certificateGenerator";
import { FaLinkedin, FaDownload, FaCheckCircle, FaHome, FaShareAlt } from "react-icons/fa";
import toast from "react-hot-toast";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    fetchCert();
  }, [id]);

  const fetchCert = async () => {
    try {
      setLoading(true);
      const res = await getCertificate(id);
      const cert = res.data.certificate;
      setCertificate(cert);

      // Pre-generate PDF for previewing or downloading
      if (cert) {
        const url = await generateCertificate(
          cert.templateName,
          cert.employeeName,
          cert._id,
          false // do not download, just generate url
        );
        setPdfUrl(url);
      }
    } catch (err) {
      console.error(err);
      setError("Certificate not found or verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certificate) return;
    generateCertificate(
      certificate.templateName,
      certificate.employeeName,
      certificate._id,
      true
    );
  };

  // LinkedIn URLs
  const verificationUrl = `${window.location.origin}/verify-certificate/${id}`;
  
  // 1. Add Certificate to LinkedIn Profile
  const certDate = certificate ? new Date(certificate.createdAt) : new Date();
  const issueYear = certDate.getFullYear();
  const issueMonth = certDate.getMonth() + 1;
  
  const addToProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    `Recognition Certificate - ${certificate?.employeeName || ""}`
  )}&organizationName=${encodeURIComponent("Sunbrilo Technologies")}&issueYear=${issueYear}&issueMonth=${issueMonth}&certId=${id}&certUrl=${encodeURIComponent(
    verificationUrl
  )}`;

  // 2. Share to LinkedIn Feed
  const shareToFeedUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    verificationUrl
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Verifying Certificate...
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-red-500 text-7xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-2">Invalid Certificate</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The certificate credentials you provided could not be verified or do not exist in our systems.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          <FaHome /> Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center p-6 sm:p-10 relative overflow-hidden">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo Area */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-10 z-10 animate-fadeIn">
        <div className="flex gap-4">
          <img src="/sunbrilologo.png" alt="Sunbrilo" className="h-10 object-contain bg-white/10 p-1.5 rounded-lg" />
          <img src="/riskonnectlogo.png" alt="Riskonnect" className="h-10 object-contain bg-white p-1 rounded-lg" />
        </div>
        <Link
          to="/"
          className="text-slate-400 hover:text-white flex items-center gap-2 font-semibold transition"
        >
          <FaHome /> Home
        </Link>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-5 gap-8 z-10 flex-1 items-center">
        {/* Left Column: Certificate Preview (Glowy Glass Card) */}
        <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-fadeIn relative">
          <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow">
            <FaCheckCircle /> Verified Certificate
          </div>

          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-inner mt-4 relative group">
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none pointer-events-none select-none"
                title="Certificate Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Generating Preview...
              </div>
            )}
          </div>

          <div className="w-full flex justify-between items-center mt-6">
            <div className="text-left">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Credential ID</span>
              <p className="text-white/80 font-mono text-sm font-semibold truncate max-w-[200px]" title={certificate._id}>
                {certificate._id}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg text-sm"
            >
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Right Column: Congratulate / Share Actions */}
        <div className="md:col-span-2 flex flex-col gap-6 text-left animate-fadeIn">
          <div>
            <span className="text-purple-400 font-extrabold text-sm uppercase tracking-wider">
              Verification Successful
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight mt-2 mb-4">
              Congratulations, {certificate.employeeName}!
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              This certificate officially verifies that <span className="font-semibold text-white">{certificate.employeeName}</span> has earned recognition under the template <span className="font-semibold text-white">"{certificate.templateName.split('/').pop().replace('.pdf', '')}"</span>.
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Issued on {new Date(certificate.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Social / LinkedIn Sharing */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <FaShareAlt className="text-blue-400" /> Share Achievements
            </h3>
            <p className="text-slate-400 text-sm">
              Showcase this verified certificate to your professional network.
            </p>

            <a
              href={addToProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#0077b5] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-[#006097] transition"
            >
              <FaLinkedin className="text-xl" /> Add to LinkedIn Profile
            </a>

            <a
              href={shareToFeedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full border border-white/20 text-white font-semibold py-3.5 rounded-2xl hover:bg-white/5 transition"
            >
              <FaLinkedin className="text-xl text-[#0077b5]" /> Post on LinkedIn Feed
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
