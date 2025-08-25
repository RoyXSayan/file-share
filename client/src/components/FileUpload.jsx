import { useState } from "react";
import QRCode from "react-qr-code";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    setUploading(true);

    // TODO: Send file to backend here (using fetch or axios)
    // For demo: we simulate with timeout
    setTimeout(() => {
      const mockUrl = `https://fileshare.com/download/${file.name}`;
      setFileUrl(mockUrl);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">📂 Upload File</h2>

      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 border rounded w-full p-2"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {uploading ? "Uploading..." : "Upload & Get Link"}
      </button>

      {fileUrl && (
        <div className="mt-6 text-center">
          <p className="text-green-600 font-medium">✅ File Uploaded!</p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block mt-2 text-blue-600 underline"
          >
            {fileUrl}
          </a>

          {/* QR Code */}
          <div className="mt-4 flex justify-center">
            <QRCode value={fileUrl} size={150} />
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
