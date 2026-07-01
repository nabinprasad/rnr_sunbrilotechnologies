import { useRef } from "react";

export default function PhotoUpload({ image, setImage }) {
  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
  };

  return (
    <div>
      <div className="flex items-center gap-6">

        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300">

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