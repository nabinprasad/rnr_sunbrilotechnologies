import { useEffect, useRef } from "react";

export default function PhotoUpload({
  image,
  setImage,
  setPhotoFile,
}) {
  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setPhotoFile(file);
    setImage(previewUrl);
  };

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 bg-slate-100">
          {image ? (
            <img
              src={image}
              alt="Employee"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Photo
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Upload Photo
          </button>

          <p className="mt-2 text-xs text-slate-500">
            Preview only. Photo is saved after you submit the form.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </div>
      </div>
    </div>
  );
}
