import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlinePhotograph, HiOutlineCode, HiX } from 'react-icons/hi';
import { createPost } from '../../features/posts/postsSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const CreatePost = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState({ code: '', language: 'javascript' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      toast.error('Please add some content or an image');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());

      if (image) {
        formData.append('image', image);
      }

      if (showCodeInput && codeSnippet.code.trim()) {
        formData.append('codeSnippet[code]', codeSnippet.code);
        formData.append('codeSnippet[language]', codeSnippet.language);
      }

      await dispatch(createPost(formData)).unwrap();

      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      setShowCodeInput(false);
      setCodeSnippet({ code: '', language: 'javascript' });

      toast.success('Post created!');
      onSuccess?.();
    } catch (error) {
      toast.error(error || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash', 'other'
  ];

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-dark-800">
      <div className="flex space-x-3">
        <img
          src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff`}
          alt={user?.username}
          className="w-12 h-12 avatar flex-shrink-0"
        />

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            maxLength={5000}
            className="w-full bg-transparent text-dark-100 placeholder-dark-500 text-lg resize-none focus:outline-none"
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3 inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-xl border border-dark-700"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-dark-900/80 hover:bg-dark-800 rounded-full transition-colors"
              >
                <HiX className="w-5 h-5 text-dark-100" />
              </button>
            </div>
          )}

          {/* Code snippet input */}
          {showCodeInput && (
            <div className="mt-3 space-y-2">
              <select
                value={codeSnippet.language}
                onChange={(e) => setCodeSnippet({ ...codeSnippet, language: e.target.value })}
                className="px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <textarea
                value={codeSnippet.code}
                onChange={(e) => setCodeSnippet({ ...codeSnippet, code: e.target.value })}
                placeholder="Paste your code here..."
                rows={6}
                className="w-full px-3 py-2 bg-dark-950 border border-dark-800 rounded-lg text-dark-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-primary-400 hover:bg-primary-400/10 rounded-full transition-colors"
                title="Add image"
              >
                <HiOutlinePhotograph className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className={`p-2 rounded-full transition-colors ${
                  showCodeInput
                    ? 'text-primary-400 bg-primary-400/10'
                    : 'text-primary-400 hover:bg-primary-400/10'
                }`}
                title="Add code snippet"
              >
                <HiOutlineCode className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-dark-500">
                {content.length}/5000
              </span>
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !image)}
                className="btn-primary px-6"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
