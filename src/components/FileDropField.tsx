import { useEffect, useId, useState } from "react";
import { ACCEPT_IMAGE_FILES } from "../../shared/contracts";

type Props = {
  label: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

export function FileDropField({ label, hint, required, file, onChange }: Props) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="field-card">
      <div className="field-head">
        <div>
          <p className="field-label">{label}</p>
          <p className="field-hint">{hint}</p>
        </div>
        {required ? <span className="pill pill-solid">필수</span> : <span className="pill">선택</span>}
      </div>

      <label className={`upload-box ${file ? "is-filled" : ""}`} htmlFor={inputId}>
        <input
          id={inputId}
          className="sr-only"
          type="file"
          accept={ACCEPT_IMAGE_FILES}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <img className="upload-preview" src={previewUrl} alt={label} />
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">＋</span>
            <strong>사진을 선택해 주세요</strong>
            <span>JPG, PNG, WEBP / 최대 10MB</span>
          </div>
        )}
      </label>

      {file ? (
        <div className="upload-meta">
          <span>{file.name}</span>
          <button type="button" className="text-button" onClick={() => onChange(null)}>
            지우기
          </button>
        </div>
      ) : null}
    </div>
  );
}
