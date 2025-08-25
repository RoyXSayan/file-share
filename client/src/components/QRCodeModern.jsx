// src/components/QRCodeModern.jsx
import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";

const QRCodeModern = ({ fileLink }) => {
  const qrRef = useRef(null);
  const qrCode = useRef(null);

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 220,
        height: 220,
        type: "svg",
        data: fileLink || "https://example.com",
        dotsOptions: {
          color: "#3b82f6",
          type: "rounded",
        },
        backgroundOptions: {
          color: "transparent",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#2563eb",
        },
        cornersDotOptions: {
          color: "#60a5fa",
        },
      });
    }

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.current.update({ data: fileLink });
      qrCode.current.append(qrRef.current);
    }
  }, [fileLink]);

  const handleDownload = (ext = "png") => {
    if (qrCode.current) {
      qrCode.current.download({
        extension: ext,
        name: "file-qr",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={qrRef} />
      <div className="flex gap-2 mt-4">
        <Button onClick={() => handleDownload("png")}>Download PNG</Button>
        <Button onClick={() => handleDownload("svg")} variant="secondary">
          Download SVG
        </Button>
      </div>
    </div>
  );
};

export default QRCodeModern;
